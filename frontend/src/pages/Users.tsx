import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  FormControlLabel,
  Switch,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  Search,
  Refresh,
} from '@mui/icons-material';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'OPERATOR';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserFormData {
  email: string;
  name: string;
  password: string;
  role: 'ADMIN' | 'MANAGER' | 'OPERATOR';
  isActive: boolean;
}

const initialFormData: UserFormData = {
  email: '',
  name: '',
  password: '',
  role: 'OPERATOR',
  isActive: true,
};

export default function Users() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterActive, setFilterActive] = useState('');

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, filterRole, filterActive]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: page + 1,
        limit: pageSize,
      };
      if (searchTerm) params.search = searchTerm;
      if (filterRole) params.role = filterRole;
      if (filterActive !== '') params.isActive = filterActive === 'true';

      const response = await api.get('/api/users', { params });
      setUsers(response.data.data || []);
      setTotal(response.data.pagination?.total || 0);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchUsers();
  };

  const handleOpenDialog = (mode: 'create' | 'edit', user?: User) => {
    setDialogMode(mode);
    if (mode === 'edit' && user) {
      setSelectedUser(user);
      setFormData({
        email: user.email,
        name: user.name,
        password: '', // Don't populate password
        role: user.role,
        isActive: user.isActive,
      });
    } else {
      setSelectedUser(null);
      setFormData(initialFormData);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData(initialFormData);
    setShowPassword(false);
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.email || !formData.name) {
        showSnackbar('Email and name are required', 'error');
        return;
      }

      if (dialogMode === 'create' && !formData.password) {
        showSnackbar('Password is required for new users', 'error');
        return;
      }

      if (dialogMode === 'create') {
        // Create user
        await api.post('/api/users', formData);
        showSnackbar('User created successfully', 'success');
      } else {
        // Update user
        const updateData: any = {
          email: formData.email,
          name: formData.name,
          role: formData.role,
          isActive: formData.isActive,
        };
        // Only include password if it's provided
        if (formData.password) {
          updateData.password = formData.password;
        }
        await api.put(`/api/users/${selectedUser?.id}`, updateData);
        showSnackbar('User updated successfully', 'success');
      }

      handleCloseDialog();
      fetchUsers();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/api/users/${userId}`);
      showSnackbar('User deleted successfully', 'success');
      fetchUsers();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to delete user', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 130,
      renderCell: (params: GridRenderCellParams) => {
        const roleColors: any = {
          ADMIN: 'error',
          MANAGER: 'warning',
          OPERATOR: 'info',
        };
        return (
          <Chip
            label={params.value}
            color={roleColors[params.value] || 'default'}
            size="small"
          />
        );
      },
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
          variant={params.value ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 150,
      valueFormatter: (params: any) => {
        return new Date(params).toLocaleDateString();
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={
            <Tooltip title="Edit">
              <Edit />
            </Tooltip>
          }
          label="Edit"
          onClick={() => handleOpenDialog('edit', params.row)}
          showInMenu={false}
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="Delete">
              <Delete />
            </Tooltip>
          }
          label="Delete"
          onClick={() => handleDelete(params.row.id)}
          showInMenu={false}
          disabled={params.row.id === currentUser?.id}
        />,
      ],
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          User Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage user accounts, roles, and permissions
        </Typography>
      </Box>

      {/* Filters and Actions */}
      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select
                value={filterRole}
                label="Role"
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="MANAGER">Manager</MenuItem>
                <MenuItem value="OPERATOR">Operator</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filterActive}
                label="Status"
                onChange={(e) => setFilterActive(e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={5} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<Search />}
              onClick={handleSearch}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                setSearchTerm('');
                setFilterRole('');
                setFilterActive('');
                setPage(0);
                fetchUsers();
              }}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog('create')}
            >
              Add User
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Data Grid */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          pagination
          page={page}
          pageSize={pageSize}
          rowCount={total}
          paginationMode="server"
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[10, 20, 50, 100]}
          disableSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        />
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Create New User' : 'Edit User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label={dialogMode === 'create' ? 'Password' : 'Password (leave empty to keep current)'}
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={dialogMode === 'create'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              >
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="MANAGER">Manager</MenuItem>
                <MenuItem value="OPERATOR">Operator</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
            {dialogMode === 'create' && (
              <Alert severity="info" sx={{ mt: 1 }}>
                The new user will receive an email with their login credentials.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {dialogMode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
