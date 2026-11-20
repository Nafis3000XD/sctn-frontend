import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';

// Route-level code splitting: each role only downloads its own dashboard chunk
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const CitizenDashboard = lazy(() => import('./pages/CitizenDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const VerifierDashboard = lazy(() => import('./pages/VerifierDashboard'));

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user } = useAuthStore();

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

function App() {
  const { user } = useAuthStore();

  return (
    <BrowserRouter>
      <div className="mesh-bg">
        <div className="mesh-blob"></div>
      </div>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />

          {/* Redirect based on role */}
          <Route path="/" element={
            !user ? <Navigate to="/login" replace /> :
            user.role === 'Citizen' ? <Navigate to="/citizen" replace /> :
            user.role === 'Admin' ? <Navigate to="/admin" replace /> :
            <Navigate to="/verifier" replace />
          } />

          <Route path="/citizen/*" element={
            <ProtectedRoute allowedRoles={['Citizen']}>
              <CitizenDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/verifier/*" element={
            <ProtectedRoute allowedRoles={['JobInterviewer', 'BankLoanOfficer', 'UniversityAuthority', 'Admin', 'Doctor', 'IntelligenceDepartment']}>
              <VerifierDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
