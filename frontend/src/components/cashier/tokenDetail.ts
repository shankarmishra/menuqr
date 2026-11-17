import type { TokenDetail } from './PaymentActionPanel';

// GET /api/app/tokens/:id answers { success, token: {...} } with amounts in paise. The cashier
// panel used to read the whole response as the token, so names, items and legal details were
// undefined. This turns the response into the shape the panel and receipt expect.

const rupees = (paise: unknown, fallbackRupees?: unknown) =>
  paise !== undefined && paise !== null ? Number(paise) / 100 : Number(fallbackRupees ?? 0);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toTokenDetail(json: any): TokenDetail | null {
  const t = json?.token ?? json;
  if (!t || typeof t !== 'object' || !t.id) return null;
  const items = Array.isArray(t.items) ? t.items : [];
  return {
    id: String(t.id),
    tokenNumber: Number(t.tokenNumber ?? t.token_number ?? 0),
    tableNumber: Number(t.tableNumber ?? t.table_number ?? 0),
    total: rupees(t.totalPaise, t.total),
    itemCount: items.reduce((sum: number, it: { quantity?: number }) => sum + Number(it.quantity || 1), 0),
    createdAt: String(t.createdAt ?? t.created_at ?? ''),
    status: String(t.status || 'UNPAID').toUpperCase() as TokenDetail['status'],
    items: items.map((it: Record<string, unknown>) => ({
      name: String(it.dishName ?? it.name ?? it.itemName ?? 'Dish'),
      variant: (it.variant as string | null) ?? null,
      quantity: Number(it.quantity ?? 1),
      totalPrice: rupees(it.totalPricePaise, it.totalPrice ?? it.total),
      isVeg: it.isVeg !== false,
    })),
    subtotal: rupees(t.subtotalPaise, t.subtotal),
    gst: rupees(t.taxPaise, t.tax ?? t.gst),
    cgst: t.cgstPaise !== undefined ? Number(t.cgstPaise) / 100 : t.cgst,
    sgst: t.sgstPaise !== undefined ? Number(t.sgstPaise) / 100 : t.sgst,
    discount: rupees(t.discountPaise, t.discount),
    restaurantName: t.restaurantName ?? undefined,
    restaurantGstin: t.restaurantGstin ?? null,
    restaurantFssai: t.restaurantFssai ?? null,
    restaurantLegalName: t.restaurantLegalName ?? null,
    restaurantGstMode: t.restaurantGstMode ?? null,
    restaurantAddress: t.restaurantAddress ?? null,
    restaurantCity: t.restaurantCity ?? null,
    restaurantPhone: t.restaurantPhone ?? null,
    taxMode: t.taxMode ?? null,
    taxRateBps: t.taxRateBps ?? null,
  };
}
