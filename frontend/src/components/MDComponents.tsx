/**
 * Material Dashboard React - Inspired Components
 * Premium components extracted and adapted for Warehouse Management System
 */

import { styled } from '@mui/material/styles';
import { Box, Card as MuiCard, Avatar as MuiAvatar } from '@mui/material';

// Gradient Box - For headers and special sections
export const MDBox = styled(Box)(({ theme, variant, bgColor, color, opacity, borderRadius, shadow, coloredShadow }) => ({
  opacity: opacity || 1,
  background: bgColor || 'transparent',
  color: color || 'inherit',
  borderRadius: borderRadius ? theme.spacing(borderRadius) : theme.spacing(1.5),
  boxShadow: shadow === 'none' ? 'none' : shadow ? theme.shadows[shadow] : 'none',
  ...(coloredShadow && {
    boxShadow: `0 4px 20px 0 rgba(0, 0, 0, 0.14), 0 7px 10px -5px ${coloredShadow}`,
  }),
  ...(variant === 'gradient' && {
    backgroundImage: `linear-gradient(195deg, ${bgColor}, ${coloredShadow || bgColor})`,
  }),
}));

// Enhanced Card with hover effects
export const MDCard = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  minWidth: 0,
  wordWrap: 'break-word',
  backgroundColor: theme.palette.background.paper,
  backgroundClip: 'border-box',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(2),
  boxShadow: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

// Avatar with gradient background
export const MDAvatar = styled(MuiAvatar)(({ theme, bgColor, size }) => ({
  width: size === 'xs' ? 24 : size === 'sm' ? 36 : size === 'lg' ? 58 : size === 'xl' ? 74 : size === 'xxl' ? 110 : 48,
  height: size === 'xs' ? 24 : size === 'sm' ? 36 : size === 'lg' ? 58 : size === 'xl' ? 74 : size === 'xxl' ? 110 : 48,
  fontSize: size === 'xs' ? 14 : size === 'sm' ? 18 : size === 'lg' ? 24 : size === 'xl' ? 32 : size === 'xxl' ? 48 : 20,
  fontWeight: 600,
  background: bgColor || theme.palette.primary.main,
  color: theme.palette.common.white,
}));

// Button with gradient background
export const MDButton = styled('button')(({ theme, variant, color, size, circular }) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size === 'small' ? '0.75rem' : size === 'large' ? '0.875rem' : '0.8125rem',
    fontWeight: 600,
    lineHeight: 1.4,
    textAlign: 'center',
    textTransform: 'uppercase',
    verticalAlign: 'middle',
    userSelect: 'none',
    border: '0',
    borderRadius: circular ? '50%' : theme.spacing(1.5),
    padding: size === 'small' ? '6px 16px' : size === 'large' ? '12px 28px' : '10px 24px',
    cursor: 'pointer',
    transition: 'all 0.15s ease-in',
    letterSpacing: '-0.025em',
    willChange: 'transform',
    
    '&:hover': {
      transform: 'scale(1.02)',
      boxShadow: theme.shadows[3],
    },
    
    '&:active': {
      transform: 'scale(0.98)',
    },
    
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
      pointerEvents: 'none',
    },
  };

  const getColor = (colorName) => {
    const colors = {
      primary: theme.palette.primary.main,
      secondary: theme.palette.secondary.main,
      info: theme.palette.info.main,
      success: theme.palette.success.main,
      warning: theme.palette.warning.main,
      error: theme.palette.error.main,
      dark: theme.palette.grey[900],
      light: theme.palette.grey[100],
      white: '#ffffff',
    };
    return colors[colorName] || colors.primary;
  };

  const buttonColor = getColor(color);

  if (variant === 'gradient') {
    return {
      ...baseStyles,
      background: `linear-gradient(195deg, ${buttonColor}, ${theme.palette.grey[800]})`,
      color: '#ffffff',
      boxShadow: `0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 5px 8px 0 rgba(0, 0, 0, 0.14), 0 1px 14px 0 rgba(0, 0, 0, 0.12)`,
    };
  }

  if (variant === 'outlined') {
    return {
      ...baseStyles,
      background: 'transparent',
      color: buttonColor,
      border: `1px solid ${buttonColor}`,
      
      '&:hover': {
        ...baseStyles['&:hover'],
        background: buttonColor,
        color: '#ffffff',
      },
    };
  }

  // Default: contained
  return {
    ...baseStyles,
    background: buttonColor,
    color: '#ffffff',
  };
});

