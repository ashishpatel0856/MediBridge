import { useEffect, useState } from 'react';
import { slotService } from '../../services/slot.service';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Calendar, Clock, Plus, Users, AlertTriangle } from 'lucide-react';

const SIDEBAR_LINKS = [
  { to: '/doctor/dashboard', label: 'Dashboard', icon: Users },
  { to: '/doctor/availability', label: 'Availability', icon: Clock },
  { to: '/doctor/appointments', label: 'Appointments', icon: Calendar },
  { to: '/doctor/profile', label: 'My Profile', icon: Users },
];

function toLocalDatetimeValue(date) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function Availability() {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addSlots, setAddSlots] = useState([{ startTime: '', endTime: '' }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isVerified = user?.isVerified !== false;

  const fetchSlots = async () => {
    try {
      const { data } = await slotService.getSlots({ availableOnly: true });
      setSlots(data.data || []);
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlots(); }, []);

  const addSlotRow = () => setAddSlots([...addSlots, { startTime: '', endTime: '' }]);
  const removeSlotRow = (i) => setAddSlots(addSlots.filter((_, idx) => idx !== i));
  const setSlotField = (i, field, val) => {
    const next = [...addSlots];
    next[i][field] = val;
    if (field === 'startTime' && val) {
      const start = new Date(val);
      start.setMinutes(start.getMinutes() + 30);
      next[i].endTime = toLocalDatetimeValue(start);
    }
    setAddSlots(next);
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    const valid = addSlots.filter((s) => s.startTime && s.endTime);
    if (valid.length === 0) return setError('Please fill in at least one slot.');
    setSaving(true);
    try {
      await slotService.createSlots(valid.map((s) => ({
        startTime: new Date(s.startTime).toISOString(),
        endTime: new Date(s.endTime).toISOString(),
      })));
      setSuccess(`${valid.length} slot(s) created successfully.`);
      setAddSlots([{ startTime: '', endTime: '' }]);
      fetchSlots();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create slots.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout sidebarLinks={SIDEBAR_LINKS}>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Availability</h1>

        {!isVerified && (
          <Alert variant="warning" className="mb-6 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>You cannot create availability slots until your account is verified by an admin.</span>
          </Alert>
        )}

        {/* Add slots form */}
        {isVerified && (
          <Card className="p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Add New Slots</h2>
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}
            {success && <Alert variant="success" className="mb-4">{success}</Alert>}

            <div className="flex flex-col gap-3">
              {addSlots.map((slot, i) => (
                <div key={i} className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">Start Time</label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={slot.startTime}
                      onChange={(e) => setSlotField(i, 'startTime', e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">End Time</label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={slot.endTime}
                      onChange={(e) => setSlotField(i, 'endTime', e.target.value)}
                    />
                  </div>
                  {addSlots.length > 1 && (
                    <button onClick={() => removeSlotRow(i)} className="text-red-400 hover:text-red-600 pb-2 text-sm">✕</button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4">
              <button onClick={addSlotRow} className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700">
                <Plus className="h-4 w-4" /> Add another slot
              </button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save Slots'}
              </Button>
            </div>
          </Card>
        )}

        {/* Existing slots */}
        <Card>
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Available Slots</h2>
          </div>
          {loading ? (
            <LoadingSpinner className="py-10" />
          ) : slots.length === 0 ? (
            <EmptyState icon={Clock} title="No slots yet" description="Add your available time slots above" />
          ) : (
            <div className="divide-y divide-gray-50">
              {slots.map((s) => (
                <div key={s.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(s.startTime || s.start_time).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-gray-400">to {new Date(s.endTime || s.end_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">Available</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
