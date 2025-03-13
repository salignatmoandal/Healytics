import { Redirect } from 'expo-router';
import { useAuth } from './contexts/AuthContext';
import { View, Text, ActivityIndicator } from 'react-native';

export default function Index() {
  const { token, loading } = useAuth();

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0c8a56" />
      </View>
    );
  }

  // Rediriger vers la page d'accueil si l'utilisateur est connecté
  if (token) {
    return <Redirect href="/(main)/home" />;
  }

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  return <Redirect href="/(auth)/login" />;
}