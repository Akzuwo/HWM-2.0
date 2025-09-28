(function () {
  const DEFAULT_DURATION = 5200;
  const ICONS = {
    success: '✅',
    error: '⚠️',
    info: 'ℹ️'
  };

  function ensureContainer(target) {
    if (target instanceof HTMLElement) {
      return target;
    }
    if (typeof target === 'string') {
      const node = document.querySelector(target);
      if (node) return node;
    }
    let container = document.querySelector('[data-toast-container]');
    if (container) return container;
    container = document.getElementById('calendar-toast-container');
    if (container) {
      container.dataset.toastContainer = 'true';
      return container;
    }
    const fallback = document.createElement('div');
    fallback.id = 'calendar-toast-container';
    fallback.className = 'calendar-toast-container';
    fallback.dataset.toastContainer = 'true';
    fallback.setAttribute('aria-live', 'polite');
    fallback.setAttribute('aria-atomic', 'true');
    document.body.appendChild(fallback);
    return fallback;
  }

  function buildToast(message, variant) {
    const toast = document.createElement('div');
    toast.className = `hm-toast hm-toast--${variant}`;
    toast.setAttribute('role', 'status');

    const icon = document.createElement('span');
    icon.className = 'hm-toast__icon';
    icon.textContent = ICONS[variant] || ICONS.info;
    toast.appendChild(icon);

    const text = document.createElement('div');
    text.className = 'hm-toast__message';
    text.innerHTML = message;
    toast.appendChild(text);

    return toast;
  }

  function hideToast(toast) {
    if (!toast) return;
    toast.classList.remove('is-visible');
    window.setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 220);
  }

  function showToast(options) {
    if (!options) return;
    const { message = '', variant = 'info', duration = DEFAULT_DURATION, container } = options;
    if (!message) return;

    const target = ensureContainer(container);
    if (!target) return;

    const toast = buildToast(message, variant);
    target.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('is-visible');
    });

    const autoHide = window.setTimeout(() => hideToast(toast), Math.max(2200, duration));

    toast.addEventListener('pointerdown', () => {
      window.clearTimeout(autoHide);
      hideToast(toast);
    });

    return toast;
  }

  function clearAll(container) {
    const target = ensureContainer(container);
    if (!target) return;
    [...target.children].forEach((child) => hideToast(child));
  }

  window.hmToast = {
    show: showToast,
    clear: clearAll
  };
})();
