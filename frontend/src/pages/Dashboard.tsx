import { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Category,
  Warning,
  ArrowUpward,
  ArrowDownward,
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
import ComplexStatisticsCard from '../components/ComplexStatisticsCard';

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
  const theme = useTheme();

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

  const statCards = [
    {
      color: 'success' as const,
      icon: <TrendingUp sx={{ fontSize: 28 }} />,
      title: 'Inbound Today',
      count: stats?.totalInbound || 0,
      percentage: {
        color: 'success' as const,
        amount: '+12.5%',
        label: 'than last week',
      },
    },
    {
      color: 'error' as const,
      icon: <TrendingDown sx={{ fontSize: 28 }} />,
      title: 'Outbound Today',
      count: stats?.totalOutbound || 0,
      percentage: {
        color: 'info' as const,
        amount: '+8.2%',
        label: 'than last week',
      },
    },
    {
      color: 'primary' as const,
      icon: <Category sx={{ fontSize: 28 }} />,
      title: 'Total Materials',
      count: stats?.totalMaterials || 0,
      percentage: {
        color: 'success' as const,
        amount: '+5.4%',
        label: 'than last month',
      },
    },
    {
      color: 'warning' as const,
      icon: <Warning sx={{ fontSize: 28 }} />,
      title: 'Low Stock Items',
      count: stats?.lowStockCount || 0,
      percentage: {
        color: 'error' as const,
        amount: '3 items',
        label: 'need attention',
      },
    },
  ];

  return (
    <Box sx={{ mt: -2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome back! Here's what's happening with your warehouse today.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Premium Stats Cards with Material Dashboard style */}
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={6} lg={3} key={index}>
            <ComplexStatisticsCard
              color={card.color}
              icon={card.icon}
              title={card.title}
              count={card.count}
              percentage={card.percentage}
            />
          </Grid>
        ))}

        {/* Charts with Modern Styling */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Weekly Inbound vs Outbound
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Transaction comparison for the last 7 days
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockChartData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={theme.palette.divider}
                  vertical={false}
                />
                <XAxis 
                  dataKey="name" 
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="inbound" 
                  fill={theme.palette.success.main} 
                  name="Inbound"
                  radius={[8, 8, 0, 0]}
                />
                <Bar 
                  dataKey="outbound" 
                  fill={theme.palette.primary.main} 
                  name="Outbound"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Transaction Trend
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Inbound and outbound flow over time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockChartData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={theme.palette.divider}
                  vertical={false}
                />
                <XAxis 
                  dataKey="name" 
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="inbound"
                  stroke={theme.palette.success.main}
                  strokeWidth={3}
                  name="Inbound"
                  dot={{ fill: theme.palette.success.main, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="outbound"
                  stroke={theme.palette.primary.main}
                  strokeWidth={3}
                  name="Outbound"
                  dot={{ fill: theme.palette.primary.main, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
