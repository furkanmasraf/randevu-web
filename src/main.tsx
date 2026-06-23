import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// @ts-ignore: allow side-effect import of CSS without type declarations
import './index.css'
import App from './App.js'

const container = document.getElementById('root') as HTMLElement

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
