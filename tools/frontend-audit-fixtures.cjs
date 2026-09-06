// Synthetic browser-only fixtures. Requests never reach a real account or backend.
const date = new Date().toLocaleDateString('en-CA');
const user = { id: 1, email: 'audit@example.invalid', role: 'admin', class_id: 1, class_slug: 'L23a', class_title: 'L23a', created_at: '2025-09-01T12:00:00Z', account_age_days: 370 };
const classes = [{ id: 1, slug: 'L23a', title: 'L23a' }];
const lessons = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, subject: ['Mathematik', 'Deutsch', 'Biologie'][i % 3], start: `${String(8 + i).padStart(2, '0')}:00`, end: `${String(8 + i).padStart(2, '0')}:45`, room: 'B204', status: 'normal', badges: [] }));
const entries = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, typ: ['hausaufgabe', 'pruefung', 'event'][i % 3], datum: date, fach: 'MA', beschreibung: `Prüfungsvorbereitung ${i + 1}\nKapitel 4 gemeinsam besprechen`, startzeit: `${String(8 + i).padStart(2, '0')}:00:00`, endzeit: `${String(8 + i).padStart(2, '0')}:45:00`, can_edit: true, class_id: 1 }));
const todos = [{ id: 1, beschreibung: 'Mathematik wiederholen', datum: date, is_done: false, subtasks: [{ id: 1, title: 'Kapitel 4 lesen', is_done: false }, { id: 2, title: 'Übungen lösen', is_done: true }] }];

function fixture(url, scenario = 'success') {
  if (scenario === 'empty') {
    if (url.hostname === 'transport.opendata.ch') return { station: { name: 'Ruopigen' }, stationboard: [] };
    if (url.pathname === '/entries') return [];
    if (['/api/todos', '/api/news'].includes(url.pathname)) return { status: 'ok', data: [] };
    if (url.pathname === '/api/weekly-preview') return { summary: '' };
    if (url.pathname === '/api/timetable/day') return { date, day_plan: [] };
    if (url.pathname === '/api/timetable/week') return { week_start: date, week_end: date, days: [] };
    if (url.pathname === '/aktuelles_fach') return { fach: 'frei', naechstes_fach: 'frei' };
  }
  if (url.hostname === 'transport.opendata.ch') return { station: { name: 'Luzern, Ruopigen Zentrum' }, stationboard: Array.from({ length: 10 }, (_, i) => ({ number: '20', category: 'B', to: 'Luzern Bahnhof mit längerem Zielnamen', operator: 'vbl', stop: { departure: new Date(Date.now() + (i * 5 + 1) * 60000).toISOString(), platform: 'A', prognosis: { departure: new Date(Date.now() + (i * 5 + 3) * 60000).toISOString() } } })) };
  if (url.pathname === '/api/me') return { status: 'ok', data: user };
  if (url.pathname === '/entries') return entries;
  if (url.pathname === '/api/todos') return { status: 'ok', data: todos, id: 2 };
  if (url.pathname === '/api/news') return { status: 'ok', data: [{ id: 1, title: 'Prüfungswoche im September', summary: 'Die nächsten Termine und Informationen für deine Klasse.', published_at: date, link_url: '/kalender' }] };
  if (url.pathname === '/api/classes') return classes;
  if (url.pathname === '/aktuelles_fach') return { fach: 'Mathematik', raum: 'B204', start: '09:00', ende: '09:45', gesamt_sekunden: 2700, verbleibende_sekunden: 900, naechstes_fach: 'Deutsch', naechste_start: '10:00', naechster_raum: 'A102' };
  if (url.pathname === '/api/timetable/day') return { date, day_plan: lessons };
  if (url.pathname === '/api/timetable/week') return { week_start: date, week_end: date, days: Array.from({ length: 5 }, (_, i) => ({ date: new Date(Date.now() + i * 86400000).toLocaleDateString('en-CA'), lessons })) };
  if (url.pathname === '/api/weekly-preview') return { summary: 'Deine Woche im Überblick\n- Mathematik: Kapitel 4 vorbereiten\n- Biologie: Prüfung am Mittwoch\n- Projektarbeit bis Freitag abschliessen', generated_at: new Date().toISOString(), source: 'cache' };
  if (url.pathname.startsWith('/api/admin/')) return { status: 'ok', data: url.pathname.endsWith('/users') ? [user] : url.pathname.endsWith('/classes') ? classes : [], pagination: { total: 1 } };
  return { status: 'ok', data: {}, class_id: 1, class_slug: 'L23a' };
}
module.exports = { fixture };
