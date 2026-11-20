import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import skillService from '../services/skillService';
import {
  Search,
  Filter,
  Plus,
  Coins,
  MapPin,
  Globe,
  Radio,
  BookOpen,
  Code,
  Palette,
  GraduationCap,
  Music,
  Languages,
  Briefcase,
  Layers,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Categories', icon: Layers },
  { id: 'programming', label: 'Programming', icon: Code },
  { id: 'design', label: 'Design & UI/UX', icon: Palette },
  { id: 'academics', label: 'Academics', icon: GraduationCap },
  { id: 'music', label: 'Music & Arts', icon: Music },
  { id: 'languages', label: 'Languages', icon: Languages },
  { id: 'career', label: 'Career Prep', icon: Briefcase },
  { id: 'other', label: 'Other Skills', icon: BookOpen },
];

const MODES = [
  { id: 'all', label: 'All Modes' },
  { id: 'in-person', label: 'In-Person (Safe Zone)' },
  { id: 'online', label: 'Online' },
  { id: 'both', label: 'Hybrid / Both' },
];

const Skills = () => {
  const [activeKind, setActiveKind] = useState('offer'); // 'offer' | 'want'
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMode, setSelectedMode] = useState('all');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSkills, setTotalSkills] = useState(0);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        kind: activeKind,
        page,
        limit: 9,
      };
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedMode !== 'all') params.mode = selectedMode;

      const data = await skillService.getSkills(params);
      setSkills(data.skills || []);
      setTotalPages(data.pages || 1);
      setTotalSkills(data.total || 0);
    } catch (err) {
      console.error('Error fetching skills:', err);
      setError('Unable to load skills. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [activeKind, page, searchQuery, selectedCategory, selectedMode]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handleTabChange = (kind) => {
    setActiveKind(kind);
    setPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSkills();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header / Intro Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-campus-teal/10 text-campus-teal text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Cashless Peer Skill Exchange
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Campus Skill Barter
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Exchange your skills for peer mentorship without spending cash. One hour of Node.js help for a UI/UX resume review!
            </p>
          </div>

          <Link
            to="/skills/create"
            className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-3 bg-campus-primary hover:bg-campus-teal text-white text-sm font-bold rounded-2xl shadow-sm hover:shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Post a Skill</span>
          </Link>
        </div>

        {/* Tab Toggle: Offering vs Looking for */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs inline-flex mb-6 w-full sm:w-auto">
          <button
            onClick={() => handleTabChange('offer')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${
              activeKind === 'offer'
                ? 'bg-campus-primary text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            🎓 Skills Offered by Students
          </button>
          <button
            onClick={() => handleTabChange('want')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${
              activeKind === 'want'
                ? 'bg-campus-amber text-campus-dark shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            🔍 Skills Students Want to Learn
          </button>
        </div>

        {/* Search & Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills (e.g. React, Python, Figma, Spanish, Calculus)..."
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

            {/* Mode Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedMode}
                onChange={(e) => {
                  setSelectedMode(e.target.value);
                  setPage(1);
                }}
                className="w-full py-2.5 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-campus-teal transition font-medium text-slate-700"
              >
                {MODES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Listings Count & Active Filters Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
          <span>
            Found <strong className="text-slate-800">{totalSkills}</strong> {activeKind === 'offer' ? 'skill offerings' : 'skill requests'}
          </span>
          {(searchQuery || selectedCategory !== 'all' || selectedMode !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedMode('all');
                setPage(1);
              }}
              className="text-campus-teal hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-campus-teal border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold text-slate-500">Searching campus skill network...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl text-center text-sm">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && skills.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4 text-2xl">
              🎯
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              No skills found in this view
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Be the first student to post a skill {activeKind === 'offer' ? 'you can teach' : 'you want to learn'}!
            </p>
            <Link
              to="/skills/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-campus-primary text-white text-xs font-bold rounded-xl hover:bg-campus-teal transition"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Skill</span>
            </Link>
          </div>
        )}

        {/* Skills Card Grid */}
        {!loading && !error && skills.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill) => (
              <Link
                key={skill._id}
                to={`/skills/${skill._id}`}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md hover:border-campus-teal/50 transition flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header: Category & Mode Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {skill.category}
                    </span>

                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        skill.mode === 'in-person'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : skill.mode === 'online'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-purple-50 text-purple-800 border border-purple-200'
                      }`}
                    >
                      {skill.mode === 'in-person' && <MapPin className="w-2.5 h-2.5" />}
                      {skill.mode === 'online' && <Globe className="w-2.5 h-2.5" />}
                      {skill.mode === 'both' && <Radio className="w-2.5 h-2.5" />}
                      {skill.mode === 'both' ? 'Hybrid' : skill.mode}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-black text-slate-900 text-lg group-hover:text-campus-primary transition mb-2 line-clamp-1">
                    {skill.title}
                  </h3>

                  {/* Description preview */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {skill.description || 'No additional description provided.'}
                  </p>

                  {/* Safe Zone indicator if in-person */}
                  {skill.safeZone && (
                    <div className="mb-4 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
                      <MapPin className="w-3.5 h-3.5 text-campus-teal shrink-0" />
                      <span className="truncate">{skill.safeZone.name}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer: Owner & Credits Per Hour */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    {skill.owner?.avatar ? (
                      <img
                        src={skill.owner.avatar}
                        alt={skill.owner.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                        {skill.owner?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">
                      {skill.owner?.name || 'Anonymous Student'}
                    </span>
                  </div>

                  {/* Credits Rate Badge */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-black text-xs">
                    <Coins className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                    <span>{skill.creditsPerHour}</span>
                    <span className="text-[10px] font-semibold text-amber-700">cr/hr</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
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

export default Skills;
