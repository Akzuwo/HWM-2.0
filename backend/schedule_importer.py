"""Shared schedule import utilities for CLI and web API."""

from __future__ import annotations

import datetime as _dt
import hashlib
import json
from typing import Dict, Mapping, Sequence, Tuple, List

import mysql.connector

WEEKDAY_ORDER = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]


class ScheduleImportError(RuntimeError):
    """Raised when the import fails for a specific reason."""


NormalisedSchedule = Dict[str, List[Dict[str, str]]]


def load_schedule_from_payload(payload: object) -> NormalisedSchedule:
    """Validate and normalise a decoded JSON schedule payload."""

    if not isinstance(payload, Mapping):
        raise ScheduleImportError("Schedule root must be an object with weekday keys")

    normalised: NormalisedSchedule = {}
    for day, entries in payload.items():
        if not isinstance(entries, Sequence):
            raise ScheduleImportError(f"Entries for '{day}' must be a list")
        normalised_day = str(day).strip() or str(day)
        prepared: List[Dict[str, str]] = []
        for index, entry in enumerate(entries):
            if not isinstance(entry, Mapping):
                raise ScheduleImportError(f"Entry #{index + 1} for '{day}' must be an object")
            try:
                start_raw = entry["start"]
                end_raw = entry["end"]
                subject_raw = entry["fach"]
            except KeyError as exc:
                raise ScheduleImportError(
                    f"Entry #{index + 1} for '{day}' is missing {exc.args[0]!r}"
                ) from exc

            for field_name, value in (
                ("start", start_raw),
                ("end", end_raw),
                ("fach", subject_raw),
            ):
                if not isinstance(value, str):
                    raise ScheduleImportError(
                        f"Entry #{index + 1} for '{day}' field '{field_name}' must be a string"
                    )

            room_raw = entry.get("raum")
            room_value = "-"
            if isinstance(room_raw, str):
                room_value = room_raw.strip() or "-"
            elif room_raw is None:
                room_value = "-"
            else:
                room_value = str(room_raw).strip() or "-"

            prepared.append(
                {
                    "start": start_raw.strip(),
                    "end": end_raw.strip(),
                    "fach": subject_raw.strip(),
                    "raum": room_value,
                }
            )
        normalised[normalised_day] = prepared
    return normalised


def load_schedule_from_json_text(data: str) -> NormalisedSchedule:
    try:
        payload = json.loads(data)
    except json.JSONDecodeError as exc:
        raise ScheduleImportError(f"Invalid JSON: {exc}") from exc
    return load_schedule_from_payload(payload)


def load_schedule_from_json_bytes(data: bytes) -> NormalisedSchedule:
    try:
        text = data.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise ScheduleImportError("Schedule file must be UTF-8 encoded") from exc
    return load_schedule_from_json_text(text)


def load_schedule_from_path(path) -> NormalisedSchedule:
    with open(path, "r", encoding="utf-8") as handle:
        return load_schedule_from_payload(json.load(handle))


def calculate_import_hash(schedule: NormalisedSchedule) -> str:
    payload_bytes = json.dumps(schedule, sort_keys=True, ensure_ascii=False).encode("utf-8")
    return hashlib.sha256(payload_bytes).hexdigest()


def resolve_class_id(cursor: mysql.connector.cursor.MySQLCursor, identifier: str) -> int:
    identifier = identifier.strip()
    if identifier.isdigit():
        cursor.execute("SELECT id FROM classes WHERE id=%s", (int(identifier),))
    else:
        slug = identifier.lower()
        cursor.execute("SELECT id FROM classes WHERE slug=%s", (slug,))
    row = cursor.fetchone()
    if not row:
        raise ScheduleImportError(f"Class '{identifier}' does not exist")
    if isinstance(row, Mapping):
        value = row.get("id")
    else:
        value = row[0]
    return int(value)


def ensure_schedule_metadata(
    conn: mysql.connector.MySQLConnection,
    class_id: int,
    source: str,
    import_hash: str,
    imported_at: _dt.datetime,
) -> None:
    cursor = conn.cursor()
    try:
        cursor.execute("SHOW COLUMNS FROM class_schedules LIKE 'updated_at'")
        has_updated_at = cursor.fetchone() is not None

        cursor.execute("SELECT id FROM class_schedules WHERE class_id=%s", (class_id,))
        row = cursor.fetchone()
        now = _dt.datetime.utcnow()
        if row:
            if isinstance(row, Mapping):
                schedule_id = int(row.get("id"))
            else:
                schedule_id = int(row[0])
            if has_updated_at:
                cursor.execute(
                    "UPDATE class_schedules SET source=%s, import_hash=%s, imported_at=%s, updated_at=%s WHERE id=%s",
                    (source, import_hash, imported_at, now, schedule_id),
                )
            else:
                cursor.execute(
                    "UPDATE class_schedules SET source=%s, import_hash=%s, imported_at=%s WHERE id=%s",
                    (source, import_hash, imported_at, schedule_id),
                )
        else:
            if has_updated_at:
                cursor.execute(
                    """
                    INSERT INTO class_schedules (class_id, source, import_hash, imported_at, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (class_id, source, import_hash, imported_at, now, now),
                )
            else:
                cursor.execute(
                    """
                    INSERT INTO class_schedules (class_id, source, import_hash, imported_at, created_at)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (class_id, source, import_hash, imported_at, now),
                )
    finally:
        cursor.close()


def upsert_schedule_entries(
    conn: mysql.connector.MySQLConnection,
    class_id: int,
    schedule: NormalisedSchedule,
) -> int:
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM stundenplan_entries WHERE class_id=%s", (class_id,))
        inserted = 0
        ordered_days = WEEKDAY_ORDER + sorted(set(schedule.keys()) - set(WEEKDAY_ORDER))
        for day in ordered_days:
            entries = schedule.get(day)
            if not entries:
                continue
            for entry in entries:
                cursor.execute(
                    """
                    INSERT INTO stundenplan_entries (class_id, tag, start, `end`, fach, raum)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (
                        class_id,
                        day,
                        entry.get("start"),
                        entry.get("end"),
                        entry.get("fach"),
                        entry.get("raum"),
                    ),
                )
                inserted += 1
        return inserted
    finally:
        cursor.close()


def import_schedule(
    conn: mysql.connector.MySQLConnection,
    class_identifier: str,
    schedule: NormalisedSchedule,
    source: str,
    *,
    imported_at: _dt.datetime | None = None,
) -> Tuple[int, str, int]:
    """Import a schedule into the database and return inserted count and hash."""

    if not class_identifier:
        raise ScheduleImportError("Class identifier is required")

    cursor = conn.cursor()
    try:
        class_id = resolve_class_id(cursor, class_identifier)
    finally:
        cursor.close()

    timestamp = imported_at or _dt.datetime.utcnow()
    import_hash = calculate_import_hash(schedule)

    inserted = upsert_schedule_entries(conn, class_id, schedule)
    ensure_schedule_metadata(conn, class_id, source, import_hash, timestamp)
    return inserted, import_hash, class_id
