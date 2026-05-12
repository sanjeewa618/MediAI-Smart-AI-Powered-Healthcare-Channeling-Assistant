export const COLORS = {
  primary: '#6B4EFF', // Deep Purple from image
  primaryDark: '#4A32C2',
  primaryLight: '#F0EEFF',
  secondary: '#FF6584',
  white: '#FFFFFF',
  background: '#F8F9FE',
  textHeader: '#1A1A3E',
  textMain: '#52527A',
  textSecondary: '#9A9AB0',
  border: '#E8E8F3',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  gradientPrimary: ['#6B4EFF', '#9D85FF'] as const,
  shadow: '#6B4EFF20',
};

export const SIZES = {
  base: 8,
  small: 12,
  font: 14,
  medium: 16,
  large: 18,
  extraLarge: 24,
  radiusSmall: 8,
  radiusMedium: 16,
  radiusLarge: 24,
  radiusExtraLarge: 32,
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  light: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};
