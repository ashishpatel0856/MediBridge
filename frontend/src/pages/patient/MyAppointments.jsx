import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  User,
  FileText,
  ChevronRight,
  Clock,
  Video,
  CheckCircle2
} from 'lucide-react';

const SIDEBAR_LINKS = [
  { to: '/patient/dashboard', label: 'Dashboard', icon: User },
  { to: '/patient/doctors', label: 'Find Doctors', icon: Search },
  { to: '/patient/appointments', label: 'My Appointments', icon: Calendar },
];

function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-IN', {
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

export default function MyAppointments() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    bookingService
      .getMyBookings()
      .then(({ data }) => setBookings(data.data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === 'ALL' ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <DashboardLayout sidebarLinks={SIDEBAR_LINKS}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Consultations
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track your scheduled video appointments, history, and medical prescriptions.
            </p>
          </div>

          <Link to="/patient/doctors">
            <Button size="sm" className="font-semibold gap-1.5 shadow-xs">
              <Calendar className="h-4 w-4" />
              <span>Book Appointment</span>
            </Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
          {['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                filter === s
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s === 'ALL'
                ? `All (${bookings.length})`
                : s === 'SCHEDULED'
                ? 'Scheduled'
                : s === 'IN_PROGRESS'
                ? 'In Progress'
                : s === 'COMPLETED'
                ? 'Completed'
                : 'Cancelled'}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-card">
                <Skeleton className="h-5 w-44 mb-2" />
                <Skeleton className="h-4 w-60 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Appointments Found"
            description={
              filter === 'ALL'
                ? 'You have not booked any consultations yet. Schedule your first session with an Ayurvedic specialist.'
                : `No appointments currently marked as ${filter.toLowerCase()}.`
            }
            action={
              <Link to="/patient/doctors">
                <Button size="sm">Find an Ayurvedic Doctor</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((b) => (
              <Link
                key={b.id}
                to={`/patient/appointments/${b.id}`}
                className="block group"
              >
                <Card
                  hover
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-slate-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold text-base shrink-0 group-hover:scale-105 transition-transform">
                      Dr
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          Dr. {b.doctorFirstName} {b.doctorLastName}
                        </h3>
                        <StatusBadge status={b.status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1 text-slate-700 font-semibold">
                          <Clock className="h-3.5 w-3.5 text-emerald-600" />
                          {formatDate(b.startTime)}
                        </span>
                        {b.meetingLink && b.status === 'SCHEDULED' && (
                          <span className="flex items-center gap-1 text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md font-semibold">
                            <Video className="h-3 w-3" /> Video Room Ready
                          </span>
                        )}
                      </div>

                      {b.symptoms && (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-1 leading-relaxed">
                          <span className="font-semibold text-slate-700">Symptoms:</span> {b.symptoms}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    {b.status === 'COMPLETED' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg">
                        <FileText className="h-3.5 w-3.5" /> Digital Prescription
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                      <span>View Session</span>
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
