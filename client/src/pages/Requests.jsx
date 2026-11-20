import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import requestService from '../services/requestService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Coins,
  Repeat,
  CheckCircle,
  XCircle,
  Clock,
  User as UserIcon,
  MapPin,
  Check,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Requests = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' | 'outgoing'
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await requestService.getMyRequests(activeTab);
      setRequests(data.requests || []);
    } catch (err) {
      showToast('error', 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, [activeTab, showToast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (actionFn, reqId, successMsg) => {
    setActionLoading(reqId);
    try {
      await actionFn(reqId);
      showToast('success', successMsg);
      fetchRequests();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-campus-primary/10 text-campus-primary text-xs font-bold uppercase tracking-wider mb-2">
            <Repeat className="w-3.5 h-3.5" />
            Campus Escrow & Double Confirmation
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Barter Session Requests
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Accept session requests, hold credits safely in escrow, and confirm completion together.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs inline-flex mb-6 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${
              activeTab === 'incoming'
                ? 'bg-campus-primary text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            📥 Incoming (You are Provider)
          </button>
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${
              activeTab === 'outgoing'
                ? 'bg-campus-primary text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            📤 Outgoing (You Requested)
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-campus-teal border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold text-slate-500">Checking barter requests...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && requests.length === 0 && (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-md mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4 text-2xl">
              🤝
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">
              No {activeTab} requests
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              {activeTab === 'incoming'
                ? 'When peers request your offered skills, their requests will appear here.'
                : 'Browse the barter board to request peer mentorship.'}
            </p>
            <Link
              to="/skills"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-campus-primary text-white text-xs font-bold rounded-xl hover:bg-campus-teal transition"
            >
              <span>Explore Skills</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Cards */}
        {!loading && requests.length > 0 && (
          <div className="space-y-4">
            {requests.map((req) => {
              const isLearner = user && req.learner && user._id === req.learner._id;
              const isProvider = user && req.provider && user._id === req.provider._id;
              const otherPerson = isLearner ? req.provider : req.learner;
              const isBusy = actionLoading === req._id;

              return (
                <div
                  key={req._id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  {/* Left Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          req.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : req.status === 'accepted'
                            ? 'bg-sky-100 text-sky-800 border border-sky-300'
                            : req.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {req.status}
                      </span>

                      {/* Role indicator */}
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {isProvider ? 'You: Provider (Earns)' : 'You: Learner (Pays)'}
                      </span>

                      <span className="text-xs text-slate-400">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-black text-slate-900 text-base">
                      {req.skill?.title || 'Skill Listing'}
                    </h3>

                    {/* Counterpart info */}
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="font-semibold">{isProvider ? 'Learner:' : 'Provider:'}</span>
                      <span className="font-bold text-slate-900">{otherPerson?.name}</span>
                      <span className="text-slate-400 font-mono">({otherPerson?.email})</span>
                    </div>

                    {/* Hours and Escrow */}
                    <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-700">
                        ⏱️ {req.hours} {req.hours === 1 ? 'Hour' : 'Hours'}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 font-black text-amber-900 flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                        {req.credits} Credits {req.status === 'accepted' && '(Escrow Held)'}
                      </span>
                      {req.proposedSafeZone && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-campus-teal" />
                          {req.proposedSafeZone.name}
                        </span>
                      )}
                    </div>

                    {req.message && (
                      <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                        "{req.message}"
                      </p>
                    )}

                    {/* Confirmation progress for accepted requests */}
                    {req.status === 'accepted' && (
                      <div className="flex items-center gap-3 text-xs pt-1 font-semibold">
                        <span className={req.learnerConfirmed ? 'text-emerald-700' : 'text-slate-400'}>
                          {req.learnerConfirmed ? '✓ Learner Confirmed' : '○ Learner Pending'}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className={req.providerConfirmed ? 'text-emerald-700' : 'text-slate-400'}>
                          {req.providerConfirmed ? '✓ Provider Confirmed' : '○ Provider Pending'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto shrink-0">
                    {/* Provider & Pending: Accept or Reject */}
                    {isProvider && req.status === 'pending' && (
                      <>
                        <button
                          disabled={isBusy}
                          onClick={() =>
                            handleAction(
                              requestService.acceptRequest,
                              req._id,
                              'Session accepted! Credits held in escrow.'
                            )
                          }
                          className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                        >
                          {isBusy ? 'Processing...' : 'Accept Session'}
                        </button>
                        <button
                          disabled={isBusy}
                          onClick={() =>
                            handleAction(
                              requestService.rejectRequest,
                              req._id,
                              'Session request rejected'
                            )
                          }
                          className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {/* Accepted Status: Confirm Completion */}
                    {req.status === 'accepted' && (
                      <>
                        {((isLearner && !req.learnerConfirmed) ||
                          (isProvider && !req.providerConfirmed)) && (
                          <button
                            disabled={isBusy}
                            onClick={() =>
                              handleAction(
                                requestService.confirmRequest,
                                req._id,
                                'Completion confirmed! Escrow released if both agreed.'
                              )
                            }
                            className="w-full sm:w-auto px-4 py-2 bg-campus-primary hover:bg-campus-teal text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirm Completed</span>
                          </button>
                        )}

                        {((isLearner && req.learnerConfirmed) ||
                          (isProvider && req.providerConfirmed)) && (
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Confirmed by you</span>
                          </span>
                        )}
                      </>
                    )}

                    {/* Either party can cancel if pending or accepted */}
                    {(req.status === 'pending' || req.status === 'accepted') && (
                      <button
                        disabled={isBusy}
                        onClick={() =>
                          handleAction(
                            requestService.cancelRequest,
                            req._id,
                            'Session cancelled (escrow refunded if applicable)'
                          )
                        }
                        className="w-full sm:w-auto px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Requests;
