import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-20 h-20 rounded-3xl bg-campus-primary/10 text-campus-primary flex items-center justify-center mx-auto mb-6">
        <Compass className="w-10 h-10 animate-spin-slow" />
      </div>

      <span className="text-xs font-mono font-bold text-campus-teal bg-campus-teal/10 px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
        404 — Page Not Found
      </span>

      <h1 className="text-3xl font-black text-slate-900 mb-2">
        You've wandered off campus!
      </h1>

      <p className="text-xs text-slate-600 max-w-sm mb-8 leading-relaxed">
        The page you are looking for does not exist or has been relocated to another campus safe zone.
      </p>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-campus-primary text-white text-xs font-bold rounded-xl hover:bg-campus-teal transition shadow-sm"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          to="/map"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition"
        >
          <span>View Campus Map</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
