import { AppLayout } from '../components/AppLayout';
import { usePageSetup } from '../hooks/usePageSetup';

export function LegalPage({ pageKey = 'privacy.main' }) {
  usePageSetup({
    bodyClass: 'legal-page',
    scripts: ['privacy']
  });

  return (
    <AppLayout>
      <main className="legal-main" id="main" data-i18n={pageKey} data-i18n-html=""></main>
    </AppLayout>
  );
}

