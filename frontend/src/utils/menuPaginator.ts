// MENUQR Auto-Pagination Engine
// Distributes menu categories & dishes across exact A4 pages with smart orphan prevention and a front cover

export interface PagedMenuItem {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  halfPrice?: number | string;
  fullPrice?: number | string;
  regPrice?: number | string;
  medPrice?: number | string;
  largePrice?: number | string;
  pricingType?: string;
  category: string;
  dietType?: 'veg' | 'non-veg' | 'vegan';
  available?: boolean;
  isSpicy?: boolean;
  isBestseller?: boolean;
}

export interface PagedCategorySection {
  categoryId: string;
  categoryName: string;
  isContinuation?: boolean;
  items: PagedMenuItem[];
}

export interface MenuPageDefinition {
  pageNumber: number;
  totalPages: number;
  pageType: 'cover' | 'menu';
  sections: PagedCategorySection[];
  runningTitle?: string;
}

export interface PaginationOptions {
  layoutMode?: 'single-column' | 'two-column';
  itemsPerPage?: number;
  enableCoverPage?: boolean;
}

/**
 * Calculates height units for items to avoid page overflow
 * - Category Heading: 2.2 units
 * - Standard Item (Name + Price): 1.0 unit
 * - Detailed Item (with description): 1.6 units
 * - Dual-price Item (Half / Full): 1.3 units
 */
function getItemWeight(item: PagedMenuItem): number {
  let weight = 1.0;
  if (item.description && item.description.trim().length > 0) {
    weight += 0.4;
  }
  if (item.halfPrice || item.fullPrice || item.regPrice || item.largePrice) {
    weight += 0.3;
  }
  return weight;
}

export function paginateMenu(
  categories: Array<{ id: string; name: string; order?: number }>,
  items: PagedMenuItem[],
  options: PaginationOptions = {}
): MenuPageDefinition[] {
  const {
    layoutMode = 'two-column',
    enableCoverPage = true
  } = options;

  // Virtual capacity per inner page (in weight units)
  // Calibrated for optimal luxury layout without clipping
  const maxCapacityPerPage = layoutMode === 'two-column' ? 14 : 7;

  // Filter available items and group by category
  const activeItems = items.filter(it => it.available !== false);
  
  // Sort categories by order if present
  const sortedCategories = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const pages: MenuPageDefinition[] = [];

  // 1. PAGE 1: DEDICATED FRONT COVER PAGE
  if (enableCoverPage) {
    pages.push({
      pageNumber: 1,
      totalPages: 1, // updated at the end
      pageType: 'cover',
      sections: []
    });
  }

  // 2. INNER MENU PAGES
  let currentPageNumber = enableCoverPage ? 2 : 1;
  let currentSections: PagedCategorySection[] = [];
  let currentWeight = 0;

  for (const cat of sortedCategories) {
    // Find items for this category (matching either category id or category name case-insensitively)
    const catItems = activeItems.filter(
      it => it.category === cat.id || it.category?.toLowerCase() === cat.name.toLowerCase()
    );

    if (catItems.length === 0) continue;

    let itemCursor = 0;
    let isContinuation = false;

    while (itemCursor < catItems.length) {
      const headingWeight = 1.8;
      const remainingSpace = maxCapacityPerPage - currentWeight;

      // If there is no space on the current page even for the heading + 1 item, bump to a new page
      if (remainingSpace < (headingWeight + 1.0) && currentSections.length > 0) {
        pages.push({
          pageNumber: currentPageNumber++,
          totalPages: 1,
          pageType: 'menu',
          sections: currentSections
        });
        currentSections = [];
        currentWeight = 0;
      }

      // Calculate how many items can fit on the current page
      const chunkItems: PagedMenuItem[] = [];
      let accumulatedChunkWeight = currentSections.length === 0 ? headingWeight : (headingWeight * 0.7);

      while (itemCursor < catItems.length) {
        const nextItem = catItems[itemCursor];
        const itemW = getItemWeight(nextItem);

        if (currentWeight + accumulatedChunkWeight + itemW > maxCapacityPerPage && chunkItems.length > 0) {
          // Page is full
          break;
        }

        chunkItems.push(nextItem);
        accumulatedChunkWeight += itemW;
        itemCursor++;
      }

      if (chunkItems.length > 0) {
        currentSections.push({
          categoryId: cat.id,
          categoryName: cat.name,
          isContinuation,
          items: chunkItems
        });
        currentWeight += accumulatedChunkWeight;
        isContinuation = true;
      }

      // If we still have items left in this category, flush the current page
      if (itemCursor < catItems.length) {
        pages.push({
          pageNumber: currentPageNumber++,
          totalPages: 1,
          pageType: 'menu',
          sections: currentSections
        });
        currentSections = [];
        currentWeight = 0;
      }
    }
  }

  // Push any remaining sections on the final page
  if (currentSections.length > 0 || pages.length === (enableCoverPage ? 1 : 0)) {
    pages.push({
      pageNumber: currentPageNumber,
      totalPages: 1,
      pageType: 'menu',
      sections: currentSections
    });
  }

  // Update totalPages across all generated page definitions
  const finalTotalPages = pages.length;
  pages.forEach(p => {
    p.totalPages = finalTotalPages;
    if (p.sections.length > 0) {
      p.runningTitle = p.sections.map(s => s.categoryName).join(' & ');
    }
  });

  return pages;
}
