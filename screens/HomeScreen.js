import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDailyMeal, getPreferenceSummary } from '../lib/mealUtils';
import {
  DEFAULT_PREFERENCES,
  STORAGE_KEYS,
  getEnabledPreferences,
  mergePreferences,
} from '../lib/preferences';

export default function HomeScreen({ navigation }) {
  const [meal, setMeal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Showing all meals');

  const loadDailyMeal = useCallback(async () => {
    try {
      const savedPreferences = await AsyncStorage.getItem(STORAGE_KEYS.userPreferences);
      const parsedPreferences = savedPreferences
        ? mergePreferences(JSON.parse(savedPreferences))
        : DEFAULT_PREFERENCES;
      const dailyMeal = getDailyMeal(parsedPreferences);
      const enabledPreferences = getEnabledPreferences(parsedPreferences);

      setMeal(dailyMeal);
      setStatusMessage(
        dailyMeal
          ? getPreferenceSummary(parsedPreferences)
          : enabledPreferences.length > 0
            ? 'No meals match your current filters yet'
            : 'No meals are available right now'
      );
    } catch (error) {
      console.error('Error loading meal:', error);
      setMeal(null);
      setStatusMessage('Unable to load today\'s meal right now');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadDailyMeal();
    }, [loadDailyMeal])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDailyMeal().finally(() => setRefreshing(false));
  }, [loadDailyMeal]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>Today's Healthy Meal</Text>
        <TouchableOpacity
          style={styles.preferencesButton}
          onPress={() => navigation.navigate('Preferences')}
        >
          <MaterialIcons name="settings" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <Text style={styles.summaryText}>{statusMessage}</Text>

      {meal ? (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('RecipeDetail', { meal })}
        >
          <Image
            source={{ uri: meal.image }}
            style={styles.mealImage}
          />
          <View style={styles.mealInfo}>
            <Text style={styles.mealName}>{meal.name}</Text>

            <View style={styles.nutritionContainer}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{meal.calories}</Text>
                <Text style={styles.nutritionLabel}>calories</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{meal.protein}</Text>
                <Text style={styles.nutritionLabel}>protein</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{meal.carbs}</Text>
                <Text style={styles.nutritionLabel}>carbs</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{meal.fats}</Text>
                <Text style={styles.nutritionLabel}>fats</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No matching meal for today</Text>
          <Text style={styles.emptyText}>
            Adjust your preferences to widen the meal pool, then come back here.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Preferences')}
          >
            <Text style={styles.emptyButtonText}>Review Preferences</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.tip}>
        Tip: Today's pick stays consistent all day. Change your preferences or come back tomorrow for a new match.
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  preferencesButton: {
    padding: 8,
  },
  summaryText: {
    marginHorizontal: 16,
    color: '#666',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    color: '#666',
    fontSize: 15,
    lineHeight: 22,
  },
  emptyButton: {
    marginTop: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  mealImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  mealInfo: {
    padding: 16,
  },
  mealName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  tip: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 4,
    marginHorizontal: 16,
    lineHeight: 20,
    marginBottom: 24,
  },
});
