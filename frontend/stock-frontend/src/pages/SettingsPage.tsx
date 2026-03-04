import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../auth/AuthContext';
import { ProfileAPI } from '../api/endpoints';
import { Toast, ToastState } from '../components/Toast';

const ROLE_COLORS: Record<string, 'error' | 'warning' | 'success'> = {
  ADMIN:   'error',
  MANAGER: 'warning',
  CASHIER: 'success',
};

export function SettingsPage() {
  const { user, updateUser } = useAuth();

  // ── Profile form ──────────────────────────────────────────────────────────
  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [profileBusy, setProfileBusy] = useState(false);

  // ── Password form ─────────────────────────────────────────────────────────
  const [currentPwd,  setCurrentPwd]  = useState('');
  const [newPwd,      setNewPwd]      = useState('');
  const [confirmPwd,  setConfirmPwd]  = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdBusy,     setPwdBusy]     = useState(false);

  const [toast, setToast] = useState<ToastState>({ open: false, message: '', severity: 'info' });

  // Pre-fill from auth context
  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setEmail(user.email ?? '');
    }
  }, [user]);

  // Avatar initials
  const initials = (user?.name ?? '')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // ── Save profile ──────────────────────────────────────────────────────────
  const saveProfile = async () => {
    if (!name.trim()) {
      setToast({ open: true, message: 'Name cannot be empty', severity: 'warning' });
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setToast({ open: true, message: 'Enter a valid email address', severity: 'warning' });
      return;
    }
    setProfileBusy(true);
    try {
      const updated = await ProfileAPI.update({ name: name.trim(), email: email.trim() });
      // Reflect new name/email in sidebar immediately — no re-login needed
      updateUser({ name: updated.name, email: updated.email });
      setToast({ open: true, message: 'Profile updated successfully', severity: 'success' });
    } catch (e: any) {
      setToast({ open: true, message: e?.response?.data?.message ?? 'Update failed', severity: 'error' });
    } finally {
      setProfileBusy(false);
    }
  };

  // ── Change password ───────────────────────────────────────────────────────
  const changePassword = async () => {
    if (!currentPwd) {
      setToast({ open: true, message: 'Enter your current password', severity: 'warning' });
      return;
    }
    if (newPwd.length < 6) {
      setToast({ open: true, message: 'New password must be at least 6 characters', severity: 'warning' });
      return;
    }
    if (newPwd !== confirmPwd) {
      setToast({ open: true, message: 'New passwords do not match', severity: 'error' });
      return;
    }
    if (currentPwd === newPwd) {
      setToast({ open: true, message: 'New password must differ from current password', severity: 'warning' });
      return;
    }
    setPwdBusy(true);
    try {
      await ProfileAPI.changePassword({ currentPassword: currentPwd, newPassword: newPwd });
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setToast({ open: true, message: 'Password changed successfully', severity: 'success' });
    } catch (e: any) {
      setToast({ open: true, message: e?.response?.data?.message ?? 'Password change failed', severity: 'error' });
    } finally {
      setPwdBusy(false);
    }
  };

  const pwdMismatch = confirmPwd.length > 0 && confirmPwd !== newPwd;

  return (
    <Box sx={{ maxWidth: 680, mx: 'auto' }}>

      {/* ── Page heading ── */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A237E' }}>
          Account Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Update your personal details and change your password
        </Typography>
      </Box>

      {/* ════════════════════════════════════════
          CARD 1 — Profile
      ════════════════════════════════════════ */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
        <Box sx={{ height: 6, background: 'linear-gradient(90deg, #1A237E, #0288D1)' }} />
        <CardContent sx={{ p: 3 }}>

          {/* Avatar + current info row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar
              sx={{
                width: 64, height: 64, fontSize: 24, fontWeight: 800,
                background: 'linear-gradient(135deg, #1A237E, #0288D1)',
              }}
            >
              {initials || <PersonIcon />}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={user?.role}
                  size="small"
                  color={ROLE_COLORS[user?.role ?? 'CASHIER']}
                  sx={{ fontSize: 11, height: 20 }}
                />
              </Box>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <PersonIcon fontSize="small" sx={{ color: '#1565C0' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565C0' }}>
              Personal Information
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
            <TextField
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={profileBusy}
              onClick={saveProfile}
              sx={{
                borderRadius: 2, px: 3,
                background: 'linear-gradient(135deg, #1A237E, #0288D1)',
                '&:hover': { background: 'linear-gradient(135deg, #151c6b, #0277BD)' },
              }}
            >
              {profileBusy ? 'Saving…' : 'Save Profile'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* ════════════════════════════════════════
          CARD 2 — Change password
      ════════════════════════════════════════ */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
        <Box sx={{ height: 6, background: 'linear-gradient(90deg, #C62828, #E53935)' }} />
        <CardContent sx={{ p: 3 }}>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <LockOutlinedIcon fontSize="small" sx={{ color: '#C62828' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#C62828' }}>
              Change Password
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You must enter your current password to set a new one. Minimum 6 characters.
          </Typography>

          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField
              label="Current Password"
              type={showCurrent ? 'text' : 'password'}
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowCurrent((v) => !v)}>
                      {showCurrent ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="New Password"
              type={showNew ? 'text' : 'password'}
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowNew((v) => !v)}>
                      {showNew ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm New Password"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              fullWidth
              error={pwdMismatch}
              helperText={pwdMismatch ? 'Passwords do not match' : ''}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowConfirm((v) => !v)}>
                      {showConfirm ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              color="error"
              startIcon={<LockOutlinedIcon />}
              disabled={pwdBusy || !currentPwd || !newPwd || !confirmPwd || pwdMismatch}
              onClick={changePassword}
              sx={{ borderRadius: 2, px: 3 }}
            >
              {pwdBusy ? 'Changing…' : 'Change Password'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* ════════════════════════════════════════
          CARD 3 — Read-only info
      ════════════════════════════════════════ */}
      <Card sx={{ borderRadius: 3, background: '#F8F9FF', boxShadow: 'none', border: '1px solid #E0E8F8' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
            ACCOUNT INFO
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1.5 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Role</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.role}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Status</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#2E7D32' }}>
                {user?.status ?? 'ACTIVE'}
              </Typography>
            </Box>
          </Box>
          <Alert severity="info" sx={{ mt: 2, borderRadius: 2, py: 0.5, fontSize: 12 }}>
            Your role and account status can only be changed by an Administrator.
          </Alert>
        </CardContent>
      </Card>

      <Toast state={toast} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </Box>
  );
}