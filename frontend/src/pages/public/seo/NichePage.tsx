import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import SiteHeader from '../../../components/marketing/SiteHeader';
import SiteFooter from '../../../components/marketing/SiteFooter';
import { SEO } from '../../../seo/SEO';
import BreadcrumbNav from '../../../components/seo/BreadcrumbNav';
import GeoFaqSection from '../../../components/seo/GeoFaqSection';
import { getBreadcrumbSchema, getFaqSchema, getOrganizationSchema } from '../../../seo/structuredData';
import { trackEvent } from '../../../analytics/analytics';
import { NICHE_PAGES, nichePath, type NichePage as NichePageData } from './nichePages';

export default function NichePage({ page }: { page: NichePageData }) {
  const path = nichePath(page.slug);
  const breadcrumbs = [{ name: page.label, path }];
  const others = NICHE_PAGES.filter((p) => p.slug !== page.slug);

  return (
    <div className="bg-[#FAFAF7] min-h-screen text-gray-900 font-sans relative overflow-x-clip">
      <div className="texture-indian-heritage fixed inset-0 pointer-events-none z-0" />
      <SEO
        title={page.title}
        description={page.description}
        canonicalUrl={path}
        schema={[
          getOrganizationSchema(),
          getBreadcrumbSchema(breadcrumbs),
          getFaqSchema(page.faqs.map((f) => ({ q: f.question, a: f.answer }))),
        ]}
      />
      <SiteHeader />

      <main id="main-content" className="pt-32 pb-24 px-6 md:px-12 max-w-5xl mx-auto relative z-10">
        <BreadcrumbNav items={breadcrumbs} />

        <h1 className="text-4xl md:text-5xl font-extrabold text-[#151C19] mb-6 tracking-tight">{page.h1}</h1>
        <p className="text-xl text-[#53615a] mb-10 leading-relaxed font-medium">{page.intro}</p>

        <section className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm mb-8 text-lg leading-relaxed text-[#151C19]/80">
          <h2 className="text-2xl font-bold text-[#151C19] mb-3">The problem with a printed menu</h2>
          <p>{page.problem}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#151C19] mb-6">What MenusQR gives you</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {page.benefits.map((b) => (
              <div key={b.heading} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg text-[#151C19] mb-2">{b.heading}</h3>
                <p className="text-base text-[#53615a] leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-[#151C19] mb-4">Get started in three steps</h2>
          <ol className="space-y-3">
            {page.steps.map((s, i) => (
              <li key={s} className="flex items-start gap-3 text-base text-[#151C19]">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#E8783C] text-xs font-bold text-white">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/plans"
              onClick={() => trackEvent('cta_click', { location: 'niche_page', label: 'view_plans', niche: page.slug })}
              className="inline-flex items-center gap-2 bg-[#E8783C] text-white px-6 py-3 rounded-full font-bold hover:bg-[#d66a30] transition-colors"
            >
              See plans and pricing <ArrowRight size={16} />
            </Link>
            <Link
              to="/templates"
              onClick={() => trackEvent('cta_click', { location: 'niche_page', label: 'view_templates', niche: page.slug })}
              className="inline-flex items-center gap-2 bg-[#151C19] text-white px-6 py-3 rounded-full font-bold hover:bg-black transition-colors"
            >
              Browse menu templates
            </Link>
          </div>
        </section>

        <GeoFaqSection faqs={page.faqs.map((f) => ({ question: f.question, answer: f.answer }))} title={`${page.label}: common questions`} />

        <nav aria-label="QR menu for other businesses" className="mt-4">
          <h2 className="text-lg font-bold text-[#151C19] mb-3">QR menus for other food businesses</h2>
          <ul className="flex flex-wrap gap-2">
            {others.map((o) => (
              <li key={o.slug}>
                <Link
                  to={nichePath(o.slug)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#151C19] hover:border-[#E8783C] hover:text-[#E8783C]"
                >
                  <Check size={14} /> {o.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/qr-menu-for-restaurants" className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#151C19] hover:border-[#E8783C] hover:text-[#E8783C]">
                <Check size={14} /> Restaurants
              </Link>
            </li>
          </ul>
        </nav>
      </main>

      <SiteFooter />
    </div>
  );
}
