"""Central configuration helpers for the Homework Manager backend."""

from __future__ import annotations

import os
from typing import Any, Dict, TypeVar

DEFAULT_DB_CONFIG: Dict[str, Any] = {
    "host": "mc-mysql01.mc-host24.de",
    "user": "u4203_Mtc42FNhxN",
    "password": "nA6U=8ecQBe@vli@SKXN9rK9",
    "database": "s4203_reports",
    "port": 3306,
}

T = TypeVar("T")

DEFAULT_CONTACT_SMTP_CONFIG: Dict[str, Any] = {
    "host": "smtp-relay.brevo.com",
    "port": 587,
    "user": "99c21d001@smtp-brevo.com",
    "password": "xsmtpsib-8b7d89b4925bfcc23bb49fe8aa78c888b89b23682830a0fabf6e5c14f4025750-3zY8GduPd5OqDIdc",
    "recipient": "no-reply@akzuwo.ch",
    "from_address": "Homework Manager <no-reply@akzuwo.ch>",
}


def _getenv_or_default(key: str, default: T) -> T:
    value = os.getenv(key)
    return value if value else default


def _coerce_int(value: str | None, default: int) -> int:
    try:
        return int(value) if value is not None else default
    except (TypeError, ValueError):
        return default


def get_db_config() -> Dict[str, Any]:
    """Return the database configuration including environment overrides."""

    config = DEFAULT_DB_CONFIG.copy()
    config["host"] = _getenv_or_default("DB_HOST", config["host"])
    config["user"] = _getenv_or_default("DB_USER", config["user"])
    config["password"] = _getenv_or_default("DB_PASSWORD", config["password"])
    config["database"] = _getenv_or_default("DB_NAME", config["database"])
    config["port"] = _coerce_int(os.getenv("DB_PORT"), config["port"])
    return config


def get_contact_smtp_settings() -> Dict[str, Any]:
    """Return SMTP settings used for the contact form including overrides."""

    config = DEFAULT_CONTACT_SMTP_CONFIG.copy()
    config["host"] = _getenv_or_default("CONTACT_SMTP_HOST", config["host"])
    config["port"] = _coerce_int(os.getenv("CONTACT_SMTP_PORT"), config["port"])
    config["user"] = _getenv_or_default("CONTACT_SMTP_USER", config["user"])
    config["password"] = _getenv_or_default("CONTACT_SMTP_PASSWORD", config["password"])

    recipient_default = config["recipient"] or config["user"]
    config["recipient"] = _getenv_or_default("CONTACT_RECIPIENT", recipient_default)

    from_default = config["from_address"] or config["user"] or config["recipient"]
    config["from_address"] = _getenv_or_default("CONTACT_FROM_ADDRESS", from_default)

    return config
