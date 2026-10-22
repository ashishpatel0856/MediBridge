import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Public landing
import LandingPage from './pages/LandingPage';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RegisterPatient from './pages/auth/RegisterPatient';
import RegisterDoctor from './pages/auth/RegisterDoctor';
import MfaVerify from './pages/auth/MfaVerify';

// Patient pages
import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorSearch from './pages/patient/DoctorSearch';
import DoctorProfile from './pages/patient/DoctorProfile';
import MyAppointments from './pages/patient/MyAppointments';
import ConsultationDetail from './pages/patient/ConsultationDetail';

// Doctor pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import Availability from './pages/doctor/Availability';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import ConsultationManage from './pages/doctor/ConsultationManage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorVerification from './pages/admin/DoctorVerification';
import AuditLogs from './pages/admin/AuditLogs';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/patient" element={<RegisterPatient />} />
          <Route path="/register/doctor" element={<RegisterDoctor />} />
          <Route path="/mfa/verify" element={<MfaVerify />} />

          {/* Patient routes */}
          <Route path="/patient/dashboard" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <PatientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/patient/doctors" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <DoctorSearch />
            </ProtectedRoute>
          } />
          <Route path="/patient/doctors/:id" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <DoctorProfile />
            </ProtectedRoute>
          } />
          <Route path="/patient/appointments" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <MyAppointments />
            </ProtectedRoute>
          } />
          <Route path="/patient/appointments/:id" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <ConsultationDetail />
            </ProtectedRoute>
          } />

          {/* Doctor routes */}
          <Route path="/doctor/dashboard" element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/doctor/availability" element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <Availability />
            </ProtectedRoute>
          } />
          <Route path="/doctor/appointments" element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <DoctorAppointments />
            </ProtectedRoute>
          } />
          <Route path="/doctor/appointments/:id" element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <ConsultationManage />
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/doctors" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DoctorVerification />
            </ProtectedRoute>
          } />
          <Route path="/admin/audit" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AuditLogs />
            </ProtectedRoute>
          } />

          {/* Landing & Redirects */}
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  </AuthProvider>
  );
}
