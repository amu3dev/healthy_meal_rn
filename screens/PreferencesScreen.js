import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PreferencesScreen() {
  const [preferences, setPreferences] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    lowCarb: false,
    highProtein: false,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const savedPreferences = await AsyncStorage.getItem('userPreferences');
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = async () => {
    try {
      await AsyncStorage.setItem('userPreferences', JSON.stringify(preferences));
      alert('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences');
    }
  };

  const togglePreference = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dietary Preferences</Text>
        
        {Object.entries(preferences).map(([key, value]) => (
          <View key={key} style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>
              {key.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() + 
               key.replace(/([A-Z])/g, ' $1').trim().slice(1)}
            </Text>
            <Switch
              value={value}
              onValueChange={() => togglePreference(key)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={value ? '#4CAF50' : '#f4f3f4'}
            />
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={savePreferences}
      >
        <Text style={styles.saveButtonText}>Save Preferences</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Note: Your preferences will be used to customize your daily meal suggestions.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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