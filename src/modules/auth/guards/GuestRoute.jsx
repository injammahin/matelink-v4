import { Navigate, Outlet } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/modules/auth/context/AuthContext';
import './auth-transition.css';

function AuthTransitionOverlay() {
  return (
    <div
      className="ml-auth-transition"
      role="status"
      aria-live="polite"
      aria-label="Signing in"
    >
      <div className="ml-auth-loader">
        <ShieldCheck
          className="ml-auth-loader__icon"
          size={26}
          strokeWidth={1.8}
        />
      </div>
    </div>
  );
}

export default function GuestRoute() {
  const {
    user,
    isAuthenticated,
    authLoading,
  } = useAuth();

  if (!authLoading && isAuthenticated && user) {
    const destination =
      String(user.role || '').toLowerCase() === 'admin'
        ? '/admin'
        : '/account';

    return <Navigate to={destination} replace />;
  }

  return (
    <>
      <Outlet />

      {authLoading && <AuthTransitionOverlay />}
    </>
  );
}