import { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Inventory,
  Category,
  Warning,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';

interface Stats {
  totalInbound: number;
  totalOutbound: number;
  totalMaterials: number;
  totalProducts: number;
  lowStockCount: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/dashboard/stats?period=today');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const mockChartData = [
    { name: 'Mon', inbound: 400, outbound: 240 },
    { name: 'Tue', inbound: 300, outbound: 139 },
    { name: 'Wed', inbound: 200, outbound: 980 },
    { name: 'Thu', inbound: 278, outbound: 390 },
    { name: 'Fri', inbound: 189, outbound: 480 },
    { name: 'Sat', inbound: 239, outbound: 380 },
    { name: 'Sun', inbound: 349, outbound: 430 },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Inbound Today
                  </Typography>
                  <Typography variant="h4">{stats?.totalInbound || 0}</Typography>
                </Box>
                <TrendingUp color="success" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Outbound Today
                  </Typography>
                  <Typography variant="h4">{stats?.totalOutbound || 0}</Typography>
                </Box>
                <TrendingDown color="error" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Materials
                  </Typography>
                  <Typography variant="h4">{stats?.totalMaterials || 0}</Typography>
                </Box>
                <Category color="primary" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Low Stock Items
                  </Typography>
                  <Typography variant="h4" color="error">
                    {stats?.lowStockCount || 0}
                  </Typography>
                </Box>
                <Warning color="warning" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Weekly Inbound vs Outbound
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="inbound" fill="#82ca9d" name="Inbound" />
                <Bar dataKey="outbound" fill="#8884d8" name="Outbound" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Transaction Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="inbound"
                  stroke="#82ca9d"
                  name="Inbound"
                />
                <Line
                  type="monotone"
                  dataKey="outbound"
                  stroke="#8884d8"
                  name="Outbound"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
