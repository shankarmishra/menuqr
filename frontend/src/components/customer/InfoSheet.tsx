import { useEffect, useId, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, Clock3, Globe, Leaf, Link2, MapPin, MessageCircle, Navigation, Phone, Share2, X } from 'lucide-react';
import type { InfoAction, InfoIcon, InfoModel } from '../../pages/customer/infoModel';
import type { TrackKind } from '../../utils/trackClick';
import { browserShareEnv, copyText, shareMenu } from '../../utils/shareMenu';
import { FacebookIcon, InstagramIcon, YoutubeIcon } from './ContactIcons';

type InfoSheetProps = {
  open: boolean;
  name: string;
  model: InfoModel;
  /** The address to share: the menu link without the QR or table parameters. */
  shareUrl: string;
  onClose: () => void;
  /** Called for every counted tap (the privacy-safe beacon). */
  onAction: (kind: TrackKind) => void;
};

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

function glyph(icon: InfoIcon, size = 18) {
  switch (icon) {
    case 'phone': return <Phone size={size} aria-hidden="true" />;
    case 'whatsapp': return <MessageCircle size={size} aria-hidden="true" />;
    case 'directions': return <Navigation size={size} aria-hidden="true" />;
    case 'instagram': return <InstagramIcon size={size} />;
    case 'facebook': return <FacebookIcon size={size} />;
    case 'youtube': return <YoutubeIcon size={size} />;
    case 'website': return <Globe size={size} aria-hidden="true" />;
    default: return <Link2 size={size} aria-hidden="true" />;
  }
}

const isTouchDevice = () =>
  typeof window !== 'undefined' && (Boolean(window.matchMedia?.('(pointer: coarse)').matches) || navigator.maxTouchPoints > 0);

const buttonBase =
  'flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[15px] font-semibold leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900';

