import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SiteHeader from '../../../components/marketing/SiteHeader';
import SiteFooter from '../../../components/marketing/SiteFooter';
import { SEO } from '../../../seo/SEO';
import BreadcrumbNav from '../../../components/seo/BreadcrumbNav';
import { getBreadcrumbSchema, getItemListSchema, getOrganizationSchema } from '../../../seo/structuredData';
import { GUIDES, GUIDES_PATH, PILLAR_PAGES, STANDALONE_PAGES } from '../../../content';

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export default function GuidesIndexPage() {
  const breadcrumbs = [{ name: 'Guides', path: GUIDES_PATH }];
  const startHere = [...PILLAR_PAGES, ...STANDALONE_PAGES];

  return (
    <div className="bg-[#FAFAF7] min-h-screen text-gray-900 font-sans relative overflow-x-clip">
      <div className="texture-indian-heritage fixed inset-0 pointer-events-none z-0" />
      <SEO
        title="Guides for Restaurant Owners | MenusQR"
        description="Practical guides for restaurant, café and dhaba owners in India: menu design, menu photos, KOTs, fewer order mistakes and QR menus."
        canonicalUrl={GUIDES_PATH}
        schema={[
          getOrganizationSchema(),
          getBreadcrumbSchema(breadcrumbs),
          getItemListSchema(
            'Guides for restaurant owners',
            GUIDES.map((g) => ({ name: g.h1, path: g.path })),
          ),
        ]}
      />
      <SiteHeader />

      <main id="main-content" className="pt-32 pb-24 px-4 sm:px-6 md:px-12 max-w-5xl mx-auto relative z-10">
        <BreadcrumbNav items={breadcrumbs} />
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#151C19] mb-5 tracking-tight">Guides for Restaurant Owners</h1>
        <p className="text-xl text-[#53615a] mb-10 leading-relaxed font-medium max-w-3xl">
          Practical, plain-language guides for running a restaurant, café or dhaba in India. Written by the MenusQR team from what we see in the restaurants we work with. No fluff, no made-up numbers.
        </p>

        <section aria-labelledby="all-guides" className="mb-14">
          <h2 id="all-guides" className="mb-5 text-2xl font-extrabold text-[#151C19]">
            All guides
          </h2>
          <ul className="grid gap-5 md:grid-cols-2">
            {GUIDES.map((guide) => (
              <li key={guide.path}>
                <Link
                  to={guide.path}
                  className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:border-[#E8783C]"
                >
                  <h3 className="text-xl font-bold text-[#151C19] group-hover:text-[#B4531F]">{guide.h1}</h3>
                  <p className="mt-2 flex-1 text-base leading-relaxed text-[#53615a]">{guide.description}</p>
                  <p className="mt-4 flex items-center justify-between text-sm text-[#53615a]">
                    <span>
                      Updated <time dateTime={guide.updated}>{formatDate(guide.updated)}</time>
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-[#B4531F]">
                      Read <ArrowRight size={16} aria-hidden="true" />
                    </span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="start-here">
          <h2 id="start-here" className="mb-5 text-2xl font-extrabold text-[#151C19]">
            New to QR menus? Start here
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {startHere.map((page) => (
              <li key={page.path}>
                <Link
                  to={page.path}
                  className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3 text-base font-semibold text-[#151C19] hover:border-[#E8783C] hover:text-[#B4531F]"
                >
                  {page.h1} <ArrowRight size={16} aria-hidden="true" className="shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
