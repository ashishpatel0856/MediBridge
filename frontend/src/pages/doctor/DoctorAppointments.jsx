import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../../services/booking.service';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Calendar, Clock, Users } from 'lucide-react';

const SIDEBAR_LINKS = [
  { to: '/doctor/dashboard', label: 'Dashboard', icon: Users },
  { to: '/doctor/availability', label: 'Availability', icon: Clock },
  { to: '/doctor/appointments', label: 'Appointments', icon: Calendar },
  { to: '/doctor/profile', label: 'My Profile', icon: Users },
];

const STATUS_COLORS = {
  SCHEDULED: 'blue', IN_PROGRESS: 'teal', COMPLETED: 'green', CANCELLED: 'red',
};

function formatDate(dt) {
  return dt ? new Date(dt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
}

export default function DoctorAppointments() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    bookingService.getMyBookings()
      .then(({ data }) => setBookings(data.data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <DashboardLayout sidebarLinks={SIDEBAR_LINKS}>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Appointments</h1>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5">
          {['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                filter === s ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner className="py-20" />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Calendar} title="No appointments" description="Appointments will appear here once patients book" />
        ) : (
          <Card>
            <div className="divide-y divide-gray-50">
              {filtered.map((b) => (
                <Link
                  key={b.id}
                  to={`/doctor/appointments/${b.id}`}
                  className="flex items-start justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900">{formatDate(b.startTime)}</p>
                      <Badge variant={STATUS_COLORS[b.status] || 'gray'}>{b.status}</Badge>
                    </div>
                    {b.symptoms && <p className="text-xs text-gray-500 mt-1 truncate">{b.symptoms}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
