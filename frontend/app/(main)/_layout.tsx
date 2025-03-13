import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';

export default function MainLayout() {
  const { token } = useAuth();
  
  // Protection des routes - rediriger vers login si non authentifié
  useEffect(() => {
    if (!token) {
      router.replace('/login');
    }
  }, [token]);

  // Ne rien rendre si l'utilisateur n'est pas authentifié
  if (!token) return null;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0c8a56',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#0c8a56',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Symptômes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}