const fs = require('fs');
const path = 'frontend/src/pages/customer/MenuPage.tsx';
let content = fs.readFileSync(path, 'utf8');

const renderDishFunc = 
  const renderDish = (item: any) => {
    const itemColor = categoryColors.get(item.category) ?? '#ff761a';
    return (
      <motion.div
        key={item.id}
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.28 }}
        className="menu-dish"
        style={{ '--dish-bg': template.colors.surface, '--dish-ink': template.colors.text, '--dish-accent': template.colors.accent, '--dish-line': template.colors.border, '--category-color': itemColor } as React.CSSProperties}
      >
        <div className="menu-dish-info">
          <h3 className="menu-dish-title">{item.name}</h3>
          {item.description && <p className="menu-dish-description" title={item.description}>{item.description}</p>}
          
          {item.pricingType === 'single' && <button type="button" className="menu-dish-price-btn" onClick={() => addToCart(item, item.price)} disabled={!isPremium}>{item.price}{isPremium && <Plus size={14} style={{ marginLeft: '4px' }} />}</button>}
          {item.pricingType === 'half-full' && (
            <div className="menu-dish-price-variants">
              {item.halfPrice && <button type="button" className="menu-dish-price-btn" onClick={() => addToCart(item, item.halfPrice, 'Half')} disabled={!isPremium}><span className="variant-label">Half</span> {item.halfPrice}{isPremium && <Plus size={14} style={{ marginLeft: '4px' }} />}</button>}
              {item.fullPrice && <button type="button" className="menu-dish-price-btn" onClick={() => addToCart(item, item.fullPrice, 'Full')} disabled={!isPremium}><span className="variant-label">Full</span> {item.fullPrice}{isPremium && <Plus size={14} style={{ marginLeft: '4px' }} />}</button>}
            </div>
          )}
          {item.pricingType === 'sizes' && (
            <div className="menu-dish-price-variants">
              {item.regPrice && <button type="button" className="menu-dish-price-btn" onClick={() => addToCart(item, item.regPrice, 'Reg')} disabled={!isPremium}><span className="variant-label">Reg</span> {item.regPrice}{isPremium && <Plus size={14} style={{ marginLeft: '4px' }} />}</button>}
              {item.medPrice && <button type="button" className="menu-dish-price-btn" onClick={() => addToCart(item, item.medPrice, 'Med')} disabled={!isPremium}><span className="variant-label">Med</span> {item.medPrice}{isPremium && <Plus size={14} style={{ marginLeft: '4px' }} />}</button>}
              {item.largePrice && <button type="button" className="menu-dish-price-btn" onClick={() => addToCart(item, item.largePrice, 'Lrg')} disabled={!isPremium}><span className="variant-label">Lrg</span> {item.largePrice}{isPremium && <Plus size={14} style={{ marginLeft: '4px' }} />}</button>}
            </div>
          )}
        </div>
        <div className="menu-dish-image-container">
          <div className="menu-dish-image-wrap">
            {item.img ? <img
              src={item.img}
              alt={item.name}
              className="menu-dish-image"
              loading="lazy"
            /> : <div className="menu-dish-image-placeholder" aria-hidden="true"><UtensilsCrossed size={32} strokeWidth={1.5} /></div>}
          </div>
        </div>
      </motion.div>
    );
  };
;

const oldDishesSectionRegex = /<section className="menu-dishes" aria-label="Menu dishes">[\s\S]*?<\/section>/;

const newDishesSection = \
        <section className="menu-dishes-container" aria-label="Menu dishes">
          <AnimatePresence mode="popLayout">
            {activeCategory === 'All' ? (
              categories.slice(1).map(cat => {
                const groupItems = filteredItems.filter(i => i.category === cat);
                if (groupItems.length === 0) return null;
                return (
                  <div key={cat} className="menu-category-group">
                    <h2 className="menu-category-title">{cat}</h2>
                    <div className="menu-dishes-grid">
                      {groupItems.map(item => renderDish(item))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="menu-dishes-grid">
                {filteredItems.map(item => renderDish(item))}
              </div>
            )}
            {filteredItems.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="menu-empty-state"
              >
                <Search size={32} />
                <p>No dishes found matching your criteria</p>
                <button type="button" onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} className="menu-dish-price-btn" style={{ padding: '8px 16px' }}>Clear search</button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
\;

content = content.replace(oldDishesSectionRegex, newDishesSection);
content = content.replace('if (loadError === \\'SUBSCRIPTION_EXPIRED\\')', renderDishFunc + '\\n\\n  if (loadError === \\'SUBSCRIPTION_EXPIRED\\')');

fs.writeFileSync(path, content, 'utf8');