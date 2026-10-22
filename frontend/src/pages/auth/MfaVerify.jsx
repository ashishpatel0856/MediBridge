import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

export default function MfaVerify() {
  const { verifyMfa } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const mfaTempToken = location.state?.mfaTempToken;

  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!mfaTempToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Invalid session. <a href="/login" className="text-teal-600">Go to login</a></p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await verifyMfa(token, mfaTempToken);
      const dest = user.role === 'DOCTOR' ? '/doctor/dashboard' : user.role === 'ADMIN' ? '/admin/dashboard' : '/patient/dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 bg-teal-600 rounded-2xl mb-4">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Two-Factor Verification</h1>
          <p className="text-sm text-gray-500 mt-1">Enter the 6-digit code from your authenticator app</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {error && <Alert variant="error" className="mb-5">{error}</Alert>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Verification Code"
              type="text"
              inputMode="numeric"
              placeholder="123456"
              maxLength={6}
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
              required
            />
            <Button type="submit" disabled={loading || token.length !== 6} size="lg" className="w-full">
              {loading ? 'Verifying…' : 'Verify'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
