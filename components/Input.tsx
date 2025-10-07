import React, { memo, useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BORDER_RADIUS, FONT_SIZES, SPACING, SHADOWS } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: any;
}

const Input = memo<InputProps>(({
  label,
  error,
  containerStyle,
  onFocus,
  onBlur,
  value,
  ...props
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: isFocused ? colors.primary : colors.textSecondary,
            },
            error && { color: colors.error },
          ]}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: colors.surface, borderColor: isFocused ? colors.primary : colors.border },
          isFocused && styles.focused,
          error && { borderColor: colors.error },
          SHADOWS.sm,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { color: colors.text },
          ]}
          placeholderTextColor={colors.textSecondary}
          placeholder={props.placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          {...props}
        />
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600' as const,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  inputContainer: {
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
  },
  focused: {
    borderWidth: 2,
  },
  input: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
  },
  error: {
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
    marginLeft: SPACING.sm,
  },
});

export default Input;
