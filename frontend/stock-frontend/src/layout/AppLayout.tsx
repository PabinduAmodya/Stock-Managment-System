import React from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CategoryIcon from '@mui/icons-material/Category';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SettingsIcon from '@mui/icons-material/Settings';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const DRAWER_WIDTH = 260;

const NAV_ITEMS: {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles?: Array<'ADMIN' | 'MANAGER' | 'CASHIER'>;
}[] = [
  { to: '/',               label: 'Dashboard',      icon: <DashboardIcon /> },
  { to: '/products',       label: 'Products',        icon: <Inventory2Icon /> },
  { to: '/categories',     label: 'Categories',      icon: <CategoryIcon /> },
  { to: '/suppliers',      label: 'Suppliers',       icon: <LocalShippingIcon />,          roles: ['ADMIN', 'MANAGER'] },
  { to: '/customers',      label: 'Customers',       icon: <PeopleIcon /> },
  { to: '/purchases',      label: 'Purchases (GRN)', icon: <ShoppingCartIcon />,           roles: ['ADMIN', 'MANAGER'] },
  { to: '/sales',          label: 'Sales',           icon: <PointOfSaleIcon /> },
  { to: '/stock',          label: 'Stock History',   icon: <TimelineIcon />,               roles: ['ADMIN', 'MANAGER'] },
  { to: '/reports',        label: 'Reports',         icon: <AssessmentIcon />,             roles: ['ADMIN', 'MANAGER'] },
  { to: '/users',          label: 'Users',           icon: <AdminPanelSettingsIcon />,     roles: ['ADMIN'] },
];

const ROLE_COLORS: Record<string, 'error' | 'warning' | 'success'> = {
  ADMIN:   'error',
  MANAGER: 'warning',
  CASHIER: 'success',
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role))
  );

  // Initials for the avatar in the sidebar
  const initials = (user?.name ?? '')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ── Brand / user info ── */}
      <Toolbar sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2, gap: 1 }}>
        <Typography variant="h6" noWrap fontWeight={800} color="primary">
          Stock Management
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            sx={{
              width: 32, height: 32, fontSize: 13, fontWeight: 700,
              background: 'linear-gradient(135deg, #1A237E, #0288D1)',
            }}
          >
            {initials}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
              {user?.name}
            </Typography>
            <Chip
              label={user?.role}
              size="small"
              color={ROLE_COLORS[user?.role ?? 'CASHIER']}
              sx={{ fontSize: 10, height: 18 }}
            />
          </Box>
        </Box>
      </Toolbar>

      <Divider />

      {/* ── Main nav ── */}
      <List sx={{ flex: 1, py: 1 }}>
        {visibleNavItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={RouterLink}
            to={item.to}
            selected={location.pathname === item.to}
            onClick={() => setMobileOpen(false)}
            sx={{
              borderRadius: 1.5,
              mx: 1,
              mb: 0.25,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'white',
                '& .MuiListItemIcon-root': { color: 'white' },
                '&:hover': { bgcolor: 'primary.dark' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 38 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />
          </ListItemButton>
        ))}
      </List>

      <Divider />

      {/* ── Bottom: Settings + Logout ── */}
      <List sx={{ py: 1 }}>
        <ListItemButton
          component={RouterLink}
          to="/settings"
          selected={location.pathname === '/settings'}
          onClick={() => setMobileOpen(false)}
          sx={{
            borderRadius: 1.5,
            mx: 1,
            mb: 0.25,
            '&.Mui-selected': {
              bgcolor: 'primary.main',
              color: 'white',
              '& .MuiListItemIcon-root': { color: 'white' },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 38 }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" primaryTypographyProps={{ fontSize: 14 }} />
        </ListItemButton>

        <Tooltip title="Logout" placement="right">
          <ListItemButton
            onClick={logout}
            sx={{ borderRadius: 1.5, mx: 1, color: 'error.main',
              '& .MuiListItemIcon-root': { color: 'error.main' } }}
          >
            <ListItemIcon sx={{ minWidth: 38 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 14 }} />
          </ListItemButton>
        </Tooltip>
      </List>
    </Box>
  );

  const pageTitle =
    [...visibleNavItems, { to: '/settings', label: 'Settings' }]
      .find((x) => x.to === location.pathname)?.label ?? 'Stock Management';

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* ── Top AppBar ── */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap fontWeight={700}>
            {pageTitle}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* ── Sidebar ── */}
      <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        {/* Mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* ── Page content ── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}