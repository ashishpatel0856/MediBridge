import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/booking.service';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import {
  Calendar,
  Search,
  FileText,
  User,
  Clock,
  ChevronRight,
} from 'lucide-react';

const SIDEBAR_LINKS = [
  { to: '/patient/dashboard', label: 'Dashboard', icon: User },
  { to: '/patient/doctors', label: 'Find Doctors', icon: Search },
  { to: '/patient/appointments', label: 'My Appointments', icon: Calendar },
];

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusBadge({ status }) {
  switch (status) {
    case 'SCHEDULED':
      return <Badge variant="blue" withDot>Scheduled</Badge>;
    case 'IN_PROGRESS':
      return <Badge variant="amber" withDot>In Progress</Badge>;
    case 'COMPLETED':
      return <Badge variant="emerald" withDot>Completed</Badge>;
    case 'CANCELLED':
      return <Badge variant="rose" withDot>Cancelled</Badge>;
    default:
      return <Badge variant="gray">{status}</Badge>;
  }
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingService
      .getMyBookings()
      .then(({ data }) => setBookings(data.data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = bookings.filter((b) => b.status === 'SCHEDULED' || b.status === 'IN_PROGRESS');
  const past = bookings.filter((b) => b.status === 'COMPLETED' || b.status === 'CANCELLED');

  return (
    <DashboardLayout sidebarLinks={SIDEBAR_LINKS}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}! 👋
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Your personalized Ayurvedic consultations and digital prescriptions overview.
            </p>
          </div>

          <Link to="/patient/doctors">
            <Button size="sm" className="font-semibold gap-2 shadow-xs">
              <Search className="h-4 w-4" />
              <span>Book New Doctor</span>
            </Button>
          </Link>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 flex items-center justify-between bg-white border-slate-200 shadow-card">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Upcoming Appointments</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{upcoming.length}</p>
              <span className="text-xs text-sky-700 font-semibold mt-0.5 block">Ready for consultation</span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 stroke-[1.8]" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between bg-white border-slate-200 shadow-card">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed Sessions</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{past.length}</p>
              <span className="text-xs text-emerald-700 font-semibold mt-0.5 block">With digital Rx</span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <FileText className="h-6 w-6 stroke-[1.8]" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between bg-white border-slate-200 shadow-card">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Consultations</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{bookings.length}</p>
              <span className="text-xs text-slate-500 font-medium mt-0.5 block">Lifetime care history</span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">
              <Clock className="h-6 w-6 stroke-[1.8]" />
            </div>
          </Card>
        </div>

        {/* Quick Action Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <h3 className="text-base sm:text-lg font-bold">Need Ayurvedic Guidance or a Health Review?</h3>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
              Consult with board-certified Ayurvedic doctors across Panchakarma, gut health, joint care, and stress management.
            </p>
          </div>
          <Link to="/patient/doctors" className="shrink-0">
            <Button size="md" className="bg-white text-emerald-950 hover:bg-emerald-50 font-bold shadow-md">
              Find Specialist →
            </Button>
          </Link>
        </div>

        {/* Upcoming Appointments Card */}
        <Card className="overflow-hidden border-slate-200 shadow-card">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-900">Upcoming Appointments</h2>
            <Link
              to="/patient/appointments"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : upcoming.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No Upcoming Consultations"
              description="You have no scheduled appointments right now. Browse our verified Ayurvedic doctors to schedule your consultation."
              action={
                <Link to="/patient/doctors">
                  <Button size="sm">Browse Verified Doctors</Button>
                </Link>
              }
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {upcoming.map((b) => (
                <Link
                  key={b.id}
                  to={`/patient/appointments/${b.id}`}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold text-sm shrink-0">
                      Dr
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">
                          Dr. {b.doctorFirstName} {b.doctorLastName}
                        </p>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatDate(b.startTime)}
                      </p>
                      {b.symptoms && (
                        <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                          <span className="font-semibold text-slate-700">Symptoms:</span> {b.symptoms}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <span>View Details</span>
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
