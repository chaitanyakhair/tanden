import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import '../node_modules/bootstrap/dist/js/bootstrap.min.js'
import { AuthProvider } from './context/AuthContext.jsx'
// import { AuthProvider } from './context/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>,
  // </StrictMode>,
)
