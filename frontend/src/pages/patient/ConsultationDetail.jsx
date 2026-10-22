import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/booking.service';
import { prescriptionService } from '../../services/prescription.service';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ArrowLeft, Calendar, FileText, Video } from 'lucide-react';

const STATUS_COLORS = {
  SCHEDULED: 'blue', IN_PROGRESS: 'teal', COMPLETED: 'green', CANCELLED: 'red',
};

function formatDate(dt) {
  return dt ? new Date(dt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
}

export default function ConsultationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingService.getById(id)
      .then(({ data }) => {
        setBooking(data.data);
        if (data.data.status === 'COMPLETED') {
          return prescriptionService.getByConsultation(id)
            .then(({ data: rx }) => setPrescription(rx.data))
            .catch(() => {});
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DashboardLayout><LoadingSpinner className="py-20" /></DashboardLayout>;
  if (!booking) return <DashboardLayout><p className="text-gray-500">Appointment not found.</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Consultation Details</h1>
          <Badge variant={STATUS_COLORS[booking.status] || 'gray'} className="text-sm px-3 py-1">{booking.status}</Badge>
        </div>

        {/* Appointment info */}
        <Card className="p-6 mb-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Appointment Info</h2>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span className="text-gray-500">Doctor</span>
            <span className="font-medium text-gray-900">Dr. {booking.doctorFirstName} {booking.doctorLastName}</span>
            <span className="text-gray-500">Date & Time</span>
            <span className="font-medium text-gray-900"><Calendar className="inline h-3.5 w-3.5 mr-1 text-gray-400" />{formatDate(booking.startTime)}</span>
            <span className="text-gray-500">Symptoms</span>
            <span className="font-medium text-gray-900">{booking.symptoms || '—'}</span>
            {booking.notes && <><span className="text-gray-500">Notes</span><span className="font-medium text-gray-900">{booking.notes}</span></>}
            {booking.meetingLink && (
              <>
                <span className="text-gray-500">Meeting Link</span>
                <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline flex items-center gap-1">
                  <Video className="h-3.5 w-3.5" /> Join Now
                </a>
              </>
            )}
          </div>
        </Card>

        {/* Prescription */}
        {prescription && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-teal-600" />
              <h2 className="text-sm font-semibold text-gray-700">Prescription</h2>
            </div>
            <div className="mb-3">
              <p className="text-xs text-gray-500">Diagnosis</p>
              <p className="text-sm font-medium text-gray-900">{prescription.diagnosis}</p>
            </div>
            {(prescription.medications || []).map((med, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-3 mb-2">
                <p className="text-sm font-semibold text-gray-900">{med.medicineName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{med.dosage} · {med.frequency} · {med.duration}</p>
                {med.instructions && <p className="text-xs text-gray-400 mt-0.5">{med.instructions}</p>}
              </div>
            ))}
            {prescription.instructions && (
              <div className="mt-3 bg-teal-50 border border-teal-100 rounded-lg p-3">
                <p className="text-xs font-medium text-teal-700">Doctor's Instructions</p>
                <p className="text-xs text-teal-600 mt-1">{prescription.instructions}</p>
              </div>
            )}
            {prescription.digitalSignature && (
              <p className="text-xs text-gray-400 mt-4 font-mono">
                Signature: {prescription.digitalSignature.slice(0, 16)}…
              </p>
            )}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
