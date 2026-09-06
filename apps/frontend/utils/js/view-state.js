// Data views share an inline recovery pattern, while keeping their own loading layout.
export function showViewState(container, { message, retry, login = false, error = false, preserve = false }) {
  if (!container?.isConnected) return;
  container.querySelectorAll(':scope > .hm-state').forEach(node => node.remove());
  const state = document.createElement('div');
  state.className = 'hm-state';
  state.setAttribute('role', error ? 'alert' : 'status');
  const text = document.createElement('p');
  text.textContent = message;
  state.appendChild(text);
  if (retry) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = window.hmI18n?.get('common.retry', 'Erneut versuchen') || 'Erneut versuchen';
    button.addEventListener('click', retry);
    state.appendChild(button);
  }
  if (login) {
    const link = document.createElement('a');
    link.href = '/login';
    link.textContent = window.hmI18n?.get('auth.submit', 'Anmelden') || 'Anmelden';
    link.addEventListener('click', event => {
      if (window.hmNavigate && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
        event.preventDefault();
        window.hmNavigate('/login');
      }
    });
    state.appendChild(link);
  }
  if (preserve) container.prepend(state);
  else container.replaceChildren(state);
  container.setAttribute('aria-busy', 'false');
}

export function setViewLoading(container) {
  container.setAttribute('aria-busy', 'true');
  if (container.querySelector('.day-card')) {
    showViewState(container, { message: 'Ansicht wird aktualisiert…', preserve: true });
    container.setAttribute('aria-busy', 'true');
  }
}
