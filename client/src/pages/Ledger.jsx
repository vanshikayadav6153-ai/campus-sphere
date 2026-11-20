import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import ledgerService from '../services/ledgerService';
import { useAuth } from '../context/AuthContext';
import {
  Coins,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Gift,
  RotateCcw,
  Clock,
} from 'lucide-react';

const Ledger = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTx, setTotalTx] = useState(0);

  const fetchLedger = useCallback(async () => {
    setLoading(true);
    try {
      const [txData, sumData] = await Promise.all([
        ledgerService.getMyLedger(page, 10),
        ledgerService.getSummary(),
      ]);
      setTransactions(txData.transactions || []);
      setTotalPages(txData.pages || 1);
      setTotalTx(txData.total || 0);
      setSummary(sumData.summary || null);
    } catch (err) {
      console.error('Error loading ledger:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const getTypeBadge = (type) => {
    switch (type) {
      case 'signup_bonus':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            <Gift className="w-3 h-3" /> Welcome Bonus
          </span>
        );
      case 'escrow_hold':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" /> Escrow Held
          </span>
        );
      case 'escrow_release_in':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            <ArrowDownLeft className="w-3 h-3" /> Payment Received
          </span>
        );
      case 'escrow_release_out':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
            <ArrowUpRight className="w-3 h-3" /> Payment Released
          </span>
        );
      case 'refund':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
            <RotateCcw className="w-3 h-3" /> Escrow Refund
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-campus-primary/10 text-campus-primary text-xs font-bold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5" />
            Audit Ledger & Campus Credits
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Transaction Ledger
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Tamper-resistant audit log tracking every credit hold, transfer, and peer settlement.
          </p>
        </div>

        {/* Summary Balance Cards */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Available Credits
              </span>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="text-2xl font-black text-slate-900">{summary.credits}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Credits in Escrow
              </span>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-500" />
                <span className="text-2xl font-black text-slate-900">{summary.heldCredits}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Lifetime Earned
              </span>
              <div className="flex items-center gap-2 text-emerald-600">
                <ArrowDownLeft className="w-5 h-5" />
                <span className="text-2xl font-black">+{summary.totalEarned}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Lifetime Spent
              </span>
              <div className="flex items-center gap-2 text-slate-700">
                <ArrowUpRight className="w-5 h-5 text-slate-400" />
                <span className="text-2xl font-black">-{summary.totalSpent}</span>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">Recent Transactions ({totalTx})</h3>
            <span className="text-xs text-slate-400">All transactions verified atomically</span>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-3 border-campus-teal border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs text-slate-500">Loading ledger records...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No transactions recorded in ledger yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Details / Note</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3 text-right">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {transactions.map((tx) => {
                    const isPositive = tx.amount > 0;
                    return (
                      <tr key={tx._id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {getTypeBadge(tx.type)}
                        </td>
                        <td className="px-5 py-3.5 text-slate-700 max-w-xs truncate">
                          {tx.note || (tx.request?.skill?.title ? `Session for: ${tx.request.skill.title}` : '—')}
                        </td>
                        <td className={`px-5 py-3.5 text-right font-black whitespace-nowrap ${
                          isPositive ? 'text-emerald-600' : 'text-slate-800'
                        }`}>
                          {isPositive ? `+${tx.amount}` : tx.amount} cr
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold text-slate-500 whitespace-nowrap">
                          {tx.balanceAfter} cr
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Ledger;
