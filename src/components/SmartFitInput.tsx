import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
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
      marginBottom: theme.spacing[3],
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
        paddingHorizontal: theme.spacing[3],
        paddingVertical: theme.spacing[2],
        minHeight: 36,
      },
      medium: {
        paddingHorizontal: theme.spacing[4],
        paddingVertical: theme.spacing[3],
        minHeight: 48,
      },
      large: {
        paddingHorizontal: theme.spacing[5],
        paddingVertical: theme.spacing[4],
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

    const errorStyle: ViewStyle = error
      ? {
          borderColor: theme.colors.error,
        }
      : {};

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...errorStyle,
    };
  };

  const getInputStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flex: 1,
      color: theme.colors.text,
      fontSize: 16,
    };

    const sizeStyles: Record<string, ViewStyle> = {
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

  const getLabelStyle = (): ViewStyle => {
    return {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: '500',
      marginBottom: theme.spacing[1],
      ...labelStyle,
    };
  };

  const getErrorStyle = (): ViewStyle => {
    return {
      color: theme.colors.error,
      fontSize: 14,
      marginTop: theme.spacing[1],
      ...errorStyle,
    };
  };

  return (
    <View style={getContainerStyle()}>
      {label && <Text style={getLabelStyle()}>{label}</Text>}
      <View style={getInputContainerStyle()}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>{leftIcon}</View>
        )}
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
    marginRight: theme.spacing[2],
  },
  rightIconContainer: {
    marginLeft: theme.spacing[2],
  },
});
