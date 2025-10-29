import { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  QrCodeScanner,
  Inventory,
  Category,
  ShoppingCart,
  Assessment,
  Logout,
  Brightness4,
  Brightness7,
  People,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const drawerWidth = 280;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Scanning', icon: <QrCodeScanner />, path: '/scanning' },
  { text: 'Inventory', icon: <Inventory />, path: '/inventory' },
  { text: 'Materials', icon: <Category />, path: '/materials' },
  { text: 'Products', icon: <ShoppingCart />, path: '/products' },
  { text: 'Reports', icon: <Assessment />, path: '/reports' },
  { text: 'Users', icon: <People />, path: '/users', adminOnly: true },
];

interface LayoutProps {
  children: React.ReactNode;
  mode: 'light' | 'dark';
  toggleTheme: () => void;
}

export default function Layout({ children, mode, toggleTheme }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 800,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          📦 Warehouse Pro
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', display: 'block', mt: 0.5 }}>
          Production & Inventory
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <List sx={{ flexGrow: 1, px: 2, py: 2 }}>
        {menuItems
          .filter((item) => !item.adminOnly || user?.role === 'ADMIN')
          .map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  color: isSelected ? 'white' : 'rgba(255,255,255,0.7)',
                  backgroundColor: isSelected ? alpha('#ffffff', 0.2) : 'transparent',
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: alpha('#ffffff', 0.15),
                    color: 'white',
                    transform: 'translateX(4px)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: alpha('#ffffff', 0.2),
                    '&:hover': {
                      backgroundColor: alpha('#ffffff', 0.25),
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 600 : 500,
                    fontSize: '0.95rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2, 
                display: { sm: 'none' },
                color: theme.palette.text.primary,
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              noWrap 
              sx={{ 
                color: theme.palette.text.primary,
                fontWeight: 700,
              }}
            >
              {menuItems.find((item) => item.path === location.pathname)?.text || 'Dashboard'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Dark Mode Toggle */}
            <IconButton 
              onClick={toggleTheme} 
              sx={{ color: theme.palette.text.primary }}
            >
              {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            
            {/* User Info */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                {user?.name}
              </Typography>
            </Box>
            
            {/* User Menu */}
            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'primary.main',
                  width: 40,
                  height: 40,
                  fontWeight: 600,
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 220,
                borderRadius: 2,
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body2" fontWeight={600}>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem disabled sx={{ py: 1 }}>
              <Typography variant="caption">
                Role: <strong>{user?.role}</strong>
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
              <ListItemIcon>
                <Logout fontSize="small" color="error" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar Navigation */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Box sx={{ mt: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
