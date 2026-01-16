import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import Dashboard from './pages/Dashboard'

const elementoRaiz = document.getElementById('root')
const raiz = createRoot(elementoRaiz)

raiz.render(
  <StrictMode>
    <Dashboard />
  </StrictMode>
)