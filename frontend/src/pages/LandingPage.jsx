import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doctorService } from '../services/doctor.service';
import Navbar from '../components/layout/Navbar';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Skeleton, { DoctorCardSkeleton } from '../components/common/Skeleton';
import {
  ShieldCheck,
  Star,
  Calendar,
  Search,
  ArrowRight,
  Clock,
  Sparkles,
  Award,
  Video,
  FileCheck2,
  CheckCircle2,
  ChevronRight,
  Leaf,
  HeartPulse,
  Activity
} from 'lucide-react';

const POPULAR_SPECIALTIES = [
  { name: 'Ayurveda', count: 'Holistic Dinacharya', icon: Leaf, desc: 'Root-cause healing for chronic lifestyle and metabolic disorders.' },
  { name: 'Panchakarma', count: 'Detox & Rejuvenation', icon: Sparkles, desc: 'Five-fold systemic purification to eliminate deep bodily toxins.' },
  { name: 'Digestive Health', count: 'Agni & Gut Balance', icon: HeartPulse, desc: 'Herbal therapies for IBS, acidity, constipation, and gut microbiome.' },
  { name: 'Skin & Hair', count: 'Natural Radiance', icon: Award, desc: 'Ayurvedic formulations for eczema, psoriasis, alopecia, and acne.' },
  { name: 'Joint Care & Arthritis', count: 'Vata Management', icon: Activity, desc: 'Herbal oils and therapies for sciatica, osteoarthritis, and mobility.' },
  { name: 'Stress & Sleep', count: 'Manasa Rogas', icon: Clock, desc: 'Medhya herbs, yoga nidra, and nervous system rejuvenation.' },
];

