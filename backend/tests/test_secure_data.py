import smtplib
import time
from typing import Dict

import pytest


def test_secure_data_requires_login(app_client):
    client, _, _ = app_client
    resp = client.get('/api/secure-data')
    assert resp.status_code == 403


def test_secure_data_after_login(app_client):
    client, _, _ = app_client
    resp = client.post('/api/auth/login', json={'email': 'admin@example.com', 'password': 'adminpw'})
    assert resp.status_code == 200
    resp = client.get('/api/secure-data')
    assert resp.status_code == 200


def _login_admin(client):
    resp = client.post('/api/auth/login', json={'email': 'admin@example.com', 'password': 'adminpw'})
    assert resp.status_code == 200


def test_admin_logs_requires_admin(app_client):
    client, _, _ = app_client
    resp = client.get('/api/admin/logs')
    assert resp.status_code == 403


def test_admin_logs_returns_recent_lines(app_client, tmp_path, monkeypatch):
    client, _, app_module = app_client
    _login_admin(client)

    log_file = tmp_path / 'backend.log'
    log_file.write_text('line1\nline2\nline3\n', encoding='utf-8')

    monkeypatch.setattr(app_module, 'LOG_FILE_HANDLER', None, raising=False)
    monkeypatch.setattr(app_module, 'LOG_FILE_PATH', str(log_file))

    resp = client.get('/api/admin/logs?lines=2')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['status'] == 'ok'
    assert data['source'] == str(log_file)
    assert data['lines'] == 2
    assert data['missing'] is False
    assert data['truncated'] is True
    assert 'line3' in data['logs']
    assert 'line1' not in data['logs']


def test_admin_users_crud_and_pagination(app_client):
    client, storage, _ = app_client
    _login_admin(client)

    resp = client.post(
        '/api/admin/users',
        json={
            'email': 'teacher@example.com',
            'password': 'Secret123!',
            'role': 'teacher',
            'class_id': 1,
            'is_active': True,
        },
    )
    data = resp.get_json()
    assert resp.status_code == 200
    assert data['status'] == 'ok'
    new_user_id = data['id']
    assert new_user_id in storage['users']

    resp = client.get('/api/admin/users?page=1&page_size=5')
    paginated = resp.get_json()
    assert resp.status_code == 200
    assert paginated['pagination']['total'] == len(storage['users'])

    resp = client.put(
        f'/api/admin/users/{new_user_id}',
        json={'role': 'admin', 'is_active': False},
    )
    assert resp.status_code == 200
    assert storage['users'][new_user_id]['role'] == 'admin'
    assert storage['users'][new_user_id]['is_active'] == 0

    resp = client.delete(f'/api/admin/users/{new_user_id}')
    assert resp.status_code == 200
    assert new_user_id not in storage['users']

    assert any(entry['action'] == 'delete' and entry['entity_type'] == 'user' for entry in storage['audit_logs'])


def test_admin_classes_and_schedules_crud(app_client):
    client, storage, _ = app_client
    _login_admin(client)

    resp = client.post(
        '/api/admin/classes',
        json={
            'slug': 'new-class',
            'title': 'Neue Klasse',
            'description': 'Test',
            'is_active': True,
        },
    )
    class_data = resp.get_json()
    assert resp.status_code == 200
    new_class_id = class_data['id']
    assert new_class_id in storage['classes']

    resp = client.put(
        f'/api/admin/classes/{new_class_id}',
        json={'title': 'Aktualisierte Klasse', 'is_active': False},
    )
    assert resp.status_code == 200
    assert storage['classes'][new_class_id]['title'] == 'Aktualisierte Klasse'
    assert storage['classes'][new_class_id]['is_active'] == 0

    resp = client.post(
        '/api/admin/schedules',
        json={'class_id': new_class_id, 'source': 'manual', 'import_hash': 'abc123'},
    )
    schedule_data = resp.get_json()
    assert resp.status_code == 200
    schedule_id = schedule_data['id']
    assert schedule_id in storage['class_schedules']

    resp = client.put(
        f'/api/admin/schedules/{schedule_id}',
        json={'source': 'imported', 'import_hash': 'xyz987'},
    )
    assert resp.status_code == 200
    assert storage['class_schedules'][schedule_id]['source'] == 'imported'

    resp = client.delete(f'/api/admin/schedules/{schedule_id}')
    assert resp.status_code == 200
    assert schedule_id not in storage['class_schedules']

    resp = client.delete(f'/api/admin/classes/{new_class_id}')
    assert resp.status_code == 200
    assert new_class_id not in storage['classes']

    actions = {(entry['entity_type'], entry['action']) for entry in storage['audit_logs']}
    assert ('class', 'delete') in actions
    assert ('schedule', 'delete') in actions
    assert resp.get_json().get('status') == 'ok'
    admin_id = storage['users_by_email']['admin@example.com']
    admin = storage['users'][admin_id]
    assert admin['last_login_updates'], 'last_login should be updated'


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


