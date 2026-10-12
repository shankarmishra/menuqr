import type { MenuItem } from '../types';

export interface FormattedVariant {
  id?: string;
  name: string;        // e.g. "Half" or "Full"
  portion?: string;     // e.g. "6 balls"
  label: string;       // e.g. "Half · 6 balls" or "Half"
  price: number;
  formattedPrice: string; // e.g. "₹120"
}

export interface ItemPricingDetails {
  hasVariants: boolean;
  variants: FormattedVariant[];
  basePrice?: number;
  formattedBasePrice?: string;
  cleanDescription?: string;
}

export function formatIndianPrice(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '';
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return String(val);
  return `₹${num.toLocaleString('en-IN')}`;
}

export function parseItemPricing(item: MenuItem): ItemPricingDetails {
  const desc = item.description || '';
  let cleanDesc = desc;

  // 1. Structured variants take highest precedence
  if (Array.isArray(item.variants) && item.variants.length > 0) {
    const variants = item.variants.map((v) => {
      const p = typeof v.price === 'number' ? v.price : parseFloat(String(v.price || 0));
      let name = (v.name || '').trim();
      let portion = '';

      const parenMatch = name.match(/^(.*?)\s*[\(\[]([^()]+)[\)\]]$/);
      const dotMatch = name.match(/^(.*?)\s*[·\-\:]\s*(.+)$/);
      if (parenMatch) {
        name = parenMatch[1].trim();
        portion = parenMatch[2].trim();
      } else if (dotMatch) {
        name = dotMatch[1].trim();
        portion = dotMatch[2].trim();
      } else {
        const regex = new RegExp(`(?:^|[;\\n,\\.\\s])${name}\\s*[:\\-\\—\\·]\\s*([^;\\n,\\.]+)`, 'i');
        const m = desc.match(regex);
        if (m) portion = m[1].trim();
      }
      const label = portion ? `${name} · ${portion}` : name;
      return { id: v.id, name, portion, label, price: p, formattedPrice: formatIndianPrice(p) };
    });

    for (const v of variants) {
      if (v.portion) {
        const re = new RegExp(`(?:^|[;\\n,\\s]*)${v.name}\\s*[:\\-\\—\\·]\\s*${v.portion}[;\\n,\\s]*`, 'gi');
        cleanDesc = cleanDesc.replace(re, ' ').trim();
      }
    }

    return {
      hasVariants: true,
      variants,
      cleanDescription: cleanDesc.replace(/^[;,\.\s\-]+|[;,\.\s\-]+$/g, '').trim(),
    };
  }

  // 2. Half and Full prices configured
  const hasHalf = item.halfPrice !== undefined && item.halfPrice !== null && item.halfPrice !== '';
  const hasFull = item.fullPrice !== undefined && item.fullPrice !== null && item.fullPrice !== '';

  if (hasHalf || hasFull) {
    const halfP = hasHalf ? (typeof item.halfPrice === 'number' ? item.halfPrice : parseFloat(String(item.halfPrice))) : null;
    const fullP = hasFull ? (typeof item.fullPrice === 'number' ? item.fullPrice : parseFloat(String(item.fullPrice))) : null;

    const halfMatch = desc.match(/(?:^|[;\n,\.\s])half\s*[:\-\—\·]\s*([^;\n,\.]+)/i);
    const fullMatch = desc.match(/(?:^|[;\n,\.\s])full\s*[:\-\—\·]\s*([^;\n,\.]+)/i);

    const halfPortion = halfMatch ? halfMatch[1].trim() : '';
    const fullPortion = fullMatch ? fullMatch[1].trim() : '';

    const variants: FormattedVariant[] = [];
    if (halfP !== null && !isNaN(halfP)) {
      const label = halfPortion ? `Half · ${halfPortion}` : 'Half';
      variants.push({ name: 'Half', portion: halfPortion, label, price: halfP, formattedPrice: formatIndianPrice(halfP) });
    }
    if (fullP !== null && !isNaN(fullP)) {
      const label = fullPortion ? `Full · ${fullPortion}` : 'Full';
      variants.push({ name: 'Full', portion: fullPortion, label, price: fullP, formattedPrice: formatIndianPrice(fullP) });
    }

    if (halfMatch) cleanDesc = cleanDesc.replace(halfMatch[0], ' ');
    if (fullMatch) cleanDesc = cleanDesc.replace(fullMatch[0], ' ');

    return {
      hasVariants: variants.length > 0,
      variants,
      cleanDescription: cleanDesc.replace(/^[;,\.\s\-]+|[;,\.\s\-]+$/g, '').trim(),
    };
  }

  // 3. Regular / Medium / Large configured
  const hasReg = item.regPrice !== undefined && item.regPrice !== null && item.regPrice !== '';
  const hasMed = item.medPrice !== undefined && item.medPrice !== null && item.medPrice !== '';
  const hasLarge = item.largePrice !== undefined && item.largePrice !== null && item.largePrice !== '';

  if (hasReg || hasMed || hasLarge) {
    const variants: FormattedVariant[] = [];
    if (hasReg) {
      const p = typeof item.regPrice === 'number' ? item.regPrice : parseFloat(String(item.regPrice));
      if (!isNaN(p)) variants.push({ name: 'Regular', label: 'Regular', price: p, formattedPrice: formatIndianPrice(p) });
    }
    if (hasMed) {
      const p = typeof item.medPrice === 'number' ? item.medPrice : parseFloat(String(item.medPrice));
      if (!isNaN(p)) variants.push({ name: 'Medium', label: 'Medium', price: p, formattedPrice: formatIndianPrice(p) });
    }
    if (hasLarge) {
      const p = typeof item.largePrice === 'number' ? item.largePrice : parseFloat(String(item.largePrice));
      if (!isNaN(p)) variants.push({ name: 'Large', label: 'Large', price: p, formattedPrice: formatIndianPrice(p) });
    }

    if (variants.length > 0) {
      return {
        hasVariants: true,
        variants,
        cleanDescription: cleanDesc.trim(),
      };
    }
  }

  // 4. Fallback to single base price (do not invent or guess prices)
  const basePrice = item.price !== undefined && item.price !== null && item.price !== ''
    ? (typeof item.price === 'number' ? item.price : parseFloat(String(item.price)))
    : undefined;

  return {
    hasVariants: false,
    variants: [],
    basePrice,
    formattedBasePrice: basePrice !== undefined && !isNaN(basePrice) ? formatIndianPrice(basePrice) : '',
    cleanDescription: desc,
  };
}
