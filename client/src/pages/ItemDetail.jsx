import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import itemService from '../services/itemService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import MapPreview from '../components/MapPreview';
import {
  ArrowLeft,
  Tag,
  ShieldCheck,
  Package,
  Calendar,
  Edit3,
  Trash2,
  ExternalLink,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await itemService.getItemById(id);
        setItem(data.item);
      } catch (err) {
        setError(err.response?.data?.message || 'Item listing not found');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (!item) return;
    setUpdatingStatus(true);
    try {
      const data = await itemService.updateItemStatus(item._id, newStatus);
      setItem(data.item);
      showToast('success', `Listing marked as ${newStatus.toUpperCase()}`);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await itemService.deleteItem(id);
      showToast('success', 'Listing deleted successfully');
      navigate('/marketplace');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete listing');
    }
  };

  const isOwner = user && item && item.owner && (user._id === item.owner._id || user._id === item.owner);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-campus-primary transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>

        {loading && (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-campus-teal border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold text-slate-500">Loading item details...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-8 rounded-3xl text-center">
            <p className="font-bold text-sm mb-1">Listing Error</p>
            <p className="text-xs">{error}</p>
          </div>
        )}

        {!loading && !error && item && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Images */}
                <div className="rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center min-h-[280px]">
                  {item.images && item.images.length > 0 && item.images[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover max-h-[380px]"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-300 py-16">
                      <Package className="w-14 h-14" />
                      <span className="text-xs text-slate-400 mt-2">No photo uploaded</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full ${
                          item.status === 'available'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : item.status === 'reserved'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-200 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {item.type === 'rent' ? 'For Rent' : 'For Sale'}
                      </span>
                      <span className="text-xs font-bold text-slate-400 capitalize">
                        {item.category}
                      </span>
                    </div>

                    <h1 className="text-2xl font-black text-slate-900 mb-2 leading-tight">
                      {item.title}
                    </h1>

                    <div className="text-3xl font-black text-slate-900 mb-4">
                      {item.type === 'rent' ? (
                        <span>
                          ₹{item.rentPerDay}{' '}
                          <span className="text-sm font-semibold text-slate-500">/day</span>
                        </span>
                      ) : (
                        <span>₹{item.price}</span>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                      <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
                        Description
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                        {item.description || 'No additional description provided.'}
                      </p>
                    </div>
                  </div>

                  {/* Seller Status Controls */}
                  {isOwner ? (
                    <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-2xl">
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Manage Item Status (Seller Control):
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          value={item.status}
                          disabled={updatingStatus}
                          onChange={(e) => handleStatusChange(e.target.value)}
                          className="flex-1 py-2 px-3 text-xs font-bold rounded-xl border border-slate-300 bg-white"
                        >
                          <option value="available">Available (Active in search)</option>
                          <option value="reserved">Reserved (Meeting arranged)</option>
                          <option value="sold">Sold (Mark as completed)</option>
                        </select>
                        <button
                          onClick={handleDelete}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>
                          Campus Gated Trade: Arrange physical meetup at the verified safe zone below.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Safe Zone Preview */}
            {item.safeZone && (
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 mb-3 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-campus-teal" />
                  <span>Designated Safe Pickup Zone</span>
                </h3>
                <MapPreview zone={item.safeZone} height="220px" />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ItemDetail;
