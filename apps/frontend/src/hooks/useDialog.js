import { useLayoutEffect, useRef } from 'react';

const focusable = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]';

// Shared focus and scroll contract for React overlays, including the mobile drawer.
export function useDialog(open, onClose) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const items = () => [...dialog.querySelectorAll(focusable)].filter(el => el.getClientRects().length && !el.closest('[inert], [hidden], [aria-hidden="true"]'));
    (dialog.querySelector('[data-initial-focus]') || items()[0] || dialog).focus({ preventScroll: true });
    const handleKey = event => {
      if (document.body.classList.contains('hm-modal-open')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current?.();
      }
      if (event.key === 'Tab') {
        const targets = items();
        const index = targets.indexOf(document.activeElement);
        if (!targets.length || (event.shiftKey ? index <= 0 : index === targets.length - 1 || index < 0)) {
          event.preventDefault();
          (targets[event.shiftKey ? targets.length - 1 : 0] || dialog).focus();
        }
      }
    };
    const handleFocus = event => {
      if (document.body.classList.contains('hm-modal-open')) return;
      if (!dialog.contains(event.target)) (items()[0] || dialog).focus({ preventScroll: true });
    };
    document.addEventListener('keydown', handleKey, true);
    document.addEventListener('focusin', handleFocus);
    return () => {
      if (!document.body.classList.contains('hm-modal-open')) document.body.style.overflow = overflow;
      document.removeEventListener('keydown', handleKey, true);
      document.removeEventListener('focusin', handleFocus);
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [open]);
  return ref;
}
