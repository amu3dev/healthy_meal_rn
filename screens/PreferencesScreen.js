import React from 'react';
import { Alert, View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { formatPreferenceLabel } from '../lib/preferences';
import { COLORS, RADII, SHADOWS, SPACING } from '../lib/theme';
import usePreferences from '../hooks/usePreferences';

const DIETARY_FILTER_KEYS = ['vegetarian', 'vegan', 'glutenFree', 'dairyFree'];
const MEAL_GOAL_KEYS = ['lowCarb', 'highProtein'];

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

  const renderPreferenceRows = (keys, accessibilityHint) => keys.map((key) => (
    <View key={key} style={styles.preferenceItem}>
      <Text style={styles.preferenceLabel}>
        {formatPreferenceLabel(key)}
      </Text>
      <Switch
        value={preferences[key]}
        onValueChange={() => togglePreference(key)}
        trackColor={{ false: COLORS.switchTrackOff, true: COLORS.switchTrackOn }}
        thumbColor={preferences[key] ? COLORS.primary : COLORS.switchThumbOff}
        accessibilityRole="switch"
        accessibilityLabel={`${formatPreferenceLabel(key)} preference`}
        accessibilityHint={accessibilityHint}
      />
    </View>
  ));

  if (isLoading) {
    return (
      <View
        style={styles.loadingContainer}
        accessibilityRole="progressbar"
        accessibilityLabel="Loading saved dietary preferences"
      >
        <Text>Loading preferences...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dietary filters</Text>
        <Text style={styles.sectionDescription}>
          Selected filters are applied together; each meal must carry every selected label.
        </Text>
        {renderPreferenceRows(
          DIETARY_FILTER_KEYS,
          'Selected dietary filters are applied together.'
        )}

        <Text style={styles.groupTitle}>Optional meal goals</Text>
        <Text style={styles.sectionDescription}>
          Goals narrow the meal pool. They describe catalog labels, not medical advice.
        </Text>
        {renderPreferenceRows(
          MEAL_GOAL_KEYS,
          'Selected meal goals narrow the available meal pool.'
        )}
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSavePreferences}
        accessibilityRole="button"
        accessibilityLabel="Save dietary preferences"
      >
        <Text style={styles.saveButtonText}>Save Preferences</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Note: We use these filters and goals when choosing your meal for the day.
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
    marginBottom: SPACING.sm,
  },
  sectionDescription: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
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
