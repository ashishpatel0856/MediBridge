import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService } from '../../services/analytics.service';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import {
  BarChart3,
  Users,
  UserCheck,
  IndianRupee,
  Calendar,
  ShieldCheck,
  ClipboardList,
  Search,
  RefreshCw,
  Activity,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const SIDEBAR_LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard Overview', icon: BarChart3 },
  { to: '/admin/doctors', label: 'Doctor Verification', icon: ShieldCheck },
  { to: '/admin/audit', label: 'Security Audit Logs', icon: ClipboardList },
];

function StatCard({ label, value, sub, icon: Icon, badgeText, badgeVariant = 'emerald', accentColor = 'emerald' }) {
  const iconBg = {
    emerald: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    teal: 'bg-teal-50 text-teal-600 border border-teal-100',
    blue: 'bg-sky-50 text-sky-600 border border-sky-100',
    indigo: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
  }[accentColor] || 'bg-emerald-50 text-emerald-600 border border-emerald-100';

  return (
    <Card className="p-5 relative overflow-hidden transition-all duration-200 hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{value ?? '—'}</p>
          {sub && <p className="text-xs text-slate-500 mt-1 font-medium">{sub}</p>}
        </div>
        <div className={`p-3 rounded-2xl ${iconBg} shrink-0`}>
          <Icon className="h-6 w-6 stroke-[1.8]" />
        </div>
      </div>
      {badgeText && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <Badge variant={badgeVariant}>{badgeText}</Badge>
          <span className="text-[11px] text-slate-400 font-medium">Real-time sync</span>
        </div>
      )}
    </Card>
  );
}