def test_deliver_email_falls_back_to_ssl(monkeypatch, app_client):
    _, _, app_module = app_client

    monkeypatch.setattr(app_module, 'CONTACT_SMTP_HOST', 'smtp.example.com')
    monkeypatch.setattr(app_module, 'CONTACT_SMTP_PORTS', (587, 465))
    monkeypatch.setattr(app_module, 'CONTACT_SMTP_USER', 'noreply@example.com')
    monkeypatch.setattr(app_module, 'CONTACT_SMTP_PASSWORD', 'super-secret')
    monkeypatch.setattr(app_module, 'CONTACT_FROM_ADDRESS', 'noreply@example.com')

    failing_instances = []

    class FailingSMTP:
        def __init__(self, host, port, timeout=10, **kwargs):
            assert port == 587
            failing_instances.append(self)
            self.quit_called = False

        def starttls(self):
            raise smtplib.SMTPException('starttls failed')

        def login(self, *args, **kwargs):  # pragma: no cover - should not be called
            pytest.fail('login should not be called on failing SMTP instance')

        def send_message(self, *args, **kwargs):  # pragma: no cover - should not be called
            pytest.fail('send_message should not be called on failing SMTP instance')

        def quit(self):
            self.quit_called = True

    class SuccessfulSMTP:
        def __init__(self, *args, **kwargs):
            self.login_called = False
            self.sent_messages = []
            self.quit_called = False

        def login(self, user, password):
            self.login_called = True
            self.credentials = (user, password)

        def send_message(self, message):
            self.sent_messages.append(message)

        def quit(self):
            self.quit_called = True

    success_state = {}

    monkeypatch.setattr(app_module.smtplib, 'SMTP', FailingSMTP)

    def fake_smtp_ssl(host, port, timeout=10, **kwargs):
        assert port == 465
        instance = SuccessfulSMTP(host, port, timeout=timeout, **kwargs)
        success_state['instance'] = instance
        success_state['params'] = {'host': host, 'port': port, 'timeout': timeout}
        return instance

    monkeypatch.setattr(app_module.smtplib, 'SMTP_SSL', fake_smtp_ssl)

    app_module._deliver_email('dest@example.com', 'Subject', 'Body text')

    assert failing_instances, 'Fallback should attempt TLS first'
    assert failing_instances[0].quit_called is True

    success = success_state.get('instance')
    assert success is not None
    assert success.login_called is True
    assert success.sent_messages, 'Email should be sent via SSL fallback'
    assert success.quit_called is True
    assert success_state['params']['timeout'] == 10


def test_resend_verification_sends_mail(app_client, monkeypatch):
    client, storage, app_module = app_client

    sent: Dict[str, object] = {}

    def fake_send_verification(email, code, expires_at):
        sent['email'] = email
        sent['code'] = code
        sent['expires_at'] = expires_at

    monkeypatch.setattr(app_module, '_send_verification_email', fake_send_verification)

    admin_id = storage['users_by_email']['admin@example.com']
    storage['users'][admin_id]['email_verified_at'] = None

    resp = client.post('/api/auth/resend', json={'email': 'admin@example.com'})
    assert resp.status_code == 200
    assert sent.get('email') == 'admin@example.com'
    assert storage['verifications'], 'verification entry should be stored'
