import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Coins,
  LogOut,
  ShoppingBag,
  Sparkles,
  Repeat,
  FileText,
  MapPin,
  Menu,
  X,
  Plus,
  LayoutDashboard,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { to: '/skills', label: 'Skills', icon: Sparkles },
    { to: '/requests', label: 'Requests', icon: Repeat, authOnly: true },
    { to: '/ledger', label: 'Ledger', icon: FileText, authOnly: true },
    { to: '/map', label: 'Map', icon: MapPin },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, authOnly: true },
  ];

  const visibleLinks = navLinks.filter((link) => !link.authOnly || Boolean(user));

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-campus-primary text-white flex items-center justify-center font-black text-lg shadow-xs">
              🎓
            </div>
            <div>
              <span className="font-extrabold text-lg text-campus-primary tracking-tight">
                CampusSphere
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    isActive(link.to)
                      ? 'bg-campus-primary/10 text-campus-primary'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Credits Badge */}
              <Link
                to="/ledger"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 shadow-xs hover:bg-amber-100/70 transition"
                title={`${user.credits} available credits, ${user.heldCredits || 0} in escrow hold`}
              >
                <Coins className="w-4 h-4 text-amber-600 fill-amber-500" />
                <span className="text-xs font-black">{user.credits ?? 10}</span>
                {user.heldCredits > 0 && (
                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-200/60 px-1 rounded-sm">
                    +{user.heldCredits} hold
                  </span>
                )}
                <span className="text-[10px] text-amber-700 font-semibold hidden sm:inline">Credits</span>
              </Link>

              {/* User Avatar & Logout (Desktop) */}
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link to="/dashboard" className="flex items-center gap-2 group">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-300 group-hover:border-campus-teal transition"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-700 hidden xl:inline group-hover:text-campus-primary transition">
                    {user.name?.split(' ')[0]}
                  </span>
                </Link>

                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 bg-campus-primary hover:bg-campus-teal text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-150">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive(link.to)
                    ? 'bg-campus-primary text-white'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {user && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-900">{user.name}</p>
                  <p className="text-[10px] text-slate-500">{user.email}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
