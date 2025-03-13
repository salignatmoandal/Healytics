import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Créer une instance axios
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

interface User {
  id: string;
  email: string;
}
interface AuthResponse {
  token: string;
  user: User;
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
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
      
      setLoading(false);
    }
    
    loadStorageData();
  }, []);

  // const apiRegister = async (endpoint: string, method: string, data?: any) => {
  //   const headers : HeadersInit = {
  //     'Content-Type': 'application/json',
  //   };

  //   if (token) {
  //     headers['Authorization'] = `Bearer ${token}`;
      

  //   }

  //   const config: RequestInit = {
  //     method,
  //     headers,
  //     body: data ? JSON.stringify(data) : undefined,
  //   };
    
    
  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      const { token, user } = response.data;
      
      await AsyncStorage.setItem('@Healytics:token', token);
      await AsyncStorage.setItem('@Healytics:user', JSON.stringify(user));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setToken(token);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', { email, password });
      const { token, user } = response.data;
      
      await AsyncStorage.setItem('@Healytics:token', token);
      await AsyncStorage.setItem('@Healytics:user', JSON.stringify(user));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setToken(token);
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

export { api };