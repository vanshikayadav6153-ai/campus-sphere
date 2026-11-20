import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import skillService from '../services/skillService';
import requestService from '../services/requestService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import MapPreview from '../components/MapPreview';
import {
  Coins,
  MapPin,
  Globe,
  Radio,
  ArrowLeft,
  Edit3,
  Trash2,
  ShieldCheck,
  Clock,
  Send,
  X,
  AlertCircle,
} from 'lucide-react';

const SkillDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [skill, setSkill] = useState(null);
  const [safeZones, setSafeZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Request Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [hours, setHours] = useState(1);
  const [message, setMessage] = useState('');
  const [proposedSafeZone, setProposedSafeZone] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    const fetchSkillAndZones = async () => {
      setLoading(true);
      setError('');
      try {
        const [skillData, zoneData] = await Promise.all([
          skillService.getSkillById(id),
          skillService.getSafeZones(),
        ]);
        setSkill(skillData.skill);
        const zones = zoneData.safeZones || [];
        setSafeZones(zones);
        if (skillData.skill?.safeZone?._id) {
          setProposedSafeZone(skillData.skill.safeZone._id);
        } else if (zones.length > 0) {
          setProposedSafeZone(zones[0]._id);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Skill not found');
      } finally {
        setLoading(false);
      }
    };
    fetchSkillAndZones();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this skill listing?')) return;
    try {
      await skillService.deleteSkill(id);
      showToast('success', 'Skill listing deleted');
      navigate('/skills');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete skill');
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setSubmittingRequest(true);
    try {
      await requestService.createRequest({
        skillId: skill._id,
        hours: Number(hours),
        message: message.trim(),
        proposedSafeZone: proposedSafeZone || undefined,
      });
      showToast('success', 'Barter session request sent to peer!');
      setShowRequestModal(false);
      navigate('/requests');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to send request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const isOwner = user && skill && skill.owner && (user._id === skill.owner._id || user._id === skill.owner);
  const liveCost = skill ? skill.creditsPerHour * hours : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/skills"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-campus-primary transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Skills</span>
        </Link>

        {loading && (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-campus-teal border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold text-slate-500">Loading skill details...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-8 rounded-3xl text-center">
            <p className="font-bold text-sm mb-1">Notice</p>
            <p className="text-xs">{error}</p>
          </div>
        )}

        {!loading && !error && skill && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                        skill.kind === 'offer'
                          ? 'bg-campus-primary/10 text-campus-primary border border-campus-primary/20'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {skill.kind === 'offer' ? '🎓 Offering Skill' : '🔍 Seeking Skill'}
                    </span>

                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {skill.category}
                    </span>

                    <span
                      className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 ${
                        skill.mode === 'in-person'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : skill.mode === 'online'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-purple-50 text-purple-800 border border-purple-200'
                      }`}
                    >
                      {skill.mode === 'in-person' && <MapPin className="w-3 h-3" />}
                      {skill.mode === 'online' && <Globe className="w-3 h-3" />}
                      {skill.mode === 'both' && <Radio className="w-3 h-3" />}
                      {skill.mode === 'both' ? 'Hybrid / Both' : skill.mode}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                    {skill.title}
                  </h1>
                </div>

                {/* Rate Card */}
                <div className="self-start bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col items-end">
                  <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">Session Rate</span>
                  <div className="flex items-center gap-1.5 text-2xl font-black text-amber-900">
                    <Coins className="w-6 h-6 text-amber-600 fill-amber-500" />
                    <span>{skill.creditsPerHour}</span>
                    <span className="text-xs font-bold text-amber-700">Credits/hr</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Description</h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {skill.description || 'No detailed description provided by the student.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* When User is NOT the owner: Request Session */}
                {!isOwner ? (
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="w-full sm:w-auto px-8 py-3.5 bg-campus-primary hover:bg-campus-teal text-white font-extrabold text-sm rounded-2xl transition shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Request Barter Session ({skill.creditsPerHour} cr/hr)</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link
                      to={`/skills/${skill._id}/edit`}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Skill</span>
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Skill</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Designated Safe Zone with Map Preview */}
            {skill.safeZone && (
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 mb-3 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-campus-teal" />
                  <span>Designated Campus Safe Zone for this Skill</span>
                </h3>
                <MapPreview zone={skill.safeZone} height="220px" />
              </div>
            )}
          </div>
        )}

        {/* Request Session Modal */}
        {showRequestModal && skill && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl relative">
              <button
                onClick={() => setShowRequestModal(false)}
                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🤝</span>
                <h3 className="font-black text-slate-900 text-lg">Request Barter Session</h3>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Connect with {skill.owner?.name} for "{skill.title}"
              </p>

              <form onSubmit={handleSendRequest} className="space-y-4">
                {/* Hours Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Session Duration (Hours)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHours(h)}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                          hours === h
                            ? 'bg-campus-primary text-white border-campus-primary shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {h} {h === 1 ? 'hr' : 'hrs'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Cost Computation */}
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">Total Escrow Cost:</span>
                  <div className="flex items-center gap-1.5 text-base font-black text-amber-900">
                    <Coins className="w-4 h-4 text-amber-600 fill-amber-500" />
                    <span>{liveCost} Credits</span>
                    <span className="text-[10px] text-amber-700 font-semibold">
                      ({hours}h × {skill.creditsPerHour}cr)
                    </span>
                  </div>
                </div>

                {/* Proposed Safe Zone */}
                {skill.mode !== 'online' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Proposed Meetup Safe Zone
                    </label>
                    <select
                      value={proposedSafeZone}
                      onChange={(e) => setProposedSafeZone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-medium"
                    >
                      {safeZones.map((z) => (
                        <option key={z._id} value={z._id}>
                          {z.icon || '📍'} {z.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Note for Peer (Optional, max 300 chars)
                  </label>
                  <textarea
                    rows={2}
                    maxLength={300}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Suggest a date, time, or specific topics you want to cover..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRequest}
                    className="flex-1 py-3 rounded-xl bg-campus-primary hover:bg-campus-teal text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingRequest ? 'Sending...' : 'Send Request'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SkillDetail;
