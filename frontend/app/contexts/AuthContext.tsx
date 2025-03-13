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

  useEffect(() => {
    async function loadStorageData() {
      const storedToken = await AsyncStorage.getItem('@Healytics:token');
      const storedUser = await AsyncStorage.getItem('@Healytics:user');
      
      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
      
      setLoading(false);
    }
    
    loadStorageData();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await api.login(email, password);
      
      await AsyncStorage.setItem('@Healytics:token', data.token);
      await AsyncStorage.setItem('@Healytics:user', JSON.stringify(data.user));
      
      setUser(data.user);
      setToken(data.token);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const data = await api.register(email, password);
      
      await AsyncStorage.setItem('@Healytics:token', data.token);
      await AsyncStorage.setItem('@Healytics:user', JSON.stringify(data.user));
      
      setUser(data.user);
      setToken(data.token);
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('@Healytics:token');
    await AsyncStorage.removeItem('@Healytics:user');
    
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}