import React from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { COLORS, SIZES } from '../theme/theme';
import * as LucideIcons from 'lucide-react-native';

interface CustomInputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof LucideIcons;
  error?: string;
  containerStyle?: ViewStyle;
}

export const CustomInput: React.FC<CustomInputProps> = ({ 
  label, 
  icon, 
  error, 
  containerStyle, 
  ...props 
}) => {
  const IconComponent = icon ? (LucideIcons[icon] as React.ElementType) : null;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error ? styles.errorBorder : null]}>
        {IconComponent && <IconComponent size={20} color={COLORS.textSecondary} style={styles.icon} />}
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.textSecondary}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: SIZES.font,
    color: COLORS.textHeader,
    marginBottom: 8,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8FB', // Mapped to the light grey/blue in image fields
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#F0F0F5',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: COLORS.textHeader,
    fontSize: 16,
    fontWeight: '500',
  },
  errorBorder: {
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
