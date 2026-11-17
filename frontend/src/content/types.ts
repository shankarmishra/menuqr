// Shared shapes for long-form marketing content (pillar pages, later guides).
// Content is plain data so it can be unit-tested (length, uniqueness) and server-rendered.

export type ContentBlock =
  | { type: 'p'; text: string }
  /** Bullet list. `lead` is shown in bold before the text. */
  | { type: 'list'; items: { lead?: string; text: string }[] }
  /** Numbered steps. */
  | { type: 'steps'; items: { lead: string; text: string }[] }
  | { type: 'table'; caption: string; head: string[]; rows: string[][] };

export interface ContentLink {
  to: string;
  label: string;
}

export interface ContentSection {
  /** Used as the heading's id and in the table of contents. */
  id: string;
  heading: string;
  blocks: ContentBlock[];
  /** Internal links shown under the section. */
  links?: ContentLink[];
}

export interface ContentFaq {
  question: string;
  answer: string;
}

export interface LongFormPage {
  path: string;
  /** Short name for breadcrumbs and navigation. */
  label: string;
  /** 60 characters or fewer. */
  title: string;
  /** 160 characters or fewer. */
  description: string;
  h1: string;
  intro: string;
  /** ISO date of the last real content change. */
  updated: string;
  sections: ContentSection[];
  faqs: ContentFaq[];
  related: ContentLink[];
  cta: { heading: string; text: string; to: string; label: string };
}

const blockText = (block: ContentBlock): string => {
  switch (block.type) {
    case 'p':
      return block.text;
    case 'list':
      return block.items.map((i) => `${i.lead ?? ''} ${i.text}`).join(' ');
    case 'steps':
      return block.items.map((i) => `${i.lead} ${i.text}`).join(' ');
    case 'table':
      return [block.caption, ...block.head, ...block.rows.flat()].join(' ');
  }
};

/** Words of body copy on a page (headings, paragraphs, lists, tables and FAQs). */
export function countWords(page: LongFormPage): number {
  const text = [
    page.h1,
    page.intro,
    ...page.sections.flatMap((s) => [s.heading, ...s.blocks.map(blockText)]),
    ...page.faqs.flatMap((f) => [f.question, f.answer]),
  ].join(' ');
  return text.split(/\s+/).filter(Boolean).length;
}