export default function LandingPage() {
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    doctorService
      .search({ limit: 4 })
      .then(({ data }) => setFeaturedDoctors(data.data || []))
      .catch(() => setFeaturedDoctors([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(`/patient/doctors${q ? `?query=${encodeURIComponent(q)}` : ''}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col text-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-emerald-50/70 via-slate-50/50 to-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200/80 text-emerald-900 text-xs font-semibold w-fit mx-auto lg:mx-0 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
                <span>Practo-Quality Ayurvedic Telemedicine</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Find & Book Top <span className="text-emerald-700">Ayurvedic Doctors</span> Online
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                Consult with verified Ayurvedic specialists from the comfort of your home. Instant slot booking with zero double-booking, video consultations, and tamper-proof digital prescriptions.
              </p>

              {/* Instant Search Bar */}
              <form onSubmit={handleSearchSubmit} className="mt-2 w-full max-w-xl mx-auto lg:mx-0">
                <div className="flex flex-col sm:flex-row gap-2 p-2 bg-white rounded-2xl border border-slate-300 shadow-md">
                  <div className="flex-1 relative flex items-center">
                    <Search className="absolute left-3.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none rounded-xl"
                      placeholder="Doctor name, specialty, or condition…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button type="submit" size="md" className="font-semibold px-6 shrink-0">
                    Search Doctors
                  </Button>
                </div>

                {/* Popular Pills */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3 text-xs text-slate-500 justify-center lg:justify-start">
                  <span className="font-medium">Popular:</span>
                  {['Ayurveda', 'Panchakarma', 'Digestive Health', 'Skin & Hair'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => navigate(`/patient/doctors?specialty=${encodeURIComponent(tag)}`)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </form>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 text-xs text-slate-600 font-medium border-t border-slate-200/60">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 100% Board-Certified Doctors
                </span>
                <span className="flex items-center gap-1.5">
                  <FileCheck2 className="h-4 w-4 text-emerald-600" /> HMAC-SHA256 Digital Prescriptions
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> DISHA / HIPAA Data Protection
                </span>
              </div>
            </div>

            {/* Right Hero Feature Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur-xl opacity-20 transform -rotate-1"></div>
                <Card className="relative p-6 border-slate-200 shadow-xl bg-white/95">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-lg shadow-xs">
                        AC
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Amrutam CareConnect</h3>
                        <p className="text-xs text-emerald-700 font-medium">Verified Telehealth Network</p>
                      </div>
                    </div>
                    <Badge variant="emerald" withDot>Live Consultations</Badge>
                  </div>

                  <div className="py-5 flex flex-col gap-3.5">
                    <div className="flex items-start gap-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                      <Calendar className="h-5 w-5 text-emerald-700 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Instant Appointment Booking</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">PostgreSQL row-lock protection guarantees zero double-booking.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                      <ShieldCheck className="h-5 w-5 text-teal-700 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Government Council License Validation</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Every doctor is vetted and verified by clinical administrators.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                      <Video className="h-5 w-5 text-sky-700 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Encrypted Telehealth Room</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">High-definition audio/video rooms generated instantly for scheduled slots.</p>
                      </div>
                    </div>
                  </div>

                  <Link to="/patient/doctors" className="block w-full">
                    <Button variant="primary" size="lg" className="w-full justify-between font-semibold shadow-sm">
                      <span>Explore Specialists & Book</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process: How Amrutam Works */}
      <section className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Simple 3-Step Process</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              How Your Healing Consultation Works
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              From choosing your specialist to receiving digitally signed prescriptions in 3 easy steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-white relative">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base mb-4 border border-emerald-100">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Choose Doctor & Slot</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Filter by medical specialty, experience, and fee. Pick from real-time calendar availability slots locked atomically.
              </p>
            </Card>

            <Card className="p-6 bg-white relative">
              <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-base mb-4 border border-teal-100">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Consult via Private Video</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Join your scheduled appointment with one click. Discuss symptoms, Prakriti (body constitution), and health concerns securely.
              </p>
            </Card>

            <Card className="p-6 bg-white relative">
              <div className="h-12 w-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-base mb-4 border border-sky-100">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Digital Prescription & Regimen</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Receive tamper-evident digital prescriptions with diagnosis, dietary Dinacharya guidelines, and herbal medication instructions.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Specialized Care</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Classical Ayurvedic Treatment Areas
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Select a specialty to browse verified practitioners specializing in your condition.
              </p>
            </div>
            <Link
              to="/patient/doctors"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              <span>View all doctors</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {POPULAR_SPECIALTIES.map((spec, i) => {
              const Icon = spec.icon;
              return (
                <Link
                  key={i}
                  to={`/patient/doctors?specialty=${encodeURIComponent(spec.name)}`}
                  className="group"
                >
                  <Card hover className="p-6 h-full flex flex-col justify-between border-slate-200">
                    <div>
                      <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 mb-4 group-hover:scale-105 group-hover:bg-emerald-100 transition-all">
                        <Icon className="h-6 w-6 stroke-[1.8]" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                        {spec.name}
                      </h3>
                      <p className="text-xs font-semibold text-emerald-700 mt-0.5">{spec.count}</p>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{spec.desc}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 mt-4 group-hover:translate-x-1 transition-transform">
                      <span>Explore doctors</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Top Rated Practitioners</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Featured Verified Physicians
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Consult with verified Ayurvedic practitioners with clinical track records.
              </p>
            </div>
            <Link
              to="/patient/doctors"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              <span>See all practitioners</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <DoctorCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredDoctors.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <p className="text-sm text-slate-500">No verified practitioners listed right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredDoctors.map((doc) => (
                <Link key={doc.id} to={`/patient/doctors/${doc.id}`} className="group block">
                  <Card hover className="p-5 h-full flex flex-col justify-between border-slate-200">
                    <div>
                      {/* Avatar & Badge */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 flex items-center justify-center text-white font-bold text-lg shadow-xs">
                          {doc.firstName?.[0]}{doc.lastName?.[0]}
                        </div>
                        <Badge variant="emerald" withDot>Verified</Badge>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                        Dr. {doc.firstName} {doc.lastName}
                      </h3>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {(doc.specialties || []).slice(0, 2).map((s) => (
                          <Badge key={s} variant="teal">{s}</Badge>
                        ))}
                      </div>

                      <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {doc.bio || `${doc.experienceYears} years of clinical Ayurvedic practice.`}
                      </p>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-800">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        <span>{parseFloat(doc.ratingAverage || 0).toFixed(1)}</span>
                        <span className="text-slate-400 font-normal">({doc.ratingCount || 0})</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-700">₹{doc.consultationFee}</span>
                        <span className="text-[10px] text-slate-400 block font-medium">per consultation</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* High-Conversion Footer CTA Banner */}
      <section className="py-16 bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
            <HeartPulse className="h-3.5 w-3.5 text-emerald-300" />
            <span>Start Your Wellness Journey Today</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight max-w-2xl leading-tight">
            Consult With Board-Certified Ayurvedic Specialists Online
          </h2>

          <p className="text-sm sm:text-base text-emerald-100/80 max-w-lg leading-relaxed">
            Personalized diagnosis, authenticated formulations, and lifestyle recommendations tailored to your unique dosha balance.
          </p>

          <div className="flex flex-wrap gap-3.5 mt-2">
            <Link to="/register/patient">
              <Button size="lg" className="font-bold bg-white text-emerald-950 hover:bg-emerald-50 shadow-lg">
                Register as Patient
              </Button>
            </Link>
            <Link to="/register/doctor">
              <Button variant="ghost" size="lg" className="text-white hover:bg-white/10 border border-white/30 font-semibold">
                Join as Doctor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
              A
            </div>
            <div>
              <span className="text-slate-200 font-bold">Amrutam CareConnect</span>
              <span className="text-slate-400 block text-[11px]">Production-Grade Ayurvedic Telemedicine System</span>
            </div>
          </div>
          <div className="text-center sm:text-right text-slate-500">
            <span>© {new Date().getFullYear()} Amrutam CareConnect. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