// Typography with custom variants
export const MDTypography = styled('span')(({ theme, variant, color, fontWeight, textTransform, verticalAlign, textGradient, opacity }) => {
  const baseStyles = {
    fontFamily: theme.typography.fontFamily,
    color: color ? theme.palette[color]?.main || color : 'inherit',
    fontWeight: fontWeight || 'inherit',
    textTransform: textTransform || 'none',
    verticalAlign: verticalAlign || 'unset',
    opacity: opacity || 1,
    ...(textGradient && {
      backgroundImage: `linear-gradient(195deg, ${color}, ${theme.palette.grey[600]})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      position: 'relative',
      zIndex: 1,
    }),
  };

  return baseStyles;
});

// Badge component
export const MDBadge = styled('span')(({ theme, color, variant, size, circular, indicator, border }) => {
  const getColor = (colorName) => {
    const colors = {
      primary: theme.palette.primary.main,
      secondary: theme.palette.secondary.main,
      info: theme.palette.info.main,
      success: theme.palette.success.main,
      warning: theme.palette.warning.main,
      error: theme.palette.error.main,
      light: theme.palette.grey[300],
      dark: theme.palette.grey[900],
    };
    return colors[colorName] || colors.primary;
  };

  const badgeColor = getColor(color);
  const isSmall = size === 'xs' || size === 'sm';
  const isMedium = size === 'md';
  const isLarge = size === 'lg';

  return {
    display: 'inline-block',
    fontSize: isSmall ? '0.65rem' : isMedium ? '0.75rem' : isLarge ? '0.875rem' : '0.75rem',
    fontWeight: 600,
    padding: circular ? '0' : isSmall ? '2px 8px' : isMedium ? '4px 10px' : '6px 12px',
    lineHeight: 1,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    verticalAlign: 'baseline',
    borderRadius: circular ? '50%' : theme.spacing(1),
    textTransform: 'uppercase',
    color: variant === 'gradient' || variant === 'contained' ? '#ffffff' : badgeColor,
    background: variant === 'gradient' 
      ? `linear-gradient(195deg, ${badgeColor}, ${theme.palette.grey[700]})`
      : variant === 'contained'
      ? badgeColor
      : 'transparent',
    border: border ? `1px solid ${badgeColor}` : variant === 'outlined' ? `1px solid ${badgeColor}` : 'none',
    ...(indicator && {
      width: '8px',
      height: '8px',
      padding: 0,
      border: `2px solid ${theme.palette.background.paper}`,
    }),
  };
});

// Input field with Material Dashboard style
export const MDInput = styled('input')(({ theme, size, error, success }) => ({
  width: '100%',
  padding: size === 'small' ? '8px 12px' : size === 'large' ? '14px 18px' : '10px 14px',
  fontSize: '0.875rem',
  fontWeight: 400,
  lineHeight: 1.5,
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${error ? theme.palette.error.main : success ? theme.palette.success.main : theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  transition: 'all 0.15s ease-in',
  fontFamily: theme.typography.fontFamily,
  
  '&:focus': {
    outline: 'none',
    borderColor: error ? theme.palette.error.main : success ? theme.palette.success.main : theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${error ? theme.palette.error.light : success ? theme.palette.success.light : theme.palette.primary.light}`,
  },
  
  '&::placeholder': {
    color: theme.palette.text.disabled,
  },
  
  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
    backgroundColor: theme.palette.action.disabledBackground,
  },
}));

export default {
  MDBox,
  MDCard,
  MDAvatar,
  MDButton,
  MDTypography,
  MDBadge,
  MDInput,
};
