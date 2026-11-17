import { useLocation } from 'react-router-dom';
import PillarPage from './PillarPage';
import GuidesIndexPage from './GuidesIndexPage';
import { GUIDES, GUIDES_PATH, PILLAR_PAGES, STANDALONE_PAGES } from '../../../content';

// Loaded as its own chunk (see contentPageLoader.ts). Picks the content page for the URL.
export default function ContentPage() {
  const { pathname } = useLocation();
  const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;

  if (path === GUIDES_PATH) return <GuidesIndexPage />;
  const guide = GUIDES.find((p) => p.path === path);
  if (guide) return <PillarPage page={guide} parents={[{ name: 'Guides', path: GUIDES_PATH }]} />;
  const page = [...PILLAR_PAGES, ...STANDALONE_PAGES].find((p) => p.path === path);
  return page ? <PillarPage page={page} /> : null;
}
