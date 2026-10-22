import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth.service';
import {
  Stethoscope,
  User,
  ArrowLeft,
  Mail,
  Lock,
  Phone,
  FileBadge,
  Clock,
  IndianRupee,
  Plus,
  Trash2,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

const SPECIALTIES = [
  'Ayurveda',
  'Panchakarma',
  'Digestive Health',
  'Skin & Hair',
  'Arthritis & Joint Care',
  'Stress & Mind',
  'General Medicine',
  'Yoga & Naturopathy',
  'Dermatology',
  'Lifestyle Disorders'
];

export default function Register({ initialType = 'patient' }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role');

  const [role, setRole] = useState(roleFromUrl || initialType);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [doctorSubmitted, setDoctorSubmitted] = useState(null);

  // Patient form state
  const [patientForm, setPatientForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    gender: 'OTHER'
  });

  // Doctor form state
  const [doctorForm, setDoctorForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    licenseNumber: '',
    specialties: ['Ayurveda'],
    qualifications: ['BAMS'],
    experienceYears: '5',
    consultationFee: '500',
    bio: ''
  });

  useEffect(() => {
    if (roleFromUrl && (roleFromUrl === 'patient' || roleFromUrl === 'doctor')) {
      setRole(roleFromUrl);
    }
  }, [roleFromUrl]);

  // Patient field handlers
  const handlePatientChange = (field) => (e) => {
    setPatientForm({ ...patientForm, [field]: e.target.value });
  };

  // Doctor field handlers
  const handleDoctorChange = (field) => (e) => {
    setDoctorForm({ ...doctorForm, [field]: e.target.value });
  };

  const toggleSpecialty = (specialty) => {
    setDoctorForm((prev) => {
      const exists = prev.specialties.includes(specialty);
      if (exists) {
        if (prev.specialties.length === 1) return prev; // Keep at least one
        return { ...prev, specialties: prev.specialties.filter((s) => s !== specialty) };
      }
      return { ...prev, specialties: [...prev.specialties, specialty] };
    });
  };

  const handleQualificationChange = (index, value) => {
    const updated = [...doctorForm.qualifications];
    updated[index] = value;
    setDoctorForm({ ...doctorForm, qualifications: updated });
  };

  const addQualification = () => {
    setDoctorForm({
      ...doctorForm,
      qualifications: [...doctorForm.qualifications, '']
    });
  };

  const removeQualification = (index) => {
    if (doctorForm.qualifications.length === 1) return;
    setDoctorForm({
      ...doctorForm,
      qualifications: doctorForm.qualifications.filter((_, idx) => idx !== index)
    });
  };

  // Submit Patient Registration
  const handleSubmitPatient = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        firstName: patientForm.firstName.trim(),
        lastName: patientForm.lastName.trim(),
        email: patientForm.email.trim().toLowerCase(),
        password: patientForm.password,
        phone: patientForm.phone.trim() || undefined
      };

      const { data } = await authService.registerPatient(payload);
      const { accessToken, refreshToken } = data.data;

      sessionStorage.setItem('accessToken', accessToken);
      if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);

      navigate('/patient/dashboard');
    } catch (err) {
      const errObj = err.response?.data?.error;
      const detailsMsg = Array.isArray(errObj?.details) && errObj.details.length > 0
        ? errObj.details.map((d) => d.message).join('. ')
        : null;
      setError(
        detailsMsg ||
        errObj?.message ||
        'Registration failed. Please verify your details and password criteria.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Submit Doctor Registration
  const handleSubmitDoctor = async (e) => {
    e.preventDefault();
    setError('');

    if (doctorForm.specialties.length === 0) {
      setError('Please select at least one medical specialty.');
      return;
    }

    const validQualifications = doctorForm.qualifications.map((q) => q.trim()).filter(Boolean);
    if (validQualifications.length === 0) {
      setError('Please specify at least one medical qualification.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        firstName: doctorForm.firstName.trim(),
        lastName: doctorForm.lastName.trim(),
        email: doctorForm.email.trim().toLowerCase(),
        password: doctorForm.password,
        phone: doctorForm.phone.trim() || undefined,
        licenseNumber: doctorForm.licenseNumber.trim(),
        specialties: doctorForm.specialties,
        qualifications: validQualifications,
        experienceYears: Math.max(0, parseInt(doctorForm.experienceYears, 10) || 0),
        consultationFee: Math.max(0, parseFloat(doctorForm.consultationFee) || 0),
        bio: doctorForm.bio.trim() || undefined
      };

      const { data } = await authService.registerDoctor(payload);
      const { accessToken, refreshToken, user } = data.data;

      sessionStorage.setItem('accessToken', accessToken);
      if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);

      setDoctorSubmitted({
        name: `${doctorForm.firstName} ${doctorForm.lastName}`,
        license: doctorForm.licenseNumber,
        email: doctorForm.email
      });
    } catch (err) {
      const errObj = err.response?.data?.error;
      const detailsMsg = Array.isArray(errObj?.details) && errObj.details.length > 0
        ? errObj.details.map((d) => d.message).join('. ')
        : null;
      setError(
        detailsMsg ||
        errObj?.message ||
        'Doctor registration failed. Please ensure all required fields are filled accurately.'
      );
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

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-emerald-700 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-stone-700 hover:text-emerald-800 hover:bg-emerald-50/80 rounded-xl transition-all border border-stone-200/60"
            >
              <ArrowLeft className="h-4 w-4 text-emerald-700" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Registration Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-auto">
          
          {/* Left Column: Visual Welcome & Value Proposition */}
          <div className="hidden lg:flex lg:col-span-5 flex-col gap-6 sticky top-24 pr-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-200/70 text-emerald-900 text-xs font-semibold w-fit">
              <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
              <span>Holistic Ayurvedic Network</span>
            </div>

            <div>
              <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight leading-snug">
                Join India's premier <span className="text-emerald-700">healing sanctuary</span>
              </h1>
              <p className="text-sm text-stone-600 mt-2.5 leading-relaxed">
                Connect with verified Ayurvedic Vaidyas, receive personalized botanical prescriptions, and manage consultations effortlessly.
              </p>
            </div>

            <div className="flex flex-col gap-3.5 pt-1">
              <div className="flex items-start gap-3 p-3.5 bg-white rounded-2xl border border-stone-200/80 shadow-2xs">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700 shrink-0">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Protected Clinical Records</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">End-to-end encrypted consultations with secure, tamper-evident records.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-white rounded-2xl border border-stone-200/80 shadow-2xs">
                <div className="p-2 bg-teal-50 rounded-xl text-teal-700 shrink-0">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Ayush Board Verified</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">Every doctor is vetted and authenticated by medical administrators.</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl">
              <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                <span className="font-bold">Are you an Ayurvedic Doctor?</span> Register your credentials to expand your clinical practice and consult patients nationwide.
              </p>
            </div>
          </div>

          {/* Right Column: Registration Card */}
          <div className="w-full lg:col-span-7 max-w-xl mx-auto">
            {doctorSubmitted ? (
              /* Doctor Success / Pending Verification Card */
              <Card className="p-6 sm:p-8 border-stone-200/90 shadow-xl bg-white text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 bg-emerald-100 rounded-full mb-4 text-emerald-700 ring-8 ring-emerald-50">
                  <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
                </div>

                <Badge variant="warning" dot className="mb-3 mx-auto">
                  Pending Clinical Verification
                </Badge>

                <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
                  Application Submitted
                </h2>
                <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                  Thank you, <span className="font-semibold text-stone-800">Dr. {doctorSubmitted.name}</span>. Your doctor profile has been successfully registered.
                </p>

                <div className="my-6 p-4 bg-stone-50 rounded-xl border border-stone-200/80 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Registered Email:</span>
                    <span className="font-semibold text-stone-800">{doctorSubmitted.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">License Number:</span>
                    <span className="font-semibold text-stone-800">{doctorSubmitted.license}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Verification Status:</span>
                    <span className="font-semibold text-amber-700">Under Admin Review</span>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/70 text-xs text-amber-900 text-left flex items-start gap-2.5 mb-6">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    Our clinical administration board will verify your medical license against state medical council registries within 24–48 hours. You may still access your doctor portal to set availability.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => navigate('/doctor/dashboard')}
                    size="lg"
                    className="w-full font-semibold justify-center"
                  >
                    Go to Doctor Dashboard
                  </Button>
                  <Button
                    onClick={() => navigate('/login')}
                    variant="outline"
                    size="lg"
                    className="w-full font-semibold justify-center"
                  >
                    Back to Sign In
                  </Button>
                </div>
              </Card>
            ) : (
              /* Main Registration Form Card */
              <Card className="p-6 sm:p-8 border-stone-200/90 shadow-xl bg-white">
                {/* Header & Role Switcher */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Create an account</h2>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1">
                    Select your account type to proceed with registration
                  </p>

                  {/* Segmented Role Switcher */}
                  <div className="grid grid-cols-2 p-1 mt-4 bg-stone-100 rounded-xl border border-stone-200/80">
                    <button
                      type="button"
                      onClick={() => {
                        setRole('patient');
                        setError('');
                      }}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        role === 'patient'
                          ? 'bg-white text-emerald-800 shadow-xs border border-stone-200/60'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <User className="h-4 w-4 text-emerald-700" />
                      <span>Patient</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRole('doctor');
                        setError('');
                      }}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        role === 'doctor'
                          ? 'bg-white text-teal-800 shadow-xs border border-stone-200/60'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <Stethoscope className="h-4 w-4 text-teal-700" />
                      <span>Ayurvedic Doctor</span>
                    </button>
                  </div>
                </div>

                {error && <Alert variant="error" className="mb-5">{error}</Alert>}

                {/* PATIENT REGISTRATION FORM */}
                {role === 'patient' && (
                  <form onSubmit={handleSubmitPatient} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                          First name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Kavya"
                          value={patientForm.firstName}
                          onChange={handlePatientChange('firstName')}
                          required
                          className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white placeholder-stone-400"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                          Last name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Patel"
                          value={patientForm.lastName}
                          onChange={handlePatientChange('lastName')}
                          required
                          className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white placeholder-stone-400"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                        Email address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-3.5 h-4 w-4 text-stone-400 pointer-events-none" />
                        <input
                          type="email"
                          placeholder="kavya.patel@example.com"
                          value={patientForm.email}
                          onChange={handlePatientChange('email')}
                          required
                          className="w-full pl-10 pr-3.5 py-2.5 border border-stone-300 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white placeholder-stone-400"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-3.5 h-4 w-4 text-stone-400 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min 8 chars, 1 uppercase, 1 num, 1 special"
                          value={patientForm.password}
                          onChange={handlePatientChange('password')}
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
                      <span className="text-[11px] text-stone-500">
                        Must contain at least 8 characters, an uppercase letter, a number, and a symbol.
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                        Phone number (optional)
                      </label>
                      <div className="relative flex items-center">
                        <Phone className="absolute left-3.5 h-4 w-4 text-stone-400 pointer-events-none" />
                        <input
                          type="tel"
                          placeholder="+91 98765 00001"
                          value={patientForm.phone}
                          onChange={handlePatientChange('phone')}
                          className="w-full pl-10 pr-3.5 py-2.5 border border-stone-300 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white placeholder-stone-400"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      size="lg"
                      className="w-full mt-3 font-semibold justify-center"
                    >
                      {loading ? 'Creating Account…' : 'Create Patient Account'}
                    </Button>
                  </form>
                )}

                {/* DOCTOR REGISTRATION FORM */}
                {role === 'doctor' && (
                  <form onSubmit={handleSubmitDoctor} className="flex flex-col gap-4.5">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                          First name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Rajesh"
                          value={doctorForm.firstName}
                          onChange={handleDoctorChange('firstName')}
                          required
                          className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white placeholder-stone-400"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                          Last name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Sharma"
                          value={doctorForm.lastName}
                          onChange={handleDoctorChange('lastName')}
                          required
                          className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white placeholder-stone-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                          Email address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <Mail className="absolute left-3.5 h-4 w-4 text-stone-400 pointer-events-none" />
                          <input
                            type="email"
                            placeholder="dr.sharma@amrutam.co.in"
                            value={doctorForm.email}
                            onChange={handleDoctorChange('email')}
                            required
                            className="w-full pl-10 pr-3.5 py-2.5 border border-stone-300 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white placeholder-stone-400"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                          Phone (optional)
                        </label>
                        <div className="relative flex items-center">
                          <Phone className="absolute left-3.5 h-4 w-4 text-stone-400 pointer-events-none" />
                          <input
                            type="tel"
                            placeholder="+91 98765 00002"
                            value={doctorForm.phone}
                            onChange={handleDoctorChange('phone')}
                            className="w-full pl-10 pr-3.5 py-2.5 border border-stone-300 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white placeholder-stone-400"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-3.5 h-4 w-4 text-stone-400 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min 8 chars, 1 uppercase, 1 num, 1 special"
                          value={doctorForm.password}
                          onChange={handleDoctorChange('password')}
                          required
                          className="w-full pl-10 pr-10 py-2.5 border border-stone-300 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white placeholder-stone-400"
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
                      <span className="text-[11px] text-stone-500">
                        Must contain at least 8 characters, an uppercase letter, a number, and a symbol.
                      </span>
                    </div>

                    {/* Professional Credentials */}
                    <div className="pt-2 border-t border-stone-100 flex flex-col gap-3.5">
                      <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                        Medical Credentials
                      </h4>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                          Medical License Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <FileBadge className="absolute left-3.5 h-4 w-4 text-stone-400 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="AYU-DEL-2016-9912"
                            value={doctorForm.licenseNumber}
                            onChange={handleDoctorChange('licenseNumber')}
                            required
                            className="w-full pl-10 pr-3.5 py-2.5 border border-stone-300 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white placeholder-stone-400 uppercase"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                            Experience (Years) <span className="text-red-500">*</span>
                          </label>
                          <div className="relative flex items-center">
                            <Clock className="absolute left-3.5 h-4 w-4 text-stone-400 pointer-events-none" />
                            <input
                              type="number"
                              min="0"
                              max="60"
                              placeholder="5"
                              value={doctorForm.experienceYears}
                              onChange={handleDoctorChange('experienceYears')}
                              required
                              className="w-full pl-10 pr-3.5 py-2.5 border border-stone-300 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white placeholder-stone-400"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                            Consultation Fee (₹) <span className="text-red-500">*</span>
                          </label>
                          <div className="relative flex items-center">
                            <IndianRupee className="absolute left-3.5 h-4 w-4 text-stone-400 pointer-events-none" />
                            <input
                              type="number"
                              min="0"
                              step="50"
                              placeholder="500"
                              value={doctorForm.consultationFee}
                              onChange={handleDoctorChange('consultationFee')}
                              required
                              className="w-full pl-10 pr-3.5 py-2.5 border border-stone-300 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white placeholder-stone-400"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Specialties Pill Selector */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                          Specialties (Select at least one) <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {SPECIALTIES.map((spec) => {
                            const selected = doctorForm.specialties.includes(spec);
                            return (
                              <button
                                key={spec}
                                type="button"
                                onClick={() => toggleSpecialty(spec)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                                  selected
                                    ? 'bg-teal-700 text-white shadow-2xs'
                                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200/80'
                                }`}
                              >
                                {spec} {selected && '✓'}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Qualifications List */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                            Qualifications <span className="text-red-500">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={addQualification}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add Degree</span>
                          </button>
                        </div>
                        <div className="flex flex-col gap-2">
                          {doctorForm.qualifications.map((q, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder={idx === 0 ? 'BAMS (Kerala Ayurveda University)' : 'MD / Diploma'}
                                value={q}
                                onChange={(e) => handleQualificationChange(idx, e.target.value)}
                                required
                                className="flex-1 px-3.5 py-2 border border-stone-300 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white placeholder-stone-400"
                              />
                              {doctorForm.qualifications.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeQualification(idx)}
                                  className="p-2 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                                  title="Remove qualification"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                          Clinical Bio (optional)
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Brief description of your Ayurvedic background, clinical specializations, and patient philosophy…"
                          value={doctorForm.bio}
                          onChange={handleDoctorChange('bio')}
                          className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white placeholder-stone-400 resize-none"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      size="lg"
                      className="w-full mt-3 font-semibold justify-center bg-teal-700 hover:bg-teal-800"
                    >
                      {loading ? 'Submitting Application…' : 'Submit Doctor Registration'}
                    </Button>
                  </form>
                )}

                {/* Footer sign in link */}
                <div className="mt-6 pt-5 border-t border-stone-100 text-center text-xs sm:text-sm text-stone-600">
                  <p>
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </Card>
            )}
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
