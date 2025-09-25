import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../constants/theme';

export interface SmartFitInputProps extends TextInputProps {
  label?: string;
  error?: string;
  variant?: 'default' | 'outline';
  size?: 'small' | 'medium' | 'large';
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  labelStyle?: ViewStyle;
  errorStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export const SmartFitInput: React.FC<SmartFitInputProps> = ({
  label,
  error,
  variant = 'default',
  size = 'medium',
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      marginBottom: theme.spacing.md,
    };

    return {
      ...baseStyle,
      ...containerStyle,
    };
  };

  const getInputContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: theme.borderRadius.medium,
      borderWidth: 1,
      backgroundColor: theme.colors.surface,
    };

    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        minHeight: 36,
      },
      medium: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        minHeight: 48,
      },
      large: {
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.lg,
        minHeight: 56,
      },
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {
        borderColor: isFocused ? theme.colors.accent : theme.colors.border,
        backgroundColor: theme.colors.surface,
      },
      outline: {
        borderColor: isFocused ? theme.colors.accent : theme.colors.border,
        backgroundColor: 'transparent',
      },
    };

    const errorBorderStyle: ViewStyle = error
      ? {
          borderColor: theme.colors.error,
        }
      : {};

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...errorBorderStyle,
    };
  };

  const getInputStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      color: theme.colors.text,
      fontSize: 16,
    };

    const sizeStyles: Record<string, TextStyle> = {
      small: {
        fontSize: 14,
      },
      medium: {
        fontSize: 16,
      },
      large: {
        fontSize: 18,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...inputStyle,
    };
  };

  const getLabelStyle = (): TextStyle => {
    return {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: '500',
      marginBottom: theme.spacing.xs,
      ...labelStyle,
    };
  };

  const getErrorStyle = (): TextStyle => {
    return {
      color: theme.colors.error,
      fontSize: 14,
      marginTop: theme.spacing.xs,
      ...errorStyle,
    };
  };

  return (
    <View style={getContainerStyle()}>
      {label && <Text style={getLabelStyle()}>{label}</Text>}
      <View style={getInputContainerStyle()}>
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        <TextInput
          style={getInputStyle()}
          placeholderTextColor={theme.colors.placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={getErrorStyle()}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  leftIconContainer: {
    marginRight: theme.spacing.sm,
  },
  rightIconContainer: {
    marginLeft: theme.spacing.sm,
  },
});
