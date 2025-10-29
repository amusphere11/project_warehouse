/**
 * ComplexStatisticsCard - Premium stat card inspired by Material Dashboard React
 * Shows statistics with icon, value, and percentage change
 */

import { Card, CardContent, Typography, Box, Icon, useTheme, alpha } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface ComplexStatisticsCardProps {
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'dark';
  icon: React.ReactNode;
  title: string;
  count: number | string;
  percentage?: {
    color: 'success' | 'error' | 'info' | 'warning';
    amount: string;
    label: string;
  };
}

export default function ComplexStatisticsCard({
  color = 'primary',
  icon,
  title,
  count,
  percentage,
}: ComplexStatisticsCardProps) {
  const theme = useTheme();

  const colorMap = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    info: theme.palette.info.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    dark: theme.palette.grey[900],
  };

  const bgColor = colorMap[color];

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'visible',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[6],
        },
      }}
    >
      <CardContent sx={{ p: 3, position: 'relative' }}>
        {/* Icon Box - Absolute positioned */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            left: 24,
            width: 64,
            height: 64,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(195deg, ${bgColor}, ${alpha(bgColor, 0.7)})`,
            color: 'white',
            boxShadow: `0 4px 20px 0 rgba(0, 0, 0, 0.14), 0 7px 10px -5px ${alpha(bgColor, 0.4)}`,
          }}
        >
          {icon}
        </Box>

        {/* Content */}
        <Box sx={{ textAlign: 'right', pt: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={500}
            sx={{ mb: 0.5 }}
          >
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {count}
          </Typography>
        </Box>

        {/* Percentage */}
        {percentage && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 2,
              pt: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            {percentage.color === 'success' ? (
              <TrendingUp sx={{ fontSize: 16, color: theme.palette.success.main }} />
            ) : percentage.color === 'error' ? (
              <TrendingDown sx={{ fontSize: 16, color: theme.palette.error.main }} />
            ) : null}
            <Typography
              variant="caption"
              fontWeight={700}
              color={`${percentage.color}.main`}
            >
              {percentage.amount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {percentage.label}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
