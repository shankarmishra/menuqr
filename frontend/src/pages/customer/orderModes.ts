export type OrderMode = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

export interface OrderingSwitches {
  dineIn?: boolean;
  takeaway?: boolean;
  delivery?: boolean;
  deliveryPausedUntil?: string | null;
  deliveryTimeSlots?: Array<{ start: string; end: string }>;
}

export interface OrderModeOptions {
  isTableLocked?: boolean;
  currentTime?: Date;
}

/**
 * Checks if current time in Asia/Kolkata falls within scheduled delivery slots.
 * Supports midnight crossing (e.g. 23:00 to 03:00).
 */
export function isDeliverySlotActive(slots?: Array<{ start: string; end: string }>, date = new Date()): boolean {
  if (!Array.isArray(slots) || slots.length === 0) return true;
  const istStr = date.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit' });
  const [currH, currM] = istStr.split(':').map(Number);
  const currentMinutes = currH * 60 + currM;

  return slots.some((slot) => {
    if (!slot || !slot.start || !slot.end) return false;
    const [sH, sM] = String(slot.start).split(':').map(Number);
    const [eH, eM] = String(slot.end).split(':').map(Number);
    if (!Number.isFinite(sH) || !Number.isFinite(sM) || !Number.isFinite(eH) || !Number.isFinite(eM)) return false;
    const startMinutes = sH * 60 + sM;
    const endMinutes = eH * 60 + eM;

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
  });
}

/**
 * Returns delivery availability and human-friendly status note.
 */
export function getDeliveryStatus(
  settings: OrderingSwitches | null | undefined,
  date = new Date()
): { isAvailable: boolean; reason?: string; remainingMinutes?: number } {
  if (!settings || settings.delivery === false) {
    return { isAvailable: false, reason: 'Delivery is not offered by the restaurant.' };
  }
  if (settings.deliveryPausedUntil) {
    const pausedUntil = new Date(settings.deliveryPausedUntil);
    if (pausedUntil > date) {
      const remainingMinutes = Math.max(1, Math.ceil((pausedUntil.getTime() - date.getTime()) / 60000));
      return {
        isAvailable: false,
        reason: `Delivery is paused for peak rush. Resumes in ~${remainingMinutes} min.`,
        remainingMinutes,
      };
    }
  }
  if (Array.isArray(settings.deliveryTimeSlots) && settings.deliveryTimeSlots.length > 0) {
    if (!isDeliverySlotActive(settings.deliveryTimeSlots, date)) {
      return {
        isAvailable: false,
        reason: 'Delivery is currently closed outside of service hours.',
      };
    }
  }
  return { isAvailable: true };
}

/**
 * The order types a diner can pick on a menu.
 *
 * `orderingSettings` is absent from a backend that predates the owner's mode switches. That backend
 * only knows dine-in and delivery, and every ordering menu offered both, so a missing field reads as
 * that pair: a menu never loses its delivery tab just because the field is not in the payload yet.
 *
 * If a customer has scanned a table QR code (isTableLocked = true), they are
 * physically dining in at that table! They can only order DINE_IN.
 */
export function availableOrderModes(
  settings: OrderingSwitches | null | undefined,
  options: OrderModeOptions = {}
): OrderMode[] {
  // Physical table QR scanned -> Lock strictly to DINE_IN
  if (options.isTableLocked) {
    return ['DINE_IN'];
  }

  if (!settings) return ['DINE_IN', 'DELIVERY'];
  const modes: OrderMode[] = [];
  if (settings.dineIn !== false) modes.push('DINE_IN');
  if (settings.takeaway) modes.push('TAKEAWAY');
  if (settings.delivery) {
    const status = getDeliveryStatus(settings, options.currentTime || new Date());
    if (status.isAvailable) {
      modes.push('DELIVERY');
    }
  }
  return modes;
}
