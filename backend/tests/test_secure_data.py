import builtins
import importlib
import io
import os
import sys
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
