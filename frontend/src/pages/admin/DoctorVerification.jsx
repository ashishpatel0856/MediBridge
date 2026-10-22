import { useEffect, useState, useCallback, useMemo } from 'react';
import { doctorService } from '../../services/doctor.service';
import { useToast } from '../../context/ToastContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import EmptyState from '../../components/common/EmptyState';
import Skeleton from '../../components/common/Skeleton';
import {
  ShieldCheck,
  BarChart3,
  ClipboardList,
  CheckCircle,
  Search,
  Filter,
  Award,
  Clock,
  IndianRupee,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

const SIDEBAR_LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard Overview', icon: BarChart3 },
  { to: '/admin/doctors', label: 'Doctor Verification', icon: ShieldCheck },
  { to: '/admin/audit', label: 'Security Audit Logs', icon: ClipboardList },
];

export default function DoctorVerification() {
  const { toast } = useToast();
  const [allDoctors, setAllDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState({});
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('PENDING'); // 'PENDING' | 'VERIFIED' | 'ALL'

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingRes, verifiedRes] = await Promise.all([
        doctorService.search({ isVerified: false, limit: 50 }),
        doctorService.search({ isVerified: true, limit: 50 }),
      ]);
      const pendingList = (pendingRes.data?.data || []).map((d) => ({ ...d, isVerified: false }));
      const verifiedList = (verifiedRes.data?.data || []).map((d) => ({ ...d, isVerified: true }));
      setAllDoctors([...pendingList, ...verifiedList]);
    } catch {
      setAllDoctors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleVerify = async (doctor) => {
    setError('');
    setVerifying((prev) => ({ ...prev, [doctor.id]: true }));
    try {
      await doctorService.verify(doctor.id);
      toast.success(`Dr. ${doctor.firstName} ${doctor.lastName} verified successfully!`);
      setAllDoctors((prev) =>
        prev.map((d) => (d.id === doctor.id ? { ...d, isVerified: true } : d))
      );
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Verification failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setVerifying((prev) => ({ ...prev, [doctor.id]: false }));
    }
  };

  const pendingCount = allDoctors.filter((d) => !d.isVerified).length;
  const verifiedCount = allDoctors.filter((d) => d.isVerified).length;

  const filteredDoctors = useMemo(() => {
    return allDoctors.filter((doc) => {
      const matchesTab =
        activeTab === 'ALL' ||
        (activeTab === 'PENDING' && !doc.isVerified) ||
        (activeTab === 'VERIFIED' && doc.isVerified);

      const matchesSearch =
        !searchQuery ||
        doc.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.licenseNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialties?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesTab && matchesSearch;
    });
  }, [allDoctors, activeTab, searchQuery]);

  return (
    <DashboardLayout sidebarLinks={SIDEBAR_LINKS}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Doctor Credential Verification
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review practitioner medical council licenses and clinical credentials before granting prescription authority.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={fetchDoctors}
            className="gap-2 text-xs font-semibold self-start sm:self-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        {/* Tab & Search Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl">
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'PENDING'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending Approval ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('VERIFIED')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'VERIFIED'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Verified ({verifiedCount})
            </button>
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({allDoctors.length})
            </button>
          </div>

          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search doctor or license #…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9.5 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 w-full sm:w-64"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-card">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-72 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : filteredDoctors.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title={activeTab === 'PENDING' ? 'No Doctors Awaiting Approval' : 'No Doctors Match Search'}
            description={
              activeTab === 'PENDING'
                ? 'All registered Ayurvedic doctors on the platform have been reviewed and approved.'
                : 'Try adjusting your search filters to find specific practitioners.'
            }
          />
        ) : (
          <div className="space-y-3.5">
            {filteredDoctors.map((doc) => (
              <Card
                key={doc.id}
                className="p-5 transition-all duration-150 hover:shadow-card-hover flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-xs">
                    {doc.firstName?.[0]}
                    {doc.lastName?.[0]}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        Dr. {doc.firstName} {doc.lastName}
                      </h3>
                      {doc.isVerified ? (
                        <Badge variant="emerald" withDot>
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="amber" withDot>
                          Pending Review
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {(doc.specialties || []).map((s) => (
                        <Badge key={s} variant="teal">
                          {s}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1 font-mono text-slate-700">
                        <Award className="h-3.5 w-3.5 text-emerald-600" />
                        License: {doc.licenseNumber}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {doc.experienceYears} Years Exp
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <IndianRupee className="h-3.5 w-3.5 text-emerald-600" />
                        ₹{doc.consultationFee} / session
                      </span>
                    </div>

                    {doc.bio && (
                      <p className="text-xs text-slate-500 mt-2 max-w-2xl line-clamp-1 leading-relaxed">
                        {doc.bio}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {doc.isVerified ? (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      Approved Practitioner
                    </span>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleVerify(doc)}
                      disabled={verifying[doc.id]}
                      className="font-semibold"
                    >
                      {verifying[doc.id] ? 'Verifying…' : 'Approve & Verify'}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Informative Guidance Panel */}
        <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
          <div className="text-xs text-sky-900 leading-relaxed">
            <p className="font-semibold mb-0.5">Clinical Regulatory Enforcement Policy</p>
            When a doctor registers, they cannot open availability slots or issue cryptographically signed prescriptions until an administrator approves their medical registration. Approving a practitioner updates their verification status instantly across all patient discovery endpoints.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
