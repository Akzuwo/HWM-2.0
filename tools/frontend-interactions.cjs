// Browser-only integration checks; all API mutations are intercepted.
const assert = require('node:assert/strict');
const path = require('node:path');
const { createRequire } = require('node:module');
const req = createRequire(path.join(process.env.HWM_AUDIT_MODULES || path.join(process.env.TEMP, 'hwm-design-audit/node_modules'), 'audit.cjs'));
const { chromium } = req('playwright');
const { default: AxeBuilder } = req('@axe-core/playwright');
const { fixture } = require('./frontend-audit-fixtures.cjs');
const base = process.env.HWM_AUDIT_URL || 'http://127.0.0.1:5174';
(async () => {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'de-CH', reducedMotion: 'reduce' });
    await context.addInitScript(() => localStorage.setItem('hm.cookieConsent.v1', JSON.stringify({ necessary: true })));
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    let failTodo = false, delayTodo = false;
    const writes = [];
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.port === '5000' || url.hostname === 'transport.opendata.ch') {
        if (route.request().method() !== 'GET') writes.push({ path: url.pathname, method: route.request().method(), body: route.request().postDataJSON() });
        if (url.pathname === '/api/todos' && route.request().method() === 'POST') {
          if (delayTodo) await new Promise(resolve => setTimeout(resolve, 600));
          return route.fulfill({ status: failTodo ? 503 : 200, json: failTodo ? { message: 'unavailable' } : { id: 50 } });
        }
        return route.fulfill({ json: fixture(url) });
      }
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return route.continue();
      return route.abort();
    });
    async function go(route) { await page.goto(base + route); await page.waitForTimeout(700); }
    async function auditDialog() {
      const result = await new AxeBuilder({ page }).include('[role="dialog"]:not([aria-hidden="true"])').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      assert.deepEqual(result.violations.map(v => [v.id, v.nodes.map(n => n.target)]), []);
      for (let i = 0; i < 12; i++) { await page.keyboard.press('Tab'); assert(await page.evaluate(() => Boolean(document.activeElement.closest('[role="dialog"]')))); }
    }
    await go('/notenrechner');
    assert(!await page.getByText('5.3', { exact: true }).count());
    await page.getByLabel('Bezeichnung', { exact: true }).fill('Audit-Note');
    await page.getByLabel('Note (1-6)', { exact: true }).fill('5');
    await page.locator('.grade-calculator__grade-form').getByRole('button', { name: /hinzufügen/i }).click();
    await page.getByRole('button', { name: 'Bearbeiten', exact: true }).click();
    await auditDialog();
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Bearbeiten');
    await page.getByRole('button', { name: 'Löschen', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Abbrechen', exact: true }).click();
    assert.equal(await page.locator('.grade-calculator__grade-item').count(), 1);
    await page.reload(); await page.waitForTimeout(500);
    assert.equal(await page.locator('.grade-calculator__grade-item').count(), 1);
    console.log('PASS grades: empty state, add, focus trap, Escape, cancel deletion, persistence');

    await go('/todos');
    await page.getByRole('button', { name: 'ToDo erledigen', exact: true }).click();
    await page.waitForTimeout(200);
    assert.equal(writes.filter(w => w.path === '/api/todos/1' && w.method === 'PUT').length, 1);
    await page.getByRole('button', { name: 'Schritte anzeigen' }).click();
    assert.equal(await page.getByRole('button', { name: 'Schritte einklappen' }).getAttribute('aria-expanded'), 'true');
    failTodo = true;
    await page.getByLabel('Titel', { exact: true }).fill('Entwurf bleibt');
    await page.getByRole('button', { name: 'ToDo erstellen', exact: true }).click();
    await page.waitForTimeout(300);
    assert.equal(await page.getByLabel('Titel', { exact: true }).inputValue(), 'Entwurf bleibt');
    failTodo = false; delayTodo = true;
    await page.getByRole('button', { name: 'ToDo erstellen', exact: true }).click();
    await page.getByLabel('Titel', { exact: true }).fill('Weitergeschriebener Entwurf');
    await page.waitForTimeout(800);
    assert.equal(await page.getByLabel('Titel', { exact: true }).inputValue(), 'Weitergeschriebener Entwurf');
    await context.setOffline(true);
    assert(await page.locator('.hm-network-status').isVisible());
    await context.setOffline(false);
    console.log('PASS todos: one update request, expansion, failed save retains draft, edits during save, offline status');

    for (const route of ['/kalender', '/weekly-preview', '/upcoming', '/kalender', '/weekly-preview', '/upcoming']) {
      await page.evaluate(route => window.hmNavigate(route), route);
      await page.waitForTimeout(650);
      assert.equal(await page.locator('main').count(), 1);
      if (route === '/weekly-preview') {
        assert.equal(await page.locator('.weekly-preview__card .loading-glass-placeholder').isVisible(), false);
        assert(await page.locator('#weekly-preview-intro').isVisible());
      }
      if (route === '/kalender') assert.equal(await page.locator('.fc').count(), 1);
    }
    console.log('PASS SPA: repeated calendar, weekly preview, upcoming navigation');

    await go('/kalender');
    await page.locator('[data-calendar-filter-toggle]').click();
    await auditDialog();
    await page.keyboard.press('Escape');
    await page.evaluate(() => window.hmNavigate('/todos'));
    await page.waitForTimeout(500);
    assert.equal(await page.locator('#fc-modal-overlay').count(), 0);
    await page.evaluate(() => window.hmNavigate('/kalender'));
    await page.waitForTimeout(700);
    assert.equal(await page.locator('#fc-modal-overlay').count(), 1);
    console.log('PASS calendar: filter focus trap, Escape, modal cleanup on navigation');

    await go('/admin/dashboard');
    await page.getByRole('button', { name: 'Neuen Nutzer anlegen', exact: true }).click();
    await auditDialog();
    await page.keyboard.press('Escape');
    for (const section of ['Klassen', 'News', 'Stundenpläne']) {
      await page.locator('.admin-dashboard__nav').getByRole('tab', { name: section, exact: true }).click();
      await page.waitForTimeout(200);
    }
    console.log('PASS admin: create dialog accessibility and resource navigation');

    await go('/profile');
    await page.locator('#delete-account-button, #delete-account-btn').first().click();
    await auditDialog();
    await page.keyboard.press('Escape');
    assert(!writes.some(w => w.path === '/api/me' && w.method === 'DELETE'));
    console.log('PASS profile: accessible delete confirmation, cancel sends no mutation');

    await page.setViewportSize({ width: 390, height: 844 });
    await go('/');
    await page.locator('.hm-navbar__toggle').click();
    await auditDialog();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.mobile-sidebar').getAttribute('aria-hidden'), 'true');
    console.log('PASS mobile: drawer focus trap and Escape');
    assert.deepEqual(errors, []);
    console.log('PASS no uncaught browser errors');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
