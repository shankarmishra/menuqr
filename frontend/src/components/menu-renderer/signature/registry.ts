/**
 * MENUQR Menu Renderer — Signature Composition Registry
 *
 * Maps a `SignatureCompositionId` to the component that owns the whole page for it. Exactly like
 * `slots/registry.ts`, kept as one small lookup table so adding a composition never requires
 * touching `MenuRenderer`.
 *
 * Two generations live here on purpose:
 *   - the three original Signature compositions, kept because live client menus reference them;
 *   - the ten `Edition` compositions, the current art-directed catalogue.
 *
 * The exhaustive `Record` type is the safety net: adding an id to `SignatureCompositionId`
 * without implementing it is a compile error, not a blank page at runtime.
 */

import type React from 'react';
import type { SignatureCompositionId } from '../../../design-system/theme.types.ts';
import type { SignatureProps } from '../types.ts';
import { HeritageBookletComposition } from './HeritageBookletComposition.tsx';
import { GraphicBookletComposition } from './GraphicBookletComposition.tsx';
import { ChalkboardComposition } from './ChalkboardComposition.tsx';
import { MaisonNoirEdition } from './editions/MaisonNoirEdition.tsx';
import { HerbariumEdition } from './editions/HerbariumEdition.tsx';
import { NorenEdition } from './editions/NorenEdition.tsx';
import { CartaRusticaEdition } from './editions/CartaRusticaEdition.tsx';
import { ChalkHouseEdition } from './editions/ChalkHouseEdition.tsx';
import { AtelierPastelEdition } from './editions/AtelierPastelEdition.tsx';
import { PresseBrutEdition } from './editions/PresseBrutEdition.tsx';
import { LittoraleEdition } from './editions/LittoraleEdition.tsx';
import { NeonIchibanEdition } from './editions/NeonIchibanEdition.tsx';
import { MaharajaTableEdition } from './editions/MaharajaTableEdition.tsx';
import { RangEPunjabEdition } from './editions/RangEPunjabEdition.tsx';
import { DakshinHeritageEdition } from './editions/DakshinHeritageEdition.tsx';
import { ThaliAndCoEdition } from './editions/ThaliAndCoEdition.tsx';
import { BombayChowkEdition } from './editions/BombayChowkEdition.tsx';

export const SIGNATURE_COMPONENTS: Record<SignatureCompositionId, React.FC<SignatureProps>> = {
  // Generation 1 — retained for backward compatibility with stored themes.
  'heritage-booklet': HeritageBookletComposition,
  'graphic-booklet': GraphicBookletComposition,
  'chalkboard-clipboard': ChalkboardComposition,

  // Generation 2 — the Edition catalogue.
  'maison-noir': MaisonNoirEdition,
  herbarium: HerbariumEdition,
  noren: NorenEdition,
  'carta-rustica': CartaRusticaEdition,
  darbar: MaharajaTableEdition, // Upgraded to Maharaja's Table
  'chalk-house': ChalkHouseEdition,
  'atelier-pastel': AtelierPastelEdition,
  'presse-brut': PresseBrutEdition,
  littorale: LittoraleEdition,
  'neon-ichiban': NeonIchibanEdition,

  // Indian Culinary Heritage Additions
  'maharaja-table': MaharajaTableEdition,
  'rang-e-punjab': RangEPunjabEdition,
  'dakshin-heritage': DakshinHeritageEdition,
  'thali-and-co': ThaliAndCoEdition,
  'bombay-chowk': BombayChowkEdition,
};

/**
 * Which theme fields each composition actually reads.
 *
 * A composition owns its layout, so `theme.slots.*` is inert for all of them — editing a cover
 * architecture or dish-card style has no visible effect. `coverPhoto` records whether the
 * composition paints `theme.cover.imageUrl` at all; the ones marked false build their imagery
 * from the menu's own dish photographs instead.
 *
 * The Design Studio reads this to decide which controls to show, so an owner is never offered a
 * dial that does nothing.
 */
export const SIGNATURE_COVER_CAPS: Record<
  SignatureCompositionId,
  { coverPhoto: boolean; dishPhotos: boolean }
> = {
  'heritage-booklet': { coverPhoto: false, dishPhotos: true },
  'graphic-booklet': { coverPhoto: false, dishPhotos: true },
  'chalkboard-clipboard': { coverPhoto: false, dishPhotos: true },

  'maison-noir': { coverPhoto: true, dishPhotos: true },
  herbarium: { coverPhoto: false, dishPhotos: true },
  noren: { coverPhoto: false, dishPhotos: true },
  'carta-rustica': { coverPhoto: false, dishPhotos: true },
  darbar: { coverPhoto: true, dishPhotos: true },
  'chalk-house': { coverPhoto: false, dishPhotos: true },
  'atelier-pastel': { coverPhoto: true, dishPhotos: true },
  'presse-brut': { coverPhoto: false, dishPhotos: true },
  littorale: { coverPhoto: true, dishPhotos: true },
  'neon-ichiban': { coverPhoto: true, dishPhotos: true },

  'maharaja-table': { coverPhoto: true, dishPhotos: true },
  'rang-e-punjab': { coverPhoto: true, dishPhotos: true },
  'dakshin-heritage': { coverPhoto: true, dishPhotos: true },
  'thali-and-co': { coverPhoto: true, dishPhotos: true },
  'bombay-chowk': { coverPhoto: true, dishPhotos: true },
};
