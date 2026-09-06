// Run: set HWM_AUDIT_MODULES to a directory containing playwright and @axe-core/playwright.
const { createRequire } = require('node:module');
const path = require('node:path');
const fs = require('node:fs');
const requireAudit = createRequire(path.join(process.env.HWM_AUDIT_MODULES || path.join(process.env.TEMP, 'hwm-design-audit', 'node_modules'), 'audit.cjs'));
const { chromium } = requireAudit('playwright');
const { default: AxeBuilder } = requireAudit('@axe-core/playwright');
const { fixture } = require('./frontend-audit-fixtures.cjs');
const routes = ['/', '/mehr-ueber-hwm', '/geschichte', '/help', '/changelog', '/datenschutz', '/impressum', '/login', '/kalender', '/abfahrten/', '/upcoming', '/todos', '/weekly-preview', '/stundenplan', '/tagesuebersicht', '/timetable-week', '/notenrechner', '/profile', '/admin/dashboard', '/nicht-vorhanden'];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const out = path.resolve(process.env.HWM_AUDIT_OUTPUT || path.join(process.env.TEMP, 'hwm-design-audit', 'results'));
  fs.mkdirSync(out, { recursive: true });
  const results = [];
  for (const width of (process.env.HWM_AUDIT_WIDTHS || '1440,390').split(',').map(Number)) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, locale: 'de-CH' });
    const page = await context.newPage();
    if (process.env.HWM_AUDIT_THEME) await context.addInitScript(theme => localStorage.setItem('hm.theme', theme), process.env.HWM_AUDIT_THEME);
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.port === '5000' || url.hostname === 'transport.opendata.ch') {
        const scenario = process.env.HWM_AUDIT_SCENARIO || 'guest';
        const success = ['success', 'empty'].includes(scenario) || (scenario === 'error' && ['/api/me', '/api/classes', '/api/session/class'].includes(url.pathname));
        return route.fulfill({ status: success ? 200 : scenario === 'error' ? 503 : 401, contentType: 'application/json', body: JSON.stringify(success ? fixture(url, scenario) : { status: 'error', message: scenario === 'error' ? 'unavailable' : 'unauthorized' }) });
      }
      if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return route.continue();
      return route.abort();
    });
    for (const route of (process.env.HWM_AUDIT_ROUTES?.split(',') || routes)) {
      const errors = [];
      const handleError = error => errors.push(error.message);
      page.on('pageerror', handleError);
      await page.goto((process.env.HWM_AUDIT_URL || 'http://127.0.0.1:5174') + route);
      await page.waitForTimeout(1000);
      const necessary = page.getByRole('button', { name: 'Nur notwendige', exact: true });
      if (await necessary.count()) await necessary.click();
      const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      const layout = await page.evaluate(() => ({
        title: document.title,
        overflow: document.documentElement.scrollWidth > innerWidth,
        text: document.querySelector('main, .login-stage')?.innerText?.slice(0, 450),
        skeletons: [...document.querySelectorAll('.loading-glass-placeholder')].filter(el => el.checkVisibility()).length,
      }));
      const name = (route.replace(/\W+/g, '-') || 'home') + '-' + width;
      await page.screenshot({ path: path.join(out, name + '.png'), fullPage: true });
      const result = { route, width, errors, ...layout, violations: audit.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })) };
      results.push(result);
      fs.writeFileSync(path.join(out, 'audit.json'), JSON.stringify(results, null, 2));
      console.log(JSON.stringify({ route, width, errors, overflow: layout.overflow, violations: result.violations.map(v => [v.id, v.nodes.length]) }));
      page.off('pageerror', handleError);
    }
    await context.close();
  }
  fs.writeFileSync(path.join(out, 'audit.json'), JSON.stringify(results, null, 2));
  await browser.close();
  if (results.some(result => result.errors.length || result.overflow || result.violations.length || result.skeletons)) process.exitCode = 1;
  console.log('Results: ' + out);
})().catch(error => { console.error(error); process.exit(1); });
