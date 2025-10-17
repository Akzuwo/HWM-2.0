import builtins
import importlib
import io
import os
import sys
import time
from typing import Dict

import pytest

# Ensure app module can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from auth import utils as auth_utils


class DummyCursor:
    def __init__(self, storage: Dict[str, object], dictionary: bool = False) -> None:
        self.storage = storage
        self.dictionary = dictionary
        self._result = None

    def execute(self, query: str, params=None) -> None:  # pragma: no cover - simple shim
        normalized = " ".join(query.split()).lower()
        self._result = None
        if normalized.startswith("select") and "from users" in normalized and "role='admin'" in normalized:
            admin = self.storage.get('admin')
            if not admin:
                self._result = None
                return
            result = {
                'id': admin['id'],
                'email': admin['email'],
                'password_hash': admin['password_hash'],
                'is_active': admin.get('is_active', 1),
            }
            if self.dictionary:
                self._result = result
            else:
                self._result = (
                    result['id'],
                    result['email'],
                    result['password_hash'],
                    result['is_active'],
                )
        elif normalized.startswith("update users set last_login_at"):
            admin = self.storage.get('admin')
            admin.setdefault('last_login_updates', []).append(params)
        elif normalized.startswith("delete from email_verifications"):
            self.storage.setdefault('verifications', []).clear()
        elif normalized.startswith("insert into email_verifications"):
            user_id, email, token, expires_at = params
            self.storage.setdefault('verifications', []).append(
                {'user_id': user_id, 'email': email, 'token': token, 'expires_at': expires_at}
            )
        else:
            self._result = None

    def fetchone(self):
        return self._result

    def close(self) -> None:  # pragma: no cover - shim
        return None


class DummyConnection:
    def __init__(self, storage: Dict[str, object]) -> None:
        self.storage = storage

    def cursor(self, dictionary: bool = False):
        return DummyCursor(self.storage, dictionary=dictionary)

    def commit(self) -> None:
        self.storage['commits'] = self.storage.get('commits', 0) + 1

    def rollback(self) -> None:
        self.storage['rollbacks'] = self.storage.get('rollbacks', 0) + 1

    def close(self) -> None:  # pragma: no cover - shim
        return None


@pytest.fixture
def app_client(monkeypatch):
    real_open = builtins.open

    def mock_open(path, *args, **kwargs):
        if path == '/etc/secrets/hwm-session-secret':
            return io.StringIO('secret')
        return real_open(path, *args, **kwargs)

    monkeypatch.setattr(builtins, 'open', mock_open)

    storage: Dict[str, object] = {
        'admin': {
            'id': 1,
            'email': 'admin@example.com',
            'password_hash': auth_utils.hash_password('adminpw'),
            'is_active': 1,
            'last_login_updates': [],
        },
        'verifications': [],
    }

    class DummyPool:
        def get_connection(self):  # pragma: no cover - shim
            raise RuntimeError('DB access disabled in tests')

    monkeypatch.setattr('mysql.connector.pooling.MySQLConnectionPool', lambda *a, **kw: DummyPool())

    app_module = importlib.import_module('app')
    app_module.app.config['TESTING'] = True
    monkeypatch.setattr(app_module, 'CONTACT_RATE_LIMIT', {})
    monkeypatch.setattr(app_module, 'CONTACT_MIN_DURATION_MS', 0)

    def fake_get_connection():
        return DummyConnection(storage)

    monkeypatch.setattr(app_module, 'get_connection', fake_get_connection)

    with app_module.app.test_client() as client:
        yield client, storage, app_module


def test_secure_data_requires_login(app_client):
    client, _, _ = app_client
    resp = client.get('/api/secure-data')
    assert resp.status_code == 403


def test_secure_data_after_login(app_client):
    client, storage, _ = app_client
    resp = client.post('/api/login', json={'password': 'adminpw'})
    assert resp.status_code == 200
    resp = client.get('/api/secure-data')
    assert resp.status_code == 200
    assert resp.get_json().get('status') == 'ok'
    assert storage['admin']['last_login_updates'], 'last_login should be updated'


def test_contact_requires_valid_data(app_client):
    client, _, _ = app_client
    resp = client.post('/api/contact', data={})
    assert resp.status_code == 400


def test_contact_success(app_client, monkeypatch):
    client, _, app_module = app_client
    monkeypatch.setattr(app_module, 'CONTACT_SMTP_HOST', 'smtp.test.local')
    monkeypatch.setattr(app_module, 'CONTACT_RECIPIENT', 'dest@example.com')
    monkeypatch.setattr(app_module, 'CONTACT_FROM_ADDRESS', 'noreply@example.com')

    sent: Dict[str, object] = {}

    def fake_send(name, email, subject, body, attachment):
        sent['name'] = name
        sent['email'] = email
        sent['subject'] = subject
        sent['body'] = body
        sent['attachment'] = attachment

    monkeypatch.setattr(app_module, '_send_contact_email', fake_send)

    resp = client.post(
        '/api/contact',
        data={
            'name': 'Tester',
            'email': 'tester@example.com',
            'subject': 'Feedback',
            'message': 'Dies ist eine ausführliche Nachricht.' * 2,
            'consent': 'true',
            'hm-contact-start': str(int(time.time() * 1000)),
        },
    )
    assert resp.status_code == 200
    assert sent.get('subject') == 'Feedback'
    assert 'Tester' in sent.get('body', '')


def test_resend_verification_sends_mail(app_client, monkeypatch):
    client, storage, app_module = app_client

    sent: Dict[str, object] = {}

    def fake_send_verification(email, token, expires_at):
        sent['email'] = email
        sent['token'] = token
        sent['expires_at'] = expires_at

    monkeypatch.setattr(app_module, '_send_verification_email', fake_send_verification)

    login_resp = client.post('/api/login', json={'password': 'adminpw'})
    assert login_resp.status_code == 200

    resp = client.post('/api/admin/resend-verification')
    assert resp.status_code == 200
    assert sent.get('email') == storage['admin']['email']
    assert storage['verifications'], 'verification entry should be stored'
