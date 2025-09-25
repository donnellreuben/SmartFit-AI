import React from 'react';
import {
  View,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { theme } from '../constants/theme';

export interface SmartFitCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  margin?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'small' | 'medium' | 'large' | 'xlarge';
  style?: ViewStyle;
  onPress?: () => void;
}

export const SmartFitCard: React.FC<SmartFitCardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  margin = 'none',
  borderRadius = 'medium',
  style,
  onPress,
  ...touchableProps
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius[borderRadius],
    };

    // Padding styles
    const paddingStyles: Record<string, ViewStyle> = {
      none: {},
      small: {
        padding: theme.spacing[2],
      },
      medium: {
        padding: theme.spacing[4],
      },
      large: {
        padding: theme.spacing[6],
      },
    };

    // Margin styles
    const marginStyles: Record<string, ViewStyle> = {
      none: {},
      small: {
        margin: theme.spacing[2],
      },
      medium: {
        margin: theme.spacing[4],
      },
      large: {
        margin: theme.spacing[6],
      },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      default: {
        backgroundColor: theme.colors.surface,
      },
      elevated: {
        backgroundColor: theme.colors.surface,
        ...theme.shadows.medium,
      },
      outlined: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
      },
    };

    return {
      ...baseStyle,
      ...paddingStyles[padding],
      ...marginStyles[margin],
      ...variantStyles[variant],
    };
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        onPress={onPress}
        activeOpacity={0.8}
        {...touchableProps}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[getCardStyle(), style]} {...touchableProps}>
      {children}
    </View>
  );
};

// const styles = StyleSheet.create({
//   // Additional styles can be added here if needed
// });
