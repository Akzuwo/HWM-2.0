import { useEffect, useMemo, useRef, useState } from 'react';
import { GlassSkeleton } from '../components/GlassSkeleton';
import { usePageSetup } from '../hooks/usePageSetup';
import { resolveApiBase } from '../../utils/js/api-client';
import { Link } from 'react-router-dom';
import { useConfirm } from '../hooks/useConfirm';

const today = new Date().toISOString().slice(0, 10);
const filters = [
  { id: 'all', label: 'Alle' },
  { id: 'open', label: 'Offen' },
  { id: 'done', label: 'Erledigt' }
];

async function apiFetch(path, options = {}) {
  const base = resolveApiBase();
  const url = path.startsWith('http') ? path : `${base}${path}`;
  const response = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload) {
    const error = new Error('Die Anfrage konnte nicht abgeschlossen werden.');
    error.status = response.status;
    throw error;
  }
  return payload;
}

function createDraft() {
  return {
    beschreibung: '',
    datum: today,
    subtasks: [{ title: '', is_done: false }]
  };
}

function cleanSubtasks(subtasks) {
  return subtasks
    .map((subtask) => ({ title: (subtask.title || '').trim(), is_done: Boolean(subtask.is_done) }))
    .filter((subtask) => subtask.title);
}

function normalizeTodo(todo) {
  const subtasks = Array.isArray(todo.subtasks) ? todo.subtasks : [];
  const allSubtasksDone = subtasks.length > 0 && subtasks.every((subtask) => subtask.is_done);
  return {
    ...todo,
    beschreibung: todo.beschreibung || '',
    datum: todo.datum || today,
    is_done: Boolean(todo.is_done || allSubtasksDone),
    subtasks
  };
}

function todoPayload(todo) {
  return {
    beschreibung: todo.beschreibung,
    datum: todo.datum || today,
    enddatum: todo.datum || today,
    is_done: Boolean(todo.is_done),
    subtasks: cleanSubtasks(todo.subtasks || [])
  };
}

function formatDueDate(value) {
  if (!value) return 'Heute';
  try {
    return new Intl.DateTimeFormat('de-CH', { day: '2-digit', month: '2-digit' }).format(new Date(`${value}T12:00:00`));
  } catch {
    return value;
  }
}

function sortTodos(a, b) {
  return String(a.datum || '').localeCompare(String(b.datum || '')) || String(a.beschreibung || '').localeCompare(String(b.beschreibung || ''));
}

