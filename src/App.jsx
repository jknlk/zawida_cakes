import ZawadiPage from './zawadi/ZawadiPage'
import './App.css'

// Single page. Any other path (e.g. the removed /flavours page) shows the home
// page and the address bar is tidied back to "/".
if (window.location.pathname !== '/') window.history.replaceState(null, '', '/' + window.location.hash)

function App() {
  return <ZawadiPage />
}

export default App