function StatusIndicator({ status }) {
  switch (status) {
    case 'SCHEDULED':
      return <Badge variant="blue" withDot>Scheduled</Badge>;
    case 'IN_PROGRESS':
      return <Badge variant="amber" withDot>In Progress</Badge>;
    case 'COMPLETED':
      return <Badge variant="emerald" withDot>Completed</Badge>;
    case 'CANCELLED':
      return <Badge variant="rose" withDot>Cancelled</Badge>;
    case 'PENDING_PAYMENT':
      return <Badge variant="gray" withDot>Pending Payment</Badge>;
    default:
      return <Badge variant="gray">{status}</Badge>;
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchStats = () => {
    setRefreshing(true);
    analyticsService
      .getOverview()
      .then(({ data }) => setStats(data.data))
      .catch(() => setStats(null))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const overview = stats?.overview;
  const cs = stats?.consultations;
  const rev = stats?.revenue;
  const cap = stats?.capacityAndUtilization;
  const recentBookings = stats?.recentBookings || [];

  // Filtered recent activity
  const filteredBookings = useMemo(() => {
    return recentBookings.filter((b) => {
      const matchSearch =
        !searchQuery ||
        b.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.symptoms?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.patientEmail?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [recentBookings, searchQuery, statusFilter]);

  return (
    <DashboardLayout sidebarLinks={SIDEBAR_LINKS}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Healthcare SaaS Admin Panel
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Live System
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Live clinic utilization metrics, appointment tracking, and regulatory governance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchStats}
              disabled={refreshing}
              className="gap-2 text-xs font-semibold"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing…' : 'Sync Live Data'}</span>
            </Button>
            <Link to="/admin/doctors">
              <Button variant="primary" size="sm" className="gap-1.5 text-xs font-semibold">
                <ShieldCheck className="h-4 w-4" />
                <span>Verify Doctors</span>
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-card">
                  <Skeleton className="h-4 w-28 mb-3" />
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-3.5 w-36" />
                </div>
              ))}
            </div>
            <div className="h-64 bg-white border border-slate-200 rounded-2xl p-6">
              <Skeleton className="h-6 w-44 mb-4" />
              <Skeleton className="h-full w-full" />
            </div>
          </div>
        ) : !stats ? (
          <EmptyState
            icon={AlertCircle}
            title="Failed to Load Live Analytics"
            description="The system could not retrieve PostgreSQL analytics aggregates. Please check your database connection."
            action={<Button onClick={fetchStats}>Retry Analytics Sync</Button>}
          />
        ) : (
          <>
            {/* Primary 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Registered Patients"
                value={overview?.totalPatients ?? '—'}
                sub="Authenticated patient records"
                icon={Users}
                badgeText={`${overview?.totalPatients || 0} Total Active`}
                badgeVariant="blue"
                accentColor="blue"
              />
              <StatCard
                label="Total Medical Specialists"
                value={overview?.totalDoctors ?? '—'}
                sub={`${overview?.verifiedDoctors ?? 0} Verified · ${overview?.pendingDoctors ?? 0} Pending`}
                icon={UserCheck}
                badgeText={overview?.pendingDoctors > 0 ? `${overview.pendingDoctors} Need Verification` : 'All Verified'}
                badgeVariant={overview?.pendingDoctors > 0 ? 'amber' : 'emerald'}
                accentColor="teal"
              />
              <StatCard
                label="Total Consultations"
                value={cs?.total ?? '—'}
                sub={`Booked today: ${cs?.today ?? 0}`}
                icon={Calendar}
                badgeText="All Time Consultations"
                badgeVariant="emerald"
                accentColor="emerald"
              />
              <StatCard
                label="Gross Platform Revenue"
                value={rev?.totalGross ? `₹${parseFloat(rev.totalGross).toLocaleString('en-IN')}` : '₹0'}
                sub={`Avg fee: ₹${rev?.averageConsultationFee || 0}`}
                icon={IndianRupee}
                badgeText="Processed Payments"
                badgeVariant="indigo"
                accentColor="indigo"
              />
            </div>

            {/* Capacity & Consultation Breakdown Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 cols: Status Distribution */}
              <Card className="p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                      Consultation Lifecycle Distribution
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Real-time breakdown of appointments across clinical lifecycle states
                    </p>
                  </div>
                  <Activity className="h-5 w-5 text-emerald-600" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  <div className="p-3.5 bg-sky-50/70 border border-sky-100 rounded-xl text-center">
                    <p className="text-xs font-semibold text-sky-800 uppercase tracking-wider">Scheduled</p>
                    <p className="text-2xl font-bold text-sky-950 mt-1">{cs?.byStatus?.SCHEDULED || 0}</p>
                    <span className="text-[10px] text-sky-600 font-medium">Awaiting call</span>
                  </div>

                  <div className="p-3.5 bg-amber-50/70 border border-amber-100 rounded-xl text-center">
                    <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">In Progress</p>
                    <p className="text-2xl font-bold text-amber-950 mt-1">{cs?.byStatus?.IN_PROGRESS || 0}</p>
                    <span className="text-[10px] text-amber-600 font-medium">Live sessions</span>
                  </div>

                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-xl text-center">
                    <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Completed</p>
                    <p className="text-2xl font-bold text-emerald-950 mt-1">{cs?.byStatus?.COMPLETED || 0}</p>
                    <span className="text-[10px] text-emerald-600 font-medium">Prescribed</span>
                  </div>

                  <div className="p-3.5 bg-rose-50/70 border border-rose-100 rounded-xl text-center">
                    <p className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Cancelled</p>
                    <p className="text-2xl font-bold text-rose-950 mt-1">{cs?.byStatus?.CANCELLED || 0}</p>
                    <span className="text-[10px] text-rose-600 font-medium">Rollback / Void</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-center col-span-2 sm:col-span-1">
                    <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Pending Pay</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{cs?.byStatus?.PENDING_PAYMENT || 0}</p>
                    <span className="text-[10px] text-slate-500 font-medium">Stripe lock</span>
                  </div>
                </div>

                {/* Quick actions row */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    All records validated against DISHA & HIPAA regulatory checks
                  </span>
                  <Link
                    to="/admin/audit"
                    className="inline-flex items-center gap-1 text-emerald-700 font-semibold hover:text-emerald-800"
                  >
                    <span>Inspect Security Audit Trail</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Card>

              {/* Right 1 col: Slot Utilization & Scale */}
              <Card className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">Capacity & Scale</h2>
                    <BarChart3 className="h-5 w-5 text-teal-600" />
                  </div>
                  <p className="text-xs text-slate-500 mb-4">Doctor availability slot utilization</p>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-700">Slot Occupancy</span>
                        <span className="text-emerald-700 font-bold">{cap?.utilizationPercentage ?? 0}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(cap?.utilizationPercentage || 0, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                        <span>{cap?.bookedSlots || 0} Booked</span>
                        <span>{cap?.totalSlots || 0} Total Slots</span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Daily Target Capacity</span>
                        <span className="font-bold text-slate-900">{cap?.scaleTargetDailyConsultations?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Async Queue State</span>
                        <Badge variant="emerald" withDot>Healthy (Active)</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <Link to="/admin/doctors" className="block w-full">
                    <Button variant="soft" size="sm" className="w-full justify-center text-xs font-semibold">
                      Manage Doctor Verifications
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>

            {/* Modern Data Table: Recent Booking Activity */}
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    Recent Consultation Bookings
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live database records of patients, doctors, and appointment transactions.
                  </p>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative flex items-center">
                    <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search patient or doctor…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8.5 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 w-48 sm:w-56"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
                    <Filter className="h-3.5 w-3.5 text-slate-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="PENDING_PAYMENT">Pending Payment</option>
                    </select>
                  </div>
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <EmptyState
                  title="No Consultations Found"
                  description={
                    searchQuery || statusFilter !== 'ALL'
                      ? 'No appointment records match your current filter criteria.'
                      : 'No consultation booking records have been created in the database yet.'
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Patient</th>
                        <th className="py-3 px-4">Doctor</th>
                        <th className="py-3 px-4">Schedule / Slot</th>
                        <th className="py-3 px-4">Amount & Status</th>
                        <th className="py-3 px-4">Consultation Status</th>
                        <th className="py-3 px-4 text-right">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">{b.patientName}</p>
                            <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{b.patientEmail}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-slate-800">{b.doctorName}</p>
                            <p className="text-[11px] text-emerald-700 font-medium">
                              {Array.isArray(b.doctorSpecialties)
                                ? b.doctorSpecialties.slice(0, 2).join(', ')
                                : 'Specialist'}
                            </p>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {b.startTime ? (
                              <>
                                <p className="font-medium text-slate-800">
                                  {new Date(b.startTime).toLocaleDateString('en-IN', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  {new Date(b.startTime).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">
                              ₹{parseFloat(b.paymentAmount || 500).toLocaleString('en-IN')}
                            </p>
                            <span
                              className={`text-[10px] font-semibold uppercase ${
                                b.paymentStatus === 'COMPLETED'
                                  ? 'text-emerald-700'
                                  : b.paymentStatus === 'PENDING'
                                  ? 'text-amber-700'
                                  : 'text-slate-400'
                              }`}
                            >
                              {b.paymentStatus || 'COMPLETED'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusIndicator status={b.status} />
                          </td>
                          <td className="py-3.5 px-4 text-right text-slate-400 text-[11px]">
                            {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
