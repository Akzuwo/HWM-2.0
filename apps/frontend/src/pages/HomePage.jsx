import { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/js/api-client';
import { HomeHero } from '../components/home/HomeHero';
import { NewsPreviewCard } from '../components/home/NewsPreviewCard';
import { usePageSetup } from '../hooks/usePageSetup';
import { GlassSkeleton } from '../components/GlassSkeleton';

function formatNewsMeta(value) {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const lang = document.documentElement.lang || navigator.language || 'de-CH';
  return date.toLocaleDateString(lang, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function normalizeNewsHref(value) {
  const href = String(value || '').trim();
  if (!href) {
    return '';
  }
  if (href.startsWith('/') && !href.startsWith('//')) {
    return href;
  }
  if (/^https?:\/\//i.test(href)) {
    return href;
  }
  return '';
}

export function HomePage() {
  usePageSetup({ bodyClass: 'home-page', scripts: ['home'] });
  const [newsItems, setNewsItems] = useState([]);
  const [newsState, setNewsState] = useState('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setNewsState('loading');

    async function loadNews() {
      try {
        const response = await apiFetch('/api/news?limit=2');
        if (!response.ok) throw new Error('News request failed');
        const payload = await response.json();
        const items = Array.isArray(payload?.data) ? payload.data : [];
        if (!cancelled) {
          setNewsItems(items);
          setNewsState(items.length ? 'ready' : 'empty');
        }
      } catch (error) {
        if (!cancelled) setNewsState('error');
        if (import.meta.env?.DEV) {
          console.warn('[HWM] Failed to load news preview:', error);
        }
      }
    }

    loadNews();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  useEffect(() => {
    window.hmI18n?.apply?.();
  }, [newsItems]);

  return (
    <>
      <main className="home-main" id="main">
        <HomeHero />

        <section className="home-preview-grid" aria-label="News-Vorschau">
          {newsState === 'loading' && !newsItems.length ? <GlassSkeleton label="Neuigkeiten werden geladen" rows={4} /> : null}
          {newsState === 'empty' ? <p className="hm-state">Noch keine Neuigkeiten veröffentlicht. Aktuelle Aufgaben findest du im Kalender.</p> : null}
          {newsState === 'error' ? <div className="hm-state" role="alert"><p>Die Neuigkeiten konnten nicht geladen werden.</p><button type="button" onClick={() => setAttempt(value => value + 1)}>Erneut versuchen</button></div> : null}
          {newsItems.map(item => {
            const href = normalizeNewsHref(item.link_url);
            return <NewsPreviewCard key={item.id} title={item.title || 'Neuigkeit'} summary={item.summary || item.body || ''}
              meta={formatNewsMeta(item.published_at || item.created_at)} href={href} disabled={!href} />;
          })}
        </section>
      </main>
    </>
  );
}
