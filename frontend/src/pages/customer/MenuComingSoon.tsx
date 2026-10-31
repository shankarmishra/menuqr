import { Phone } from 'lucide-react';
import { firstDialNumber } from '../../utils/dialNumber';

type MenuComingSoonProps = {
  name: string;
  tagline?: string | null;
  logoUrl?: string | null;
  phone?: string | null;
  background: string;
  textColor: string;
};

/**
 * Shown for a restaurant whose menu has no dishes yet. It says so plainly and offers only what the
 * owner has actually saved (name, tagline, logo, phone): nothing is invented to fill the page.
 */
export function MenuComingSoon({ name, tagline, logoUrl, phone, background, textColor }: MenuComingSoonProps) {
  const dial = firstDialNumber(phone);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center"
      style={{ backgroundColor: background, color: textColor }}
    >
      {logoUrl && (
        <img
          src={logoUrl}
          alt={name}
          className="mb-6 h-24 w-24 rounded-full bg-white object-contain p-2 shadow-lg"
          loading="eager"
          decoding="async"
        />
      )}
      <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
      {tagline && <p className="mt-2 max-w-sm opacity-80">{tagline}</p>}

      <div className="mt-10 max-w-sm" role="status">
        <h2 className="text-xl font-semibold">Our menu is being prepared</h2>
        <p className="mt-2 opacity-80">Please check back soon.</p>
      </div>

      {dial.length >= 6 && (
        <a
          href={`tel:${dial}`}
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-current/30 px-4 py-2 text-sm font-semibold"
        >
          <Phone size={14} aria-hidden="true" />
          {phone}
        </a>
      )}
    </main>
  );
}
