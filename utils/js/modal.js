(function () {
  const FOCUSABLE_SELECTOR = [
    'a[href]',
    'area[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  let activeModal = null;
  let openCount = 0;
  let listenersAttached = false;
  let scrollLockY = 0;

  function lockPageScroll() {
    if (typeof document === 'undefined' || !document.body) {
      return;
    }
    scrollLockY = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollLockY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  }

  function unlockPageScroll() {
    if (typeof document === 'undefined' || !document.body) {
      return;
    }
    const topValue = document.body.style.top || '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    const previousY = topValue ? Math.abs(parseInt(topValue, 10)) : scrollLockY;
    window.scrollTo(0, Number.isFinite(previousY) ? previousY : 0);
  }

  function resolveElement(target) {
    if (!target) return null;
    if (target instanceof HTMLElement) return target;
    if (typeof target === 'string') {
      return document.getElementById(target) || document.querySelector(target);
    }
    return null;
  }

  function isVisible(element) {
    return !!(
      element &&
      (element.offsetWidth || element.offsetHeight || element.getClientRects().length)
    );
  }

  function getFocusableElements(container) {
    if (!container) return [];
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(isVisible);
  }

  function attachGlobalListeners() {
    if (listenersAttached) return;
    document.addEventListener('keydown', handleKeydown, true);
    document.addEventListener('focusin', enforceFocus, true);
    listenersAttached = true;
  }

  function detachGlobalListeners() {
    if (!listenersAttached) return;
    document.removeEventListener('keydown', handleKeydown, true);
    document.removeEventListener('focusin', enforceFocus, true);
    listenersAttached = false;
  }

  function setInitialFocus(overlay, dialog, options) {
    const customTarget = options && options.initialFocus;
    let target = null;
    if (customTarget instanceof HTMLElement) {
      target = customTarget;
    } else if (typeof customTarget === 'string') {
      target = dialog.querySelector(customTarget) || overlay.querySelector(customTarget);
    }

    if (!target) {
      target = overlay.querySelector('[data-hm-modal-initial-focus]');
    }

    if (!target) {
      const focusables = getFocusableElements(dialog);
      target = focusables[0];
    }

    if (!target) {
      target = dialog;
    }

    if (target && typeof target.focus === 'function') {
      try {
        target.focus({ preventScroll: true });
      } catch (err) {
        // fallback if preventScroll is not supported
        target.focus();
      }
    }
  }

  function open(target, options = {}) {
    const overlay = resolveElement(target);
    if (!overlay) return;

    if (activeModal && activeModal.overlay === overlay) {
      return;
    }

    if (activeModal && activeModal.overlay !== overlay) {
      close(activeModal.overlay, { restoreFocus: false });
    }

    const dialog = overlay.querySelector('.hm-modal') || overlay;
    if (!dialog.hasAttribute('tabindex')) {
      dialog.setAttribute('tabindex', '-1');
    }

    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');

    if (openCount === 0) {
      document.body.classList.add('hm-modal-open');
      lockPageScroll();
      attachGlobalListeners();
    }
    openCount += 1;

    const restoreFocusOption = options && options.restoreFocus;
    const onRequestClose = options && options.onRequestClose;

    activeModal = {
      overlay,
      dialog,
      restoreFocus: restoreFocusOption !== false,
      lastFocused: previouslyFocused,
      onRequestClose: typeof onRequestClose === 'function' ? onRequestClose : null
    };

    setInitialFocus(overlay, dialog, options);
  }

  function close(target, options = {}) {
    const overlay = resolveElement(target);
    if (!overlay) return;

    const shouldRestoreFocus = options.restoreFocus !== false;

    if (overlay.classList.contains('is-open')) {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
    }

    openCount = Math.max(0, openCount - 1);
    if (openCount === 0) {
      document.body.classList.remove('hm-modal-open');
      unlockPageScroll();
      detachGlobalListeners();
    }

    if (activeModal && activeModal.overlay === overlay) {
      const { lastFocused, restoreFocus } = activeModal;
      activeModal = null;
      if (shouldRestoreFocus && restoreFocus !== false && lastFocused && document.contains(lastFocused)) {
        try {
          lastFocused.focus({ preventScroll: true });
        } catch (err) {
          lastFocused.focus();
        }
      }
    }
  }

  function handleKeydown(event) {
    if (!activeModal) return;
    if (!activeModal.dialog.contains(event.target)) {
      return;
    }

    if (event.key === 'Escape' || event.key === 'Esc') {
      if (activeModal.onRequestClose) {
        event.preventDefault();
        activeModal.onRequestClose();
      } else {
        close(activeModal.overlay);
      }
      return;
    }

    if (event.key === 'Tab') {
      const focusables = getFocusableElements(activeModal.dialog);
      if (focusables.length === 0) {
        event.preventDefault();
        try {
          activeModal.dialog.focus({ preventScroll: true });
        } catch (err) {
          activeModal.dialog.focus();
        }
        return;
      }

      const currentIndex = focusables.indexOf(document.activeElement);
      let nextIndex = currentIndex;

      if (event.shiftKey) {
        nextIndex = currentIndex <= 0 ? focusables.length - 1 : currentIndex - 1;
      } else {
        nextIndex = currentIndex === focusables.length - 1 ? 0 : currentIndex + 1;
      }

      event.preventDefault();
      const nextElement = focusables[nextIndex] || focusables[0];
      try {
        nextElement.focus({ preventScroll: true });
      } catch (err) {
        nextElement.focus();
      }
    }
  }

  function enforceFocus(event) {
    if (!activeModal) return;
    if (activeModal.overlay.contains(event.target)) {
      return;
    }

    const focusables = getFocusableElements(activeModal.dialog);
    const target = focusables[0] || activeModal.dialog;
    try {
      target.focus({ preventScroll: true });
    } catch (err) {
      target.focus();
    }
  }

  window.hmModal = {
    open,
    close
  };
})();
