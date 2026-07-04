import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface CustoRowProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  unit: string;
  disabled?: boolean;
}

export function CustoRow({ label, value, onChangeText, unit, disabled }: CustoRowProps) {
  const [editando, setEditando] = useState(false);

  return (
    <View style={[styles.row, disabled && styles.rowDisabled]}>
      <Text style={[styles.label, disabled && styles.labelDisabled]} numberOfLines={1}>{label}</Text>
      <TouchableOpacity
        style={[styles.inputWrap, disabled && styles.inputWrapDisabled]}
        onPress={() => !disabled && setEditando(true)}
        activeOpacity={disabled ? 1 : 1}
      >
        {editando && !disabled ? (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            onBlur={() => setEditando(false)}
            keyboardType="decimal-pad"
            inputMode="decimal"
            autoFocus
            selectTextOnFocus
          />
        ) : (
          <Text style={[styles.valor, disabled && styles.valorDisabled]} numberOfLines={1}>
            {disabled ? 'N/A' : (value || '0')}
          </Text>
        )}
        <Text style={styles.unit}>{unit}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    height: 36,
    width: 90,
  },
  valor: {
    color: colors.text,
    fontSize: 14,
    minWidth: 40,
    flexShrink: 1,
    textAlign: 'right',
  },
  input: {
    color: colors.text,
    fontSize: 14,
    minWidth: 40,
    flexShrink: 1,
    textAlign: 'right',
  },
  unit: {
    color: colors.textSecondary,
    fontSize: 11,
    marginLeft: 4,
  },
  rowDisabled: {
    opacity: 0.45,
  },
  labelDisabled: {
    color: colors.textMuted,
  },
  inputWrapDisabled: {
    backgroundColor: colors.background,
  },
  valorDisabled: {
    color: colors.textMuted,
    fontStyle: 'italic' as const,
  },
});
