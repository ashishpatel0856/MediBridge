import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/booking.service';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import {
  Calendar,
  Clock,
  Users,
  FileText,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Plus,
  Video
} from 'lucide-react';

const SIDEBAR_LINKS = [
  { to: '/doctor/dashboard', label: 'Doctor Dashboard', icon: Users },
  { to: '/doctor/availability', label: 'Availability Slots', icon: Clock },
  { to: '/doctor/appointments', label: 'Clinical Appointments', icon: Calendar },
];

function formatDate(dt) {
  return dt
    ? new Date(dt).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';
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

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Optimistic check, populated by JWT/profile
  const isVerified = user?.isVerified !== false;

  useEffect(() => {
    bookingService
      .getMyBookings()
      .then(({ data }) => setBookings(data.data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = bookings.filter((b) => b.status === 'SCHEDULED' || b.status === 'IN_PROGRESS');
  const completed = bookings.filter((b) => b.status === 'COMPLETED');

  return (
    <DashboardLayout sidebarLinks={SIDEBAR_LINKS}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Clinician Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage patient consultations, open schedule slots, and digital prescriptions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/doctor/availability">
              <Button size="sm" className="font-semibold gap-1.5 shadow-xs">
                <Plus className="h-4 w-4" />
                <span>Open New Slots</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Verification banner */}
        {!isVerified ? (
          <Alert variant="warning" className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-bold text-amber-900">Practitioner Account Pending Administrator Review</p>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Your medical license and practitioner registration are under administrative review. You will be able to create open slots and issue signed prescriptions once verified by the platform admin.
              </p>
            </div>
          </Alert>
        ) : (
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs font-semibold text-emerald-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
              <span>Verified Clinical Practitioner Account · Full Prescription Authority Granted</span>
            </div>
            <Badge variant="emerald" withDot>Active</Badge>
          </div>
        )}

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 flex items-center justify-between bg-white border-slate-200 shadow-card">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Upcoming Appointments</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{upcoming.length}</p>
              <span className="text-xs text-sky-700 font-semibold mt-0.5 block">Awaiting video call</span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 stroke-[1.8]" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between bg-white border-slate-200 shadow-card">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed Sessions</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{completed.length}</p>
              <span className="text-xs text-emerald-700 font-semibold mt-0.5 block">Prescriptions signed</span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <FileText className="h-6 w-6 stroke-[1.8]" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between bg-white border-slate-200 shadow-card">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Consultations</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{bookings.length}</p>
              <span className="text-xs text-slate-500 font-medium mt-0.5 block">All-time appointments</span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">
              <Users className="h-6 w-6 stroke-[1.8]" />
            </div>
          </Card>
        </div>

        {/* Upcoming appointments table / card */}
        <Card className="overflow-hidden border-slate-200 shadow-card">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-900">Upcoming Patient Sessions</h2>
            <Link
              to="/doctor/appointments"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View all appointments</span>
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
              description="Patients will appear here once they book open availability slots."
              action={
                <Link to="/doctor/availability">
                  <Button size="sm">Manage Availability Slots</Button>
                </Link>
              }
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {upcoming.map((b) => (
                <Link
                  key={b.id}
                  to={`/doctor/appointments/${b.id}`}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center font-bold text-sm shrink-0">
                      Pt
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">
                          {b.patientFirstName || 'Patient'} {b.patientLastName || ''}
                        </p>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Scheduled: {formatDate(b.startTime)}
                      </p>
                      {b.symptoms && (
                        <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                          <span className="font-semibold text-slate-700">Reported Symptoms:</span> {b.symptoms}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <span>Manage Session</span>
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
