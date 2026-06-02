import React from 'react';
import { Alert, View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { DEFAULT_PREFERENCES, formatPreferenceLabel } from '../lib/preferences';
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
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={preferences[key] ? '#4CAF50' : '#f4f3f4'}
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
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  preferenceLabel: {
    fontSize: 16,
    color: '#444',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  note: {
    margin: 16,
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
});
