import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { I18nProvider } from './i18n/i18nContext'
import { ConfirmProvider } from './components/common/ConfirmProvider'
import { initPlayGamesListener } from './utils/playGamesBridge'
import { adsService } from './services/adsService'

initPlayGamesListener();
// Starts the new-player ad grace at launch rather than at the first win.
adsService.markFirstSeen();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nProvider>
      <ConfirmProvider>
        <App />
      </ConfirmProvider>
    </I18nProvider>
  </StrictMode>,
)