export function TodoListsPage() {
  usePageSetup({ bodyClass: 'todo-lists-page' });

  const [todos, setTodos] = useState([]);
  const [draft, setDraft] = useState(createDraft);
  const [filter, setFilter] = useState('all');
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [titleDraft, setTitleDraft] = useState('');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const subtaskRefs = useRef([]);
  const mutationRefs = useRef(new Set());
  const [pendingIds, setPendingIds] = useState(new Set());
  const [authRequired, setAuthRequired] = useState(false);
  const { confirm, confirmation } = useConfirm();

  const stats = useMemo(() => {
    const openTodos = todos.filter((todo) => !todo.is_done).length;
    const openSteps = todos.reduce((sum, todo) => {
      if (!todo.subtasks.length) return sum + (todo.is_done ? 0 : 1);
      return sum + todo.subtasks.filter((subtask) => !subtask.is_done).length;
    }, 0);
    return { total: todos.length, openTodos, openSteps };
  }, [todos]);

  const visibleTodos = useMemo(() => {
    return todos
      .filter((todo) => {
        if (filter === 'open') return !todo.is_done;
        if (filter === 'done') return todo.is_done;
        return true;
      })
      .toSorted(sortTodos);
  }, [filter, todos]);

  async function loadTodos() {
    setStatus(todos.length ? 'refreshing' : 'loading');
    try {
      const payload = await apiFetch('/api/todos');
      setTodos((payload.data || []).map(normalizeTodo));
      setMessage('');
      setStatus('ready');
      setAuthRequired(false);
    } catch (error) {
      setAuthRequired(error.status === 401 || error.status === 403);
      setMessage(error.status === 401 || error.status === 403
        ? 'Bitte melde dich an, um deine ToDo-Listen zu sehen.'
        : 'Deine ToDos konnten nicht geladen werden. Prüfe die Verbindung und versuche es erneut.');
      setStatus('error');
    }
  }

  useEffect(() => {
    loadTodos();
  }, []);

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function updateDraftSubtask(index, value) {
    setDraft((current) => ({
      ...current,
      subtasks: current.subtasks.map((subtask, currentIndex) =>
        currentIndex === index ? { ...subtask, title: value } : subtask
      )
    }));
  }

  function removeDraftSubtask(index) {
    setDraft((current) => ({
      ...current,
      subtasks: current.subtasks.length > 1
        ? current.subtasks.filter((_, currentIndex) => currentIndex !== index)
        : [{ title: '', is_done: false }]
    }));
  }

  function handleDraftSubtaskKeyDown(event, index) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    setDraft((current) => {
      const next = [...current.subtasks];
      if (!next[index]?.title.trim()) return current;
      next.splice(index + 1, 0, { title: '', is_done: false });
      return { ...current, subtasks: next };
    });
    window.setTimeout(() => subtaskRefs.current[index + 1]?.focus(), 0);
  }

  function setPending(todoId, pending) {
    if (pending) mutationRefs.current.add(todoId);
    else mutationRefs.current.delete(todoId);
    setPendingIds(new Set(mutationRefs.current));
  }

  async function persistTodo(todo) {
    await apiFetch(`/api/todos/${todo.id}`, {
      method: 'PUT',
      body: JSON.stringify(todoPayload(todo))
    });
  }

  async function updateTodoOptimistic(todoId, updater) {
    if (mutationRefs.current.has(todoId)) return;
    const previous = todos.find(todo => todo.id === todoId);
    if (!previous) return;
    const nextTodo = normalizeTodo(typeof updater === 'function' ? updater(previous) : { ...previous, ...updater });
    setPending(todoId, true);
    setTodos(current => current.map(todo => todo.id === todoId ? nextTodo : todo));
    try {
      await persistTodo(nextTodo);
      setMessage('');
    } catch {
      setTodos(current => current.map(todo => todo.id === todoId ? previous : todo));
      setMessage('Änderung konnte nicht gespeichert werden. Der vorherige Stand wurde wiederhergestellt. Bitte versuche es erneut.');
    } finally {
      setPending(todoId, false);
    }
  }

  async function submitTodo(event) {
    event.preventDefault();
    if (mutationRefs.current.has('create')) return;
    const title = draft.beschreibung.trim();
    if (!title) {
      setMessage('Bitte gib deinem ToDo einen Titel.');
      return;
    }

    const subtasks = cleanSubtasks(draft.subtasks);
    const optimisticTodo = normalizeTodo({
      id: `tmp-${Date.now()}`,
      beschreibung: title,
      datum: draft.datum || today,
      is_done: false,
      subtasks
    });

    setPending('create', true);
    setStatus('saving');
    try {
      const payload = await apiFetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify(todoPayload(optimisticTodo))
      });
      setTodos(current => [{ ...optimisticTodo, id: payload.id }, ...current]);
      setDraft(current => current === draft ? createDraft() : current);
      setStatus('ready');
      setMessage('');
    } catch {
      setStatus('ready');
      setMessage('ToDo konnte nicht erstellt werden. Dein Entwurf bleibt erhalten. Bitte versuche es erneut.');
    } finally {
      setPending('create', false);
    }
  }

  function toggleExpanded(todoId) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(todoId)) next.delete(todoId);
      else next.add(todoId);
      return next;
    });
  }

  function startTitleEdit(todo) {
    setEditingTitleId(todo.id);
    setTitleDraft(todo.beschreibung);
  }

  async function saveTitle(todo) {
    const title = titleDraft.trim();
    setEditingTitleId(null);
    if (!title || title === todo.beschreibung) return;
    await updateTodoOptimistic(todo.id, { beschreibung: title });
  }

  async function toggleTodo(todo) {
    const nextDone = !todo.is_done;
    await updateTodoOptimistic(todo.id, {
      is_done: nextDone,
      subtasks: todo.subtasks.map((subtask) => ({ ...subtask, is_done: nextDone }))
    });
  }

  async function toggleSubtask(todo, subtaskIndex) {
    await updateTodoOptimistic(todo.id, (current) => {
      const subtasks = current.subtasks.map((subtask, index) =>
        index === subtaskIndex ? { ...subtask, is_done: !subtask.is_done } : subtask
      );
      return {
        ...current,
        subtasks,
        is_done: subtasks.length > 0 && subtasks.every((subtask) => subtask.is_done)
      };
    });
  }

  async function deleteTodo(todoId) {
    if (mutationRefs.current.has(todoId)) return;
    const todo = todos.find(item => item.id === todoId);
    if (!await confirm({ title: 'ToDo löschen', message: `„${todo?.beschreibung}“ und alle zugehörigen Schritte werden dauerhaft gelöscht.`, label: 'ToDo löschen' })) return;
    setPending(todoId, true);
    try {
      await apiFetch(`/api/todos/${todoId}`, { method: 'DELETE' });
      setTodos((current) => current.filter((todo) => todo.id !== todoId));
      setMessage('');
    } catch {
      setMessage('ToDo konnte nicht gelöscht werden. Bitte versuche es erneut.');
    } finally {
      setPending(todoId, false);
    }
  }

  return (
    <>
      {confirmation}
      <main className="todo-lists todo-lists--compact" id="main">
        <header className="todo-lists__header todo-lists__header--compact">
          <div>
            <h1 className="todo-lists__title">ToDo Listen</h1>
            <p className="todo-lists__lead">Aufgaben schnell erfassen, abhaken und im Blick behalten.</p>
          </div>
          <div className="todo-lists__stats" aria-label="ToDo Übersicht">
            <span>{stats.total} ToDos</span>
            <span>{stats.openSteps} offene Schritte</span>
          </div>
        </header>

        <section className="todo-lists__grid todo-lists__grid--compact">
          <form className="todo-panel todo-form todo-form--compact" onSubmit={submitTodo}>
            <div className="todo-panel__header">
              <h2>Neues ToDo</h2>
            </div>

            <label className="todo-field">
              <span>Titel</span>
              <input
                required
                value={draft.beschreibung}
                onChange={(event) => updateDraft('beschreibung', event.target.value)}
                placeholder="Aufgabe eingeben"
              />
            </label>

            <label className="todo-field">
              <span>Fälligkeitsdatum</span>
              <input type="date" value={draft.datum} onChange={(event) => updateDraft('datum', event.target.value)} />
            </label>

            <div className="todo-subtask-editor">
              <span className="todo-subtask-editor__label">Subtasks</span>
              {draft.subtasks.map((subtask, index) => (
                <div className="todo-subtask-row todo-subtask-row--draft" key={index}>
                  <label><span>Schritt {index + 1}</span>
                  <input
                    aria-label={`Schritt ${index + 1}`}
                    ref={(node) => {
                      subtaskRefs.current[index] = node;
                    }}
                    value={subtask.title}
                    onChange={(event) => updateDraftSubtask(index, event.target.value)}
                    onKeyDown={(event) => handleDraftSubtaskKeyDown(event, index)}
                    placeholder={index === 0 ? 'Schritt eingeben, Enter für nächsten' : 'Nächster Schritt'}
                  />
                  </label>
                  <button type="button" aria-label="Subtask entfernen" onClick={() => removeDraftSubtask(index)}>
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button className="todo-lists__primary" type="submit" aria-disabled={status === 'saving'} aria-busy={status === 'saving'}>
              {status === 'saving' ? 'Wird erstellt…' : 'ToDo erstellen'}
            </button>
            {message ? <div className="todo-lists__message" role="alert"><p>{message}</p>
              {status === 'error' ? (authRequired ? <Link to="/login">Anmelden</Link> : <button type="button" onClick={loadTodos}>Erneut versuchen</button>) : null}
            </div> : null}
          </form>

          <section className="todo-panel todo-list-panel todo-list-panel--compact" aria-live="polite">
            <div className="todo-list-toolbar">
              <div className="todo-filters" aria-label="ToDo Filter">
                {filters.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={filter === item.id ? 'is-active' : ''}
                    aria-pressed={filter === item.id}
                    onClick={() => setFilter(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <span className="todo-sort-label">{visibleTodos.length} Ergebnisse · Nach Datum</span>
            </div>

            {status === 'loading' ? <GlassSkeleton label="ToDos werden geladen" rows={4} compact /> : null}
            {status === 'refreshing' ? <p role="status">ToDos werden aktualisiert…</p> : null}
            {status === 'ready' && visibleTodos.length === 0 ? <div className="todo-lists__empty"><p>{todos.length ? 'Keine ToDos für diesen Filter.' : 'Noch keine ToDos. Erfasse deine erste Aufgabe im Formular.'}</p>{filter !== 'all' ? <button type="button" onClick={() => setFilter('all')}>Alle ToDos anzeigen</button> : null}</div> : null}

            <div className="todo-cards todo-cards--compact" role="list">
              {visibleTodos.map((todo) => {
                const done = todo.subtasks.filter((subtask) => subtask.is_done).length;
                const isExpanded = expandedIds.has(todo.id);
                return (
                  <article
                    className={`todo-card todo-card--compact${todo.is_done ? ' is-done' : ''}${isExpanded ? ' is-expanded' : ''}`}
                    key={todo.id}
                    role="listitem"
                    aria-busy={pendingIds.has(todo.id)}
                  >
                    <div className="todo-card__main">
                      <button
                        className="todo-check"
                        type="button"
                        aria-label={todo.is_done ? 'ToDo wieder öffnen' : 'ToDo erledigen'}
                        aria-pressed={todo.is_done}
                        disabled={pendingIds.has(todo.id)}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleTodo(todo);
                        }}
                      >
                        <span aria-hidden="true">{todo.is_done ? '✓' : ''}</span>
                      </button>

                      <div className="todo-card__content">
                        {editingTitleId === todo.id ? (
                          <input
                            className="todo-title-input"
                            aria-label="ToDo-Titel bearbeiten"
                            value={titleDraft}
                            autoFocus
                            onClick={(event) => event.stopPropagation()}
                            onChange={(event) => setTitleDraft(event.target.value)}
                            onBlur={() => saveTitle(todo)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') saveTitle(todo);
                              if (event.key === 'Escape') setEditingTitleId(null);
                            }}
                          />
                        ) : (
                          <button
                            type="button"
                            className="todo-card__title"
                            onClick={(event) => {
                              event.stopPropagation();
                              startTitleEdit(todo);
                            }}
                          >
                            {todo.beschreibung}
                          </button>
                        )}
                        <span className="todo-card__progress">{done}/{todo.subtasks.length || 1} Schritte</span>
                      </div>

                      <time className="todo-card__date" dateTime={todo.datum}>
                        {formatDueDate(todo.datum)}
                      </time>
                      <button className="todo-card__expand" type="button" aria-expanded={isExpanded} aria-controls={`todo-steps-${todo.id}`} onClick={() => toggleExpanded(todo.id)} aria-label={isExpanded ? 'Schritte einklappen' : 'Schritte anzeigen'}>{isExpanded ? '−' : '+'}</button>
                      <button
                        className="todo-card__delete"
                        type="button"
                        aria-label="ToDo löschen"
                        disabled={pendingIds.has(todo.id)}
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteTodo(todo.id);
                        }}
                      >
                        ×
                      </button>
                    </div>

                    <div id={`todo-steps-${todo.id}`} className="todo-card__subtask-wrap" aria-hidden={!isExpanded} inert={isExpanded ? undefined : ''}>
                      {todo.subtasks.length ? (
                        <ul className="todo-card__subtasks todo-card__subtasks--compact">
                          {todo.subtasks.map((subtask, index) => (
                            <li className={subtask.is_done ? 'is-done' : ''} key={subtask.id || `${subtask.title}-${index}`}>
                              <button
                                type="button"
                                className="todo-subcheck"
                                aria-label={subtask.is_done ? 'Subtask wieder öffnen' : 'Subtask erledigen'}
                                aria-pressed={subtask.is_done}
                                disabled={pendingIds.has(todo.id)}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  toggleSubtask(todo, index);
                                }}
                              >
                                <span aria-hidden="true">{subtask.is_done ? '✓' : ''}</span>
                              </button>
                              <span>{subtask.title}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="todo-card__empty">Keine Subtasks</p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </section>
      </main>
    </>
  );
}
