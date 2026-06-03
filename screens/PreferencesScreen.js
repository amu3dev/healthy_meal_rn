import React from 'react';
import { Alert, View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { DEFAULT_PREFERENCES, formatPreferenceLabel } from '../lib/preferences';
import { COLORS, RADII, SHADOWS, SPACING } from '../lib/theme';
import usePreferences from '../hooks/usePreferences';

export default function PreferencesScreen() {
  const {
    preferences,
    isLoading,
    savePreferences,
    togglePreference,
  } = usePreferences();

  const handleSavePreferences = async () => {
    try {
      await savePreferences();
      Alert.alert('Preferences saved', 'Your daily meal suggestions now use these filters.');
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Save failed', 'We could not save your preferences. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading preferences...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dietary Preferences</Text>
        
        {Object.keys(DEFAULT_PREFERENCES).map((key) => (
          <View key={key} style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>
              {formatPreferenceLabel(key)}
            </Text>
            <Switch
              value={preferences[key]}
              onValueChange={() => togglePreference(key)}
              trackColor={{ false: COLORS.switchTrackOff, true: COLORS.switchTrackOn }}
              thumbColor={preferences[key] ? COLORS.primary : COLORS.switchThumbOff}
            />
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSavePreferences}
      >
        <Text style={styles.saveButtonText}>Save Preferences</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Note: We use these preferences when choosing your meal for the day.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    margin: SPACING.lg,
    ...SHADOWS.soft,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  preferenceLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.sm,
    padding: SPACING.lg,
    margin: SPACING.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.primaryContrast,
    fontSize: 16,
    fontWeight: 'bold',
  },
  note: {
    margin: SPACING.lg,
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 14,
  },
});
