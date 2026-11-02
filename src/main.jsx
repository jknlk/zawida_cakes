import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// SplitText measures characters, so mount after the display font is ready. The
// fonts are preloaded from this server, so this is normally instant; the timeout
// only guards a slow connection from holding the whole page back.
const fontsReady = document.fonts
  ? Promise.race([
      Promise.all([
        ...[400, 500, 600, 700, 800].map((w) => document.fonts.load(`${w} 1em Poppins`)),
      ]).then(() => document.fonts.ready),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ])
  : Promise.resolve()

fontsReady.finally(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
