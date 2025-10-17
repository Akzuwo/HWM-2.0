import builtins
import datetime
import importlib
import io
import os
import sys
import time
from typing import Dict, List, Optional

import pytest

# Ensure app module can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from auth import utils as auth_utils


class FakeCursor:
    def __init__(self, storage: Dict[str, object], dictionary: bool = False) -> None:
        self.storage = storage
        self.dictionary = dictionary
        self._rows: List[object] = []
        self.rowcount = 0
        self.lastrowid: Optional[int] = None

    def _prepare_rows(self, rows: List[Dict[str, object]], columns: List[str]) -> None:
        if self.dictionary:
            self._rows = [{col: row.get(col) for col in columns} for row in rows]
        else:
            self._rows = [tuple(row.get(col) for col in columns) for row in rows]

    def execute(self, query: str, params=None) -> None:  # pragma: no cover - shim
        normalized = " ".join(query.split()).lower()
        self._rows = []
        self.rowcount = 0
        self.lastrowid = None

        users: Dict[int, Dict[str, object]] = self.storage.setdefault('users', {})
        classes: Dict[int, Dict[str, object]] = self.storage.setdefault('classes', {})
        schedules: Dict[int, Dict[str, object]] = self.storage.setdefault('class_schedules', {})

        if normalized.startswith("select count(*) as total from users"):
            self._prepare_rows([
                {'total': len(users)}
            ], ['total'])
            return

        if normalized.startswith("select id, email, password_hash, is_active, email_verified_at, role from users where role='admin'"):
            admin = next((row for row in users.values() if row.get('role') == 'admin'), None)
            if not admin:
                self._rows = []
                return
            self._prepare_rows([
                {
                    'id': admin['id'],
                    'email': admin['email'],
                    'password_hash': admin['password_hash'],
                    'is_active': admin.get('is_active', 1),
                    'email_verified_at': admin.get('email_verified_at'),
                    'role': admin.get('role'),
                }
            ], ['id', 'email', 'password_hash', 'is_active', 'email_verified_at', 'role'])
            return

        if normalized.startswith("select id, email, password_hash, role, class_id, is_active, email_verified_at") and "where email=%s" in normalized:
            email = params[0] if params else None
            user_id = self.storage.setdefault('users_by_email', {}).get(email)
            if user_id is None:
                self._rows = []
                return
            user = users.get(user_id)
            if not user:
                self._rows = []
                return
            self._prepare_rows([
                {
                    'id': user['id'],
                    'email': user['email'],
                    'password_hash': user['password_hash'],
                    'role': user.get('role', 'student'),
                    'class_id': user.get('class_id'),
                    'is_active': user.get('is_active', 1),
                    'email_verified_at': user.get('email_verified_at'),
                }
            ], ['id', 'email', 'password_hash', 'role', 'class_id', 'is_active', 'email_verified_at'])
            return

        if normalized.startswith("select id, email, role, class_id, is_active, created_at, updated_at from users order by id desc"):
            limit, offset = params
            ordered = sorted(users.values(), key=lambda row: row['id'], reverse=True)
            subset = ordered[offset:offset + limit]
            rows = [
                {
                    'id': row['id'],
                    'email': row['email'],
                    'role': row.get('role', 'student'),
                    'class_id': row.get('class_id'),
                    'is_active': row.get('is_active', 1),
                    'created_at': row['created_at'],
                    'updated_at': row['updated_at'],
                }
                for row in subset
            ]
            self._prepare_rows(rows, ['id', 'email', 'role', 'class_id', 'is_active', 'created_at', 'updated_at'])
            return

        if normalized.startswith("select id, email, role, class_id, is_active, created_at, updated_at from users where id=%s"):
            user_id = params[0]
            user = users.get(user_id)
            if not user:
                self._rows = []
                return
            self._prepare_rows([
                {
                    'id': user['id'],
                    'email': user['email'],
                    'role': user.get('role', 'student'),
                    'class_id': user.get('class_id'),
                    'is_active': user.get('is_active', 1),
                    'created_at': user['created_at'],
                    'updated_at': user['updated_at'],
                }
            ], ['id', 'email', 'role', 'class_id', 'is_active', 'created_at', 'updated_at'])
            return

        if normalized.startswith("insert into users"):
            email, password_hash, role, class_id, is_active, created_at, updated_at = params
            if email in self.storage.setdefault('users_by_email', {}):
                raise RuntimeError('duplicate email')
            new_id = self.storage.setdefault('next_ids', {}).setdefault('users', 1)
            self.storage['next_ids']['users'] = new_id + 1
            user_record = {
                'id': new_id,
                'email': email,
                'password_hash': password_hash,
                'role': role,
                'class_id': class_id,
                'is_active': is_active,
                'created_at': created_at,
                'updated_at': updated_at,
                'email_verified_at': None,
            }
            users[new_id] = user_record
            self.storage['users_by_email'][email] = new_id
            self.lastrowid = new_id
            self.rowcount = 1
            return

        if normalized.startswith("update users set last_login_at"):
            user_id = params[1]
            user = users.get(user_id)
            if user:
                user.setdefault('last_login_updates', []).append(params)
                user['updated_at'] = datetime.datetime.utcnow()
                self.rowcount = 1
            return

        if normalized.startswith("update users set"):
            set_part = query.split('SET', 1)[1].rsplit('WHERE', 1)[0]
            assignments = [segment.strip() for segment in set_part.split(',')]
            user_id = params[-1]
            user = users.get(user_id)
            if not user:
                self.rowcount = 0
                return
            for assignment, value in zip(assignments, params[:-1]):
                column = assignment.split('=')[0].strip().strip('`')
                if column == 'email':
                    old_email = user['email']
                    if old_email != value:
                        self.storage['users_by_email'].pop(old_email, None)
                        self.storage['users_by_email'][value] = user_id
                    user['email'] = value
                elif column == 'role':
                    user['role'] = value
                elif column == 'class_id':
                    user['class_id'] = value
                elif column == 'is_active':
                    user['is_active'] = value
                elif column == 'password_hash':
                    user['password_hash'] = value
            user['updated_at'] = datetime.datetime.utcnow()
            self.rowcount = 1
            return

        if normalized.startswith("delete from users where id=%s"):
            user_id = params[0]
            user = users.pop(user_id, None)
            if user:
                self.storage['users_by_email'].pop(user['email'], None)
                self.rowcount = 1
            return

        if normalized.startswith("select count(*) as total from classes"):
            self._prepare_rows([
                {'total': len(classes)}
            ], ['total'])
            return

        if normalized.startswith("select id, slug, title, description, is_active, created_at, updated_at from classes order by title asc"):
            limit, offset = params
            ordered = sorted(classes.values(), key=lambda row: row['title'])
            subset = ordered[offset:offset + limit]
            rows = [
                {
                    'id': row['id'],
                    'slug': row['slug'],
                    'title': row['title'],
                    'description': row.get('description'),
                    'is_active': row.get('is_active', 1),
                    'created_at': row['created_at'],
                    'updated_at': row['updated_at'],
                }
                for row in subset
            ]
            self._prepare_rows(rows, ['id', 'slug', 'title', 'description', 'is_active', 'created_at', 'updated_at'])
            return

        if normalized.startswith("select id, slug, title, description, is_active, created_at, updated_at from classes where id=%s"):
            class_id = params[0]
            cls = classes.get(class_id)
            if not cls:
                self._rows = []
                return
            self._prepare_rows([
                {
                    'id': cls['id'],
                    'slug': cls['slug'],
                    'title': cls['title'],
                    'description': cls.get('description'),
                    'is_active': cls.get('is_active', 1),
                    'created_at': cls['created_at'],
                    'updated_at': cls['updated_at'],
                }
            ], ['id', 'slug', 'title', 'description', 'is_active', 'created_at', 'updated_at'])
            return

        if normalized.startswith("select id from classes where id=%s"):
            class_id = params[0]
            if class_id in classes:
                self._prepare_rows([{'id': class_id}], ['id'])
            else:
                self._rows = []
            return

        if normalized.startswith("insert into classes"):
            slug, title, description, is_active, created_at, updated_at = params
            new_id = self.storage.setdefault('next_ids', {}).setdefault('classes', 1)
            self.storage['next_ids']['classes'] = new_id + 1
            classes[new_id] = {
                'id': new_id,
                'slug': slug,
                'title': title,
                'description': description,
                'is_active': is_active,
                'created_at': created_at,
                'updated_at': updated_at,
            }
            self.lastrowid = new_id
            self.rowcount = 1
            return

        if normalized.startswith("update classes set"):
            set_part = query.split('SET', 1)[1].rsplit('WHERE', 1)[0]
            assignments = [segment.strip() for segment in set_part.split(',')]
            class_id = params[-1]
            cls = classes.get(class_id)
            if not cls:
                self.rowcount = 0
                return
            for assignment, value in zip(assignments, params[:-1]):
                column = assignment.split('=')[0].strip().strip('`')
                cls[column] = value
            cls['updated_at'] = datetime.datetime.utcnow()
            self.rowcount = 1
            return

        if normalized.startswith("delete from classes where id=%s"):
            class_id = params[0]
            if classes.pop(class_id, None):
                self.rowcount = 1
            return

        if normalized.startswith("select count(*) as total from class_schedules"):
            self._prepare_rows([
                {'total': len(schedules)}
            ], ['total'])
            return

        if normalized.startswith("select cs.id, cs.class_id, cs.source, cs.import_hash, cs.imported_at") and "from class_schedules" in normalized:
            limit, offset = params
            ordered = sorted(schedules.values(), key=lambda row: row['id'], reverse=True)
            subset = ordered[offset:offset + limit]
            rows = []
            for entry in subset:
                class_info = classes.get(entry['class_id'], {})
                rows.append(
                    {
                        'id': entry['id'],
                        'class_id': entry['class_id'],
                        'source': entry.get('source'),
                        'import_hash': entry.get('import_hash'),
                        'imported_at': entry.get('imported_at'),
                        'created_at': entry['created_at'],
                        'updated_at': entry['updated_at'],
                        'class_slug': class_info.get('slug'),
                        'class_title': class_info.get('title'),
                    }
                )
            self._prepare_rows(
                rows,
                ['id', 'class_id', 'source', 'import_hash', 'imported_at', 'created_at', 'updated_at', 'class_slug', 'class_title'],
            )
            return

        if normalized.startswith("select cs.id, cs.class_id, cs.source, cs.import_hash, cs.imported_at") and "where cs.id=%s" in normalized:
            schedule_id = params[0]
            entry = schedules.get(schedule_id)
            if not entry:
                self._rows = []
                return
            class_info = classes.get(entry['class_id'], {})
            self._prepare_rows(
                [
                    {
                        'id': entry['id'],
                        'class_id': entry['class_id'],
                        'source': entry.get('source'),
                        'import_hash': entry.get('import_hash'),
                        'imported_at': entry.get('imported_at'),
                        'created_at': entry['created_at'],
                        'updated_at': entry['updated_at'],
                        'class_slug': class_info.get('slug'),
                        'class_title': class_info.get('title'),
                    }
                ],
                ['id', 'class_id', 'source', 'import_hash', 'imported_at', 'created_at', 'updated_at', 'class_slug', 'class_title'],
            )
            return

        if normalized.startswith("insert into class_schedules"):
            class_id, source, import_hash, imported_at, created_at, updated_at = params
            new_id = self.storage.setdefault('next_ids', {}).setdefault('class_schedules', 1)
            self.storage['next_ids']['class_schedules'] = new_id + 1
            schedules[new_id] = {
                'id': new_id,
                'class_id': class_id,
                'source': source,
                'import_hash': import_hash,
                'imported_at': imported_at,
                'created_at': created_at,
                'updated_at': updated_at,
            }
            self.lastrowid = new_id
            self.rowcount = 1
            return

        if normalized.startswith("update class_schedules set"):
            set_part = query.split('SET', 1)[1].rsplit('WHERE', 1)[0]
            assignments = [segment.strip() for segment in set_part.split(',')]
            schedule_id = params[-1]
            entry = schedules.get(schedule_id)
            if not entry:
                self.rowcount = 0
                return
            for assignment, value in zip(assignments, params[:-1]):
                column = assignment.split('=')[0].strip().strip('`')
                entry[column] = value
            entry['updated_at'] = datetime.datetime.utcnow()
            self.rowcount = 1
            return

        if normalized.startswith("delete from class_schedules where id=%s"):
            schedule_id = params[0]
            if schedules.pop(schedule_id, None):
                self.rowcount = 1
            return

        if normalized.startswith("insert into admin_audit_logs"):
            actor_id, action, entity_type, entity_id, details = params
            log_id = self.storage.setdefault('next_ids', {}).setdefault('audit_logs', 1)
            self.storage['next_ids']['audit_logs'] = log_id + 1
            self.storage.setdefault('audit_logs', []).append(
                {
                    'id': log_id,
                    'actor_id': actor_id,
                    'action': action,
                    'entity_type': entity_type,
                    'entity_id': entity_id,
                    'details': details,
                }
            )
            self.lastrowid = log_id
            self.rowcount = 1
            return

        if normalized.startswith("insert into email_verifications"):
            user_id, email, token, expires_at = params
            entries = self.storage.setdefault('verifications', [])
            verification_id = len(entries) + 1
            entries.append(
                {
                    'id': verification_id,
                    'user_id': user_id,
                    'email': email,
                    'token': token,
                    'expires_at': expires_at,
                }
            )
            self.lastrowid = verification_id
            self.rowcount = 1
            return

        if normalized.startswith("delete from email_verifications"):
            self.storage.setdefault('verifications', []).clear()
            self.rowcount = 0
            return

        if normalized.startswith("update email_verifications set verified_at"):
            verified_at, verification_id = params
            entries = self.storage.setdefault('verifications', [])
            for entry in entries:
                if entry['id'] == verification_id:
                    entry['verified_at'] = verified_at
                    break
            self.rowcount = 1
            return

        if normalized.startswith("update users set email_verified_at"):
            email_verified_at, user_id = params
            user = users.get(user_id)
            if user:
                user['email_verified_at'] = email_verified_at
                user['updated_at'] = datetime.datetime.utcnow()
                self.rowcount = 1
            return

        if normalized.startswith("select id from users where id=%s"):
            user_id = params[0]
            if user_id in users:
                self._prepare_rows([{'id': user_id}], ['id'])
            else:
                self._rows = []
            return

        self._rows = []

    def fetchone(self):  # pragma: no cover - shim
        if not self._rows:
            return None
        return self._rows.pop(0)

    def fetchall(self):  # pragma: no cover - shim
        rows = list(self._rows)
        self._rows = []
        return rows

    def close(self) -> None:  # pragma: no cover - shim
        return None


