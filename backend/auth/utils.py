"""Utility helpers for password hashing and token management."""

from __future__ import annotations

import datetime as _dt
import secrets
from typing import Optional

from argon2 import PasswordHasher, exceptions as argon2_exceptions

_password_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    """Hash *password* using Argon2 and return the encoded hash."""
    if not password:
        raise ValueError("Password must not be empty")
    return _password_hasher.hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    """Return ``True`` if *password* matches *password_hash*."""
    if not password_hash or password is None:
        return False
    try:
        return _password_hasher.verify(password_hash, password)
    except (argon2_exceptions.VerifyMismatchError, argon2_exceptions.VerificationError, argon2_exceptions.InvalidHash, ValueError):
        return False


def generate_token(length: int = 32) -> str:
    """Generate a URL-safe random token."""
    if length <= 0:
        raise ValueError("length must be positive")
    return secrets.token_urlsafe(length)


def calculate_token_expiry(seconds: int, *, now: Optional[_dt.datetime] = None) -> _dt.datetime:
    """Return an absolute expiry timestamp seconds from *now*."""
    if seconds <= 0:
        raise ValueError("seconds must be positive")
    reference = now or _dt.datetime.now(_dt.timezone.utc)
    if reference.tzinfo is not None:
        reference = reference.astimezone(_dt.timezone.utc).replace(tzinfo=None)
    return reference + _dt.timedelta(seconds=seconds)


__all__ = [
    "hash_password",
    "verify_password",
    "generate_token",
    "calculate_token_expiry",
]
