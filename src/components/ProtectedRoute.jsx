
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import api from '../api/axios';

function ProtectedRoute() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let active = true;

    api.get('/users/me')
      .then(() => {
        if (active) setStatus('authenticated');
      })
      .catch(() => {
        if (active) setStatus('unauthenticated');
      });

    return () => {
      active = false;
    };
  }, []);

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">Checking authentication...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
