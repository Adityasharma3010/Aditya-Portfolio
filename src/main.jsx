import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initAnalytics } from './lib/analytics'
import { consoleHint } from './lib/hints'
import { initPwa } from './lib/pwa'

initAnalytics()
consoleHint()
initPwa()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
