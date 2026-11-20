import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import skillService from '../services/skillService';
import { useToast } from '../context/ToastContext';
import MapPreview from '../components/MapPreview';
import { ArrowLeft, Save, Sparkles, MapPin, Coins } from 'lucide-react';

const CATEGORIES = [
  { id: 'programming', label: 'Programming & Web Dev' },
  { id: 'design', label: 'UI/UX & Graphic Design' },
  { id: 'academics', label: 'Academics & Mathematics' },
  { id: 'music', label: 'Music & Audio' },
  { id: 'languages', label: 'Languages' },
  { id: 'career', label: 'Career Prep & Resume Review' },
  { id: 'other', label: 'Other Skills' },
];

const SkillForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    kind: 'offer', // 'offer' | 'want'
    category: 'programming',
    creditsPerHour: 3,
    mode: 'both', // 'in-person' | 'online' | 'both'
    safeZone: '',
  });

  const [safeZones, setSafeZones] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const zoneData = await skillService.getSafeZones();
        const zones = zoneData.safeZones || [];
        setSafeZones(zones);

        if (isEdit) {
          const res = await skillService.getSkillById(id);
          const s = res.skill;
          setFormData({
            title: s.title,
            description: s.description || '',
            kind: s.kind,
            category: s.category,
            creditsPerHour: s.creditsPerHour,
            mode: s.mode,
            safeZone: s.safeZone?._id || s.safeZone || '',
          });
        } else if (zones.length > 0) {
          setFormData((prev) => ({ ...prev, safeZone: zones[0]._id }));
        }
      } catch (err) {
        showToast('error', 'Failed to load form details');
      }
    };
    init();
  }, [id, isEdit, showToast]);

  const selectedZoneObj = safeZones.find((z) => z._id === formData.safeZone);
  const showSafeZoneSelector = formData.mode === 'in-person' || formData.mode === 'both';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        kind: formData.kind,
        category: formData.category,
        creditsPerHour: Number(formData.creditsPerHour),
        mode: formData.mode,
        safeZone: showSafeZoneSelector ? formData.safeZone : null,
      };

      if (isEdit) {
        await skillService.updateSkill(id, payload);
        showToast('success', 'Skill listing updated successfully');
      } else {
        await skillService.createSkill(payload);
        showToast('success', 'Skill listing published to barter board!');
      }
      navigate('/skills');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Error saving skill');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/skills"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-campus-primary transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Skills</span>
        </Link>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <h1 className="text-2xl font-black text-slate-900 mb-1">
            {isEdit ? 'Edit Skill Listing' : 'Post a Skill to the Barter Board'}
          </h1>
          <p className="text-xs text-slate-500 mb-6">
            Offer your knowledge or request peer mentorship using cashless campus credits.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Kind: Offer or Want */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">I Want To</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, kind: 'offer' })}
                  className={`py-3 rounded-2xl text-xs font-bold border transition ${
                    formData.kind === 'offer'
                      ? 'bg-campus-primary text-white border-campus-primary shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  🎓 Offer My Skill (Teach Others)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, kind: 'want' })}
                  className={`py-3 rounded-2xl text-xs font-bold border transition ${
                    formData.kind === 'want'
                      ? 'bg-campus-amber text-campus-dark border-campus-amber shadow-xs font-extrabold'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  🔍 Request a Skill (Learn from Peers)
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Skill Title (3-80 chars)</label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={80}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Node.js & Express Debugging, Figma UI Prototyping..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-campus-teal"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-campus-teal"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Credits per hour */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rate (1-20 Credits/hr)
                </label>
                <div className="relative">
                  <Coins className="w-4 h-4 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    required
                    min={1}
                    max={20}
                    value={formData.creditsPerHour}
                    onChange={(e) => setFormData({ ...formData, creditsPerHour: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-campus-teal font-bold"
                  />
                </div>
              </div>

              {/* Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Session Mode</label>
                <select
                  value={formData.mode}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-campus-teal"
                >
                  <option value="both">Hybrid / Both</option>
                  <option value="in-person">In-Person (Safe Zone)</option>
                  <option value="online">Online Only</option>
                </select>
              </div>
            </div>

            {/* Safe Zone (Only appears when mode is in-person or both) */}
            {showSafeZoneSelector && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Designated Campus Safe Zone (Required for In-Person)
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

                {selectedZoneObj && (
                  <div className="mt-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Safe Zone Map Preview
                    </span>
                    <MapPreview zone={selectedZoneObj} height="160px" />
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description (Up to 500 characters)
              </label>
              <textarea
                rows={3}
                maxLength={500}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What topics will you cover? What prerequisites are required? (e.g. Bring laptop, have VS Code installed)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-campus-teal"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-campus-primary hover:bg-campus-teal text-white font-extrabold text-sm rounded-2xl transition shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : isEdit ? 'Update Skill' : 'Publish Skill Listing'}</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SkillForm;
