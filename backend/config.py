"""Central configuration helpers for the Homework Manager backend."""

from __future__ import annotations

import os
from typing import Any, Dict


def _require_env(key: str) -> str:
    value = os.environ.get(key)
    if value is None or value == "":
        raise RuntimeError(f"Environment variable {key} must be set")
    return value


def _optional_env(key: str) -> str | None:
    value = os.environ.get(key)
    if value is None or value == "":
        return None
    return value


def _coerce_int(value: str | None, default: int) -> int:
    try:
        return int(value) if value not in {None, ""} else default
    except (TypeError, ValueError):
        return default


def get_db_config() -> Dict[str, Any]:
    """Return the database configuration from environment variables."""

    return {
        "host": _require_env("DB_HOST"),
        "user": _require_env("DB_USER"),
        "password": _require_env("DB_PASSWORD"),
        "database": _require_env("DB_NAME"),
        "port": _coerce_int(os.environ.get("DB_PORT"), 3306),
    }


def get_contact_smtp_settings() -> Dict[str, Any]:
    """Return SMTP settings for the optional support mailer from environment variables."""

    host = _require_env("CONTACT_SMTP_HOST")
    user = _optional_env("CONTACT_SMTP_USER")
    password = _optional_env("CONTACT_SMTP_PASSWORD")
    recipient = _optional_env("CONTACT_RECIPIENT") or user
    from_address = _optional_env("CONTACT_FROM_ADDRESS") or user or recipient

    return {
        "host": host,
        "user": user,
        "password": password,
        "recipient": recipient,
        "from_address": from_address,
    }
