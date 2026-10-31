/**
 * A backend from before empty menus were left empty answers a restaurant with no dishes with a fixed
 * set of placeholder dishes (ids `item-1`, `item-2`, ... under `cat-starters`, `cat-main`, ...).
 * Real dishes and categories always get generated ids, so this shape is never a restaurant's own menu
 * and is treated as an empty one, rather than showing diners dishes and prices nobody entered.
 */
export function isPlaceholderMenu(items: ReadonlyArray<{ id: string }>, categories: ReadonlyArray<{ id: string }>): boolean {
  return (
    items.length > 0 &&
    items.every((item) => /^item-\d+$/.test(item.id)) &&
    categories.every((category) => /^cat-[a-z]+$/.test(category.id))
  );
}
