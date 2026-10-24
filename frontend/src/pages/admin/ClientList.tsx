import { useEffect, useState, useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  QrCode, 
  ShieldCheck, 
  Edit3, 
  Trash2, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Store,
  Coffee,
  UtensilsCrossed,
  Phone
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { deleteClient, getClients, type ClientRecord } from './clientStore';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemAnim: Variants = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.25 } } };

const PAGE_SIZE = 24;

export default function ClientList() {
  const location = useLocation();
  const pathType = location.pathname.split('/').pop() || 'all';

  const [activeCategory, setActiveCategory] = useState<'all' | 'restaurants' | 'dhabas' | 'cafes'>(() => {
    if (['restaurants', 'dhabas', 'cafes'].includes(pathType)) return pathType as any;
    return 'all';
  });

  const [savedClients, setSavedClients] = useState<ClientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (['restaurants', 'dhabas', 'cafes'].includes(pathType)) {
      setActiveCategory(pathType as any);
      setCurrentPage(1);
    }
  }, [pathType]);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setError('');

    getClients()
      .then((records) => {
        if (!isCurrent) return;
        setSavedClients(records);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (!isCurrent) return;
        setError(err instanceof Error ? err.message : 'Could not load client profiles.');
        setIsLoading(false);
      });

    return () => { isCurrent = false; };
  }, []);

  // Category counts across all records
  const counts = useMemo(() => {
    return {
      all: savedClients.length,
      restaurants: savedClients.filter(c => c.category === 'restaurants').length,
      dhabas: savedClients.filter(c => c.category === 'dhabas').length,
      cafes: savedClients.filter(c => c.category === 'cafes').length,
    };
  }, [savedClients]);

  // Filter clients by category and search query
  const filteredClients = useMemo(() => {
    return savedClients.filter((client) => {
      // 1. Category filter
      if (activeCategory !== 'all' && client.category !== activeCategory) {
        return false;
      }

      // 2. Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      const name = (client.businessName || '').toLowerCase();
      const city = (client.city || '').toLowerCase();
      const state = (client.state || '').toLowerCase();
      const phone = (client.phone || '').toLowerCase();
      const email = (client.email || (client as any).ownerEmail || '').toLowerCase();
      const slug = (client.menuSlug || '').toLowerCase();

      return name.includes(q) || city.includes(q) || state.includes(q) || phone.includes(q) || email.includes(q) || slug.includes(q);
    });
  }, [savedClients, activeCategory, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / PAGE_SIZE));
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredClients.slice(start, start + PAGE_SIZE);
  }, [filteredClients, currentPage]);

  const handleDelete = async (client: ClientRecord) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${client.businessName}"? This action cannot be undone.`)) return;
    try {
      await deleteClient(client.id);
      setSavedClients(current => current.filter(c => c.id !== client.id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete this client.');
    }
  };

  const getCategoryBadge = (cat?: string) => {
    if (cat === 'dhabas') {
      return { label: '🛖 Dhaba', bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
    }
    if (cat === 'cafes') {
      return { label: '☕ Cafe', bg: 'bg-teal-500/15 text-teal-300 border-teal-500/30' };
    }
    return { label: '🍽️ Restaurant', bg: 'bg-orange-500/15 text-orange-300 border-orange-500/30' };
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Manage Businesses</span>
            <span className="text-sm font-bold text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              {filteredClients.length} {filteredClients.length === 1 ? 'profile' : 'profiles'}
            </span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm font-medium">
            Monitor all onboarded restaurants, dhabas, and cafes with live menus & QR identities.
          </p>
        </div>

        {/* Search input */}
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, city, phone, slug..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-white text-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/5">
        <button
          type="button"
          onClick={() => { setActiveCategory('all'); setCurrentPage(1); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20 font-black'
              : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/5'
          }`}
        >
          <UtensilsCrossed size={14} />
          <span>All Businesses</span>
          <span className="px-1.5 py-0.5 rounded-full bg-black/20 text-[10px]">{counts.all}</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveCategory('restaurants'); setCurrentPage(1); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeCategory === 'restaurants'
              ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20 font-black'
              : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/5'
          }`}
        >
          <span>🍽️ Restaurants</span>
          <span className="px-1.5 py-0.5 rounded-full bg-black/20 text-[10px]">{counts.restaurants}</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveCategory('dhabas'); setCurrentPage(1); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeCategory === 'dhabas'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-md shadow-amber-500/20 font-black'
              : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/5'
          }`}
        >
          <Store size={14} />
          <span>🛖 Dhabas</span>
          <span className="px-1.5 py-0.5 rounded-full bg-black/20 text-[10px]">{counts.dhabas}</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveCategory('cafes'); setCurrentPage(1); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeCategory === 'cafes'
              ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/20 font-black'
              : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/5'
          }`}
        >
          <Coffee size={14} />
          <span>☕ Cafes</span>
          <span className="px-1.5 py-0.5 rounded-full bg-black/20 text-[10px]">{counts.cafes}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Grid of Clients */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold">Loading client profiles from database...</p>
        </div>
      ) : paginatedClients.length === 0 ? (
        <div className="py-16 text-center bg-white/[0.02] rounded-2xl border border-white/5 p-8">
          <p className="text-base text-slate-300 font-bold">No profiles found matching your selection.</p>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery ? 'Try clearing your search keyword.' : 'Onboard a new restaurant or change filter category.'}
          </p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {paginatedClients.map((client) => {
            const badge = getCategoryBadge(client.category);
            const locationStr = [client.city, client.state].filter(Boolean).join(', ') || 'Location Unset';
            const menuCount = client.menuItems ? client.menuItems.length : 0;
            const ownerContact = client.phone || (client as any).ownerEmail || 'No contact provided';

            return (
              <motion.div
                key={client.id}
                variants={itemAnim}
                className="group relative rounded-2xl bg-[#131b18] border border-[#23312c] hover:border-[#384e46] transition-all flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-0.5"
              >
                {/* Header bar */}
                <div className="p-4 border-b border-[#23312c]/70 bg-[#16211d] flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      <span className="text-[10px] font-bold text-amber-300/90 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md uppercase">
                        {client.plan || 'Essential'} Plan
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white truncate" title={client.businessName}>
                      {client.businessName}
                    </h3>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md shrink-0">
                    <ShieldCheck size={12} />
                    <span>{client.status || 'Active'}</span>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-4 space-y-3 flex-1 text-xs">
                  {/* Location & Menu Items */}
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400 truncate max-w-[180px]">
                      <MapPin size={13} className="text-orange-400 shrink-0" />
                      <span className="truncate">{locationStr}</span>
                    </span>
                    <span className="font-bold text-white bg-white/5 px-2 py-0.5 rounded border border-white/10 shrink-0">
                      {menuCount} Dishes
                    </span>
                  </div>

                  {/* Slug / Public URL */}
                  <div className="flex items-center justify-between text-slate-400 bg-[#0d1311] p-2 rounded-xl border border-white/5 font-mono text-[11px]">
                    <span className="truncate text-slate-300">/menu/{client.menuSlug}</span>
                    <a
                      href={`/menu/${client.menuSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-400 hover:text-orange-300 flex items-center gap-1 font-sans font-bold hover:underline shrink-0 ml-2"
                      title="Open Live Public Menu"
                    >
                      <span>Live Menu</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>

                  {/* Contact Info */}
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Phone size={12} className="text-slate-500 shrink-0" />
                    <span className="truncate">{ownerContact}</span>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-3 bg-[#111715] border-t border-[#23312c]/70 flex items-center gap-2">
                  <Link
                    to={`/admin/clients/${client.id}/business`}
                    className="flex-1 py-2 rounded-xl bg-white/[0.06] hover:bg-orange-500 hover:text-white text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Edit3 size={13} />
                    <span>Edit Profile</span>
                  </Link>

                  <Link
                    to={`/admin/qr?clientId=${encodeURIComponent(client.id)}`}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-all cursor-pointer border border-white/5"
                    title="Generate QR Placard"
                    aria-label={`QR Code for ${client.businessName}`}
                  >
                    <QrCode size={15} />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(client)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-all cursor-pointer border border-rose-500/20"
                    title="Delete Business"
                    aria-label={`Delete ${client.businessName}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-slate-400">
          <div>
            Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, filteredClients.length)} of {filteredClients.length} profiles
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft size={14} />
              <span>Prev</span>
            </button>
            <span className="font-bold text-white px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
