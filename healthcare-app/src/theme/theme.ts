export const COLORS = {
  primary: '#7B2FF7', // Primary Purple
  primaryDark: '#5F0FFF', // Deep Violet
  primaryLight: '#F3F0FF', // Very light violet for backgrounds
  secondary: '#9333EA', // Secondary Purple
  accent: '#C084FC', // Accent Light Purple
  white: '#FFFFFF',
  background: '#F8F9FC', // Soft White
  textHeader: '#1F2937', // Dark Gray
  textMain: '#4B5563', // Main Text
  textSecondary: '#9CA3AF', // Light Gray
  border: '#E5E7EB',
  inputBg: '#F3F4F6', // Soft Gray
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  gradientPrimary: ['#9333EA', '#7E22CE', '#5B21B6'] as const,
  shadow: 'rgba(123, 47, 247, 0.15)',
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
