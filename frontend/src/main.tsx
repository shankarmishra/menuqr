import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CONTENT_PATHS } from './content/manifest'
import { preloadContentPage } from './pages/public/seo/contentPageLoader'

// Prerendered <head> tags are replaced by <Helmet>; drop them first to avoid duplicates.
document.head.querySelectorAll('[data-prerendered]').forEach((node) => node.remove())

function mount() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

// On a long content page, fetch its chunk before the first render so the prerendered text
// is replaced by the same page, not by a loading screen. Mount anyway if the chunk fails.
const path = window.location.pathname.length > 1 ? window.location.pathname.replace(/\/$/, '') : '/'
if (CONTENT_PATHS.includes(path)) preloadContentPage().then(mount, mount)
else mount()
