import builtins
import importlib
import io
import os
import sys
import time

import pytest

# Ensure app module can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

@pytest.fixture
def client(monkeypatch):
    real_open = builtins.open
    def mock_open(path, *args, **kwargs):
        if path == '/etc/secrets/hwm-session-secret':
            return io.StringIO('secret')
        if path == '/etc/secrets/hwm-pw':
            return io.StringIO('adminpw')
        return real_open(path, *args, **kwargs)
    monkeypatch.setattr(builtins, 'open', mock_open)

    class DummyPool:
        def get_connection(self):
            raise RuntimeError('DB access disabled in tests')
    monkeypatch.setattr('mysql.connector.pooling.MySQLConnectionPool', lambda *a, **kw: DummyPool())
    app = importlib.import_module('app')
    monkeypatch.setattr(app, 'ADMIN_PASSWORD', 'adminpw')
    monkeypatch.setattr(app, 'CONTACT_RATE_LIMIT', {})
    app.app.config['TESTING'] = True
    with app.app.test_client() as c:
        yield c


def test_secure_data_requires_login(client):
    resp = client.get('/api/secure-data')
    assert resp.status_code == 403


def test_secure_data_after_login(client):
    resp = client.post('/api/login', json={'password': 'adminpw'})
    assert resp.status_code == 200
    resp = client.get('/api/secure-data')
    assert resp.status_code == 200
    assert resp.get_json().get('status') == 'ok'


def test_contact_requires_valid_data(client):
    resp = client.post('/api/contact', data={})
    assert resp.status_code == 400


def test_contact_success(monkeypatch):
    real_open = builtins.open

    def mock_open(path, *args, **kwargs):
        if path == '/etc/secrets/hwm-session-secret':
            return io.StringIO('secret')
        if path == '/etc/secrets/hwm-pw':
            return io.StringIO('adminpw')
        return real_open(path, *args, **kwargs)

    monkeypatch.setattr(builtins, 'open', mock_open)

    class DummyPool:
        def get_connection(self):
            raise RuntimeError('DB access disabled in tests')

    monkeypatch.setattr('mysql.connector.pooling.MySQLConnectionPool', lambda *a, **kw: DummyPool())
    app = importlib.import_module('app')
    app.app.config['TESTING'] = True
    monkeypatch.setattr(app, 'CONTACT_SMTP_HOST', 'smtp.test.local')
    monkeypatch.setattr(app, 'CONTACT_RECIPIENT', 'dest@example.com')
    monkeypatch.setattr(app, 'CONTACT_FROM_ADDRESS', 'noreply@example.com')
    monkeypatch.setattr(app, 'CONTACT_RATE_LIMIT', {})
    monkeypatch.setattr(app, 'CONTACT_MIN_DURATION_MS', 0)

    sent = {}

    def fake_send(name, email, subject, body, attachment):
        sent['name'] = name
        sent['email'] = email
        sent['subject'] = subject
        sent['body'] = body
        sent['attachment'] = attachment

    monkeypatch.setattr(app, '_send_contact_email', fake_send)

    with app.app.test_client() as client:
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
