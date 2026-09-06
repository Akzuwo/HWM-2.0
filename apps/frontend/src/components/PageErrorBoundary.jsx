import { Component } from 'react';

export class PageErrorBoundary extends Component {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  componentDidCatch(error) { console.error('Page failed to render', error); }
  render() {
    if (!this.state.error) return this.props.children;
    return <main id="main" className="hm-state" role="alert">
      <h1>Diese Ansicht konnte nicht geöffnet werden</h1>
      <p>Bitte lade die Seite erneut. Deine bereits gespeicherten Daten bleiben erhalten.</p>
      <button type="button" onClick={() => window.location.reload()}>Erneut versuchen</button>
    </main>;
  }
}
