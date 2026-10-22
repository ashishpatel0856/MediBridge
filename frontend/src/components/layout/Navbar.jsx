import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, LogOut, User, Menu, X, ArrowRight, ShieldCheck, Calendar, Search } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardLink =
    user?.role === 'DOCTOR'
      ? '/doctor/dashboard'
      : user?.role === 'ADMIN'
      ? '/admin/dashboard'
      : '/patient/dashboard';

  return (
    <nav className="sticky top-0 z-40 glass-nav border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center h-10 w-10 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl shadow-xs shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <Stethoscope className="h-5 w-5 text-white stroke-[2.2]" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-slate-900 tracking-tight">Amrutam</span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  Ayurveda
                </span>
              </div>
              <span className="block text-[11px] font-semibold text-emerald-600 tracking-wider uppercase">
                CareConnect
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-7">
            <Link
              to="/"
              className="text-sm font-medium text-slate-600 hover:text-emerald-700 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/patient/doctors"
              className="text-sm font-medium text-slate-600 hover:text-emerald-700 transition-colors flex items-center gap-1.5"
            >
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <span>Find Doctors</span>
            </Link>
            {user?.role === 'PATIENT' && (
              <Link
                to="/patient/appointments"
                className="text-sm font-medium text-slate-600 hover:text-emerald-700 transition-colors flex items-center gap-1.5"
              >
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>My Appointments</span>
              </Link>
            )}
          </div>

          {/* Desktop Auth / User Controls */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to={dashboardLink}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 rounded-xl transition-all border border-emerald-200/70"
                >
                  <User className="h-4 w-4 text-emerald-700" />
                  <span>Dashboard</span>
                </Link>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">
                    {user.email}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : user.role === 'DOCTOR'
                        ? 'bg-teal-100 text-teal-700 border border-teal-200'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-emerald-700 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register/patient"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs shadow-emerald-700/20 transition-all active:scale-[0.98]"
                >
                  <span>Book Consultation</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger toggle */}
          <button
            className="sm:hidden p-2 text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 py-4 flex flex-col gap-3 shadow-lg">
          <Link
            to="/"
            className="text-sm font-medium text-slate-800 py-1.5"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/patient/doctors"
            className="text-sm font-medium text-slate-800 py-1.5"
            onClick={() => setMenuOpen(false)}
          >
            Find Doctors
          </Link>

          {user ? (
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to={dashboardLink}
                className="text-sm font-semibold text-emerald-700 py-1"
                onClick={() => setMenuOpen(false)}
              >
                Go to {user.role} Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-rose-600 text-left font-medium py-1 cursor-pointer"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-700 py-1"
                onClick={() => setMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                to="/register/patient"
                className="text-sm font-semibold text-emerald-700 py-1"
                onClick={() => setMenuOpen(false)}
              >
                Patient Registration
              </Link>
              <Link
                to="/register/doctor"
                className="text-sm font-semibold text-teal-700 py-1"
                onClick={() => setMenuOpen(false)}
              >
                Doctor Practitioner Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