class FakeConnection:
    def __init__(self, storage: Dict[str, object]) -> None:
        self.storage = storage

    def cursor(self, dictionary: bool = False):
        return FakeCursor(self.storage, dictionary=dictionary)

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

    now = datetime.datetime.utcnow()
    storage: Dict[str, object] = {
        'users': {
            1: {
                'id': 1,
                'email': 'admin@example.com',
                'password_hash': auth_utils.hash_password('adminpw'),
                'role': 'admin',
                'class_id': 1,
                'is_active': 1,
                'created_at': now,
                'updated_at': now,
                'email_verified_at': now,
                'last_login_updates': [],
            }
        },
        'users_by_email': {'admin@example.com': 1},
        'classes': {
            1: {
                'id': 1,
                'slug': 'default',
                'title': 'Default Class',
                'description': 'Default class',
                'is_active': 1,
                'created_at': now,
                'updated_at': now,
            }
        },
        'class_schedules': {},
        'audit_logs': [],
        'verifications': [],
        'next_ids': {'users': 2, 'classes': 2, 'class_schedules': 1, 'audit_logs': 1},
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
        return FakeConnection(storage)

    monkeypatch.setattr(app_module, 'get_connection', fake_get_connection)

    with app_module.app.test_client() as client:
        yield client, storage, app_module


def test_secure_data_requires_login(app_client):
    client, _, _ = app_client
    resp = client.get('/api/secure-data')
    assert resp.status_code == 403


def test_secure_data_after_login(app_client):
    client, storage, _ = app_client
    resp = client.post('/api/auth/login', json={'email': 'admin@example.com', 'password': 'adminpw'})
    assert resp.status_code == 200
    resp = client.get('/api/secure-data')
    assert resp.status_code == 200


def _login_admin(client):
    resp = client.post('/api/auth/login', json={'email': 'admin@example.com', 'password': 'adminpw'})
    assert resp.status_code == 200


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


def test_resend_verification_sends_mail(app_client, monkeypatch):
    client, storage, app_module = app_client

    sent: Dict[str, object] = {}

    def fake_send_verification(email, token, expires_at):
        sent['email'] = email
        sent['token'] = token
        sent['expires_at'] = expires_at

    monkeypatch.setattr(app_module, '_send_verification_email', fake_send_verification)

    admin_id = storage['users_by_email']['admin@example.com']
    storage['users'][admin_id]['email_verified_at'] = None

    resp = client.post('/api/auth/resend', json={'email': 'admin@example.com'})
    assert resp.status_code == 200
    assert sent.get('email') == 'admin@example.com'
    assert storage['verifications'], 'verification entry should be stored'
