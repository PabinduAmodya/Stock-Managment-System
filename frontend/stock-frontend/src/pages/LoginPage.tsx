import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import InventoryIcon from '@mui/icons-material/Inventory';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import { AuthAPI } from '../api/endpoints';
import { useAuth } from '../auth/AuthContext';

export function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [busy,     setBusy]     = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const canSubmit = useMemo(
    () => email.trim().length > 3 && password.length > 0,
    [email, password]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      const res = await AuthAPI.login({ email: email.trim(), password });
      login({ token: res.token, name: res.name, email: res.email, role: res.role, status: res.status });
      nav('/', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Login failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a237e 0%, #1565c0 50%, #0288d1 100%)',
        position: 'relative',
        overflow: 'hidden',
        p: 2,
      }}
    >
      {/* Decorative background circles */}
      <Box sx={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300,
        borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240,
        borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
      <Box sx={{ position: 'absolute', top: '40%', left: -40, width: 180, height: 180,
        borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

      {/* Card */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 4,
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.25)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Top accent bar */}
        <Box sx={{ height: 5, background: 'linear-gradient(90deg, #1a237e, #0288d1)' }} />

        <Box sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 64, height: 64,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f0f4ff, #ffffff)',
                border: '1px solid #e0e8ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 4px 12px rgba(26,35,126,0.12)',
              }}
            >
              <InventoryIcon sx={{ fontSize: 32, color: '#1565c0' }} />
            </Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, letterSpacing: -0.5, color: '#1a237e', mb: 0.5 }}
            >
              Stock Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your account
            </Typography>
          </Box>

          {/* Error alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={onSubmit} sx={{ display: 'grid', gap: 2.5 }}>
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': { borderColor: '#1565c0' },
                  '&.Mui-focused fieldset': { borderColor: '#1a237e' },
                },
              }}
            />

            <TextField
              label="Password"
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPwd((v) => !v)} edge="end">
                      {showPwd
                        ? <VisibilityOffIcon sx={{ fontSize: 20 }} />
                        : <VisibilityIcon sx={{ fontSize: 20 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': { borderColor: '#1565c0' },
                  '&.Mui-focused fieldset': { borderColor: '#1a237e' },
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!canSubmit || busy}
              fullWidth
              sx={{
                mt: 0.5,
                py: 1.4,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: 15,
                background: 'linear-gradient(135deg, #1a237e, #0288d1)',
                boxShadow: '0 6px 20px rgba(26,35,126,0.35)',
                transition: 'all 0.2s',
                '&:hover': {
                  background: 'linear-gradient(135deg, #151c6b, #0277bd)',
                  boxShadow: '0 8px 24px rgba(26,35,126,0.45)',
                  transform: 'translateY(-1px)',
                },
                '&:active': { transform: 'translateY(0)' },
                '&.Mui-disabled': {
                  background: '#e0e0e0',
                  boxShadow: 'none',
                },
              }}
            >
              {busy ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={18} sx={{ color: 'white' }} />
                  <span>Signing in…</span>
                </Box>
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              mt: 3, pt: 2,
              borderTop: '1px solid #f0f0f0',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" color="text.disabled">
              © {new Date().getFullYear()} Stock Management System
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}