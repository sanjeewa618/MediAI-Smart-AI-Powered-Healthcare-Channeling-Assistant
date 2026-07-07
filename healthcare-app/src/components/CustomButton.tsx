import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../theme/theme';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'secondary';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const CustomButton: React.FC<CustomButtonProps> = ({ 
  title, 
  onPress, 
  loading, 
  disabled,
  variant = 'primary', 
  style, 
  textStyle 
}) => {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isDisabled = disabled || loading;

  if (isPrimary) {
    return (
      <TouchableOpacity 
        onPress={onPress} 
        activeOpacity={0.8}
        disabled={isDisabled}
        style={[styles.wrapper, style, isDisabled && { opacity: 0.6 }]}
      >
        <LinearGradient
          colors={COLORS.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.container, { width: '100%' }, SHADOWS.medium, style]}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={[styles.text, styles.primaryText, textStyle]}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.8}
      disabled={isDisabled}
      style={[
        styles.container, 
        isOutline ? styles.outlineContainer : styles.secondaryContainer,
        style,
        isDisabled && { opacity: 0.6 }
      ]}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.primary} />
      ) : (
        <Text style={[
          styles.text, 
          isOutline ? styles.outlineText : styles.secondaryText, 
          textStyle
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: SIZES.base,
  },
  container: {
    borderRadius: 30, // Fully rounded like the images
    paddingVertical: 14,
    paddingHorizontal: SIZES.extraLarge,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginVertical: SIZES.base,
  },
  secondaryContainer: {
    backgroundColor: COLORS.primaryLight,
    marginVertical: SIZES.base,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
  primaryText: {
    color: COLORS.white,
  },
  outlineText: {
    color: COLORS.primary,
  },
  secondaryText: {
    color: COLORS.primary,
  },
});
