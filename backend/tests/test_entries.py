import datetime

from class_ids import DEFAULT_ENTRY_CLASS_ID


def _authenticate(client):
    with client.session_transaction() as sess:
        sess['is_admin'] = True
        sess['role'] = 'admin'
        sess['class_id'] = 1


def test_add_entry_uses_default_class_id(app_client):
    client, storage, _ = app_client
    _authenticate(client)

    payload = {
        'typ': 'event',
        'datum': '2024-05-01',
        'beschreibung': 'Testeintrag',
    }

    resp = client.post('/add_entry', json=payload)
    assert resp.status_code == 200

    entries = storage['eintraege']
    assert entries, 'entry should have been stored'
    assert entries[0]['class_id'] == DEFAULT_ENTRY_CLASS_ID


def test_add_entry_accepts_custom_class_id(app_client):
    client, storage, _ = app_client
    _authenticate(client)

    payload = {
        'typ': 'event',
        'datum': '2024-05-02',
        'beschreibung': 'Custom class entry',
        'class_id': 'u24F',
    }

    resp = client.post('/add_entry', json=payload)
    assert resp.status_code == 200

    entries = storage['eintraege']
    assert entries[-1]['class_id'] == 'U24f'


def test_add_entry_rejects_invalid_class_id(app_client):
    client, storage, _ = app_client
    _authenticate(client)

    before_entries = list(storage['eintraege'])

    payload = {
        'typ': 'event',
        'datum': '2024-05-03',
        'beschreibung': 'Invalid class',
        'class_id': 'XYZ',
    }

    resp = client.post('/add_entry', json=payload)
    assert resp.status_code == 400
    assert storage['eintraege'] == before_entries


def test_class_admin_cannot_add_entry_for_other_class(app_client):
    client, storage, _ = app_client
    with client.session_transaction() as sess:
        sess['role'] = 'class_admin'
        sess['is_admin'] = False
        sess['entry_class_id'] = DEFAULT_ENTRY_CLASS_ID

    payload = {
        'typ': 'event',
        'datum': '2024-05-04',
        'beschreibung': 'Wrong class',
        'class_id': 'U24f',
    }

    resp = client.post('/add_entry', json=payload)
    assert resp.status_code == 403
    assert all(entry['beschreibung'] != 'Wrong class' for entry in storage['eintraege'])


def test_teacher_can_add_entry_for_any_class(app_client):
    client, storage, _ = app_client
    with client.session_transaction() as sess:
        sess['role'] = 'teacher'
        sess['is_admin'] = False

    payload = {
        'typ': 'event',
        'datum': '2024-05-05',
        'beschreibung': 'Teacher entry',
        'class_id': 'U24f',
    }

    resp = client.post('/add_entry', json=payload)
    assert resp.status_code == 200
    assert any(entry['beschreibung'] == 'Teacher entry' for entry in storage['eintraege'])


def test_entries_filters_by_session_class_slug(app_client):
    client, storage, _ = app_client
    storage['eintraege'] = [
        {
            'id': 1,
            'class_id': 'L23a',
            'beschreibung': 'Class A homework',
            'datum': datetime.date(2024, 5, 6),
            'startzeit': None,
            'endzeit': None,
            'typ': 'homework',
            'fach': 'Math',
        },
        {
            'id': 2,
            'class_id': 'U24f',
            'beschreibung': 'Other class homework',
            'datum': datetime.date(2024, 5, 7),
            'startzeit': None,
            'endzeit': None,
            'typ': 'homework',
            'fach': 'Science',
        },
    ]

    with client.session_transaction() as sess:
        sess['role'] = 'student'
        sess['class_id'] = 1
        sess['class_slug'] = 'l23a'
        sess.pop('entry_class_id', None)

    resp = client.get('/entries')
    assert resp.status_code == 200

    data = resp.get_json()
    assert [entry['beschreibung'] for entry in data] == ['Class A homework']


def test_entries_filters_by_other_class_slug(app_client):
    client, storage, _ = app_client
    storage['eintraege'] = [
        {
            'id': 1,
            'class_id': 'L23a',
            'beschreibung': 'Class A homework',
            'datum': datetime.date(2024, 5, 6),
            'startzeit': None,
            'endzeit': None,
            'typ': 'homework',
            'fach': 'Math',
        },
        {
            'id': 2,
            'class_id': 'U24f',
            'beschreibung': 'Other class homework',
            'datum': datetime.date(2024, 5, 7),
            'startzeit': None,
            'endzeit': None,
            'typ': 'homework',
            'fach': 'Science',
        },
    ]

    with client.session_transaction() as sess:
        sess['role'] = 'student'
        sess['class_id'] = 2
        sess['class_slug'] = 'u24f'
        sess.pop('entry_class_id', None)

    resp = client.get('/entries')
    assert resp.status_code == 200

    data = resp.get_json()
    assert [entry['beschreibung'] for entry in data] == ['Other class homework']
