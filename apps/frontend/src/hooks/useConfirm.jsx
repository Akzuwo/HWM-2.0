import { useEffect, useRef, useState } from 'react';
import { Dialog } from '../components/Dialog';

export function useConfirm() {
  const [request, setRequest] = useState(null);
  const resolveRef = useRef(null);
  useEffect(() => () => resolveRef.current?.(false), []);
  const settle = value => {
    resolveRef.current?.(value);
    resolveRef.current = null;
    setRequest(null);
  };
  const confirm = options => new Promise(resolve => {
    resolveRef.current?.(false);
    resolveRef.current = resolve;
    setRequest(options);
  });
  const confirmation = <Dialog open={Boolean(request)} title={request?.title} onClose={() => settle(false)} actions={<>
    <button type="button" data-initial-focus className="grade-calculator__button grade-calculator__button--secondary" onClick={() => settle(false)}>Abbrechen</button>
    <button type="button" className="grade-calculator__button grade-calculator__inline-button--danger" onClick={() => settle(true)}>{request?.label || 'Löschen'}</button>
  </>}><p>{request?.message}</p></Dialog>;
  return { confirm, confirmation, confirming: Boolean(request) };
}
