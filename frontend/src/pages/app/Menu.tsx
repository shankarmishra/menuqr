import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ImagePlus, Plus, Search, CheckCircle2, XCircle, Trash2, Edit2, UtensilsCrossed, AlertCircle, X, Loader2, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { usePlan } from '../../lib/usePlan';
import { useToast } from '../../components/feedback/ToastProvider';
import {
  createMenuCategory,
  createMenuItem,
  deleteMenuCategory,
  deleteMenuItem,
  getMenu,
  setMenuItemAvailability,
  updateMenuCategory,
  updateMenuItem,
  type AppMenuData,
  type AppMenuItem,
} from './appStore';

type SortOption = 'recent' | 'az' | 'za' | 'price_asc' | 'price_desc';
type StatusFilter = 'all' | 'live' | 'hidden';
type DietFilter = 'all' | 'veg' | 'non-veg';

export default function Menu() {
  const [menu, setMenu] = useState<AppMenuData | null>(null);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [saving, setSaving] = useState(false);
  const { sub, loading, isEditLimitReached, contentChangesRemaining, contentChangesLimit, can, refresh } = usePlan();
  const showToast = useToast();
  const canAddContent = can('one_time_edit') || can('add_item');
  const canEditContent = can('one_time_edit') || can('edit_item');
  const planId = sub?.planId?.toUpperCase() ?? 'BASIC';

  // Filters and Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dietFilter, setDietFilter] = useState<DietFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('recent');

  // Modals / Drawers State
  const [isItemDrawerOpen, setIsItemDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AppMenuItem | null>(null);
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{id: string; name: string} | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{type: 'item'|'category', id: string, name: string} | null>(null);

  // Form States (Item)
  const [itemForm, setItemForm] = useState({ name: '', description: '', price: '', imageUrl: '', categoryId: '', dietType: 'veg', isAvailable: true });
  // Form States (Category)
  const [categoryForm, setCategoryForm] = useState({ name: '' });

  async function loadMenu() {
    try {
      const data = await getMenu();
      setMenu(data);
    } catch {
      showToast('error', 'Could not load your menu.');
    } finally {
      setLoadingMenu(false);
    }
  }

  useEffect(() => { void loadMenu(); }, []);

  async function runMutation(action: () => Promise<unknown>, successMessage: string) {
    setSaving(true);
    try {
      await action();
      await loadMenu();
      await refresh();
      showToast('success', successMessage);
      return true;
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Could not save change.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  // Derived Stats
  const stats = useMemo(() => {
    if (!menu) return { total: 0, categories: 0, live: 0, hidden: 0 };
    let total = 0, live = 0, hidden = 0;
    menu.categories.forEach(c => {
      c.items.forEach(i => {
        total++;
        if (i.is_available) live++; else hidden++;
      });
    });
    return { total, categories: menu.categories.length, live, hidden };
  }, [menu]);

  // Filtered & Sorted Data
  const filteredCategories = useMemo(() => {
    if (!menu) return [];
    
    let cats = menu.categories.map(c => ({
      ...c,
      items: c.items.filter(item => {
        const matchesSearch = !searchQuery || 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || (statusFilter === 'live' ? item.is_available : !item.is_available);
        const matchesDiet = dietFilter === 'all' || (item.diet_type?.toLowerCase() === dietFilter);
        return matchesSearch && matchesStatus && matchesDiet;
      })
    }));

    if (categoryFilter !== 'all') {
      cats = cats.filter(c => c.id === categoryFilter);
    }

    cats = cats.map(c => {
      const sortedItems = [...c.items].sort((a, b) => {
        if (sortOption === 'az') return a.name.localeCompare(b.name);
        if (sortOption === 'za') return b.name.localeCompare(a.name);
        if (sortOption === 'price_asc') return Number(a.price || 0) - Number(b.price || 0);
        if (sortOption === 'price_desc') return Number(b.price || 0) - Number(a.price || 0);
        return 0; // recent (default, assume db order)
      });
      return { ...c, items: sortedItems };
    });

    return cats;
  }, [menu, searchQuery, categoryFilter, statusFilter, dietFilter, sortOption]);

  // Handlers
  const openItemDrawer = (item?: AppMenuItem, defaultCategory?: string) => {
    if (!canEditContent && item) {
      showToast('error', 'Edit limit reached.');
      return;
    }
    if (!canAddContent && !item) {
      showToast('error', 'Add limit reached.');
      return;
    }

    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        description: item.description || '',
        price: String(item.price || ''),
        imageUrl: item.image_url || '',
        categoryId: item.category_id,
        dietType: item.diet_type || 'veg',
        isAvailable: item.is_available ?? true
      });
    } else {
      setEditingItem(null);
      setItemForm({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        categoryId: defaultCategory || menu?.categories[0]?.id || '',
        dietType: 'veg',
        isAvailable: true
      });
    }
    setIsItemDrawerOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menu?.menu) return;
    if (!itemForm.name.trim() || !itemForm.price || !itemForm.categoryId) {
      showToast('info', 'Please fill in name, price, and category.');
      return;
    }

    const payload = {
      categoryId: itemForm.categoryId,
      name: itemForm.name.trim(),
      description: itemForm.description,
      price: Number(itemForm.price),
      imageUrl: itemForm.imageUrl,
      dietType: itemForm.dietType,
      isAvailable: itemForm.isAvailable,
    };

    let success = false;
    if (editingItem) {
      success = await runMutation(() => updateMenuItem(editingItem.id, payload), 'Menu item updated.');
    } else {
      success = await runMutation(() => createMenuItem({ menuId: menu.menu!.id, ...payload }), 'Menu item created.');
    }

    if (success) setIsItemDrawerOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    let success = false;
    if (deleteConfirm.type === 'item') {
      success = await runMutation(() => deleteMenuItem(deleteConfirm.id), 'Menu item removed.');
    } else {
      success = await runMutation(() => deleteMenuCategory(deleteConfirm.id), 'Category removed.');
    }
    if (success) setDeleteConfirm(null);
  };

  const handleToggleAvailability = async (item: AppMenuItem) => {
    if (!canEditContent) {
       showToast('error', 'Edit limit reached. Please upgrade.');
       return;
    }
    await runMutation(() => setMenuItemAvailability(item.id, !item.is_available), item.is_available ? 'Item hidden for today.' : 'Item is live.');
  };

  const openCategoryModal = (cat?: {id: string, name: string}) => {
    if (!canEditContent && cat) return showToast('error', 'Edit limit reached.');
    if (!canAddContent && !cat) return showToast('error', 'Add limit reached.');
    
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({ name: cat.name });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '' });
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menu?.menu || !categoryForm.name.trim()) return;

    let success = false;
    if (editingCategory) {
      success = await runMutation(() => updateMenuCategory(editingCategory.id, { name: categoryForm.name.trim() }), 'Category updated.');
    } else {
      success = await runMutation(() => createMenuCategory({ menuId: menu.menu!.id, name: categoryForm.name.trim() }), 'Category created.');
    }
    if (success) setIsCategoryModalOpen(false);
  };

  if (loading || loadingMenu) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-[#e8783c] animate-spin" />
    </div>
  );

  if (!menu?.menu) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 bg-[#e8783c]/10 rounded-full flex items-center justify-center mb-6">
          <UtensilsCrossed className="w-8 h-8 text-[#e8783c]" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Your menu is ready to be built</h1>
        <p className="text-[#aab7b2] mb-8">Add your first category and dishes, then publish your menu to your permanent QR.</p>
        <Link to="/onboarding" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#e8783c] hover:bg-[#d4652a] px-6 py-3 text-sm font-bold text-white transition-colors">
          Create First Category
        </Link>
      </div>
    );
  }

  // Calculate usage %
  const isUnlimited = planId === 'PREMIUM';
  const usagePercentage = !isUnlimited && contentChangesLimit ? Math.min(100, Math.round(((contentChangesLimit - (contentChangesRemaining || 0)) / contentChangesLimit) * 100)) : 0;
  const usedEdits = contentChangesLimit ? contentChangesLimit - (contentChangesRemaining || 0) : 0;

  return (
    <div className="pb-24 max-w-[1400px] mx-auto px-4 md:px-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-6 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Menu Management</h1>
          <p className="text-xs sm:text-sm text-[#aab7b2] mt-1">Manage your menu content, availability and presentation.</p>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/m/${menu.menu.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs sm:text-sm font-semibold text-white transition-colors">
            Preview <ExternalLink size={14} className="text-[#aab7b2]" />
          </a>
          <button onClick={() => openItemDrawer()} disabled={!canAddContent} className="inline-flex items-center gap-2 rounded-lg bg-[#e8783c] hover:bg-[#d4652a] px-3 py-2 text-xs sm:text-sm font-semibold text-white transition-colors disabled:opacity-50">
            <Plus size={14} /> Add Item
          </button>
        </div>
      </header>

      {/* Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
        <div className="bg-[#151c19] rounded-xl p-4 border border-white/5 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-[#87958e] uppercase tracking-wider mb-1">Total Items</span>
          <span className="text-xl sm:text-2xl font-bold text-white">{stats.total}</span>
        </div>
        <div className="bg-[#151c19] rounded-xl p-4 border border-white/5 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-[#87958e] uppercase tracking-wider mb-1">Categories</span>
          <span className="text-xl sm:text-2xl font-bold text-white">{stats.categories}</span>
        </div>
        <div className="bg-[#151c19] rounded-xl p-4 border border-white/5 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-[#87958e] uppercase tracking-wider mb-1">Live Today</span>
          <span className="text-xl sm:text-2xl font-bold text-emerald-400">{stats.live}</span>
        </div>
        <div className="bg-[#151c19] rounded-xl p-4 border border-white/5 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-[#87958e] uppercase tracking-wider mb-1">Hidden</span>
          <span className="text-xl sm:text-2xl font-bold text-rose-400">{stats.hidden}</span>
        </div>
        <div className={`col-span-2 sm:col-span-4 lg:col-span-1 rounded-xl p-4 border shadow-sm flex flex-col justify-between ${isEditLimitReached && !isUnlimited ? 'bg-rose-500/10 border-rose-500/20' : 'bg-[#151c19] border-white/5'}`}>
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] sm:text-xs font-semibold text-[#87958e] uppercase tracking-wider">Edit Usage</span>
            <span className="text-[10px] font-bold text-white px-1.5 py-0.5 bg-white/10 rounded">{planId}</span>
          </div>
          {isUnlimited ? (
            <span className="text-base sm:text-lg font-bold text-[#e8783c] mt-auto">UNLIMITED</span>
          ) : (
            <div className="mt-auto">
              <div className="flex justify-between items-end mb-1">
                <span className="text-base sm:text-lg font-bold text-white">{usedEdits} <span className="text-xs text-[#87958e]">/ {contentChangesLimit}</span></span>
                <span className="text-[10px] text-[#aab7b2]">{contentChangesRemaining} left</span>
              </div>
              <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${isEditLimitReached ? 'bg-rose-500' : 'bg-[#e8783c]'}`} style={{ width: `${usagePercentage}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {isEditLimitReached && !isUnlimited && (
        <div className="mb-8 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-rose-400 shrink-0" size={20} />
            <div>
              <h4 className="text-sm font-bold text-white">Menu change limit reached</h4>
              <p className="text-xs text-rose-200/70 mt-0.5">You've used all {contentChangesLimit} changes in your {planId} plan. Upgrade to continue editing.</p>
            </div>
          </div>
          <Link to="/app/subscription" className="shrink-0 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 px-4 py-2 text-sm font-bold text-rose-200 transition-colors">
            View Plans
          </Link>
        </div>
      )}

      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-[#0a100d]/90 backdrop-blur-md py-3 sm:py-4 mb-4 sm:mb-6 border-b border-white/5 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#87958e]" size={18} />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dishes or description..."
            className="w-full bg-[#151c19] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-[#87958e] focus:outline-none focus:border-[#e8783c] transition-colors"
          />
        </div>
        <div className="flex overflow-x-auto pb-1 -mb-1 md:pb-0 md:mb-0 md:flex-nowrap gap-2" style={{scrollbarWidth: 'none'}}>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-[#151c19] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#e8783c] appearance-none cursor-pointer whitespace-nowrap min-w-max">
            <option value="all">All Categories</option>
            {menu.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className="bg-[#151c19] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#e8783c] appearance-none cursor-pointer whitespace-nowrap min-w-max">
            <option value="all">All Status</option>
            <option value="live">Live Only</option>
            <option value="hidden">Hidden Only</option>
          </select>
          <select value={dietFilter} onChange={(e) => setDietFilter(e.target.value as DietFilter)} className="bg-[#151c19] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#e8783c] appearance-none cursor-pointer whitespace-nowrap min-w-max">
            <option value="all">All Food Types</option>
            <option value="veg">Veg</option>
            <option value="non-veg">Non-Veg</option>
          </select>
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value as SortOption)} className="bg-[#151c19] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#e8783c] appearance-none cursor-pointer whitespace-nowrap min-w-max">
            <option value="recent">Sort: Custom</option>
            <option value="az">Name: A-Z</option>
            <option value="za">Name: Z-A</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
          <button onClick={() => openCategoryModal()} disabled={!canAddContent} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50 whitespace-nowrap min-w-max">
            <Plus size={14} /> Category
          </button>
        </div>
      </div>

      {/* Menu List */}
      <div className="space-y-8 sm:space-y-12">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">No dishes found</h3>
            <p className="text-sm text-[#aab7b2]">Try adjusting your search or filters.</p>
          </div>
        ) : (
          filteredCategories.map(category => (
            <section key={category.id} className="space-y-4">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white uppercase tracking-wider">{category.name}</h2>
                  <span className="text-xs font-semibold text-[#87958e] px-2 py-1 bg-white/5 rounded-md">{category.items.length} items</span>
                </div>
                <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openItemDrawer(undefined, category.id)} disabled={!canAddContent} className="p-1.5 text-[#aab7b2] hover:text-white hover:bg-white/10 rounded-md transition-colors disabled:opacity-50" title="Add item to category"><Plus size={16}/></button>
                  <button onClick={() => openCategoryModal(category)} disabled={!canEditContent} className="p-1.5 text-[#aab7b2] hover:text-white hover:bg-white/10 rounded-md transition-colors disabled:opacity-50" title="Edit category"><Edit2 size={16}/></button>
                  <button onClick={() => setDeleteConfirm({type: 'category', id: category.id, name: category.name})} disabled={!canEditContent} className="p-1.5 text-[#aab7b2] hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors disabled:opacity-50" title="Delete category"><Trash2 size={16}/></button>
                </div>
              </div>
              
              {category.items.length === 0 ? (
                <div className="border border-dashed border-white/10 rounded-xl p-8 text-center bg-white/[0.02]">
                  <p className="text-sm text-[#87958e]">No dishes in this category.</p>
                  <button onClick={() => openItemDrawer(undefined, category.id)} disabled={!canAddContent} className="mt-3 text-sm font-semibold text-[#e8783c] hover:text-[#d4652a] disabled:opacity-50">Add the first item</button>
                </div>
              ) : (
                <div className="bg-[#151c19]/50 border border-white/10 rounded-xl overflow-hidden shadow-sm">
                  {/* Desktop Table Header */}
                  <div className="hidden md:grid grid-cols-[minmax(200px,2fr)_1fr_120px_140px] gap-4 px-6 py-3 border-b border-white/5 bg-white/[0.02] text-xs uppercase font-bold tracking-wider text-[#87958e]">
                    <div>Item</div>
                    <div>Price</div>
                    <div>Status</div>
                    <div className="text-right">Actions</div>
                  </div>
                  
                  <div className="divide-y divide-white/5">
                    {category.items.map(item => (
                      <div key={item.id} className="group flex flex-col md:grid md:grid-cols-[minmax(200px,2fr)_1fr_120px_140px] gap-0 md:gap-4 px-3 py-3 md:px-6 items-start md:items-center hover:bg-white/[0.03] transition-colors">
                        {/* Mobile & Desktop: Item Info */}
                        <div className="flex gap-3 w-full items-start">
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg bg-black/40 border border-white/5 overflow-hidden shrink-0 relative mt-1 md:mt-0">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" onError={e => e.currentTarget.style.display = 'none'} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/20"><UtensilsCrossed size={16}/></div>
                            )}
                            {item.diet_type === 'veg' && <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white/50"></div>}
                            {item.diet_type === 'non-veg' && <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-rose-500 ring-1 ring-white/50"></div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="text-sm md:text-base font-bold text-white truncate">{item.name}</h3>
                              {/* Mobile Price */}
                              <span className="md:hidden font-bold text-white text-sm shrink-0">₹{item.price || '-'}</span>
                            </div>
                            <p className="text-xs text-[#87958e] mt-0.5 line-clamp-1 md:line-clamp-2">{item.description || 'No description'}</p>
                            
                            {/* Mobile Status & Actions (Inline to save height) */}
                            <div className="flex md:hidden items-center justify-between mt-2 pt-2 border-t border-white/5">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${item.is_available ? 'text-emerald-400' : 'text-rose-400'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${item.is_available ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                                {item.is_available ? 'Live' : 'Hidden'}
                              </span>
                              <div className="flex items-center gap-0.5">
                                <button onClick={() => handleToggleAvailability(item)} disabled={saving || !canEditContent} className="p-1.5 text-[#aab7b2] active:bg-white/10 rounded-md" title={item.is_available ? 'Hide for today' : 'Unhide item'}>
                                  {item.is_available ? <EyeOff size={16}/> : <Eye size={16}/>}
                                </button>
                                <button onClick={() => openItemDrawer(item)} disabled={!canEditContent} className="p-1.5 text-[#aab7b2] active:bg-white/10 rounded-md" title="Edit item">
                                  <Edit2 size={16}/>
                                </button>
                                <button onClick={() => setDeleteConfirm({type: 'item', id: item.id, name: item.name})} disabled={!canEditContent} className="p-1.5 text-rose-400 active:bg-rose-500/10 rounded-md" title="Delete item">
                                  <Trash2 size={16}/>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Desktop Price */}
                        <div className="hidden md:block font-medium text-sm text-white/90">
                          <span>₹{item.price || '-'}</span>
                        </div>

                        {/* Desktop Status */}
                        <div className="hidden md:flex items-center justify-start gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.is_available ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${item.is_available ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                            {item.is_available ? 'Live' : 'Hidden'}
                          </span>
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleToggleAvailability(item)} disabled={saving || !canEditContent} className="p-2 text-[#aab7b2] hover:text-white hover:bg-white/10 rounded-md transition-colors disabled:opacity-50" title={item.is_available ? 'Hide for today' : 'Unhide item'}>
                            {item.is_available ? <EyeOff size={16}/> : <Eye size={16}/>}
                          </button>
                          <button onClick={() => openItemDrawer(item)} disabled={!canEditContent} className="p-2 text-[#aab7b2] hover:text-white hover:bg-white/10 rounded-md transition-colors disabled:opacity-50" title="Edit item">
                            <Edit2 size={16}/>
                          </button>
                          <button onClick={() => setDeleteConfirm({type: 'item', id: item.id, name: item.name})} disabled={!canEditContent} className="p-2 text-[#aab7b2] hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors disabled:opacity-50" title="Delete item">
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ))
        )}
      </div>

      {/* Item Drawer */}
      {isItemDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !saving && setIsItemDrawerOpen(false)} />
          <div className="relative w-full max-w-md bg-[#0a100d] border-l border-white/10 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
              <button onClick={() => !saving && setIsItemDrawerOpen(false)} className="p-2 text-[#87958e] hover:text-white rounded-full hover:bg-white/5 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveItem} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Image Upload/URL Preview */}
              <div className="space-y-3">
                <label className="block text-xs uppercase font-bold tracking-wider text-[#87958e]">Item Photo URL</label>
                <div className="flex gap-4 items-start">
                  <div className="w-20 h-20 rounded-xl bg-[#151c19] border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                    {itemForm.imageUrl ? (
                      <img src={itemForm.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={e => e.currentTarget.style.display = 'none'} />
                    ) : (
                      <ImagePlus size={24} className="text-[#87958e]/50" />
                    )}
                  </div>
                  <input type="url" value={itemForm.imageUrl} onChange={e => setItemForm({...itemForm, imageUrl: e.target.value})} placeholder="https://..." className="flex-1 mt-2 bg-[#151c19] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c] transition-colors" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="block text-xs uppercase font-bold tracking-wider text-[#87958e] mb-2">Dish Name *</span>
                  <input required value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} className="w-full bg-[#151c19] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c] transition-colors" />
                </label>
                
                <label className="block">
                  <span className="block text-xs uppercase font-bold tracking-wider text-[#87958e] mb-2">Description</span>
                  <textarea rows={3} value={itemForm.description} onChange={e => setItemForm({...itemForm, description: e.target.value})} className="w-full bg-[#151c19] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c] transition-colors resize-none" />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="block text-xs uppercase font-bold tracking-wider text-[#87958e] mb-2">Price *</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">$</span>
                      <input required type="number" min="0" step="0.01" value={itemForm.price} onChange={e => setItemForm({...itemForm, price: e.target.value})} className="w-full bg-[#151c19] border border-white/10 rounded-lg pl-7 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c] transition-colors" />
                    </div>
                  </label>
                  
                  <label className="block">
                    <span className="block text-xs uppercase font-bold tracking-wider text-[#87958e] mb-2">Category *</span>
                    <select required value={itemForm.categoryId} onChange={e => setItemForm({...itemForm, categoryId: e.target.value})} className="w-full bg-[#151c19] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c] appearance-none cursor-pointer">
                      <option value="" disabled>Select...</option>
                      {menu?.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <span className="block text-xs uppercase font-bold tracking-wider text-[#87958e]">Food Type</span>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setItemForm({...itemForm, dietType: 'veg'})} className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${itemForm.dietType === 'veg' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[#151c19] border-white/10 text-[#87958e] hover:border-white/20'}`}>
                        <div className={`w-2 h-2 rounded-full ${itemForm.dietType === 'veg' ? 'bg-emerald-400' : 'bg-[#87958e]'}`}></div> Veg
                      </button>
                      <button type="button" onClick={() => setItemForm({...itemForm, dietType: 'non-veg'})} className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${itemForm.dietType === 'non-veg' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-[#151c19] border-white/10 text-[#87958e] hover:border-white/20'}`}>
                        <div className={`w-2 h-2 rounded-full ${itemForm.dietType === 'non-veg' ? 'bg-rose-400' : 'bg-[#87958e]'}`}></div> Non-Veg
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="block text-xs uppercase font-bold tracking-wider text-[#87958e]">Availability</span>
                    <button type="button" onClick={() => setItemForm({...itemForm, isAvailable: !itemForm.isAvailable})} className={`w-full py-2 rounded-lg border text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${itemForm.isAvailable ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[#151c19] border-white/10 text-[#87958e]'}`}>
                      {itemForm.isAvailable ? <><CheckCircle2 size={16} /> Available</> : <><XCircle size={16}/> Hidden Today</>}
                    </button>
                  </div>
                </div>
              </div>
            </form>
            
            <div className="p-6 border-t border-white/10 bg-[#0a100d] flex gap-3">
              <button type="button" onClick={() => setIsItemDrawerOpen(false)} disabled={saving} className="flex-1 py-3 px-4 rounded-lg font-bold text-sm text-white bg-white/5 hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveItem} disabled={saving} className="flex-[2] py-3 px-4 rounded-lg font-bold text-sm text-white bg-[#e8783c] hover:bg-[#d4652a] transition-colors flex justify-center items-center gap-2">
                {saving ? <Loader2 size={18} className="animate-spin" /> : 'Save Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !saving && setIsCategoryModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-[#151c19] border border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 className="text-lg font-bold text-white mb-4">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
              <form onSubmit={handleSaveCategory}>
                <label className="block mb-6">
                  <span className="block text-xs uppercase font-bold tracking-wider text-[#87958e] mb-2">Category Name</span>
                  <input autoFocus required value={categoryForm.name} onChange={e => setCategoryForm({name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c] transition-colors" />
                </label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsCategoryModalOpen(false)} disabled={saving} className="flex-1 py-2.5 rounded-lg font-bold text-sm text-white bg-white/5 hover:bg-white/10 transition-colors">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg font-bold text-sm text-white bg-[#e8783c] hover:bg-[#d4652a] transition-colors flex justify-center items-center">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !saving && setDeleteConfirm(null)} />
          <div className="relative w-full max-w-sm bg-[#151c19] border border-rose-500/20 rounded-2xl shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Delete {deleteConfirm.type === 'item' ? 'Item' : 'Category'}?</h2>
            <p className="text-sm text-[#87958e] mb-6">
              Are you sure you want to remove <strong>{deleteConfirm.name}</strong>?<br/>
              {deleteConfirm.type === 'category' ? 'This will permanently delete the category AND all items inside it.' : 'This will permanently remove this item from your menu.'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} disabled={saving} className="flex-1 py-2.5 rounded-lg font-bold text-sm text-white bg-white/5 hover:bg-white/10 transition-colors">Cancel</button>
              <button onClick={handleDeleteConfirm} disabled={saving} className="flex-1 py-2.5 rounded-lg font-bold text-sm text-white bg-rose-500 hover:bg-rose-600 transition-colors flex justify-center items-center">
                {saving ? <Loader2 size={16} className="animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}