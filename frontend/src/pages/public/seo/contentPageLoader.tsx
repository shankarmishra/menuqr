import { lazy, type ComponentType } from 'react';

// Content pages are long, so they live in their own chunk. The HTML for them is prerendered;
// main.tsx calls preloadContentPage() before the first render on a content URL so React draws
// the page straight away instead of flashing a loading screen over the prerendered text.

let loaded: ComponentType | null = null;
const load = () =>
  import('./ContentPage').then((mod) => {
    loaded = mod.default;
    return mod;
  });

const LazyContentPage = lazy(load);

export function preloadContentPage(): Promise<unknown> {
  return load();
}

export default function ContentPageRoute() {
  const Page = loaded;
  return Page ? <Page /> : <LazyContentPage />;
}
