import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import './styles/app.css';
import './styles/design-system.css';
import './styles/apple-design.css';
import './styles/stitch-reference.css';
import './theme';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('React root element "#root" was not found.');
}

ReactDOM.createRoot(rootElement).render(<App />);
