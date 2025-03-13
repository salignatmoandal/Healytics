import AsyncStorage from '@react-native-async-storage/async-storage';

// Remplacez par l'URL de votre backend
// Pour les émulateurs : 
// - Android : 10.0.2.2:3000
// - iOS : localhost:3000
// Pour les appareils physiques : l'adresse IP de votre machine
const API_URL = 'http://localhost:3000';

// Fonction utilitaire pour les requêtes API
const apiRequest = async (endpoint: string, method: string, data?: any) => {
  const token = await AsyncStorage.getItem('@Healytics:token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config: RequestInit = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  };
  
  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API request failed: ${response.status}`);
  }
  
  return response.json();
};

// API exportée
export const api = {
  // Authentification
  login: (email: string, password: string) => 
    apiRequest('/auth/login', 'POST', { email, password }),
  
  register: (email: string, password: string) => 
    apiRequest('/auth/register', 'POST', { email, password }),
  
  // Symptômes
  getSymptoms: () => 
    apiRequest('/symptom', 'GET'),
  
  addSymptom: (symptom: string) => 
    apiRequest('/symptom', 'POST', { symptom }),
  
  // Analyse IA
  analyzeSymptoms: (symptoms: string[]) => 
    apiRequest('/ai/analyze', 'POST', { symptoms }),
  
  // Profil utilisateur
  getUserProfile: () => 
    apiRequest('/users/profile', 'GET'),
  

};

export default api;