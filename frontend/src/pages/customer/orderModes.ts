export type OrderMode = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

type OrderingSwitches = { dineIn: boolean; takeaway: boolean; delivery: boolean };

/**
 * The order types a diner can pick on a menu.
 *
 * `orderingSettings` is absent from a backend that predates the owner's mode switches. That backend
 * only knows dine-in and delivery, and every ordering menu offered both, so a missing field reads as
 * that pair: a menu never loses its delivery tab just because the field is not in the payload yet.
 */
export function availableOrderModes(settings: OrderingSwitches | null | undefined): OrderMode[] {
  if (!settings) return ['DINE_IN', 'DELIVERY'];
  const modes: OrderMode[] = [];
  if (settings.dineIn !== false) modes.push('DINE_IN');
  if (settings.takeaway) modes.push('TAKEAWAY');
  if (settings.delivery) modes.push('DELIVERY');
  return modes;
}
