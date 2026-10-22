import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/booking.service';
import { prescriptionService } from '../../services/prescription.service';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ArrowLeft, Calendar, Clock, Users, Plus } from 'lucide-react';

const SIDEBAR_LINKS = [
  { to: '/doctor/dashboard', label: 'Dashboard', icon: Users },
  { to: '/doctor/availability', label: 'Availability', icon: Clock },
  { to: '/doctor/appointments', label: 'Appointments', icon: Calendar },
];

const STATUS_COLORS = { SCHEDULED: 'blue', IN_PROGRESS: 'teal', COMPLETED: 'green', CANCELLED: 'red' };

function formatDate(dt) {
  return dt ? new Date(dt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
}

export default function ConsultationManage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [prescriptionModal, setPrescriptionModal] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: '',
    medications: [{ medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    instructions: '',
    followUpDate: '',
  });
  const [prescribing, setPrescribing] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    const { data } = await bookingService.getById(id);
    setBooking(data.data);
    if (data.data.status === 'COMPLETED') {
      prescriptionService.getByConsultation(id)
        .then(({ data: rx }) => setPrescription(rx.data))
        .catch(() => {});
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  const updateStatus = async (status) => {
    setStatusLoading(true);
    try {
      const { data } = await bookingService.updateStatus(id, status);
      setBooking(data.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Status update failed.');
    } finally {
      setStatusLoading(false);
    }
  };

  const setMed = (i, field, val) => {
    const meds = [...prescriptionForm.medications];
    meds[i][field] = val;
    setPrescriptionForm({ ...prescriptionForm, medications: meds });
  };

  const handlePrescribe = async () => {
    setPrescribing(true);
    try {
      await prescriptionService.create({
        consultationId: id,
        ...prescriptionForm,
        medications: prescriptionForm.medications.filter((m) => m.medicineName),
      });
      setPrescriptionModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to issue prescription.');
    } finally {
      setPrescribing(false);
    }
  };

  if (loading) return <DashboardLayout sidebarLinks={SIDEBAR_LINKS}><LoadingSpinner className="py-20" /></DashboardLayout>;

  return (
    <DashboardLayout sidebarLinks={SIDEBAR_LINKS}>
      <div className="max-w-2xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Consultation</h1>
          <Badge variant={STATUS_COLORS[booking?.status] || 'gray'} className="text-sm px-3 py-1">{booking?.status}</Badge>
        </div>

        {error && <Alert variant="error" className="mb-4">{error}</Alert>}

        <Card className="p-6 mb-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Patient Details</h2>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span className="text-gray-500">Date & Time</span>
            <span className="font-medium">{formatDate(booking?.startTime)}</span>
            <span className="text-gray-500">Symptoms</span>
            <span className="font-medium">{booking?.symptoms || '—'}</span>
            {booking?.notes && <><span className="text-gray-500">Notes</span><span className="font-medium">{booking.notes}</span></>}
            {booking?.meetingLink && (
              <>
                <span className="text-gray-500">Meeting</span>
                <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">Join Call</a>
              </>
            )}
          </div>
        </Card>

        {/* Status actions */}
        <Card className="p-5 mb-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Update Status</h2>
          <div className="flex gap-2 flex-wrap">
            {booking?.status === 'SCHEDULED' && (
              <Button onClick={() => updateStatus('IN_PROGRESS')} disabled={statusLoading}>
                Start Consultation
              </Button>
            )}
            {booking?.status === 'IN_PROGRESS' && (
              <>
                <Button onClick={() => updateStatus('COMPLETED')} disabled={statusLoading}>
                  Mark Complete
                </Button>
                <Button variant="secondary" onClick={() => setPrescriptionModal(true)}>
                  Issue Prescription
                </Button>
              </>
            )}
            {booking?.status === 'SCHEDULED' && (
              <Button variant="danger" onClick={() => updateStatus('CANCELLED')} disabled={statusLoading}>
                Cancel
              </Button>
            )}
          </div>
        </Card>

        {/* Existing prescription */}
        {prescription && (
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Issued Prescription</h2>
            <p className="text-sm font-medium text-gray-900 mb-2">{prescription.diagnosis}</p>
            {(prescription.medications || []).map((med, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-3 mb-2">
                <p className="text-sm font-semibold text-gray-900">{med.medicineName}</p>
                <p className="text-xs text-gray-500">{med.dosage} · {med.frequency} · {med.duration}</p>
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* Prescription modal */}
      <Modal isOpen={prescriptionModal} onClose={() => setPrescriptionModal(false)} title="Issue Prescription" size="lg">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Diagnosis *</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Primary diagnosis…"
              value={prescriptionForm.diagnosis}
              onChange={(e) => setPrescriptionForm({ ...prescriptionForm, diagnosis: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Medications</label>
            {prescriptionForm.medications.map((med, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-3 mb-2">
                <div className="grid grid-cols-2 gap-2">
                  <input className="col-span-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm" placeholder="Medicine name *" value={med.medicineName} onChange={(e) => setMed(i, 'medicineName', e.target.value)} />
                  <input className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm" placeholder="Dosage" value={med.dosage} onChange={(e) => setMed(i, 'dosage', e.target.value)} />
                  <input className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm" placeholder="Frequency" value={med.frequency} onChange={(e) => setMed(i, 'frequency', e.target.value)} />
                  <input className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm" placeholder="Duration" value={med.duration} onChange={(e) => setMed(i, 'duration', e.target.value)} />
                  <input className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm" placeholder="Instructions" value={med.instructions} onChange={(e) => setMed(i, 'instructions', e.target.value)} />
                </div>
                {prescriptionForm.medications.length > 1 && (
                  <button type="button" onClick={() => setPrescriptionForm({ ...prescriptionForm, medications: prescriptionForm.medications.filter((_, idx) => idx !== i) })} className="text-xs text-red-500 mt-1">Remove</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setPrescriptionForm({ ...prescriptionForm, medications: [...prescriptionForm.medications, { medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }] })} className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700">
              <Plus className="h-3 w-3" /> Add medication
            </button>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">General Instructions</label>
            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" rows={2} value={prescriptionForm.instructions} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, instructions: e.target.value })} placeholder="Dietary advice, lifestyle, follow-up instructions…" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Follow-up Date (optional)</label>
            <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" value={prescriptionForm.followUpDate} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, followUpDate: e.target.value })} />
          </div>
          {error && <Alert variant="error">{error}</Alert>}
          <Button onClick={handlePrescribe} disabled={prescribing || !prescriptionForm.diagnosis} size="lg" className="w-full">
            {prescribing ? 'Issuing…' : 'Issue Prescription'}
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
