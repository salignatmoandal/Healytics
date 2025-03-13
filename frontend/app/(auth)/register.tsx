import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Link, router } from 'expo-router';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setError('');
      await register(email, password);
      router.replace('/home');
    } catch (err) {
      setError('Erreur lors de l\'inscription');
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-5 bg-gray-100">
      <Text className="text-3xl font-bold mb-8 text-green-600">Inscription</Text>
      
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
      
      <TextInput
        className="w-full h-12 bg-white rounded-xl px-4 mb-4 shadow-sm"
        placeholder="Confirmer le mot de passe"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        className="w-full h-12 bg-green-600 rounded-xl justify-center items-center mt-2"
        onPress={handleRegister}
      >
        <Text className="text-white font-bold text-base">S'inscrire</Text>
      </TouchableOpacity>
      
      <View className="flex-row mt-5">
        <Text className="text-gray-600">Déjà un compte ? </Text>
        <Link href="/login" asChild>
          <TouchableOpacity>
            <Text className="text-green-600 font-bold">Se connecter</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}