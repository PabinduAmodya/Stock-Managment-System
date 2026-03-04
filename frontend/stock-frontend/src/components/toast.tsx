import React from 'react';
import { Alert, Snackbar } from '@mui/material';

export type ToastState = {
  open: boolean;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
};

export function Toast({ state, onClose }: { state: ToastState; onClose: () => void }) {
  return (
    <Snackbar open={state.open} autoHideDuration={3500} onClose={onClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <Alert onClose={onClose} severity={state.severity} variant="filled" sx={{ width: '100%' }}>
        {state.message}
      </Alert>
    </Snackbar>
  );
}
