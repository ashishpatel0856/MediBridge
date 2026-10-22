import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { doctorService } from '../../services/doctor.service';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Skeleton, { DoctorCardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import {
  Search,
  Star,
  Users,
  Calendar,
  ChevronRight,
  Clock,
} from 'lucide-react';

const SIDEBAR_LINKS = [
  { to: '/patient/dashboard', label: 'Dashboard', icon: Users },
  { to: '/patient/doctors', label: 'Find Doctors', icon: Search },
  { to: '/patient/appointments', label: 'My Appointments', icon: Calendar },
];

const SPECIALTIES = [
  '',
  'Ayurveda',
  'Panchakarma',
  'Digestive Health',
  'Skin & Hair',
  'Joint Care & Arthritis',
  'Stress & Sleep',
  'General Medicine',
  'Lifestyle Disorders',
];

export default function DoctorSearch() {
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialty: searchParams.get('specialty') || '',
    maxFee: '',
    minRating: '',
    query: searchParams.get('query') || '',
    page: 1,
  });

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    const params = {};
    if (filters.specialty) params.specialty = filters.specialty;
    if (filters.maxFee) params.maxFee = filters.maxFee;
    if (filters.minRating) params.minRating = filters.minRating;
    if (filters.query) params.query = filters.query;
    params.page = filters.page;
    params.limit = 12;

    try {
      const { data } = await doctorService.search(params);
      setDoctors(data.data || []);
      setPagination(data.pagination || {});
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const setFilter = (key) => (e) =>
    setFilters((prev) => ({ ...prev, [key]: e.target.value, page: 1 }));

  return (
    <DashboardLayout sidebarLinks={SIDEBAR_LINKS}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Verified Ayurvedic Practitioners
            </h1>
            <Badge variant="emerald" withDot>Verified Only</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Browse verified clinical practitioners, view schedule availability, and book appointments.
          </p>
        </div>

        {/* Filter Card */}
        <Card className="p-4 bg-white shadow-card">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-6 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                className="w-full pl-9.5 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                placeholder="Search by doctor name or clinical condition…"
                value={filters.query}
                onChange={setFilter('query')}
              />
            </div>

            <div className="sm:col-span-3">
              <select
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer"
                value={filters.specialty}
                onChange={setFilter('specialty')}
              >
                {SPECIALTIES.map((s) => (
                  <option key={s} value={s}>
                    {s ? s : 'All Specialties'}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer"
                value={filters.maxFee}
                onChange={setFilter('maxFee')}
              >
                <option value="">Any Consultation Fee</option>
                <option value="500">Up to ₹500</option>
                <option value="750">Up to ₹750</option>
                <option value="1000">Up to ₹1,000</option>
                <option value="2000">Up to ₹2,000</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Results Info */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
          <span>
            {pagination.total !== undefined ? `${pagination.total} verified specialists available` : 'Searching…'}
          </span>
          {filters.specialty && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, specialty: '', query: '', maxFee: '', page: 1 }))}
              className="text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Doctor Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <DoctorCardSkeleton key={i} />
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No Doctors Match Your Search"
            description="Try selecting a different specialty or clearing your search filters to view all verified practitioners."
            action={
              <Button
                variant="secondary"
                onClick={() => setFilters({ specialty: '', maxFee: '', minRating: '', query: '', page: 1 })}
              >
                Reset Search Filters
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map((doc) => (
              <Link key={doc.id} to={`/patient/doctors/${doc.id}`} className="block group">
                <Card hover className="p-5 h-full flex flex-col justify-between border-slate-200">
                  <div>
                    {/* Header: Avatar, Name, Verified */}
                    <div className="flex items-start justify-between mb-3.5">
                      <div className="h-13 w-13 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 flex items-center justify-center text-white font-bold text-lg shadow-xs group-hover:scale-105 transition-transform">
                        {doc.firstName?.[0]}
                        {doc.lastName?.[0]}
                      </div>
                      <Badge variant="emerald" withDot>Verified</Badge>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                      Dr. {doc.firstName} {doc.lastName}
                    </h3>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {(doc.specialties || []).slice(0, 2).map((s) => (
                        <Badge key={s} variant="teal">{s}</Badge>
                      ))}
                    </div>

                    <div className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {doc.bio || `${doc.experienceYears} years of clinical Ayurvedic practice.`}
                    </div>

                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {doc.experienceYears} yrs exp
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-slate-800">
                          {parseFloat(doc.ratingAverage || 0).toFixed(1)}
                        </span>
                        <span className="text-slate-400">({doc.ratingCount || 0})</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-base font-extrabold text-emerald-800">₹{doc.consultationFee}</p>
                      <p className="text-[10px] text-slate-400 font-medium">per consultation</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 group-hover:text-emerald-800 group-hover:translate-x-0.5 transition-all">
                      <span>Book Slot</span>
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-4">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setFilters((prev) => ({ ...prev, page: p }))}
                className={`h-9 w-9 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  filters.page === p
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