/** Bottom sheet with the restaurant's contact details. Built without a library: focus trap, Escape, backdrop and scroll lock. */
export function InfoSheet({ open, name, model, shareUrl, onClose, onAction }: InfoSheetProps) {
  const titleId = useId();
  const weekId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const reduceMotion = useReducedMotion();
  const [showWeek, setShowWeek] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!open) return;
    setShowWeek(false);
    setNotice('');
    const opener = document.activeElement as HTMLElement | null;
    const appRoot = document.getElementById('root');
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // The sheet is rendered outside #root, so the page behind it can be switched off for keyboards and screen readers.
    appRoot?.setAttribute('inert', '');
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      const root = dialogRef.current;
      if (event.key !== 'Tab' || !root) return;
      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((element) => element.offsetParent !== null);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !root.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !root.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      appRoot?.removeAttribute('inert');
      opener?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 3000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const handleShare = async () => {
    const result = await shareMenu({ title: name, url: shareUrl }, browserShareEnv());
    if (result === 'copied') setNotice('Link copied');
    else if (result === 'failed') setNotice('Could not share. Copy the address from your browser instead.');
    if (result === 'shared' || result === 'copied') onAction('share');
  };

  const renderAction = (action: InfoAction, variant: 'primary' | 'secondary') => {
    const onClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
      onAction(action.kind);
      // A computer cannot place a call: copy the number so it can be dialled elsewhere.
      if (action.copyText && !isTouchDevice()) {
        event.preventDefault();
        void copyText(action.copyText, browserShareEnv()).then((copied) => setNotice(copied ? 'Number copied' : action.copyText ?? ''));
      }
    };
    return (
      <a
        key={`${action.kind}:${action.href}`}
        href={action.href}
        {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        onClick={onClick}
        className={`${buttonBase} ${variant === 'primary' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50'}`}
      >
        {glyph(action.icon)}
        <span className="flex min-w-0 flex-col items-start text-left">
          <span>{action.label}</span>
          {action.detail && <span className="max-w-full truncate text-[13px] font-normal opacity-80">{action.detail}</span>}
        </span>
      </a>
    );
  };

  const actionCount = model.calls.length + (model.whatsapp ? 1 : 0);
  const hasHours = Boolean(model.status || model.today || model.hoursText);
  const section = (children: ReactNode) => <div className="border-t border-slate-200 px-5 py-4">{children}</div>;

  if (typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/55 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.18 }}
          onClick={onClose}
          data-info-sheet-backdrop
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative max-h-[88dvh] w-full overflow-y-auto overscroll-contain rounded-t-3xl bg-white text-slate-900 shadow-2xl sm:max-w-md sm:rounded-3xl"
            initial={{ y: reduceMotion ? 0 : '100%' }}
            animate={{ y: 0 }}
            exit={{ y: reduceMotion ? 0 : '100%' }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', damping: 30, stiffness: 340 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-white px-5 pb-3 pt-4">
              <h2 id={titleId} className="min-w-0 text-lg font-bold leading-snug [overflow-wrap:anywhere]">{name}</h2>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close restaurant info"
                className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            {hasHours && section(
              <>
                {model.status && (
                  <p className={`flex items-center gap-2 text-base font-semibold ${model.status.isOpen ? 'text-emerald-800' : 'text-rose-800'}`}>
                    <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${model.status.isOpen ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                    {model.status.label}
                  </p>
                )}
                {model.status?.note && <p className="mt-1 text-sm text-slate-600">{model.status.note}</p>}
                {model.today && (
                  <p className="mt-2 flex items-start gap-2 text-[15px] text-slate-800">
                    <Clock3 size={18} className="mt-0.5 shrink-0 text-slate-500" aria-hidden="true" />
                    <span>Today {model.today}</span>
                  </p>
                )}
                {model.status?.lastOrder && <p className="mt-1 pl-7 text-sm text-slate-600">Last order {model.status.lastOrder}</p>}
                {model.hoursText && (
                  <p className="flex items-start gap-2 text-[15px] text-slate-800">
                    <Clock3 size={18} className="mt-0.5 shrink-0 text-slate-500" aria-hidden="true" />
                    <span>{model.hoursText}</span>
                  </p>
                )}
                {model.week && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowWeek((value) => !value)}
                      aria-expanded={showWeek}
                      aria-controls={weekId}
                      className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-slate-700 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                    >
                      Full week
                      <ChevronDown size={16} aria-hidden="true" className={`transition-transform ${showWeek ? 'rotate-180' : ''}`} />
                    </button>
                    {showWeek && (
                      <dl id={weekId} className="mt-1 divide-y divide-slate-100 text-[15px]">
                        {model.week.map((row) => (
                          <div key={row.key} className={`flex justify-between gap-4 py-2 ${row.isToday ? 'font-bold' : ''}`} aria-current={row.isToday ? 'date' : undefined}>
                            <dt>{row.name}</dt>
                            <dd className="text-right">{row.text}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </>
                )}
              </>
            )}

            {(model.addressLines.length > 0 || model.directions) && section(
              <>
                {model.addressLines.length > 0 && (
                  <address className="flex items-start gap-2 text-[15px] not-italic leading-snug text-slate-800">
                    <MapPin size={18} className="mt-0.5 shrink-0 text-slate-500" aria-hidden="true" />
                    <span>
                      {model.addressLines.map((line) => (
                        <span key={line} className="block">{line}</span>
                      ))}
                    </span>
                  </address>
                )}
                {model.directions && <div className="mt-3 grid">{renderAction(model.directions, 'primary')}</div>}
              </>
            )}

            {actionCount > 0 && section(
              <div className={`grid gap-2 ${actionCount === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {model.calls.map((action) => renderAction(action, 'secondary'))}
                {model.whatsapp && renderAction(model.whatsapp, 'secondary')}
              </div>
            )}

            {model.links.length > 0 && section(
              <ul className="-my-1 divide-y divide-slate-100">
                {model.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onAction(link.kind)}
                      className="flex min-h-14 items-center gap-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-800">{glyph(link.icon)}</span>
                      <span className="flex min-w-0 flex-col">
                        <span className="text-[15px] font-semibold">{link.label}</span>
                        {link.detail && <span className="truncate text-[13px] text-slate-600">{link.detail}</span>}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {model.partners.length > 0 && section(
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-slate-600">Also on</span>
                {model.partners.map((partner) => (
                  <a
                    key={partner.href}
                    href={partner.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onAction(partner.kind)}
                    className="inline-flex h-9 items-center rounded-full border border-slate-300 px-4 text-sm font-semibold hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                  >
                    {partner.label}
                  </a>
                ))}
              </div>
            )}

            {section(
              <>
                {model.diet && (
                  <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-900">
                    <Leaf size={14} aria-hidden="true" />
                    {model.diet}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleShare}
                  className={`${buttonBase} w-full border border-slate-300 bg-white text-slate-900 hover:bg-slate-50`}
                >
                  <Share2 size={18} aria-hidden="true" />
                  Share this menu
                </button>
                <p role="status" aria-live="polite" className="min-h-5 pt-2 text-center text-sm text-slate-700">{notice}</p>
                {model.fssai && <p className="pt-1 text-center text-xs text-slate-600">FSSAI Lic. No. {model.fssai}</p>}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
