import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Stethoscope,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Lock,
  Mail,
  CheckCircle2
} from 'lucide-react';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Card from '../../components/common/Card';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(form);
      if (result.requiresMfa) {
        navigate('/mfa/verify', { state: { mfaTempToken: result.mfaTempToken } });
        return;
      }
      const role = result.user.role;
      const dest =
        from ||
        (role === 'DOCTOR'
          ? '/doctor/dashboard'
          : role === 'ADMIN'
          ? '/admin/dashboard'
          : '/patient/dashboard');
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-between">
      {/* Top Header with Logo & Back to Home */}
      <header className="w-full border-b border-stone-200/70 bg-white/90 backdrop-blur-md px-4 sm:px-8 py-3.5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center h-10 w-10 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl shadow-xs shadow-emerald-950/20 group-hover:scale-105 transition-transform">
              <Stethoscope className="h-5 w-5 text-white stroke-[2.2]" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-stone-900 tracking-tight">Amrutam</span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  Ayurveda
                </span>
              </div>
              <span className="block text-xs font-semibold text-emerald-700 tracking-wider uppercase">
                CareConnect
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-stone-700 hover:text-emerald-800 hover:bg-emerald-50/80 rounded-xl transition-all border border-stone-200/60"
          >
            <ArrowLeft className="h-4 w-4 text-emerald-700" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Visual Welcome & Highlights (hidden on small mobile, visible on desktop) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col gap-6 pr-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-200/70 text-emerald-900 text-xs font-semibold w-fit">
              <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
              <span>Secure Telemedicine Portal</span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
                Welcome back to your <span className="text-emerald-700">healing sanctuary</span>
              </h1>
              <p className="text-sm text-stone-600 mt-2.5 leading-relaxed">
                Log in to consult with verified Ayurvedic specialists, review prescriptions, and manage appointments seamlessly.
              </p>
            </div>

            <div className="flex flex-col gap-3.5 pt-2">
              <div className="flex items-start gap-3 p-3.5 bg-white rounded-2xl border border-stone-200/80 shadow-2xs">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700 shrink-0">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Protected Clinical Records</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">End-to-end encrypted health data and tamper-evident signatures.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-white rounded-2xl border border-stone-200/80 shadow-2xs">
                <div className="p-2 bg-teal-50 rounded-xl text-teal-700 shrink-0">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Verified Practitioners</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">Board-certified doctors with validated Ayurvedic credentials.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Polished Login Card */}
          <div className="w-full lg:col-span-6 max-w-md mx-auto">
            <Card className="p-6 sm:p-8 border-stone-200/90 shadow-xl bg-white">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Sign in</h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Enter your credentials to access your account
                </p>
              </div>

              {error && <Alert variant="error" className="mb-5">{error}</Alert>}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
                {/* Email Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-stone-700 tracking-wide uppercase">
                    Email address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 h-4 w-4 text-stone-400 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 border border-stone-300 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white placeholder-stone-400"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-700 tracking-wide uppercase">
                      Password
                    </label>
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 h-4 w-4 text-stone-400 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                      className="w-full pl-10 pr-10 py-2.5 border border-stone-300 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white placeholder-stone-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="w-full mt-2 font-semibold justify-center"
                >
                  {loading ? 'Signing in…' : 'Sign in to Account'}
                </Button>
              </form>

              {/* Navigation links */}
              <div className="mt-6 pt-5 border-t border-stone-100 flex flex-col gap-2.5 text-center text-xs sm:text-sm text-stone-600">
                <p>
                  New patient?{' '}
                  <Link
                    to="/register/patient"
                    className="font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    Create an account
                  </Link>
                </p>
                <p>
                  Are you an Ayurvedic practitioner?{' '}
                  <Link
                    to="/register/doctor"
                    className="font-bold text-teal-700 hover:text-teal-800 transition-colors"
                  >
                    Register as doctor
                  </Link>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="w-full text-center py-4 text-xs text-stone-400 border-t border-stone-200/50 bg-white/50">
        © {new Date().getFullYear()} Amrutam CareConnect. All rights reserved.
      </footer>
    </div>
  );
}
