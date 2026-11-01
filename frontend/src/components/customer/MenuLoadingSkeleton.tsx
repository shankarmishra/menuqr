import { MenusQRBrand } from '../brand/MenusQRBrand';

export function MenuLoadingSkeleton() {
  return (
    <div
      className="customer-menu min-h-screen bg-white"
      role="status"
      aria-busy="true"
      aria-label="Loading menu"
    >
      <header className="menu-topbar border-b border-slate-100 flex items-center justify-between h-16 max-w-5xl mx-auto px-4">
        <div className="opacity-90">
          <MenusQRBrand size="sm" variant="light" className="scale-75 origin-left" />
        </div>
        <div className="h-8 w-16 rounded-full bg-slate-100 animate-pulse" />
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-pulse">
        {/* Cover / Hero skeleton */}
        <div className="rounded-3xl bg-slate-50 border border-slate-100 p-6 space-y-3">
          <div className="h-4 w-24 bg-slate-200 rounded-full" />
          <div className="h-8 w-3/4 bg-slate-200 rounded-lg" />
          <div className="h-4 w-1/2 bg-slate-200 rounded-full" />
          <div className="flex gap-2 pt-2">
            <div className="h-6 w-20 bg-slate-200 rounded-full" />
            <div className="h-6 w-28 bg-slate-200 rounded-full" />
          </div>
        </div>

        {/* Category navigation pills skeleton */}
        <div className="flex gap-2 overflow-x-hidden py-2" aria-hidden="true">
          <div className="h-9 w-20 shrink-0 bg-slate-900/10 rounded-full" />
          <div className="h-9 w-24 shrink-0 bg-slate-100 rounded-full" />
          <div className="h-9 w-28 shrink-0 bg-slate-100 rounded-full" />
          <div className="h-9 w-20 shrink-0 bg-slate-100 rounded-full" />
        </div>

        {/* Section header skeleton */}
        <div className="space-y-2 pt-4">
          <div className="h-6 w-36 bg-slate-200 rounded-md" />
          <div className="h-3 w-48 bg-slate-100 rounded-full" />
        </div>

        {/* Dish cards skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-start justify-between gap-4"
            >
              <div className="space-y-2.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-sm bg-slate-200 shrink-0" />
                  <div className="h-4 w-40 bg-slate-200 rounded" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-full bg-slate-100 rounded" />
                  <div className="h-3 w-2/3 bg-slate-100 rounded" />
                </div>
                <div className="h-4 w-16 bg-slate-200 rounded pt-1" />
              </div>
              {i % 2 === 0 && (
                <div className="w-20 h-20 rounded-xl bg-slate-100 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
