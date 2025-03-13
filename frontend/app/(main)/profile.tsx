import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function Profile() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        { 
          text: "Déconnexion", 
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="bg-green-600 p-8 rounded-b-3xl items-center">
        <View className="w-24 h-24 rounded-full bg-white justify-center items-center mb-4">
          <Ionicons name="person" size={50} color="#0c8a56" />
        </View>
        <Text className="text-white text-xl font-bold">{user?.email || 'Utilisateur'}</Text>
      </View>

      <View className="p-4">
        <Text className="text-lg font-bold text-gray-800 mb-4 mt-2">Paramètres du compte</Text>
        
        <TouchableOpacity className="bg-white p-4 rounded-xl flex-row items-center mb-3 shadow-sm">
          <Ionicons name="person-circle-outline" size={24} color="#0c8a56" />
          <Text className="text-gray-800 ml-3">Modifier mon profil</Text>
          <Ionicons name="chevron-forward" size={20} color="gray" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
        
        <TouchableOpacity className="bg-white p-4 rounded-xl flex-row items-center mb-3 shadow-sm">
          <Ionicons name="notifications-outline" size={24} color="#0c8a56" />
          <Text className="text-gray-800 ml-3">Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="gray" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
        
        <TouchableOpacity className="bg-white p-4 rounded-xl flex-row items-center mb-3 shadow-sm">
          <Ionicons name="lock-closed-outline" size={24} color="#0c8a56" />
          <Text className="text-gray-800 ml-3">Confidentialité et sécurité</Text>
          <Ionicons name="chevron-forward" size={20} color="gray" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
        
        <Text className="text-lg font-bold text-gray-800 mb-4 mt-6">Support</Text>
        
        <TouchableOpacity className="bg-white p-4 rounded-xl flex-row items-center mb-3 shadow-sm">
          <Ionicons name="help-circle-outline" size={24} color="#0c8a56" />
          <Text className="text-gray-800 ml-3">Aide et support</Text>
          <Ionicons name="chevron-forward" size={20} color="gray" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
        
        <TouchableOpacity className="bg-white p-4 rounded-xl flex-row items-center mb-3 shadow-sm">
          <Ionicons name="information-circle-outline" size={24} color="#0c8a56" />
          <Text className="text-gray-800 ml-3">À propos</Text>
          <Ionicons name="chevron-forward" size={20} color="gray" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-red-500 p-4 rounded-xl items-center mt-6"
          onPress={handleLogout}
        >
          <Text className="text-white font-bold">Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}