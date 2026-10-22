import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorService } from '../../services/doctor.service';
import { slotService } from '../../services/slot.service';
import { bookingService } from '../../services/booking.service';
import { useToast } from '../../context/ToastContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import {
  Star,
  Clock,
  Award,
  ArrowLeft,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const SIDEBAR_LINKS = [
  { to: '/patient/dashboard', label: 'Dashboard', icon: Award },
  { to: '/patient/doctors', label: 'Find Doctors', icon: Star },
  { to: '/patient/appointments', label: 'My Appointments', icon: Calendar },
];

function formatSlotTime(dt) {
  return new Date(dt).toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    Promise.all([
      doctorService.getById(id),
      slotService.getSlots({ doctorId: id, availableOnly: true }),
    ])
      .then(([{ data: d }, { data: s }]) => {
        setDoctor(d.data);
        setSlots(s.data || []);
      })
      .catch(() => {
        setDoctor(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const openBooking = (slot) => {
    setSelectedSlot(slot);
    setBookingError('');
    setBookingModal(true);
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setBookingError('Please enter your symptoms or reason for consultation.');
      return;
    }

    setBooking(true);
    setBookingError('');
    try {
      const idempotencyKey = uuidv4();
      await bookingService.book(
        {
          slotId: selectedSlot.id,
          symptoms: symptoms.trim(),
          notes: notes.trim() || undefined,
          paymentMethod,
        },
        idempotencyKey
      );

      toast.success('Consultation booked and scheduled successfully!');
      setBookingModal(false);
      navigate('/patient/appointments');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Booking failed. Please try again.';
      setBookingError(msg);
      toast.error(msg);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebarLinks={SIDEBAR_LINKS}>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-6 w-24" />
          <div className="p-6 bg-white rounded-2xl border border-slate-200">
            <Skeleton className="h-20 w-full mb-4" />
            <Skeleton className="h-10 w-3/4" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!doctor) {
    return (
      <DashboardLayout sidebarLinks={SIDEBAR_LINKS}>
        <div className="max-w-4xl mx-auto py-12 text-center">
          <EmptyState
            title="Doctor Profile Not Found"
            description="The requested Ayurvedic practitioner is not registered or may be pending review."
            action={<Button onClick={() => navigate('/patient/doctors')}>Browse All Doctors</Button>}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarLinks={SIDEBAR_LINKS}>
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Doctors
        </button>

        {/* Doctor Header Card */}
        <Card className="p-6 sm:p-8 bg-white border-slate-200 shadow-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-start sm:items-center gap-5">
              <div className="h-20 w-20 bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 rounded-2xl flex items-center justify-center text-white font-extrabold text-3xl shadow-sm shrink-0">
                {doctor.firstName?.[0]}
                {doctor.lastName?.[0]}
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h1>
                  <Badge variant="emerald" withDot>Verified</Badge>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(doctor.specialties || []).map((s) => (
                    <Badge key={s} variant="teal">
                      {s}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-slate-800">
                      {parseFloat(doctor.ratingAverage || 0).toFixed(1)}
                    </span>
                    <span>({doctor.ratingCount || 0} reviews)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-slate-400" />
                    {doctor.experienceYears} Years Clinical Exp
                  </span>
                  <span className="flex items-center gap-1 font-mono text-slate-700">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    License: {doctor.licenseNumber}
                  </span>
                </div>
              </div>
            </div>

            <div className="sm:text-right bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 w-full sm:w-auto">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-800">
                ₹{doctor.consultationFee}
              </p>
              <p className="text-xs text-emerald-700 font-semibold mt-0.5">per video consultation</p>
            </div>
          </div>

          {/* Bio & Qualifications */}
          <div className="pt-6 space-y-4">
            {doctor.bio && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  About Practitioner
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{doctor.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Qualifications & Degrees
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-800">
                  {(doctor.qualifications || []).join(' · ') || 'BAMS, MD (Ayurveda)'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Consultation Languages
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-800">
                  {(doctor.languages || ['English', 'Hindi']).join(', ')}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Available Appointment Slots */}
        <Card className="p-6 bg-white border-slate-200 shadow-card">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Available Appointment Slots
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select an open consultation window to book your appointment.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200/80">
              {slots.length} Slots Open
            </span>
          </div>

          {slots.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No open consultation slots right now</p>
              <p className="text-xs text-slate-400 mt-1">Please check back later or choose another specialist.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => openBooking(slot)}
                  className="flex items-center justify-between p-4 bg-slate-50/70 border border-slate-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50/50 hover:shadow-xs transition-all text-left cursor-pointer group"
                >
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-800">
                      {formatSlotTime(slot.startTime || slot.start_time)}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">30-min Clinical Video Session</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                    Book →
                  </span>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Appointment Booking Modal */}
      <Modal isOpen={bookingModal} onClose={() => setBookingModal(false)} title="Confirm Appointment Booking">
        {selectedSlot && (
          <form onSubmit={handleBook} className="flex flex-col gap-4.5">
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Selected Appointment Slot</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {formatSlotTime(selectedSlot.startTime || selectedSlot.start_time)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dr. {doctor.firstName} {doctor.lastName}
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg font-extrabold text-emerald-800">₹{doctor.consultationFee}</span>
                <span className="text-[10px] text-slate-400 block font-medium">Standard Fee</span>
              </div>
            </div>

            {bookingError && <Alert variant="error">{bookingError}</Alert>}

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Symptoms or Clinical Concern <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 resize-none transition-all placeholder-slate-400"
                placeholder="Describe your health symptoms, medical background, or reason for this consultation…"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Additional Notes (Optional)
              </label>
              <textarea
                rows={2}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 resize-none transition-all placeholder-slate-400"
                placeholder="Any previous medications, allergies, or questions for the doctor…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Payment Option
              </label>
              <select
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer bg-white"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="UPI">UPI (Instant Confirmation)</option>
                <option value="CARD">Credit / Debit Card</option>
                <option value="NETBANKING">Net Banking</option>
                <option value="STRIPE">Stripe Payment Gateway</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={booking || !symptoms.trim()}
              size="lg"
              className="w-full mt-2 font-bold justify-center"
            >
              {booking ? 'Scheduling Slot…' : `Confirm Appointment · ₹${doctor.consultationFee}`}
            </Button>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
}
