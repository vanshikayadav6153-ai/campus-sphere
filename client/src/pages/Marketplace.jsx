import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import itemService from '../services/itemService';
import {
  Search,
  Plus,
  Tag,
  MapPin,
  Package,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Gear' },
  { id: 'appliances', label: 'Hostel Utilities (Irons/Cookers)' },
  { id: 'textbooks', label: 'Textbooks' },
  { id: 'electronics', label: 'Electronics & Calc' },
  { id: 'drafters', label: 'Engineering Drafters' },
  { id: 'uniforms', label: 'Lab Coats & Uniforms' },
  { id: 'other', label: 'Other Gear' },
];

const Marketplace = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all'); // 'all' | 'sell' | 'rent'
  const [statusFilter, setStatusFilter] = useState('available'); // default hides sold

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 12,
        status: statusFilter,
      };
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedType !== 'all') params.type = selectedType;

      const data = await itemService.getItems(params);
      setItems(data.items || []);
      setTotalPages(data.pages || 1);
      setTotalItems(data.total || 0);
    } catch (err) {
      console.error('Error fetching marketplace items:', err);
      setError('Unable to load marketplace items. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, selectedCategory, selectedType, statusFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchItems();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-campus-primary/10 text-campus-primary text-xs font-bold uppercase tracking-wider mb-2">
              <ShoppingBag className="w-3.5 h-3.5" />
              Circular Campus Marketplace
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Student Gear & Hostel Utilities
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Buy, sell, or rent irons, cookers, books, and lab coats. Handover safely at designated campus safe zones.
            </p>
          </div>

          <Link
            to="/marketplace/create"
            className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-3 bg-campus-primary hover:bg-campus-teal text-white text-sm font-bold rounded-2xl shadow-sm hover:shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>List an Item</span>
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-8 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items (iron, kettle, engineering maths, drafter)..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-campus-teal bg-slate-50 focus:bg-white transition"
              />
            </form>

            {/* Category Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full py-2.5 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-campus-teal transition font-medium text-slate-700"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="md:col-span-2">
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setPage(1);
                }}
                className="w-full py-2.5 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-campus-teal transition font-medium text-slate-700"
              >
                <option value="all">All Types (Sell/Rent)</option>
                <option value="sell">Buy Only</option>
                <option value="rent">Rent Only</option>
              </select>
            </div>

            {/* Status Filter (Default hides sold) */}
            <div className="md:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full py-2.5 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-campus-teal transition font-medium text-slate-700"
              >
                <option value="available">Available Only</option>
                <option value="all">Include Sold / Reserved</option>
                <option value="sold">Sold Items</option>
              </select>
            </div>
          </div>
        </div>

        {/* Count summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
          <span>
            Found <strong className="text-slate-800">{totalItems}</strong> listings
          </span>
          {(searchQuery || selectedCategory !== 'all' || selectedType !== 'all' || statusFilter !== 'available') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedType('all');
                setStatusFilter('available');
                setPage(1);
              }}
              className="text-campus-teal hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-4 border border-slate-200 animate-pulse space-y-3">
                <div className="w-full h-40 bg-slate-200 rounded-2xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-6 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl text-center text-sm">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4 text-2xl">
              📦
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No items found</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              No campus gear matched your search criteria. Be the first to list an item for sale or rent!
            </p>
            <Link
              to="/marketplace/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-campus-primary text-white text-xs font-bold rounded-xl hover:bg-campus-teal transition"
            >
              <Plus className="w-4 h-4" />
              <span>List Your Gear</span>
            </Link>
          </div>
        )}

        {/* Card Grid */}
        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <Link
                key={item._id}
                to={`/marketplace/${item._id}`}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-campus-teal/50 transition flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Image Container or Placeholder */}
                  <div className="w-full h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                    {item.images && item.images.length > 0 && item.images[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="text-slate-300 flex flex-col items-center">
                        <Package className="w-10 h-10" />
                        <span className="text-[10px] text-slate-400 mt-1">No Photo</span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs ${
                          item.status === 'available'
                            ? 'bg-emerald-600 text-white'
                            : item.status === 'reserved'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          item.type === 'rent'
                            ? 'bg-purple-600 text-white'
                            : 'bg-campus-primary text-white'
                        }`}
                      >
                        {item.type === 'rent' ? 'For Rent' : 'For Sale'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      {item.category}
                    </span>

                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-campus-primary transition line-clamp-1 mb-1">
                      {item.title}
                    </h3>

                    {/* Price / Rent */}
                    <div className="text-base font-black text-slate-900 mb-2">
                      {item.type === 'rent' ? (
                        <span>
                          ₹{item.rentPerDay} <span className="text-xs font-semibold text-slate-500">/day</span>
                        </span>
                      ) : (
                        <span>₹{item.price}</span>
                      )}
                    </div>

                    {/* Safe Zone */}
                    {item.safeZone && (
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <MapPin className="w-3 h-3 text-campus-teal shrink-0" />
                        <span className="truncate">{item.safeZone.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer: Seller */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600 truncate font-semibold">
                    {item.owner?.name || 'Student'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-600 px-3 py-1.5 bg-white border border-slate-200 rounded-xl">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Marketplace;
