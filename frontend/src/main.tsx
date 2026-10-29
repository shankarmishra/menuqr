import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Prerendered <head> tags are replaced by <Helmet>; drop them first to avoid duplicates.
document.head.querySelectorAll('[data-prerendered]').forEach((node) => node.remove())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
