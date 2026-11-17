import { Phone, MessageCircle } from 'lucide-react';

export const DEFAULT_SUPPORT_PHONE = '+918796530323';

/** "+918796530323" → "+91 87965 30323" for display. */
export function formatSupportPhone(phone: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

interface ContactSupportCardProps {
  supportPhone?: string;
  restaurantName?: string;
  /** Short context sent in the WhatsApp message, e.g. "my free trial has ended". */
  reason?: string;
}

/**
 * Call / WhatsApp the MenusQR team. Used when a restaurant wants to pay offline
 * (the team then activates the plan from the super admin panel).
 */
export default function ContactSupportCard({ supportPhone, restaurantName, reason }: ContactSupportCardProps) {
  const phone = supportPhone || DEFAULT_SUPPORT_PHONE;
  const digits = phone.replace(/[^\d]/g, '');
  const message = `Hi MenusQR team, ${reason || 'I want to activate a plan'}${restaurantName ? ` for ${restaurantName}` : ''}. Please help me with the payment.`;
  const whatsappUrl = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#151c19] p-5 md:p-6">
      <h3 className="text-base font-bold text-white">Prefer to pay our team directly?</h3>
      <p className="mt-1 text-sm text-[#aab7b2]">
        Call or WhatsApp us. We can activate your plan as soon as your payment is received —
        cash, UPI or bank transfer.
      </p>
      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
        <a
          href={`tel:${phone}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/15"
        >
          <Phone size={16} /> Call {formatSupportPhone(phone)}
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366]/15 px-4 py-3 text-sm font-bold text-[#4ade80] transition-colors hover:bg-[#25D366]/25"
        >
          <MessageCircle size={16} /> WhatsApp us
        </a>
      </div>
    </div>
  );
}
