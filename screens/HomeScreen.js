import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOCK_MEALS = [
  {
    id: 1,
    name: 'Quinoa Buddha Bowl',
    calories: 450,
    protein: '20g',
    carbs: '65g',
    fats: '15g',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500',
    ingredients: [
      '1 cup quinoa',
      '2 cups mixed vegetables',
      '1 avocado',
      'chickpeas',
      'tahini dressing'
    ],
    instructions: [
      'Cook quinoa according to package instructions',
      'Roast vegetables in the oven',
      'Arrange in a bowl',
      'Top with sliced avocado and chickpeas',
      'Drizzle with tahini dressing'
    ]
  },
  {
    id: 2,
    name: 'Grilled Salmon with Roasted Vegetables',
    calories: 520,
    protein: '42g',
    carbs: '30g',
    fats: '28g',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500',
    ingredients: [
      '6 oz salmon fillet',
      '2 cups mixed vegetables (broccoli, carrots, zucchini)',
      '2 tablespoons olive oil',
      'Fresh herbs (dill, parsley)',
      'Lemon',
      'Salt and pepper'
    ],
    instructions: [
      'Preheat oven to 400°F (200°C)',
      'Season salmon with herbs, salt, and pepper',
      'Toss vegetables with olive oil and seasonings',
      'Roast vegetables for 20 minutes',
      'Grill salmon for 4-5 minutes per side',
      'Serve with lemon wedges'
    ]
  },
  {
    id: 3,
    name: 'Mediterranean Chickpea Salad',
    calories: 380,
    protein: '15g',
    carbs: '45g',
    fats: '18g',
    image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=500',
    ingredients: [
      '2 cans chickpeas, drained',
      '1 cucumber, diced',
      'Cherry tomatoes',
      'Red onion',
      'Feta cheese',
      'Olive oil',
      'Lemon juice',
      'Fresh herbs'
    ],
    instructions: [
      'Drain and rinse chickpeas',
      'Chop vegetables into bite-sized pieces',
      'Combine all ingredients in a large bowl',
      'Drizzle with olive oil and lemon juice',
      'Season with salt and pepper',
      'Toss well and refrigerate for 30 minutes before serving'
    ]
  }
];

export default function HomeScreen({ navigation }) {
  const [meal, setMeal] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDailyMeal = async () => {
    try {
      // In a real app, this would fetch from an API
      const randomMeal = MOCK_MEALS[Math.floor(Math.random() * MOCK_MEALS.length)];
      setMeal(randomMeal);
      await AsyncStorage.setItem('lastMeal', JSON.stringify(randomMeal));
    } catch (error) {
      console.error('Error loading meal:', error);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadDailyMeal().then(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    loadDailyMeal();
  }, []);

  if (!meal) {
    return (
      <View style={styles.container}>
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

      <Text style={styles.tip}>
        Tip: Pull down to refresh for a new meal suggestion
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    marginTop: 8,
    marginBottom: 24,
  },
});