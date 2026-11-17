import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SiteHeader from '../../../components/marketing/SiteHeader';
import SiteFooter from '../../../components/marketing/SiteFooter';
import { SEO } from '../../../seo/SEO';
import BreadcrumbNav from '../../../components/seo/BreadcrumbNav';
import GeoFaqSection from '../../../components/seo/GeoFaqSection';
import { getArticleSchema, getBreadcrumbSchema, getFaqSchema, getOrganizationSchema, type BreadcrumbItem } from '../../../seo/structuredData';
import { trackEvent } from '../../../analytics/analytics';
import type { ContentBlock, LongFormPage } from '../../../content/types';

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

function Block({ block }: { block: ContentBlock }) {
  if (block.type === 'p') return <p>{block.text}</p>;

  if (block.type === 'list') {
    return (
      <ul className="list-disc space-y-2 pl-6">
        {block.items.map((item) => (
          <li key={item.text}>
            {item.lead && <strong className="text-[#151C19]">{item.lead} </strong>}
            {item.text}
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === 'steps') {
    return (
      <ol className="space-y-3">
        {block.items.map((item, i) => (
          <li key={item.lead} className="flex items-start gap-3">
            <span aria-hidden="true" className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#E8783C] text-sm font-bold text-white">
              {i + 1}
            </span>
            <span>
              <strong className="text-[#151C19]">{item.lead} </strong>
              {item.text}
            </span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200">
      <table className="w-full min-w-[520px] border-collapse text-left text-base">
        <caption className="sr-only">{block.caption}</caption>
        <thead className="bg-[#F3F1EA] text-[#151C19]">
          <tr>
            {block.head.map((cell, i) => (
              <th key={i} scope="col" className="px-4 py-3 font-bold">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row) => (
            <tr key={row[0]} className="border-t border-gray-200">
              {row.map((cell, i) =>
                i === 0 ? (
                  <th key={i} scope="row" className="px-4 py-3 font-semibold text-[#151C19]">
                    {cell}
                  </th>
                ) : (
                  <td key={i} className="px-4 py-3">
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Renders any long-form content page: pillar pages, guides and standalone pages. */
export default function PillarPage({ page, parents = [] }: { page: LongFormPage; parents?: BreadcrumbItem[] }) {
  const breadcrumbs = [...parents, { name: page.label, path: page.path }];

  return (
    <div className="bg-[#FAFAF7] min-h-screen text-gray-900 font-sans relative overflow-x-clip">
      <div className="texture-indian-heritage fixed inset-0 pointer-events-none z-0" />
      <SEO
        title={page.title}
        description={page.description}
        canonicalUrl={page.path}
        type="article"
        schema={[
          getOrganizationSchema(),
          getBreadcrumbSchema(breadcrumbs),
          getArticleSchema({ path: page.path, headline: page.h1, description: page.description, dateModified: page.updated }),
          getFaqSchema(page.faqs.map((f) => ({ q: f.question, a: f.answer }))),
        ]}
      />
      <SiteHeader />

      <main id="main-content" className="pt-32 pb-24 px-4 sm:px-6 md:px-12 max-w-4xl mx-auto relative z-10">
        <BreadcrumbNav items={breadcrumbs} />

        <h1 className="text-4xl md:text-5xl font-extrabold text-[#151C19] mb-5 tracking-tight">{page.h1}</h1>
        <p className="text-xl text-[#53615a] mb-4 leading-relaxed font-medium">{page.intro}</p>
        <p className="text-sm text-[#53615a] mb-8">
          By the MenusQR team · Updated <time dateTime={page.updated}>{formatDate(page.updated)}</time>
        </p>

        <nav aria-label="On this page" className="mb-10 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-3 text-base font-bold text-[#151C19]">On this page</h2>
          <ol className="grid gap-x-6 sm:grid-cols-2">
            {page.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="flex min-h-11 items-center text-base font-medium text-[#151C19] underline-offset-4 hover:text-[#E8783C] hover:underline">
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="space-y-12 text-lg leading-relaxed text-[#151C19]/80">
          {page.sections.map((section) => (
            <section key={section.id} aria-labelledby={section.id}>
              <h2 id={section.id} className="mb-4 scroll-mt-28 text-2xl md:text-3xl font-extrabold text-[#151C19]">
                {section.heading}
              </h2>
              <div className="space-y-4">
                {section.blocks.map((block, i) => (
                  <Block key={i} block={block} />
                ))}
              </div>
              {section.links && (
                <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
                  {section.links.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to} className="inline-flex min-h-11 items-center gap-1.5 text-base font-bold text-[#B4531F] underline-offset-4 hover:underline">
                        {link.label} <ArrowRight size={16} aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </article>

        <section className="my-12 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[#151C19] p-8 text-white">
          <div>
            <h2 className="text-2xl font-extrabold">{page.cta.heading}</h2>
            <p className="mt-1 text-base text-white/80">{page.cta.text}</p>
          </div>
          <Link
            to={page.cta.to}
            onClick={() => trackEvent('cta_click', { location: 'pillar_page', label: page.cta.label, page_path: page.path })}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#E8783C] px-6 py-3 font-bold text-white hover:bg-[#d66a30] transition-colors"
          >
            {page.cta.label} <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>

        <GeoFaqSection faqs={page.faqs} title={`${page.label}: questions and answers`} />

        <nav aria-label="Related pages" className="mt-6">
          <h2 className="mb-3 text-lg font-bold text-[#151C19]">Read next</h2>
          <ul className="flex flex-wrap gap-2">
            {page.related.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="inline-flex min-h-11 items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-base font-semibold text-[#151C19] hover:border-[#E8783C] hover:text-[#B4531F]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>

      <SiteFooter />
    </div>
  );
}
