import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import statsService from '../services/statsService';
import itemService from '../services/itemService';
import skillService from '../services/skillService';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import {
  Coins,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  Package,
  Repeat,
  Plus,
  MapPin,
  Sparkles,
  Edit3,
  Trash2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState(null);
  const [myItems, setMyItems] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [activeTab, setActiveTab] = useState('items'); // 'items' | 'skills'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsData, itemsData, skillsData] = await Promise.all([
          statsService.getMyStats(),
          itemService.getMyItems(),
          skillService.getMySkills(),
        ]);
        setStats(statsData.stats);
        setMyItems(itemsData.items || []);
        setMySkills(skillsData.skills || []);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleItemStatusChange = async (itemId, newStatus) => {
    try {
      const data = await itemService.updateItemStatus(itemId, newStatus);
      setMyItems((prev) =>
        prev.map((item) => (item._id === itemId ? data.item : item))
      );
      showToast('success', `Item marked as ${newStatus.toUpperCase()}`);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Delete this gear listing?')) return;
    try {
      await itemService.deleteItem(itemId);
      setMyItems((prev) => prev.filter((item) => item._id !== itemId));
      showToast('success', 'Listing deleted');
    } catch (err) {
      showToast('error', 'Failed to delete listing');
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Delete this skill listing?')) return;
    try {
      await skillService.deleteSkill(skillId);
      setMySkills((prev) => prev.filter((s) => s._id !== skillId));
      showToast('success', 'Skill listing removed');
    } catch (err) {
      showToast('error', 'Failed to delete skill');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Greeting & Pending Alert */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-campus-teal uppercase tracking-wider block mb-1">
              Student Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage your balance, pending barter requests, and campus listings.
            </p>
          </div>

          {/* Pending Requests Alert */}
          {stats?.pendingIncomingRequests > 0 && (
            <Link
              to="/requests"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs transition shadow-xs animate-bounce"
            >
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>{stats.pendingIncomingRequests} Pending Barter Requests</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          )}
        </div>

        {/* Balance Cards: Available / On Hold */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Available Credits */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Available Credits
            </span>
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-amber-500 fill-amber-500" />
              <span className="text-3xl font-black text-slate-900">{user?.credits ?? 10}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Ready for peer barter</p>
          </div>

          {/* On Hold in Escrow */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Credits in Escrow Hold
            </span>
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-sky-500" />
              <span className="text-3xl font-black text-slate-900">{user?.heldCredits ?? 0}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Locked until session confirmation</p>
          </div>

          {/* Lifetime Earned */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Lifetime Earned
            </span>
            <div className="flex items-center gap-2 text-emerald-600">
              <ArrowDownLeft className="w-6 h-6" />
              <span className="text-3xl font-black">+{stats?.creditsEarned || 0}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">{stats?.hoursTaught || 0} hrs taught</p>
          </div>

          {/* Lifetime Spent */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Lifetime Spent
            </span>
            <div className="flex items-center gap-2 text-slate-700">
              <ArrowUpRight className="w-6 h-6 text-slate-400" />
              <span className="text-3xl font-black">-{stats?.creditsSpent || 0}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">{stats?.hoursLearned || 0} hrs learned</p>
          </div>
        </div>

        {/* Quick Actions Strip */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs mb-8 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-700 ml-2">Quick Actions:</span>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/marketplace/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-campus-primary hover:bg-campus-teal text-white text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>List Gear</span>
            </Link>
            <Link
              to="/skills/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-campus-teal hover:bg-campus-primary text-white text-xs font-bold transition shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Offer Skill</span>
            </Link>
            <Link
              to="/map"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Campus Map</span>
            </Link>
            <Link
              to="/ledger"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Audit Ledger</span>
            </Link>
          </div>
        </div>

        {/* My Listings Section (Tabs: Gear vs Skills) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('items')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  activeTab === 'items'
                    ? 'bg-campus-primary text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                📦 My Gear Listings ({myItems.length})
              </button>
              <button
                onClick={() => setActiveTab('skills')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  activeTab === 'skills'
                    ? 'bg-campus-primary text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                ⚡ My Skills ({mySkills.length})
              </button>
            </div>

            <Link
              to={activeTab === 'items' ? '/marketplace/create' : '/skills/create'}
              className="text-xs font-bold text-campus-teal hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New {activeTab === 'items' ? 'Item' : 'Skill'}</span>
            </Link>
          </div>

          {/* Items Content */}
          {activeTab === 'items' && (
            <div>
              {myItems.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  You haven't listed any gear yet.{' '}
                  <Link to="/marketplace/create" className="text-campus-teal underline font-bold">
                    List an item now
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {myItems.map((item) => (
                    <div
                      key={item._id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 p-2 rounded-xl transition"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              item.status === 'available'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'reserved'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {item.status}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {item.type}
                          </span>
                        </div>
                        <Link
                          to={`/marketplace/${item._id}`}
                          className="font-bold text-sm text-slate-900 hover:text-campus-primary transition"
                        >
                          {item.title}
                        </Link>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          {item.type === 'rent' ? `₹${item.rentPerDay}/day` : `₹${item.price}`} ·{' '}
                          {item.safeZone?.name || 'Safe Zone'}
                        </p>
                      </div>

                      {/* Status Dropdown Control */}
                      <div className="flex items-center gap-2">
                        <select
                          value={item.status}
                          onChange={(e) => handleItemStatusChange(item._id, e.target.value)}
                          className="py-1.5 px-2.5 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                        >
                          <option value="available">Available</option>
                          <option value="reserved">Reserved</option>
                          <option value="sold">Sold</option>
                        </select>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Skills Content */}
          {activeTab === 'skills' && (
            <div>
              {mySkills.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  You haven't listed any skills yet.{' '}
                  <Link to="/skills/create" className="text-campus-teal underline font-bold">
                    Offer a skill now
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {mySkills.map((s) => (
                    <div
                      key={s._id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 p-2 rounded-xl transition"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              s.kind === 'offer'
                                ? 'bg-campus-primary/10 text-campus-primary'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {s.kind === 'offer' ? 'Offering' : 'Seeking'}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {s.mode}
                          </span>
                        </div>
                        <Link
                          to={`/skills/${s._id}`}
                          className="font-bold text-sm text-slate-900 hover:text-campus-primary transition"
                        >
                          {s.title}
                        </Link>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          {s.creditsPerHour} Credits/hr · {s.safeZone?.name || 'Online'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/skills/${s._id}/edit`}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition"
                          title="Edit Skill"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteSkill(s._id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Skill"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
