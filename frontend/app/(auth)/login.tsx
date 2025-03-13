import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Link, useRouter } from "expo-router"; 

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter(); // ✅ Utilisation correcte

  const handleLogin = async () => {
    try {
      setError('');
      await login(email, password);
      router.replace('/home'); // ✅ Utilisation correcte
    } catch (err) {
      setError('Identifiants invalides');
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-5 bg-gray-100">
      <Text className="text-3xl font-bold mb-8 text-green-600">Connexion</Text>
      
      {error ? <Text className="text-red-500 mb-4">{error}</Text> : null}
      
      <TextInput
        className="w-full h-12 bg-white rounded-xl px-4 mb-4 shadow-sm"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        className="w-full h-12 bg-white rounded-xl px-4 mb-4 shadow-sm"
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        className="w-full h-12 bg-green-600 rounded-xl justify-center items-center mt-2"
        onPress={handleLogin}
      >
        <Text className="text-white font-bold text-base">Se connecter</Text>
      </TouchableOpacity>
      
      <View className="flex-row mt-5">
        <Text className="text-gray-600">Pas encore de compte ? </Text>
        <Link href="/register" asChild> 
          <TouchableOpacity>
            <Text className="text-green-600 font-bold">S'inscrire</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
