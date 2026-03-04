import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { CircularProgress, Box } from '@mui/material';

type Props = {
  children: React.ReactNode;
  allowedRoles?: Array<'ADMIN' | 'MANAGER' | 'CASHIER'>;
};

export function RequireAuth({ children, allowedRoles }: Props) {
  const { user, loading } = useAuth();

  // Still loading from localStorage — show spinner, don't redirect yet
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Not logged in → redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // Wrong role → redirect to dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}