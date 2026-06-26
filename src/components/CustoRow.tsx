import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface CustoRowProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  unit: string;
}

export function CustoRow({ label, value, onChangeText, unit }: CustoRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          selectTextOnFocus
          placeholderTextColor={colors.textMuted}
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>
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
    minWidth: 100,
  },
  input: {
    color: colors.text,
    fontSize: 14,
    minWidth: 56,
    textAlign: 'right',
  },
  unit: {
    color: colors.textSecondary,
    fontSize: 11,
    marginLeft: 4,
  },
});
