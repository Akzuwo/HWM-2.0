import { useEffect, useState } from 'react';

export function NetworkStatus() {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  return <div className="hm-network-status" role="status" aria-live="polite" hidden={!offline}>
    Offline – angezeigte Daten sind möglicherweise veraltet. Änderungen in der Cloud benötigen eine Verbindung. Lokale Noten bleiben verfügbar.
  </div>;
}
