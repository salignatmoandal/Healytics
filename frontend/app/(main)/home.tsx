import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Home() {
  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-5 bg-green-600 rounded-b-3xl mb-5 pt-10 pb-10">
        <Text className="text-2xl font-bold text-white mb-1">Bienvenue sur Healytics</Text>
        <Text className="text-base text-white opacity-80">Votre assistant santé personnel</Text>
      </View>
      
      <View className="px-4">
        <TouchableOpacity 
          className="bg-white rounded-2xl p-5 mb-4 shadow"
          onPress={() => router.push('/chat')}
        >
          <View className="w-15 h-15 rounded-full bg-green-100 justify-center items-center mb-4">
            <Ionicons name="chatbubble-ellipses" size={30} color="#0c8a56" />
          </View>
          <Text className="text-lg font-bold text-gray-800 mb-2">Décrire mes symptômes</Text>
          <Text className="text-sm text-gray-600 leading-5">
            Discutez avec notre assistant pour décrire vos symptômes et obtenir une analyse
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="bg-white rounded-2xl p-5 mb-4 shadow">
          <View className="w-15 h-15 rounded-full bg-green-100 justify-center items-center mb-4">
            <Ionicons name="document-text" size={30} color="#0c8a56" />
          </View>
          <Text className="text-lg font-bold text-gray-800 mb-2">Mes rapports</Text>
          <Text className="text-sm text-gray-600 leading-5">
            Consultez l'historique de vos analyses et rapports médicaux
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="bg-white rounded-2xl p-5 mb-4 shadow">
          <View className="w-15 h-15 rounded-full bg-green-100 justify-center items-center mb-4">
            <Ionicons name="information-circle" size={30} color="#0c8a56" />
          </View>
          <Text className="text-lg font-bold text-gray-800 mb-2">Conseils santé</Text>
          <Text className="text-sm text-gray-600 leading-5">
            Découvrez des conseils personnalisés pour améliorer votre bien-être
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}