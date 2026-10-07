const fs = require('fs');
const path = 'frontend/src/pages/app/Menu.tsx';
let content = fs.readFileSync(path, 'utf8');

const newDishesSection = \
      <section aria-labelledby="items-heading" className="space-y-8">
        <h2 id="items-heading" className="text-xl font-bold tracking-tight text-white">Dishes by Category</h2>
        
        {menu.categories.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-[#151c19] p-8 text-center">
            <UtensilsCrossed className="mx-auto h-8 w-8 text-[#e8783c]/50 mb-3" />
            <p className="text-sm text-[#aab7b2]">You have no categories yet.</p>
          </div>
        )}

        {menu.categories.map(category => (
          <div key={category.id} className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-2">
              <h3 className="text-lg font-semibold text-[#e8783c]">{category.name}</h3>
              <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-[#aab7b2]">
                {category.items?.length || 0} items
              </span>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {category.items?.length === 0 && (
                <p className="text-xs text-[#87958e] italic">No dishes in this category.</p>
              )}
              {category.items?.map((item) => {
                const draft = drafts[item.id] ?? { name: item.name, description: item.description ?? '', price: String(item.price ?? ''), imageUrl: item.image_url ?? '' };
                return (
                  <article key={item.id} className="group relative flex flex-col sm:flex-row gap-5 rounded-xl border border-white/10 bg-[#1c2420] p-5 transition-all hover:border-white/20 hover:bg-[#202925] hover:shadow-lg hover:shadow-black/20">
                    <div className="flex-shrink-0">
                      {draft.imageUrl ? (
                        <img src={draft.imageUrl} alt={draft.name} className="h-24 w-24 rounded-lg object-cover border border-white/10 shadow-sm" />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-white/20 bg-[#151c19]">
                          <UtensilsCrossed size={24} className="text-white/20" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-1 flex-col gap-3">
                      <div className="space-y-2">
                        <input aria-label="\ name" value={draft.name} disabled={!canEditContent} onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: { ...draft, name: event.target.value } }))} className="w-full bg-transparent text-lg font-bold text-white placeholder-white/30 outline-none transition-colors focus:border-b focus:border-[#e8783c] disabled:opacity-60" placeholder="Dish Name" />
                        <textarea aria-label="\ description" value={draft.description} disabled={!canEditContent} onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: { ...draft, description: event.target.value } }))} placeholder="Add a delicious description..." rows={2} className="w-full resize-none bg-transparent text-sm text-[#aab7b2] placeholder-white/20 outline-none transition-colors focus:text-white disabled:opacity-60" />
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-auto pt-2 border-t border-white/5">
                        <div className="relative flex items-center">
                          <span className="absolute left-2.5 text-sm font-medium text-[#87958e]">₹</span>
                          <input type="number" min="0" step="0.01" value={draft.price} disabled={!canEditContent} onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: { ...draft, price: event.target.value } }))} className="w-24 rounded-md border border-white/10 bg-[#151c19] py-1.5 pl-7 pr-2 text-sm font-semibold text-white outline-none transition-colors focus:border-[#e8783c] focus:ring-1 focus:ring-[#e8783c] disabled:opacity-60" />
                        </div>
                        
                        <div className="relative flex-1">
                          <input type="url" value={draft.imageUrl} disabled={!canEditContent} onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: { ...draft, imageUrl: event.target.value } }))} placeholder="Photo URL (https://...)" className="w-full rounded-md border border-white/10 bg-[#151c19] px-3 py-1.5 text-xs text-white outline-none transition-colors focus:border-[#e8783c] disabled:opacity-60" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col items-center justify-between gap-2 border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-4">
                      <button type="button" disabled={!canEditContent || saving} onClick={() => void saveItem(item)} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-40" aria-label="Save changes"><Save size={14} /> Save</button>
                      <button type="button" disabled={!canEditContent || saving} onClick={() => void toggleAvailability(item)} className={\inline-flex w-full items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold transition-colors \\}>{item.is_available ? 'Live' : 'Hidden'}</button>
                      <button type="button" disabled={!canEditContent || saving} onClick={() => void removeItem(item.id)} aria-label="Remove item" className="inline-flex w-full items-center justify-center rounded-lg px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/15 transition-colors disabled:opacity-40"><Trash2 size={16} /></button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-12 rounded-2xl border border-[#e8783c]/20 bg-gradient-to-b from-[#e8783c]/5 to-transparent p-6 shadow-inner">
          <form onSubmit={(event) => void addItem(event)} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="md:col-span-2 lg:col-span-3 mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8783c]/20 text-[#e8783c]">
                <UtensilsCrossed size={16} />
              </div>
              <h3 className="text-lg font-bold text-white">Create New Dish</h3>
            </div>
            
            <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
              <label className="text-xs font-medium text-[#87958e] ml-1">Dish Name</label>
              <input value={itemName} onChange={(event) => setItemName(event.target.value)} disabled={!canAddContent || saving} placeholder="E.g. Truffle Fries" aria-label="Dish name" className="w-full rounded-xl border border-white/10 bg-[#1c2420] px-4 py-3 text-sm text-white shadow-sm outline-none transition-all focus:border-[#e8783c] focus:ring-1 focus:ring-[#e8783c] disabled:opacity-40" />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#87958e] ml-1">Category</label>
              <select value={itemCategory} onChange={(event) => setItemCategory(event.target.value)} disabled={!canAddContent || saving} aria-label="Dish category" className="w-full rounded-xl border border-white/10 bg-[#1c2420] px-4 py-3 text-sm text-white shadow-sm outline-none transition-all focus:border-[#e8783c] focus:ring-1 focus:ring-[#e8783c] disabled:opacity-40">
                <option value="">Select a category</option>
                {menu.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#87958e] ml-1">Price (₹)</label>
              <input type="number" min="0" step="0.01" value={itemPrice} onChange={(event) => setItemPrice(event.target.value)} disabled={!canAddContent || saving} placeholder="0.00" aria-label="Price" className="w-full rounded-xl border border-white/10 bg-[#1c2420] px-4 py-3 text-sm text-white shadow-sm outline-none transition-all focus:border-[#e8783c] focus:ring-1 focus:ring-[#e8783c] disabled:opacity-40" />
            </div>
            
            <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
              <label className="text-xs font-medium text-[#87958e] ml-1">Photo URL</label>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#1c2420] px-4 py-3 shadow-sm transition-all focus-within:border-[#e8783c] focus-within:ring-1 focus-within:ring-[#e8783c]">
                <ImagePlus size={18} className="text-[#87958e]" />
                <input type="url" value={itemImage} onChange={(event) => setItemImage(event.target.value)} disabled={!canAddContent || saving} placeholder="Paste image link here (https://...)" aria-label="Dish photo URL" className="w-full bg-transparent text-sm text-white outline-none disabled:opacity-40" />
              </div>
            </div>
            
            <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
              <label className="text-xs font-medium text-[#87958e] ml-1">Description</label>
              <textarea value={itemDescription} onChange={(event) => setItemDescription(event.target.value)} disabled={!canAddContent || saving} placeholder="What makes this dish special?" rows={2} aria-label="Description" className="w-full resize-none rounded-xl border border-white/10 bg-[#1c2420] px-4 py-3 text-sm text-white shadow-sm outline-none transition-all focus:border-[#e8783c] focus:ring-1 focus:ring-[#e8783c] disabled:opacity-40" />
            </div>
            
            <button disabled={!canAddContent || saving} className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#e8783c] hover:bg-[#d8682c] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-[#e8783c]/20 transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-40 md:col-span-2 lg:col-span-3"><Plus size={18} /> Add Dish to Menu</button>
          </form>
        </div>
      </section>
\;

const oldSectionRegex = /<section aria-labelledby="items-heading" className="space-y-4">[\s\S]*?<\/section>/;

if (oldSectionRegex.test(content)) {
    content = content.replace(oldSectionRegex, newDishesSection);
    fs.writeFileSync(path, content, 'utf8');
} else {
    console.error("Section not found!");
}