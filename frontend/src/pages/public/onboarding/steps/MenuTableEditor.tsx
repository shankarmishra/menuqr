import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import type { ParsedCategory, ParsedMenuItem } from '../../../../utils/excelMenuParser';
import { OB, inputStyle } from '../chrome';

/**
 * The parsed spreadsheet, editable in place.
 *
 * A real restaurant sheet always has something wrong in it — a dish in the wrong section, a price
 * typo, a duplicate row. Before this, onboarding showed those mistakes read-only and the owner had
 * to finish setup and then fix them from the dashboard. Everything here is local state on the
 * wizard's `restaurantData`; nothing is saved until the final step.
 */
export default function MenuTableEditor({
  categories,
  items,
  onChange,
}: {
  categories: ParsedCategory[];
  items: ParsedMenuItem[];
  onChange: (next: { categories: ParsedCategory[]; items: ParsedMenuItem[] }) => void;
}) {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const patchItem = (index: number, patch: Partial<ParsedMenuItem>) => {
    onChange({
      categories,
      items: items.map((item, idx) => (idx === index ? { ...item, ...patch } : item)),
    });
  };

  const deleteItem = (index: number) => {
    onChange({ categories, items: items.filter((_, idx) => idx !== index) });
  };

  const addItem = () => {
    const fallbackCategory = categories[0];
    if (!fallbackCategory) return;
    onChange({
      categories,
      items: [
        ...items,
        {
          id: `manual_${Date.now()}`,
          name: '',
          description: '',
          price: 0,
          category: fallbackCategory.id,
          dietType: 'veg',
          available: true,
          imageUrl: '',
        },
      ],
    });
  };

  const renameCategory = (id: string, name: string) => {
    onChange({ categories: categories.map((c) => (c.id === id ? { ...c, name } : c)), items });
  };

  const moveCategory = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const reordered = [...categories];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    onChange({ categories: reordered.map((c, idx) => ({ ...c, order: idx })), items });
  };

  /** Deleting a section keeps its dishes — they move to "General" rather than silently vanishing. */
  const deleteCategory = (id: string) => {
    const remaining = categories.filter((c) => c.id !== id);
    const orphans = items.filter((item) => item.category === id);

    if (orphans.length === 0) {
      onChange({ categories: remaining.map((c, idx) => ({ ...c, order: idx })), items });
      return;
    }

    let general = remaining.find((c) => c.name.trim().toLowerCase() === 'general');
    const nextCategories = [...remaining];
    if (!general) {
      general = { id: `cat_general_${Date.now()}`, name: 'General', description: '', order: nextCategories.length };
      nextCategories.push(general);
    }

    onChange({
      categories: nextCategories.map((c, idx) => ({ ...c, order: idx })),
      items: items.map((item) => (item.category === id ? { ...item, category: general!.id } : item)),
    });
  };

  const countFor = (categoryId: string) => items.filter((item) => item.category === categoryId).length;

  return (
    <div className="space-y-4">
      {/* ── Section strip ── */}
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: OB.inkMuted }}>
          Menu sections ({categories.length})
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5"
              style={{ background: OB.panelRaised, borderColor: OB.goldLineSoft }}
            >
              {editingCategoryId === category.id ? (
                <input
                  autoFocus
                  value={category.name}
                  onChange={(e) => renameCategory(category.id, e.target.value)}
                  onBlur={() => setEditingCategoryId(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingCategoryId(null)}
                  className="w-32 rounded-lg border px-2 py-0.5 text-xs text-[#F6F0E4] focus:outline-none"
                  style={inputStyle}
                  aria-label={`Rename ${category.name}`}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingCategoryId(category.id)}
                  className="cursor-pointer text-xs font-bold"
                  style={{ color: OB.ink }}
                  title="Rename section"
                >
                  {category.name || 'Untitled'}
                </button>
              )}
              <span className="font-mono text-[10px]" style={{ color: OB.inkFaint }}>
                {countFor(category.id)}
              </span>
              <span className="flex items-center">
                <button
                  type="button"
                  onClick={() => moveCategory(index, -1)}
                  disabled={index === 0}
                  className="cursor-pointer p-0.5 disabled:opacity-25"
                  style={{ color: OB.inkMuted }}
                  aria-label={`Move ${category.name} up`}
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => moveCategory(index, 1)}
                  disabled={index === categories.length - 1}
                  className="cursor-pointer p-0.5 disabled:opacity-25"
                  style={{ color: OB.inkMuted }}
                  aria-label={`Move ${category.name} down`}
                >
                  <ChevronDown size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => deleteCategory(category.id)}
                  className="cursor-pointer p-0.5 hover:opacity-80"
                  style={{ color: OB.danger }}
                  aria-label={`Delete ${category.name}`}
                  title="Delete section (its dishes move to General)"
                >
                  <Trash2 size={12} />
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Dish rows ── */}
      <div className="overflow-hidden rounded-2xl border" style={{ borderColor: OB.goldLineSoft, background: OB.canvasDeep }}>
        <div className="max-h-[360px] overflow-y-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 z-10" style={{ background: OB.panelRaised, color: OB.inkMuted }}>
              <tr className="font-mono text-[10px] uppercase tracking-wider">
                <th className="px-2 py-2.5">Veg</th>
                <th className="px-2 py-2.5">Section</th>
                <th className="px-2 py-2.5">Dish name</th>
                <th className="px-2 py-2.5 text-right">Single</th>
                <th className="px-2 py-2.5 text-right">Half</th>
                <th className="px-2 py-2.5 text-right">Full</th>
                <th className="px-2 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id || index} className="border-t" style={{ borderColor: 'rgba(212,175,55,0.08)' }}>
                  <td className="px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() => patchItem(index, { dietType: item.dietType === 'veg' ? 'non-veg' : 'veg' })}
                      className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-sm border"
                      style={{ borderColor: item.dietType === 'veg' ? OB.ok : OB.danger }}
                      title={item.dietType === 'veg' ? 'Vegetarian — click for non-veg' : 'Non-vegetarian — click for veg'}
                      aria-label={`Diet type for ${item.name || 'new dish'}`}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: item.dietType === 'veg' ? OB.ok : OB.danger }}
                      />
                    </button>
                  </td>
                  <td className="px-2 py-1.5">
                    <select
                      value={item.category}
                      onChange={(e) => patchItem(index, { category: e.target.value })}
                      className="max-w-[130px] rounded-lg border px-1.5 py-1 text-[11px] text-[#F6F0E4] focus:outline-none"
                      style={inputStyle}
                      aria-label={`Section for ${item.name || 'new dish'}`}
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      value={item.name}
                      placeholder="Dish name"
                      onChange={(e) => patchItem(index, { name: e.target.value })}
                      className="w-full min-w-[150px] rounded-lg border px-2 py-1 text-[11px] font-semibold text-[#F6F0E4] placeholder:text-[#766A58] focus:outline-none"
                      style={inputStyle}
                      aria-label="Dish name"
                    />
                    {item.description && (
                      <span className="mt-0.5 line-clamp-1 block text-[10px] italic" style={{ color: OB.inkFaint }}>
                        {item.description}
                      </span>
                    )}
                  </td>
                  {(['price', 'halfPrice', 'fullPrice'] as const).map((field) => (
                    <td key={field} className="px-2 py-1.5 text-right">
                      <input
                        inputMode="decimal"
                        value={item[field] ?? ''}
                        placeholder="—"
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9.]/g, '');
                          const parsed = raw === '' ? undefined : Number(raw);
                          patchItem(index, {
                            [field]: field === 'price' ? (parsed ?? 0) : parsed,
                          } as Partial<ParsedMenuItem>);
                        }}
                        className="w-16 rounded-lg border px-1.5 py-1 text-right font-mono text-[11px] text-[#F6F0E4] placeholder:text-[#766A58] focus:outline-none"
                        style={inputStyle}
                        aria-label={`${field} for ${item.name || 'new dish'}`}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1.5 text-right">
                    <button
                      type="button"
                      onClick={() => deleteItem(index)}
                      className="cursor-pointer p-1 hover:opacity-80"
                      style={{ color: OB.danger }}
                      aria-label={`Delete ${item.name || 'dish'}`}
                      title="Delete dish"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={addItem}
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 border-t py-2.5 text-[11px] font-bold transition-colors"
          style={{ borderColor: OB.goldLineSoft, color: OB.gold, background: OB.panelRaised }}
        >
          <Plus size={13} /> Add a dish manually
        </button>
      </div>

      <p className="text-[11px]" style={{ color: OB.inkFaint }}>
        Edit anything here — name, section, prices, veg marker. Leave Half and Full blank for a
        single-price dish. Nothing is saved until the final step.
      </p>
    </div>
  );
}
