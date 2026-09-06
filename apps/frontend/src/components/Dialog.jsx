import { createPortal } from 'react-dom';
import { useDialog } from '../hooks/useDialog';

export function Dialog({ open, title, subtitle, onClose, actions, children, wide = false }) {
  const ref = useDialog(open, onClose);
  if (!open) return null;
  return createPortal(
    <div className="grade-modal" role="presentation" onClick={onClose}>
      <div ref={ref} tabIndex={-1} className={`grade-modal__dialog${wide ? ' grade-modal__dialog--wide' : ''}`}
        role="dialog" aria-modal="true" aria-label={title} onClick={event => event.stopPropagation()}>
        <div className="grade-modal__header">
          <div><h2>{title}</h2>{subtitle ? <p>{subtitle}</p> : null}</div>
          <button type="button" className="grade-modal__close" aria-label="Schliessen" onClick={onClose}>×</button>
        </div>
        <div className="grade-modal__body">{children}</div>
        {actions ? <div className="grade-modal__footer">{actions}</div> : null}
      </div>
    </div>, document.body
  );
}
