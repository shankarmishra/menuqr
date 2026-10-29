/**
 * MENUQR Menu Renderer — Slot Registry
 *
 * Maps a slot id from `MenuTheme` to the component that renders it. Exhaustive `Record` types
 * mean a new slot id cannot be added to the theme contract without the compiler demanding an
 * implementation here — which is how we avoid the string-sniffing dispatch in the old
 * `DynamicDesignEngine` (`spec.themeId?.includes('yoursteak')` and similar).
 *
 * 4 covers x 3 navs x 4 cards x 3 sections x 2 footers = 288 layout combinations from these
 * sixteen components, before brand colour, font pairing, texture and density multiply it.
 */

import type React from 'react';
import type {
  CoverSlot,
  DishCardSlot,
  FooterSlot,
  NavSlot,
  SectionSlot,
} from '../../../design-system/theme.types.ts';
import type { SlotProps } from '../types.ts';

import { BentoCollageCover, HeritageArchCover, HeroPhotoCover, MonogramCover } from './covers.tsx';
import { CapsulePillsNav, SidebarIndexNav, UnderlineTabsNav } from './navs.tsx';
import {
  BentoTileCard,
  CompactRowCard,
  MagazineCard,
  MichelinLeaderCard,
  type DishCardProps,
} from './cards.tsx';
import { ArchTitleSection, HairlineCapsSection, RibbonSection, type SectionHeadingProps } from './sections.tsx';
import { ContactBlockFooter, MinimalMarkFooter, type FooterProps } from './footers.tsx';

export const COVER_COMPONENTS: Record<CoverSlot, React.FC<SlotProps>> = {
  'hero-photo': HeroPhotoCover,
  monogram: MonogramCover,
  'heritage-arch': HeritageArchCover,
  'bento-collage': BentoCollageCover,
};

export const NAV_COMPONENTS: Record<NavSlot, React.FC<SlotProps>> = {
  'capsule-pills': CapsulePillsNav,
  'underline-tabs': UnderlineTabsNav,
  'sidebar-index': SidebarIndexNav,
};

export const DISH_CARD_COMPONENTS: Record<DishCardSlot, React.FC<DishCardProps>> = {
  magazine: MagazineCard,
  'michelin-leader': MichelinLeaderCard,
  'compact-row': CompactRowCard,
  'bento-tile': BentoTileCard,
};

export const SECTION_COMPONENTS: Record<SectionSlot, React.FC<SectionHeadingProps>> = {
  ribbon: RibbonSection,
  'hairline-caps': HairlineCapsSection,
  'arch-title': ArchTitleSection,
};

export const FOOTER_COMPONENTS: Record<FooterSlot, React.FC<FooterProps>> = {
  'contact-block': ContactBlockFooter,
  'minimal-mark': MinimalMarkFooter,
};

export { DISH_CARD_CONTAINER } from './cards.tsx';
