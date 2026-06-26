import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  prefix?: string;
  suffix?: string;
  editable?: boolean;
}

export function InputField({
  label,
  value,
  onChangeText,
  placeholder = '0',
  keyboardType = 'default',
  prefix,
  suffix,
  editable = true,
}: InputFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, !editable && styles.inputDisabled]}>
        {prefix ? <Text style={styles.affix}>{prefix}</Text> : null}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType}
          editable={editable}
          selectTextOnFocus
        />
        {suffix ? <Text style={styles.affix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 44,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  affix: {
    color: colors.textSecondary,
    fontSize: 14,
    marginRight: 4,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
});
