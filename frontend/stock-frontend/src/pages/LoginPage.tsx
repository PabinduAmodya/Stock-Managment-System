    import React, { useMemo, useState } from 'react';
    import {
      Box,
      Button,
      TextField,
      Typography,
      Alert,
      InputAdornment,
      IconButton,
      CircularProgress
    } from '@mui/material';
    import VisibilityIcon from '@mui/icons-material/Visibility';
    import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
    import InventoryIcon from '@mui/icons-material/Inventory';
    import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
    import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
    import { useNavigate } from 'react-router-dom';
    import { AuthAPI } from '../api/endpoints';
    import { useAuth } from '../auth/AuthContext';

    export function LoginPage() {
      const nav = useNavigate();
      const { login } = useAuth();

      const [email, setEmail]       = useState('');
      const [password, setPassword] = useState('');
      const [showPwd, setShowPwd]   = useState(false);
      const [busy, setBusy]         = useState(false);
      const [error, setError]       = useState<string | null>(null);

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
          const response = await AuthAPI.login({ email: email.trim(), password });
          login({
            token:  response.token,
            name:   response.name,
            email:  response.email,
            role:   response.role,
            status: response.status
          });
          nav('/', { replace: true });
        } catch (err: any) {
          const msg = err?.response?.data?.message ?? err?.message ?? 'Login failed';
          setError(msg);
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
          }}
        >
          {/* Background decorative circles */}
          <Box sx={{
            position: 'absolute', width: 400, height: 400, borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)', top: -100, left: -100
          }} />
          <Box sx={{
            position: 'absolute', width: 300, height: 300, borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)', bottom: -80, right: -80
          }} />
          <Box sx={{
            position: 'absolute', width: 200, height: 200, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)', top: '40%', right: '10%'
          }} />

          {/* Card */}
          <Box
            sx={{
              width: '100%',
              maxWidth: 420,
              mx: 2,
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 32px 64px rgba(0,0,0,0.35)',
              backdropFilter: 'blur(10px)',
              background: 'rgba(255,255,255,0.97)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Top accent bar */}
            <Box sx={{ height: 5, background: 'linear-gradient(90deg, #1a237e, #0288d1)' }} />

            {/* Logo area */}
            <Box
              sx={{
                pt: 5, pb: 3, px: 4,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                background: 'linear-gradient(180deg, #f0f4ff 0%, #ffffff 100%)',
                borderBottom: '1px solid #e8edf5'
              }}
            >
              <Box
                sx={{
                  width: 64, height: 64, borderRadius: '18px',
                  background: 'linear-gradient(135deg, #1a237e, #0288d1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mb: 2,
                  boxShadow: '0 8px 24px rgba(26,35,126,0.3)'
                }}
              >
                <InventoryIcon sx={{ color: '#fff', fontSize: 32 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a237e', letterSpacing: '-0.5px' }}>
                Stock Management
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7a99', mt: 0.5 }}>
                Sign in to your account to continue
              </Typography>
            </Box>

            {/* Form area */}
            <Box sx={{ px: 4, py: 4 }}>
              {error && (
                <Alert
                  severity="error"
                  sx={{ mb: 3, borderRadius: 2, fontSize: 13 }}
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={onSubmit} sx={{ display: 'grid', gap: 2.5 }}>
                <TextField
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ color: '#9aa3b8', fontSize: 20 }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': { borderColor: '#1565c0' },
                      '&.Mui-focused fieldset': { borderColor: '#1a237e' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#1a237e' }
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
                        <LockOutlinedIcon sx={{ color: '#9aa3b8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPwd((v) => !v)} edge="end" size="small">
                          {showPwd
                            ? <VisibilityOffIcon sx={{ fontSize: 20, color: '#9aa3b8' }} />
                            : <VisibilityIcon sx={{ fontSize: 20, color: '#9aa3b8' }} />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': { borderColor: '#1565c0' },
                      '&.Mui-focused fieldset': { borderColor: '#1a237e' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#1a237e' }
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={!canSubmit || busy}
                  sx={{
                    mt: 0.5,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: 15,
                    letterSpacing: 0.5,
                    background: canSubmit && !busy
                      ? 'linear-gradient(135deg, #1a237e, #0288d1)'
                      : undefined,
                    boxShadow: canSubmit && !busy
                      ? '0 6px 20px rgba(26,35,126,0.35)'
                      : 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #151c6b, #0277bd)',
                      boxShadow: '0 8px 24px rgba(26,35,126,0.45)',
                      transform: 'translateY(-1px)'
                    },
                    '&:active': { transform: 'translateY(0)' }
                  }}
                >
                  {busy
                    ? <><CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />Signing in…</>
                    : 'Sign In'
                  }
                </Button>
              </Box>

              {/* Footer */}
              <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #f0f0f5', textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#aab0c0' }}>
                  © {new Date().getFullYear()} Stock Management System
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      );
    }