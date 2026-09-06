(function (global) {
  const TOAST_TIMEOUT = 5000;
  const CONTAINER_ID = 'hm-toast-container';
  const VARIANTS = new Set(['info', 'success', 'error', 'warning']);

  function ensureContainer() {
    let container = document.getElementById(CONTAINER_ID);
    if (!container) {
      container = document.createElement('div');
      container.id = CONTAINER_ID;
      container.className = 'hm-toast-container';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(container);
    }
    return container;
  }

  function hideToast(toast) {
    if (!toast) return;
    toast.classList.remove('is-visible');
    const remove = () => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      remove();
    } else {
      toast.addEventListener('transitionend', remove, { once: true });
      setTimeout(remove, 400);
    }
  }

  function createToast(message, variant = 'info', options = {}) {
    const container = ensureContainer();
    const toast = document.createElement('div');
    const variantClass = VARIANTS.has(variant) ? variant : 'info';
    toast.className = `hm-toast hm-toast--${variantClass}`;
    toast.setAttribute('role', 'status');
    toast.textContent = message;

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'hm-toast__close';
    closeButton.setAttribute('aria-label', options.closeLabel || 'Meldung schliessen');
    closeButton.textContent = '×';
    closeButton.addEventListener('click', () => hideToast(toast));
    toast.appendChild(closeButton);

    container.appendChild(toast);
    while (container.children.length > 3) container.firstElementChild.remove();

    requestAnimationFrame(() => {
      toast.classList.add('is-visible');
    });

    const timeout = Math.max(5000, Number(options.timeout) || TOAST_TIMEOUT);
    if (timeout !== Infinity) {
      let remaining = timeout;
      let started = Date.now();
      let timer = setTimeout(() => hideToast(toast), remaining);
      let paused = false;
      const pause = () => { if (paused) return; paused = true; clearTimeout(timer); remaining -= Date.now() - started; };
      const resume = () => {
        if (toast.matches(':hover') || toast.contains(document.activeElement)) return;
        if (!paused) return;
        paused = false;
        clearTimeout(timer);
        started = Date.now();
        timer = setTimeout(() => hideToast(toast), Math.max(0, remaining));
      };
      toast.addEventListener('mouseenter', pause);
      toast.addEventListener('mouseleave', resume);
      toast.addEventListener('focusin', pause);
      toast.addEventListener('focusout', () => queueMicrotask(resume));
    }
    return toast;
  }

  const api = {
    show(message, variant, options = {}) {
      return createToast(String(message), variant, options);
    },
    success(message, options = {}) {
      return createToast(String(message), 'success', options);
    },
    error(message, options = {}) {
      return createToast(String(message), 'error', options);
    },
    info(message, options = {}) {
      return createToast(String(message), 'info', options);
    },
  };

  global.hmToast = api;
  global.showToast = (message) => api.info(message);
})(window);
