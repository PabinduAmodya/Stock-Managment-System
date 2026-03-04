import React from 'react';
import {
  AppBar,
  Box,
  Chip,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Tooltip
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
import LogoutIcon from '@mui/icons-material/Logout';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const drawerWidth = 260;

// Nav items with optional role restriction
const navItems: { to: string; label: string; icon: React.ReactNode; roles?: string[] }[] = [
  { to: '/',          label: 'Dashboard',       icon: <DashboardIcon /> },
  { to: '/products',  label: 'Products',         icon: <Inventory2Icon /> },
  { to: '/categories',label: 'Categories',       icon: <CategoryIcon /> },
  { to: '/suppliers', label: 'Suppliers',        icon: <LocalShippingIcon />,  roles: ['ADMIN', 'MANAGER'] },
  { to: '/customers', label: 'Customers',        icon: <PeopleIcon /> },
  { to: '/purchases', label: 'Purchases (GRN)',  icon: <ShoppingCartIcon />,   roles: ['ADMIN', 'MANAGER'] },
  { to: '/sales',     label: 'Sales',            icon: <PointOfSaleIcon /> },
  { to: '/stock',     label: 'Stock History',    icon: <TimelineIcon />,       roles: ['ADMIN', 'MANAGER'] },
  { to: '/reports',   label: 'Reports',          icon: <AssessmentIcon />,     roles: ['ADMIN', 'MANAGER'] },
  { to: '/users',     label: 'Users',            icon: <AdminPanelSettingsIcon />, roles: ['ADMIN'] }
];

const roleColors: Record<string, 'error' | 'warning' | 'success'> = {
  ADMIN:   'error',
  MANAGER: 'warning',
  CASHIER: 'success'
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Filter nav items based on user role
  const visibleNavItems = navItems.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role))
  );

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar>
        <Box>
          <Typography variant="h6" noWrap fontWeight={800}>
             Stock Management
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              {user?.name}
            </Typography>
            <Chip
              label={user?.role}
              size="small"
              color={roleColors[user?.role ?? 'CASHIER']}
              sx={{ fontSize: 10, height: 18 }}
            />
          </Box>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ flex: 1 }}>
        {visibleNavItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={RouterLink}
            to={item.to}
            selected={location.pathname === item.to}
            onClick={() => setMobileOpen(false)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 1 }}>
        <Tooltip title="Logout">
          <ListItemButton onClick={logout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` }
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
          <Typography variant="h6" noWrap>
            {visibleNavItems.find((x) => x.to === location.pathname)?.label ?? 'Stock Management'}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` }
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}