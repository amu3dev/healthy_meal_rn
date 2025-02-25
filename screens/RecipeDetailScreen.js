import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';

export default function RecipeDetailScreen({ route }) {
  const { meal } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: meal.image }}
        style={styles.image}
      />

      <View style={styles.content}>
        <Text style={styles.title}>{meal.name}</Text>

        <View style={styles.nutritionCard}>
          <View style={styles.nutritionRow}>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {meal.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>{ingredient}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {meal.instructions.map((instruction, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.stepNumber}>{index + 1}.</Text>
              <Text style={styles.listText}>{instruction}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  nutritionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 8,
    width: 16,
  },
  stepNumber: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 8,
    width: 24,
  },
  listText: {
    fontSize: 16,
    color: '#444',
    flex: 1,
    lineHeight: 24,
  },
});