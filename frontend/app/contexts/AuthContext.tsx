import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../service/api';

interface User {
  id: string;
  email: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Au montage, on tente de récupérer les données en cache (token et user)
  useEffect(() => {
    (async () => {
      const storedToken = await AsyncStorage.getItem('@Healytics:token');
      const storedUser = await AsyncStorage.getItem('@Healytics:user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    })();
  }, []);

  /**
   * Fonction de connexion
   */
  const login = async (email: string, password: string) => {
    try {
      const data = await api.login(email, password); 
      // data est censé contenir au moins { token: string }
      // et éventuellement { user: { id, email } }

      if (!data.token) {
        throw new Error("Token manquant dans la réponse.");
      }

      // On stocke toujours le token
      await AsyncStorage.setItem('@Healytics:token', data.token);
      setToken(data.token);

      if (data.user) {
        // Si le backend renvoie un user, on le stocke
        await AsyncStorage.setItem('@Healytics:user', JSON.stringify(data.user));
        setUser(data.user);
      } else {
        // Si aucune info user n’est renvoyée, tu peux ignorer ou créer un user minimal
        // const minimalUser = { id: 'N/A', email };
        // await AsyncStorage.setItem('@Healytics:user', JSON.stringify(minimalUser));
        // setUser(minimalUser);
      }

    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  /**
   * Fonction d'inscription
   */
  const register = async (email: string, password: string) => {
    try {
      console.log('Tentative d\'inscription avec:', { email });
      
      const data = await api.register(email, password);
      console.log('Réponse brute d\'inscription:', data);
      
      // Vérifie la présence du token
      if (!data.token) {
        console.error('Token manquant dans la réponse:', data);
        throw new Error('Token non valide');
      }
      // Vérifie la présence de l’utilisateur
      if (!data.user) {
        console.error('Utilisateur manquant dans la réponse:', data);
        throw new Error('Utilisateur non valide');
      }

      // Stockage du token et de l'utilisateur
      await AsyncStorage.setItem('@Healytics:token', data.token);
      await AsyncStorage.setItem('@Healytics:user', JSON.stringify(data.user));
      
      setUser(data.user);
      setToken(data.token);

    } catch (error) {
      console.error('Erreur d\'inscription détaillée:', error);
      throw error;
    }
  };

  /**
   * Fonction de déconnexion
   */
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@Healytics:token');
      await AsyncStorage.removeItem('@Healytics:user');
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      throw error;
    }
  };

  // Valeurs fournies au reste de l’application via le Context
  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook useAuth : pour accéder facilement au contexte
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider;