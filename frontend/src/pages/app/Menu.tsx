import { useEffect, useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  UtensilsCrossed,
  X,
  Loader2,
  ExternalLink,
  Eye,
  EyeOff,
  Copy,
  Layers,
  UploadCloud,
  FileSpreadsheet
} from 'lucide-react';
import { usePlan } from '../../lib/usePlan';
import { useToast } from '../../components/feedback/ToastProvider';
import { compressImageBeforeUpload } from '../../utils/imageCompressor';
import {
  createMenuCategory,
  createMenuItem,
  deleteMenuCategory,
  deleteMenuItem,
  duplicateMenuItem,
  bulkUpdateMenuItems,
  publishMenu,
  getMenu,
  setMenuItemAvailability,
  updateMenuCategory,
  updateMenuItem,
  type AppMenuData,
  type AppMenuItem,
  type AppVariant,
  type AppAddonGroup
} from './appStore';
import { SmartImportWizard } from '../../components/menu-builder/SmartImportWizard';

type SortOption = 'recent' | 'az' | 'za' | 'price_asc' | 'price_desc';
type StatusFilter = 'all' | 'live' | 'hidden';
type DietFilter = 'all' | 'veg' | 'non-veg';
type PricingFilter = 'all' | 'single' | 'variants';

export default function Menu() {
  const [menuData, setMenuData] = useState<AppMenuData | null>(null);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [saving, setSaving] = useState(false);
  const { loading, can, refresh } = usePlan();
  const showToast = useToast();
  const canAddContent = can('one_time_edit') || can('add_item');
  const canEditContent = can('one_time_edit') || can('edit_item');

  // Filters and Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dietFilter, setDietFilter] = useState<DietFilter>('all');
  const [pricingFilter, setPricingFilter] = useState<PricingFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('recent');

  // Modals & Drawers State
  const [isImportWizardOpen, setIsImportWizardOpen] = useState(false);
  const [isItemDrawerOpen, setIsItemDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AppMenuItem | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleDishImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const compressed = await compressImageBeforeUpload(file, 1000, 0.78);
      const res = await fetch('/api/app/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ image: compressed.dataUrl, category: 'dishes' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setItemForm(prev => ({ ...prev, imageUrl: data.url }));
      showToast('success', `Photo compressed (-${compressed.reductionPercentage}%) and attached!`);
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to upload photo.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };


  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string; description?: string } | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'item' | 'category' | 'bulk'; id?: string; name?: string } | null>(null);

  // Bulk Operations State
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isBulkCategoryModalOpen, setIsBulkCategoryModalOpen] = useState(false);
  const [bulkTargetCategory, setBulkTargetCategory] = useState('');

  const [isBulkPriceModalOpen, setIsBulkPriceModalOpen] = useState(false);
  const [priceAdjustType, setPriceAdjustType] = useState<'flat' | 'percentage'>('flat');
  const [priceAdjustValue, setPriceAdjustValue] = useState<string>('');

  // Form States (Item)
  const [itemForm, setItemForm] = useState<{
    name: string;
    description: string;
    price: string;
    imageUrl: string;
    categoryId: string;
    dietType: string;
    isAvailable: boolean;
    pricingType: 'single' | 'variants';
    variants: AppVariant[];
    addonGroups: AppAddonGroup[];
  }>({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    categoryId: '',
    dietType: 'veg',
    isAvailable: true,
    pricingType: 'single',
    variants: [],
    addonGroups: []
  });

  // Form States (Category)
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

  async function loadMenuData() {
    try {
      const data = await getMenu();
      setMenuData(data);
    } catch {
      showToast('error', 'Could not load your restaurant menu.');
    } finally {
      setLoadingMenu(false);
    }
  }

  useEffect(() => { void loadMenuData(); }, []);

  async function runMutation(action: () => Promise<unknown>, successMessage: string) {
    setSaving(true);
    try {
      await action();
      await loadMenuData();
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
    if (!menuData) return { total: 0, categories: 0, live: 0, hidden: 0, variantItems: 0 };
    let total = 0, live = 0, hidden = 0, variantItems = 0;
    menuData.categories.forEach(c => {
      c.items.forEach(i => {
        total++;
        if (i.is_available) live++; else hidden++;
        if (i.pricing_type === 'variants' || (i.variants && i.variants.length > 0)) variantItems++;
      });
    });
    return { total, categories: menuData.categories.length, live, hidden, variantItems };
  }, [menuData]);

  // All menu items flattened for selection & filtering
  const allItems = useMemo(() => {
    if (!menuData) return [];
    return menuData.categories.flatMap(c => c.items);
  }, [menuData]);

  // Filtered & Sorted Data
  const filteredCategories = useMemo(() => {
    if (!menuData) return [];

    let cats = menuData.categories.map(c => ({
      ...c,
      items: c.items.filter(item => {
        const matchesSearch = !searchQuery ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || (statusFilter === 'live' ? item.is_available : !item.is_available);
        const matchesDiet = dietFilter === 'all' || (item.diet_type?.toLowerCase() === dietFilter);
        const hasVar = item.pricing_type === 'variants' || (item.variants && item.variants.length > 0);
        const matchesPricing = pricingFilter === 'all' || (pricingFilter === 'variants' ? hasVar : !hasVar);
        return matchesSearch && matchesStatus && matchesDiet && matchesPricing;
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
        return 0; // recent (default)
      });
      return { ...c, items: sortedItems };
    });

    return cats;
  }, [menuData, searchQuery, categoryFilter, statusFilter, dietFilter, pricingFilter, sortOption]);

  // Handlers
  const handleTogglePublish = async () => {
    if (!menuData?.menu) return;
    const currentStatus = menuData.menu.status || 'PUBLISHED';
    const nextStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    await runMutation(
      () => publishMenu(nextStatus),
      nextStatus === 'PUBLISHED' ? 'Menu published to live QR code!' : 'Menu changed to Draft mode.'
    );
  };

  const openItemDrawer = (item?: AppMenuItem, defaultCategory?: string) => {
    if (!canEditContent && item) {
      showToast('error', 'Edit limit reached. Upgrade your plan.');
      return;
    }
    if (!canAddContent && !item) {
      showToast('error', 'Add limit reached. Upgrade your plan.');
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
        isAvailable: item.is_available ?? true,
        pricingType: item.pricing_type || (item.variants && item.variants.length > 0 ? 'variants' : 'single'),
        variants: item.variants || [],
        addonGroups: item.addon_groups || []
      });
    } else {
      setEditingItem(null);
      setItemForm({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        categoryId: defaultCategory || menuData?.categories[0]?.id || '',
        dietType: 'veg',
        isAvailable: true,
        pricingType: 'single',
        variants: [
          { name: 'Half', price: 0 },
          { name: 'Full', price: 0 }
        ],
        addonGroups: []
      });
    }
    setIsItemDrawerOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuData?.menu) return;
    if (!itemForm.name.trim() || !itemForm.categoryId) {
      showToast('info', 'Please fill in item name and category.');
      return;
    }

    const basePrice = itemForm.pricingType === 'single' ? Number(itemForm.price || 0) : 0;

    const payload = {
      categoryId: itemForm.categoryId,
      name: itemForm.name.trim(),
      description: itemForm.description,
      price: basePrice,
      imageUrl: itemForm.imageUrl,
      dietType: itemForm.dietType,
      isAvailable: itemForm.isAvailable,
      pricingType: itemForm.pricingType,
      variants: itemForm.pricingType === 'variants' ? itemForm.variants : [],
      addonGroups: itemForm.addonGroups
    };

    let success = false;
    if (editingItem) {
      success = await runMutation(() => updateMenuItem(editingItem.id, payload), 'Menu item updated.');
    } else {
      success = await runMutation(() => createMenuItem({ menuId: menuData.menu!.id, ...payload }), 'Menu item created.');
    }

    if (success) setIsItemDrawerOpen(false);
  };

  const handleDuplicateItem = async (item: AppMenuItem) => {
    await runMutation(() => duplicateMenuItem(item.id), `Duplicated "${item.name}".`);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    let success = false;
    if (deleteConfirm.type === 'item' && deleteConfirm.id) {
      success = await runMutation(() => deleteMenuItem(deleteConfirm.id!), 'Menu item deleted.');
    } else if (deleteConfirm.type === 'category' && deleteConfirm.id) {
      success = await runMutation(() => deleteMenuCategory(deleteConfirm.id!), 'Category deleted.');
    } else if (deleteConfirm.type === 'bulk') {
      success = await runMutation(
        () => bulkUpdateMenuItems(selectedItemIds, 'delete'),
        `${selectedItemIds.length} items deleted.`
      );
      if (success) setSelectedItemIds([]);
    }
    if (success) setDeleteConfirm(null);
  };

  const handleToggleAvailability = async (item: AppMenuItem) => {
    await runMutation(
      () => setMenuItemAvailability(item.id, !item.is_available),
      item.is_available ? 'Item hidden.' : 'Item is live.'
    );
  };

  // Bulk Handlers
  const toggleSelectItem = (id: string) => {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAllItems = () => {
    if (selectedItemIds.length === allItems.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(allItems.map(i => i.id));
    }
  };

  const handleBulkCategorySave = async () => {
    if (!bulkTargetCategory || selectedItemIds.length === 0) return;
    const success = await runMutation(
      () => bulkUpdateMenuItems(selectedItemIds, 'change_category', { categoryId: bulkTargetCategory }),
      `Moved ${selectedItemIds.length} items.`
    );
    if (success) {
      setIsBulkCategoryModalOpen(false);
      setSelectedItemIds([]);
    }
  };

  const handleBulkAvailabilitySave = async (isAvailable: boolean) => {
    if (selectedItemIds.length === 0) return;
    const success = await runMutation(
      () => bulkUpdateMenuItems(selectedItemIds, 'change_availability', { isAvailable }),
      `Updated ${selectedItemIds.length} items availability.`
    );
    if (success) setSelectedItemIds([]);
  };

  const handleBulkPriceSave = async () => {
    const val = Number(priceAdjustValue);
    if (!Number.isFinite(val) || selectedItemIds.length === 0) {
      showToast('error', 'Enter a valid adjustment value.');
      return;
    }
    const success = await runMutation(
      () => bulkUpdateMenuItems(selectedItemIds, 'adjust_price', { type: priceAdjustType, value: val }),
      `Adjusted prices for ${selectedItemIds.length} items.`
    );
    if (success) {
      setIsBulkPriceModalOpen(false);
      setSelectedItemIds([]);
      setPriceAdjustValue('');
    }
  };

  // Category Modal Handlers
  const openCategoryModal = (cat?: { id: string; name: string; description?: string }) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({ name: cat.name, description: cat.description || '' });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '' });
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuData?.menu || !categoryForm.name.trim()) return;

    let success = false;
    if (editingCategory) {
      success = await runMutation(() => updateMenuCategory(editingCategory.id, { name: categoryForm.name.trim(), description: categoryForm.description.trim() }), 'Category updated.');
    } else {
      success = await runMutation(() => createMenuCategory({ menuId: menuData.menu!.id, name: categoryForm.name.trim(), description: categoryForm.description.trim() }), 'Category created.');
    }
    if (success) setIsCategoryModalOpen(false);
  };

  if (loading || loadingMenu) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-[#e8783c] animate-spin" />
    </div>
  );

  const menuStatus = menuData?.menu?.status || 'PUBLISHED';
  const publicSlug = menuData?.menu?.menuSlug;

  return (
    <div className="min-h-screen space-y-6 pb-24 text-[#f0f4f2]">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#2d3a34] bg-[#1d2723] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Menu Manager</h1>
            {/* Live / Draft Status Badge & Toggle */}
            <button
              type="button"
              onClick={handleTogglePublish}
              disabled={saving}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${
                menuStatus === 'PUBLISHED'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
              }`}
              title="Click to toggle between Live and Draft menu mode"
            >
              <span className={`h-2 w-2 rounded-full ${menuStatus === 'PUBLISHED' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {menuStatus === 'PUBLISHED' ? 'LIVE MENU' : 'DRAFT MODE'}
            </button>
          </div>
          <p className="mt-1 text-xs text-[#aab7b2]">
            Organize dishes, categories, portion sizes, and bulk pricing for your permanent QR code
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Smart Excel Import Action Button */}
          <button
            type="button"
            onClick={() => setIsImportWizardOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-[#3b82f6]/40 bg-[#3b82f6]/10 px-4 py-2.5 text-xs font-bold text-[#60a5fa] transition-all hover:bg-[#3b82f6]/20 hover:border-[#3b82f6] cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-[#3b82f6]" />
            Import Excel Spreadsheet
          </button>

          <button
            type="button"
            onClick={() => openItemDrawer()}
            className="flex items-center gap-2 rounded-xl bg-[#e8783c] px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#d6672b]"
          >
            <Plus className="h-4 w-4" />
            Add Dish
          </button>

          <button
            type="button"
            onClick={() => openCategoryModal()}
            className="flex items-center gap-2 rounded-xl border border-[#384841] bg-[#151c19] px-3.5 py-2.5 text-xs font-semibold text-[#aab7b2] hover:border-[#e8783c] hover:text-white"
          >
            <Layers className="h-4 w-4" />
            Add Category
          </button>

          {publicSlug && (
            <a
              href={`/menu/${publicSlug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-[#384841] bg-[#151c19] px-3 py-2.5 text-xs font-semibold text-[#aab7b2] hover:text-white"
            >
              <ExternalLink className="h-4 w-4" />
              Preview Live
            </a>
          )}
        </div>
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-xl border border-[#2d3a34] bg-[#1d2723] p-4 text-center">
          <p className="text-xs text-[#aab7b2]">Total Categories</p>
          <p className="mt-1 text-2xl font-bold text-white">{stats.categories}</p>
        </div>
        <div className="rounded-xl border border-[#2d3a34] bg-[#1d2723] p-4 text-center">
          <p className="text-xs text-[#aab7b2]">Total Dishes</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-[#2d3a34] bg-[#1d2723] p-4 text-center">
          <p className="text-xs text-[#aab7b2]">Active / Live</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">{stats.live}</p>
        </div>
        <div className="rounded-xl border border-[#2d3a34] bg-[#1d2723] p-4 text-center">
          <p className="text-xs text-[#aab7b2]">Hidden Dishes</p>
          <p className="mt-1 text-2xl font-bold text-amber-400">{stats.hidden}</p>
        </div>
        <div className="rounded-xl border border-[#2d3a34] bg-[#1d2723] p-4 text-center">
          <p className="text-xs text-[#aab7b2]">Portion Variants</p>
          <p className="mt-1 text-2xl font-bold text-sky-400">{stats.variantItems}</p>
        </div>
      </div>

      {/* Filtering & Search Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#2d3a34] bg-[#1d2723] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#aab7b2]" />
          <input
            type="text"
            placeholder="Search dishes by name or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#384841] bg-[#151c19] pl-9 pr-4 py-2 text-xs font-medium text-white placeholder-[#aab7b2] focus:border-[#e8783c] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-[#384841] bg-[#151c19] px-3 py-2 text-xs font-medium text-white focus:border-[#e8783c] focus:outline-none"
          >
            <option value="all">All Categories ({stats.categories})</option>
            {menuData?.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.items.length})
              </option>
            ))}
          </select>

          {/* Pricing Filter */}
          <select
            value={pricingFilter}
            onChange={(e) => setPricingFilter(e.target.value as PricingFilter)}
            className="rounded-xl border border-[#384841] bg-[#151c19] px-3 py-2 text-xs font-medium text-white focus:border-[#e8783c] focus:outline-none"
          >
            <option value="all">All Pricing Modes</option>
            <option value="single">Single Price Only</option>
            <option value="variants">Has Size Variants</option>
          </select>

          {/* Availability Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-xl border border-[#384841] bg-[#151c19] px-3 py-2 text-xs font-medium text-white focus:border-[#e8783c] focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="live">Live Only</option>
            <option value="hidden">Hidden Only</option>
          </select>

          {/* Diet Filter */}
          <select
            value={dietFilter}
            onChange={(e) => setDietFilter(e.target.value as DietFilter)}
            className="rounded-xl border border-[#384841] bg-[#151c19] px-3 py-2 text-xs font-medium text-white focus:border-[#e8783c] focus:outline-none"
          >
            <option value="all">All Diets</option>
            <option value="veg">Vegetarian</option>
            <option value="non-veg">Non-Vegetarian</option>
          </select>

          {/* Sort */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="rounded-xl border border-[#384841] bg-[#151c19] px-3 py-2 text-xs font-medium text-white focus:border-[#e8783c] focus:outline-none"
          >
            <option value="recent">Recently Added</option>
            <option value="az">Name A-Z</option>
            <option value="za">Name Z-A</option>
            <option value="price_asc">Price Low-High</option>
            <option value="price_desc">Price High-Low</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Floating Bar when items selected */}
      {selectedItemIds.length > 0 && (
        <div className="sticky top-4 z-30 flex items-center justify-between rounded-xl border border-[#e8783c] bg-[#1d2723] px-5 py-3 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#e8783c] px-2.5 py-1 text-xs font-bold text-white">
              {selectedItemIds.length} Selected
            </span>
            <button
              type="button"
              onClick={selectAllItems}
              className="text-xs text-[#aab7b2] hover:text-white underline"
            >
              {selectedItemIds.length === allItems.length ? 'Deselect all' : 'Select all'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsBulkCategoryModalOpen(true)}
              className="rounded-lg border border-[#384841] bg-[#151c19] px-3 py-1.5 text-xs font-semibold text-white hover:border-[#e8783c]"
            >
              Change Category
            </button>

            <button
              type="button"
              onClick={() => handleBulkAvailabilitySave(true)}
              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20"
            >
              Make Live
            </button>

            <button
              type="button"
              onClick={() => handleBulkAvailabilitySave(false)}
              className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20"
            >
              Make Hidden
            </button>

            <button
              type="button"
              onClick={() => setIsBulkPriceModalOpen(true)}
              className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-400 hover:bg-sky-500/20"
            >
              Adjust Prices
            </button>

            <button
              type="button"
              onClick={() => setDeleteConfirm({ type: 'bulk' })}
              className="rounded-lg bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/30"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats.total === 0 && (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#384841] bg-[#1d2723]/50 p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8783c]/10 text-[#e8783c]">
            <UtensilsCrossed className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Your menu is currently empty</h3>
          <p className="mt-1 max-w-sm text-xs text-[#aab7b2]">
            Upload an existing restaurant spreadsheet or add dishes manually to build your QR menu.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setIsImportWizardOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-[#3b82f6] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#2563eb] shadow-md shadow-[#3b82f6]/20 cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Import Excel Spreadsheet
            </button>
            <button
              type="button"
              onClick={() => openItemDrawer()}
              className="flex items-center gap-2 rounded-xl border border-[#384841] bg-[#151c19] px-5 py-2.5 text-xs font-semibold text-white hover:border-[#e8783c]"
            >
              <Plus className="h-4 w-4" />
              Add First Dish
            </button>
          </div>
        </div>
      )}

      {/* Categories & Item Tables */}
      <div className="space-y-6">
        {filteredCategories.map((category) => (
          <div key={category.id} className="overflow-hidden rounded-2xl border border-[#2d3a34] bg-[#1d2723]">
            {/* Category Header */}
            <div className="flex items-center justify-between border-b border-[#2d3a34] bg-[#151c19] px-6 py-4">
              <div className="flex items-center gap-3">
                <Layers className="h-5 w-5 text-[#e8783c]" />
                <div>
                  <h3 className="text-base font-bold text-white">{category.name}</h3>
                  {category.description && (
                    <p className="text-xs text-[#aab7b2]">{category.description}</p>
                  )}
                </div>
                <span className="rounded-full bg-[#25322c] px-2.5 py-0.5 text-xs font-semibold text-[#aab7b2]">
                  {category.items.length} items
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openItemDrawer(undefined, category.id)}
                  className="flex items-center gap-1 rounded-lg border border-[#384841] bg-[#1d2723] px-2.5 py-1.5 text-xs font-semibold text-emerald-400 hover:border-emerald-500"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Dish
                </button>

                <button
                  type="button"
                  onClick={() => openCategoryModal(category)}
                  className="rounded-lg p-1.5 text-[#aab7b2] hover:bg-[#25322c] hover:text-white"
                  title="Edit category"
                >
                  <Edit2 className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteConfirm({ type: 'category', id: category.id, name: category.name })}
                  className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/20"
                  title="Delete category"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Category Items List */}
            {category.items.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#aab7b2]">
                No items in this category. Click "+ Add Dish" above to add one.
              </div>
            ) : (
              <div className="divide-y divide-[#25322c]">
                {category.items.map((item) => {
                  const isSelected = selectedItemIds.includes(item.id);
                  const hasVariants = item.pricing_type === 'variants' || (item.variants && item.variants.length > 0);

                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col gap-3 p-4 transition-colors sm:flex-row sm:items-center sm:justify-between ${
                        isSelected ? 'bg-[#e8783c]/5' : 'hover:bg-[#25322c]/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectItem(item.id)}
                          className="h-4 w-4 rounded border-[#384841] bg-[#151c19] text-[#e8783c] focus:ring-0"
                        />

                        {/* Diet Icon / Image */}
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#384841] bg-[#151c19]">
                          <span className={`h-3 w-3 rounded-full ${item.diet_type === 'veg' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{item.name}</h4>
                            {hasVariants && (
                              <span className="rounded bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold text-sky-300">
                                {item.variants?.length || 2} variants
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="mt-0.5 text-xs text-[#aab7b2] line-clamp-1">{item.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        {/* Price Display */}
                        <div className="text-right font-mono text-sm font-bold text-emerald-400">
                          {hasVariants && item.variants && item.variants.length > 0 ? (
                            <span>
                              ₹{Math.min(...item.variants.map((v) => Number(v.price)))} – ₹{Math.max(...item.variants.map((v) => Number(v.price)))}
                            </span>
                          ) : (
                            <span>₹{item.price || 0}</span>
                          )}
                        </div>

                        {/* Live / Hidden Switch */}
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(item)}
                          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
                            item.is_available
                              ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                              : 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25'
                          }`}
                        >
                          {item.is_available ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          {item.is_available ? 'Live' : 'Hidden'}
                        </button>

                        {/* Quick Row Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openItemDrawer(item)}
                            className="rounded-lg p-1.5 text-[#aab7b2] hover:bg-[#25322c] hover:text-white"
                            aria-label="Edit item"
                            title="Edit item"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDuplicateItem(item)}
                            className="rounded-lg p-1.5 text-[#aab7b2] hover:bg-[#25322c] hover:text-white"
                            title="Duplicate dish"
                          >
                            <Copy className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirm({ type: 'item', id: item.id, name: item.name })}
                            className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/20"
                            title="Delete dish"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* SMART IMPORT WIZARD MODAL */}
      <SmartImportWizard
        isOpen={isImportWizardOpen}
        onClose={() => setIsImportWizardOpen(false)}
        onSuccess={loadMenuData}
      />

      {/* ITEM EDITOR DRAWER / MODAL */}
      {isItemDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="flex w-full max-w-xl flex-col bg-[#1d2723] shadow-2xl text-[#f0f4f2]">
            <div className="flex items-center justify-between border-b border-[#2d3a34] bg-[#151c19] px-6 py-4">
              <h2 className="text-lg font-bold text-white">
                {editingItem ? 'Edit Dish' : 'Add New Dish'}
              </h2>
              <button
                type="button"
                onClick={() => setIsItemDrawerOpen(false)}
                className="rounded-lg p-2 text-[#aab7b2] hover:bg-[#25322c] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Category Selection */}
              <div>
                <label htmlFor="dish-category" className="text-xs font-semibold text-[#aab7b2]">Category *</label>
                <select
                  id="dish-category"
                  aria-label="Category"
                  value={itemForm.categoryId}
                  onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                  required
                  className="mt-1 w-full rounded-xl border border-[#384841] bg-[#151c19] px-3.5 py-2.5 text-sm text-white focus:border-[#e8783c] focus:outline-none"
                >
                  {menuData?.categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Item Name */}
              <div>
                <label htmlFor="dish-name" className="text-xs font-semibold text-[#aab7b2]">Dish Name *</label>
                <input
                  id="dish-name"
                  aria-label="Dish Name"
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="E.g. Paneer Butter Masala"
                  required
                  className="mt-1 w-full rounded-xl border border-[#384841] bg-[#151c19] px-3.5 py-2.5 text-sm text-white focus:border-[#e8783c] focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="dish-description" className="text-xs font-semibold text-[#aab7b2]">Description</label>
                <textarea
                  id="dish-description"
                  aria-label="Description"
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  placeholder="Ingredients or preparation details..."
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-[#384841] bg-[#151c19] px-3.5 py-2.5 text-sm text-white focus:border-[#e8783c] focus:outline-none"
                />
              </div>

              {/* Dish Photo with Client Pre-Compression */}
              <div>
                <label className="text-xs font-semibold text-[#aab7b2]">Dish Photo (Auto-compressed before upload)</label>
                <div className="mt-1.5 flex items-center gap-3">
                  {itemForm.imageUrl ? (
                    <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border border-[#384841] bg-black/40">
                      <img src={itemForm.imageUrl} alt="Dish" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setItemForm({ ...itemForm, imageUrl: '' })}
                        className="absolute top-1 right-1 bg-black/80 rounded-full p-0.5 text-rose-400 hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : null}
                  <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-[#384841] hover:border-[#e8783c] bg-[#151c19] text-xs font-semibold text-[#aab7b2] hover:text-white transition-all">
                    <UploadCloud size={16} className="text-[#e8783c]" />
                    <span>{uploadingImage ? 'Optimizing & Uploading...' : (itemForm.imageUrl ? 'Change Photo' : 'Upload Dish Photo')}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={uploadingImage}
                      onChange={handleDishImageUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Pricing Mode Selector */}
              <div className="rounded-xl border border-[#2d3a34] bg-[#151c19] p-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#aab7b2]">
                  Pricing Mode
                </label>
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setItemForm({ ...itemForm, pricingType: 'single' })}
                    className={`flex-1 rounded-xl border py-2.5 text-xs font-bold transition-all ${
                      itemForm.pricingType === 'single'
                        ? 'border-[#e8783c] bg-[#e8783c]/15 text-[#e8783c]'
                        : 'border-[#384841] bg-[#1d2723] text-[#aab7b2]'
                    }`}
                  >
                    Single Price
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemForm({ ...itemForm, pricingType: 'variants' })}
                    className={`flex-1 rounded-xl border py-2.5 text-xs font-bold transition-all ${
                      itemForm.pricingType === 'variants'
                        ? 'border-[#e8783c] bg-[#e8783c]/15 text-[#e8783c]'
                        : 'border-[#384841] bg-[#1d2723] text-[#aab7b2]'
                    }`}
                  >
                    Size / Portion Variants
                  </button>
                </div>

                {itemForm.pricingType === 'single' ? (
                  <div className="mt-4">
                    <label htmlFor="dish-price" className="text-xs font-semibold text-[#aab7b2]">Price (₹) *</label>
                    <input
                      id="dish-price"
                      aria-label="Price"
                      type="number"
                      min="0"
                      step="1"
                      value={itemForm.price}
                      onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                      placeholder="180"
                      className="mt-1 w-full rounded-xl border border-[#384841] bg-[#1d2723] px-3.5 py-2.5 text-sm font-mono text-white focus:border-[#e8783c] focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#aab7b2]">Portion Prices (Half / Full / Sizes)</label>
                      <button
                        type="button"
                        onClick={() => setItemForm({ ...itemForm, variants: [...itemForm.variants, { name: '', price: 0 }] })}
                        className="text-xs font-semibold text-[#e8783c] hover:underline"
                      >
                        + Add Variant
                      </button>
                    </div>

                    {itemForm.variants.map((v, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Portion (Half/Full/Large)"
                          value={v.name}
                          onChange={(e) => {
                            const updated = [...itemForm.variants];
                            updated[idx].name = e.target.value;
                            setItemForm({ ...itemForm, variants: updated });
                          }}
                          className="flex-1 rounded-lg border border-[#384841] bg-[#1d2723] px-3 py-2 text-xs text-white"
                        />
                        <input
                          type="number"
                          placeholder="Price (₹)"
                          value={v.price || ''}
                          onChange={(e) => {
                            const updated = [...itemForm.variants];
                            updated[idx].price = Number(e.target.value);
                            setItemForm({ ...itemForm, variants: updated });
                          }}
                          className="w-28 rounded-lg border border-[#384841] bg-[#1d2723] px-3 py-2 text-xs font-mono text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setItemForm({ ...itemForm, variants: itemForm.variants.filter((_, i) => i !== idx) })}
                          className="p-1 text-rose-400 hover:text-rose-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Diet Type */}
              <div>
                <label className="text-xs font-semibold text-[#aab7b2]">Diet Classification</label>
                <div className="mt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setItemForm({ ...itemForm, dietType: 'veg' })}
                    className={`flex-1 rounded-xl border py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      itemForm.dietType === 'veg'
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500'
                        : 'border-[#384841] bg-[#151c19] text-[#aab7b2] hover:text-white'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    Pure Veg
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemForm({ ...itemForm, dietType: 'non-veg' })}
                    className={`flex-1 rounded-xl border py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      itemForm.dietType === 'non-veg'
                        ? 'border-rose-500 bg-rose-500/20 text-rose-300 ring-1 ring-rose-500'
                        : 'border-[#384841] bg-[#151c19] text-[#aab7b2] hover:text-white'
                    }`}
                  >
                    <span className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-rose-400" />
                    Non-Veg
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemForm({ ...itemForm, dietType: 'vegan' })}
                    className={`flex-1 rounded-xl border py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      itemForm.dietType === 'vegan'
                        ? 'border-teal-500 bg-teal-500/20 text-teal-300 ring-1 ring-teal-500'
                        : 'border-[#384841] bg-[#151c19] text-[#aab7b2] hover:text-white'
                    }`}
                  >
                    <span>🌱</span>
                    Vegan
                  </button>
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center justify-between rounded-xl border border-[#2d3a34] bg-[#151c19] p-4">
                <div>
                  <p className="text-xs font-bold text-white">Item Availability</p>
                  <p className="text-[11px] text-[#aab7b2]">Is this dish live on your menu today?</p>
                </div>
                <input
                  type="checkbox"
                  checked={itemForm.isAvailable}
                  onChange={(e) => setItemForm({ ...itemForm, isAvailable: e.target.checked })}
                  className="h-5 w-5 rounded border-[#384841] bg-[#1d2723] text-[#e8783c]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsItemDrawerOpen(false)}
                  className="rounded-xl border border-[#384841] px-5 py-2.5 text-xs font-semibold text-[#aab7b2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#e8783c] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#d6672b]"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#2d3a34] bg-[#1d2723] p-6 shadow-2xl text-[#f0f4f2]">
            <div className="flex items-center justify-between border-b border-[#2d3a34] pb-4">
              <h3 className="text-base font-bold text-white">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-[#aab7b2] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#aab7b2]">Category Name *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="E.g. Starters, Main Course, Desserts"
                  required
                  className="mt-1 w-full rounded-xl border border-[#384841] bg-[#151c19] px-3.5 py-2 text-sm text-white focus:border-[#e8783c] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#aab7b2]">Description (Optional)</label>
                <input
                  type="text"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Short description for this menu section"
                  className="mt-1 w-full rounded-xl border border-[#384841] bg-[#151c19] px-3.5 py-2 text-sm text-white focus:border-[#e8783c] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="rounded-xl border border-[#384841] px-4 py-2 text-xs font-semibold text-[#aab7b2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#e8783c] px-5 py-2 text-xs font-bold text-white hover:bg-[#d6672b]"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK CATEGORY MODAL */}
      {isBulkCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#2d3a34] bg-[#1d2723] p-6 shadow-2xl text-[#f0f4f2]">
            <h3 className="text-base font-bold text-white">Move {selectedItemIds.length} Items to Category</h3>
            <div className="mt-4">
              <select
                value={bulkTargetCategory}
                onChange={(e) => setBulkTargetCategory(e.target.value)}
                className="w-full rounded-xl border border-[#384841] bg-[#151c19] p-3 text-sm text-white"
              >
                <option value="">Select Target Category</option>
                {menuData?.categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsBulkCategoryModalOpen(false)}
                className="rounded-xl border border-[#384841] px-4 py-2 text-xs font-semibold text-[#aab7b2]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkCategorySave}
                disabled={!bulkTargetCategory}
                className="rounded-xl bg-[#e8783c] px-5 py-2 text-xs font-bold text-white hover:bg-[#d6672b] disabled:opacity-50"
              >
                Apply Category Move
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK PRICE ADJUSTMENT MODAL */}
      {isBulkPriceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#2d3a34] bg-[#1d2723] p-6 shadow-2xl text-[#f0f4f2]">
            <h3 className="text-base font-bold text-white">Bulk Adjust Prices ({selectedItemIds.length} items)</h3>
            <p className="mt-1 text-xs text-[#aab7b2]">Increase or decrease prices for selected dishes.</p>

            <div className="mt-4 space-y-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPriceAdjustType('flat')}
                  className={`flex-1 rounded-xl border py-2 text-xs font-bold ${
                    priceAdjustType === 'flat' ? 'border-[#e8783c] bg-[#e8783c]/15 text-[#e8783c]' : 'border-[#384841] bg-[#151c19] text-[#aab7b2]'
                  }`}
                >
                  Flat Amount (₹)
                </button>
                <button
                  type="button"
                  onClick={() => setPriceAdjustType('percentage')}
                  className={`flex-1 rounded-xl border py-2 text-xs font-bold ${
                    priceAdjustType === 'percentage' ? 'border-[#e8783c] bg-[#e8783c]/15 text-[#e8783c]' : 'border-[#384841] bg-[#151c19] text-[#aab7b2]'
                  }`}
                >
                  Percentage (%)
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#aab7b2]">
                  Adjustment Value ({priceAdjustType === 'flat' ? '₹' : '%'}) — Use positive (+20) or negative (-10)
                </label>
                <input
                  type="number"
                  placeholder={priceAdjustType === 'flat' ? '20' : '10'}
                  value={priceAdjustValue}
                  onChange={(e) => setPriceAdjustValue(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#384841] bg-[#151c19] px-3.5 py-2.5 text-sm font-mono text-white focus:border-[#e8783c] focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsBulkPriceModalOpen(false)}
                className="rounded-xl border border-[#384841] px-4 py-2 text-xs font-semibold text-[#aab7b2]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkPriceSave}
                className="rounded-xl bg-[#e8783c] px-5 py-2 text-xs font-bold text-white hover:bg-[#d6672b]"
              >
                Apply Price Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#1d2723] p-6 shadow-2xl text-[#f0f4f2]">
            <h3 className="text-lg font-bold text-white">Confirm Deletion</h3>
            <p className="mt-2 text-xs text-[#aab7b2]">
              Are you sure you want to delete {deleteConfirm.name ? `"${deleteConfirm.name}"` : `${selectedItemIds.length} items`}? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="rounded-xl border border-[#384841] px-4 py-2 text-xs font-semibold text-[#aab7b2]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-500"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
