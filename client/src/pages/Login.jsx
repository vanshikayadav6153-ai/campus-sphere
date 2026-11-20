import React, { useState } from 'react';
import { useSearchParams, Navigate, useNavigate } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API } from '../services/api';

const Login = () => {
  const [searchParams] = useSearchParams();
  const errorParam = searchParams.get('error');
  const { user, loading, devLogin } = useAuth();
  const navigate = useNavigate();

  // State for Dev Test helper
  const [devEmail, setDevEmail] = useState('student@gmail.com');
  const [devName, setDevName] = useState('Vanshika Yadav');
  const [devError, setDevError] = useState('');
  const [isDevLoading, setIsDevLoading] = useState(false);

  // If already authenticated, redirect straight to dashboard
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleDevSubmit = async (e) => {
    e.preventDefault();
    setDevError('');
    setIsDevLoading(true);
    try {
      await devLogin(devEmail, devName);
      navigate('/dashboard');
    } catch (err) {
      setDevError(err.response?.data?.message || err.message || 'Login rejected');
    } finally {
      setIsDevLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-campus-primary text-white flex items-center justify-center mx-auto shadow-md text-2xl font-black mb-4">
          🎓
        </div>
        <h2 className="text-3xl font-black tracking-tight text-slate-900">
          CampusSphere
        </h2>
        <p className="mt-2 text-sm text-slate-600 font-medium">
          A hyper-gated student marketplace & cashless skill-barter network
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200 sm:px-10">
          {/* Domain Error Notice */}
          {errorParam === 'domain' && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold">Access Restricted</p>
                <p className="mt-0.5 text-rose-700 leading-relaxed">
                  Only email addresses ending with <strong className="font-mono bg-rose-100 px-1.5 py-0.5 rounded">@gmail.com</strong> are authorized to enter CampusSphere.
                </p>
              </div>
            </div>
          )}

          {errorParam && errorParam !== 'domain' && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-800">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold">Authentication Notice</p>
                <p className="mt-0.5 text-amber-700">An error occurred during authentication. Please try again.</p>
              </div>
            </div>
          )}

          {/* Institutional Gating Badge */}
          <div className="mb-6 p-3 rounded-xl bg-campus-sand/40 border border-campus-teal/20 flex items-center justify-between text-xs">
            <span className="font-bold text-campus-dark flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-campus-teal" />
              Domain-Gated Access
            </span>
            <span className="font-mono font-semibold px-2 py-0.5 rounded-md bg-white text-campus-primary border border-slate-200">
              @gmail.com
            </span>
          </div>

          {/* Primary Action: Continue with Google */}
          <a
            href={`${API}/api/auth/google`}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-slate-300 rounded-2xl shadow-sm bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm transition hover:shadow-md cursor-pointer group"
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
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform ml-auto" />
          </a>

          {/* First Login Perk Banner */}
          <div className="mt-6 text-center">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-campus-teal bg-campus-teal/10 px-3 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              New users receive 10 starting campus credits automatically!
            </span>
          </div>

          {/* Dev Test Helper (Allows immediate domain gating test even with mock Google client secrets) */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <details className="text-xs">
              <summary className="font-semibold text-slate-500 cursor-pointer hover:text-slate-800 transition">
                🛠️ Quick Dev Domain Tester (Click to expand)
              </summary>
              <form onSubmit={handleDevSubmit} className="mt-3 space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="text-[11px] text-slate-500">
                  Test domain gating without waiting for live Google Console keys:
                </p>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700">Test Email</label>
                  <input
                    type="email"
                    value={devEmail}
                    onChange={(e) => setDevEmail(e.target.value)}
                    placeholder="e.g. user@gmail.com vs user@yahoo.com"
                    className="w-full mt-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700">Display Name</label>
                  <input
                    type="text"
                    value={devName}
                    onChange={(e) => setDevName(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                {devError && (
                  <p className="text-[11px] text-rose-600 font-semibold">{devError}</p>
                )}
                <button
                  type="submit"
                  disabled={isDevLoading}
                  className="w-full py-2 bg-campus-primary hover:bg-campus-teal text-white font-bold rounded-lg transition"
                >
                  {isDevLoading ? 'Verifying Domain...' : 'Simulate Login'}
                </button>
              </form>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
