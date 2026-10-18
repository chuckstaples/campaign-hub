import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/im-fell-english/latin-400.css';
import '@fontsource/im-fell-english/latin-400-italic.css';
import '@fontsource-variable/literata/opsz.css';
import '@fontsource-variable/literata/opsz-italic.css';
import '@fontsource/cinzel/latin-400.css';
import '@fontsource/atkinson-hyperlegible/latin-400.css';
import '@fontsource/atkinson-hyperlegible/latin-700.css';
import './styles.css';
import { HubProvider } from './lib/store.jsx';
import { applyPrefs, getPrefs } from './lib/prefs.js';
import App from './App.jsx';

applyPrefs(getPrefs());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HubProvider>
      <App />
    </HubProvider>
  </StrictMode>,
);
