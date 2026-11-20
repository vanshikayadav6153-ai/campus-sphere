import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import itemService from '../services/itemService';
import skillService from '../services/skillService';
import { useToast } from '../context/ToastContext';
import MapPreview from '../components/MapPreview';
import { ArrowLeft, Plus, Save, Package, MapPin } from 'lucide-react';

const ItemForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'sell',
    price: '',
    rentPerDay: '',
    category: 'appliances',
    imageUrl: '',
    safeZone: '',
  });

  const [safeZones, setSafeZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const zoneData = await skillService.getSafeZones();
        const zones = zoneData.safeZones || [];
        setSafeZones(zones);

        if (isEdit) {
          const itemData = await itemService.getItemById(id);
          const itm = itemData.item;
          setFormData({
            title: itm.title,
            description: itm.description || '',
            type: itm.type,
            price: itm.price || '',
            rentPerDay: itm.rentPerDay || '',
            category: itm.category || 'other',
            imageUrl: itm.images?.[0] || '',
            safeZone: itm.safeZone?._id || itm.safeZone || '',
          });
        } else if (zones.length > 0) {
          setFormData((prev) => ({ ...prev, safeZone: zones[0]._id }));
        }
      } catch (err) {
        showToast('error', 'Failed to load form details');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEdit, showToast]);

  const selectedZoneObj = safeZones.find((z) => z._id === formData.safeZone);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        price: formData.type === 'sell' ? Number(formData.price) : 0,
        rentPerDay: formData.type === 'rent' ? Number(formData.rentPerDay) : 0,
        category: formData.category,
        images: formData.imageUrl ? [formData.imageUrl.trim()] : [],
        safeZone: formData.safeZone,
      };

      if (isEdit) {
        await itemService.updateItem(id, payload);
        showToast('success', 'Listing updated successfully');
      } else {
        await itemService.createItem(payload);
        showToast('success', 'Gear listed in marketplace!');
      }
      navigate('/marketplace');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Error saving listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-campus-primary transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <h1 className="text-2xl font-black text-slate-900 mb-1">
            {isEdit ? 'Edit Gear Listing' : 'List Gear in Campus Marketplace'}
          </h1>
          <p className="text-xs text-slate-500 mb-6">
            Share books, kettles, irons, or drafters with fellow students.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type: Sell or Rent */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Listing Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'sell' })}
                  className={`py-3 rounded-2xl text-xs font-bold border transition ${
                    formData.type === 'sell'
                      ? 'bg-campus-primary text-white border-campus-primary'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Sell (One-time Buy)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'rent' })}
                  className={`py-3 rounded-2xl text-xs font-bold border transition ${
                    formData.type === 'rent'
                      ? 'bg-campus-primary text-white border-campus-primary'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Rent (Per Day Fee)
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Item Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Philips Electric Iron, Calculus Textbook (7th Ed)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-campus-teal"
              />
            </div>

            {/* Price / Rent per day */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formData.type === 'sell' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 350"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-campus-teal"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rent Fee (₹/day)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.rentPerDay}
                    onChange={(e) => setFormData({ ...formData, rentPerDay: e.target.value })}
                    placeholder="e.g. 20"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-campus-teal"
                  />
                </div>
              )}

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-campus-teal"
                >
                  <option value="appliances">Hostel Utilities (Irons/Cookers)</option>
                  <option value="textbooks">Textbooks</option>
                  <option value="electronics">Electronics & Calc</option>
                  <option value="drafters">Engineering Drafters</option>
                  <option value="uniforms">Lab Coats & Uniforms</option>
                  <option value="other">Other Gear</option>
                </select>
              </div>
            </div>

            {/* Photo URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Photo URL (Optional)</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-campus-teal"
              />
            </div>

            {/* Safe Pickup Zone Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Safe Handover Checkpoint
              </label>
              <select
                required
                value={formData.safeZone}
                onChange={(e) => setFormData({ ...formData, safeZone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-campus-teal mb-3 font-medium"
              >
                {safeZones.map((z) => (
                  <option key={z._id} value={z._id}>
                    {z.icon || '📍'} {z.name} ({z.safetyNote})
                  </option>
                ))}
              </select>

              {/* Real-time Map Preview */}
              {selectedZoneObj && (
                <div className="mt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Checkpoint Map Preview
                  </span>
                  <MapPreview zone={selectedZoneObj} height="160px" />
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Condition, working status, semester, etc..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-campus-teal"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-campus-primary hover:bg-campus-teal text-white font-extrabold text-sm rounded-2xl transition shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : isEdit ? 'Update Listing' : 'Publish Gear Listing'}</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ItemForm;
