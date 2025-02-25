import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import HomeScreen from './screens/HomeScreen';
import RecipeDetailScreen from './screens/RecipeDetailScreen';
import PreferencesScreen from './screens/PreferencesScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{
            title: 'Daily Healthy Meal'
          }}
        />
        <Stack.Screen 
          name="RecipeDetail" 
          component={RecipeDetailScreen}
          options={{
            title: 'Recipe Details'
          }}
        />
        <Stack.Screen 
          name="Preferences" 
          component={PreferencesScreen}
          options={{
            title: 'Your Preferences'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}