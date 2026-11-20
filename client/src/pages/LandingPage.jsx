import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import statsService from '../services/statsService';
import { API } from '../services/api';
import {
  ShieldAlert,
  Trash2,
  Lock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Repeat,
  Package,
  Clock,
  Coins,
  MapPin,
  Users,
} from 'lucide-react';

// Count-up helper hook for live numbers animation
function useCountUp(endVal, duration = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;
    const end = Number(endVal) || 0;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [endVal, duration]);

  return count;
}

function StatItem({ icon: Icon, value, label, suffix = '' }) {
  const animatedValue = useCountUp(value);
  return (
    <div className="text-center p-4">
      <div className="w-10 h-10 rounded-2xl bg-white/10 text-campus-sand flex items-center justify-center mx-auto mb-2 border border-white/15">
        <Icon className="w-5 h-5 text-campus-amber" />
      </div>
      <div className="text-2xl sm:text-3xl font-black text-white">
        {animatedValue}
        {suffix}
      </div>
      <div className="text-[11px] font-bold text-slate-300 mt-0.5">{label}</div>
    </div>
  );
}

const LandingPage = () => {
  const { user, loading } = useAuth();
  const [publicStats, setPublicStats] = useState({
    totalStudents: 0,
    activeItems: 0,
    activeSkills: 0,
    completedSessions: 0,
    mentoringHours: 0,
    creditsExchanged: 0,
    itemsReused: 0,
  });

  useEffect(() => {
    statsService
      .getPublicStats()
      .then((data) => {
        if (data?.stats) setPublicStats(data.stats);
      })
      .catch((err) => console.warn('Could not load public stats:', err));
  }, []);

  // Redirect logged-in users straight to /dashboard
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-campus-primary text-white flex items-center justify-center font-black text-lg shadow-xs">
              🎓
            </div>
            <div>
              <span className="font-extrabold text-lg text-campus-primary tracking-tight">
                CampusSphere
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-campus-sand text-campus-dark border border-campus-teal/20">
                Institutional Gated
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition"
            >
              Sign In
            </Link>
            <a
              href={`${API}/api/auth/google`}
              className="px-4 py-2 bg-campus-primary hover:bg-campus-teal text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-campus-dark via-campus-primary to-campus-teal text-white py-20 lg:py-28 px-4">
        <div className="relative max-w-4xl mx-auto text-center z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold mb-6 border border-white/20">
            <span className="w-2 h-2 bg-campus-amber rounded-full animate-pulse" />
            <span>ALPHA CODERS · CAMPUS INFRASTRUCTURE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight mb-6">
            One Campus. <br />
            <span className="text-campus-sand">Trusted Exchange.</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-200 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            A hyper-gated student marketplace & cashless skill-barter network.
            Buy, rent, and reuse hostel utilities, trade skills with campus credits, and exchange safely in verified campus safe zones.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`${API}/api/auth/google`}
              className="w-full sm:w-auto px-8 py-4 bg-campus-amber hover:bg-campus-rust text-campus-dark hover:text-white font-black text-sm rounded-2xl transition shadow-xl flex items-center justify-center gap-3 cursor-pointer group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
              <ArrowRight className="w-4 h-4 text-campus-dark group-hover:translate-x-1 transition" />
            </a>

            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-4 border border-white/30 text-white font-bold text-sm rounded-2xl hover:bg-white/10 transition text-center"
            >
              Sign In via Institutional Email
            </Link>
          </div>

          <p className="mt-4 text-[11px] text-slate-300">
            🎁 All verified student accounts receive 10 welcome Campus Credits automatically.
          </p>
        </div>
      </section>

      {/* Live Impact Stats Strip */}
      <section className="bg-campus-dark py-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          <StatItem icon={Users} value={publicStats.totalStudents} label="Students Joined" />
          <StatItem icon={Package} value={publicStats.activeItems} label="Active Gear" />
          <StatItem icon={Sparkles} value={publicStats.activeSkills} label="Skills Offered" />
          <StatItem icon={Repeat} value={publicStats.completedSessions} label="Completed Barters" />
          <StatItem icon={Clock} value={publicStats.mentoringHours} label="Hours Mentored" suffix="h" />
          <StatItem icon={Coins} value={publicStats.creditsExchanged} label="Credits Traded" />
          <StatItem icon={CheckCircle2} value={publicStats.itemsReused} label="Items Reused" />
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-black uppercase text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            The Problem
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 mb-2">
            Campus life has a trust, waste, and access problem
          </h2>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto">
            The value already exists on campus. The current systems make it hard to find, verify, and exchange.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-5">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg mb-2">Trust Gap</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Public marketplaces bring unknown sellers, scam risks, and unsafe off-campus handovers.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg mb-2">Usable Waste</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Graduating students discard irons, cookers, textbooks, and hostel utilities every semester.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg mb-2">Blocked Access</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              High tutoring costs limit peer learning, even when expertise already exists right across the hall.
            </p>
          </div>
        </div>
      </section>

      {/* 3-Step How-It-Works */}
      <section className="bg-slate-100/70 py-20 px-4 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-black uppercase text-campus-teal bg-campus-teal/10 px-3 py-1 rounded-full border border-campus-teal/20">
              The User Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 mb-2">
              From verified signup to safe handover in three steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs text-center relative">
              <div className="w-10 h-10 rounded-full bg-campus-primary text-white font-black text-sm flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="font-extrabold text-slate-900 text-base mb-1">Sign Up</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sign up securely with your verified college email. Instant 10 starting campus credits allocated.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs text-center relative">
              <div className="w-10 h-10 rounded-full bg-campus-teal text-white font-black text-sm flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="font-extrabold text-slate-900 text-base mb-1">List an Offer</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                List an item for rent or sale, or post a skill to teach or learn with custom credits per hour.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs text-center relative">
              <div className="w-10 h-10 rounded-full bg-campus-amber text-campus-dark font-black text-sm flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="font-extrabold text-slate-900 text-base mb-1">Match & Exchange</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Match quickly, settle with escrow credit holds, and fulfill physical exchanges inside guarded safe zones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 px-4 border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-campus-primary text-white flex items-center justify-center font-bold text-sm">
              🎓
            </div>
            <span className="font-black text-sm text-campus-primary">CampusSphere</span>
          </div>

          <p className="text-xs font-bold text-slate-500">
            Connecting Campuses, Empowering Students.
          </p>

          <span className="text-[11px] text-slate-400">
            Alpha Coders · Built for Indian College Ecosystems
          </span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
