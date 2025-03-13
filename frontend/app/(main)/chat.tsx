import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour ! Je suis votre assistant médical. Quels symptômes ressentez-vous aujourd\'hui ?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim() === '') return;
    
    // Créer le message utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };
    
    // Calculez le nouveau tableau de symptômes (incluant le dernier message)
    const newSymptoms = [...symptoms, inputText];
    
    setMessages(prev => [...prev, userMessage]);
    setSymptoms(newSymptoms);
    setInputText('');
    
    // Proposer une analyse ou demander plus de symptômes selon le nombre
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: newSymptoms.length >= 2 
          ? 'Souhaitez-vous que j\'analyse ces symptômes maintenant ?'
          : 'Avez-vous d\'autres symptômes à me signaler ?',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const analyzeSymptoms = async () => {
    setIsAnalyzing(true);
    
    // Message d'analyse en cours
    const analysisMessage: Message = {
      id: Date.now().toString(),
      text: 'Analyse en cours...',
      isUser: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, analysisMessage]);
    
    try {
      // Récupérer le token d'authentification
      const token = await AsyncStorage.getItem('@Healytics:token');
      console.log('Envoi des symptômes à l\'API:', symptoms);
      
      // Appel à l'API d'analyse
      const response = await fetch(`${API_URL}/ai/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ symptoms }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Réponse de l\'API:', data);
      
      // Construire le texte de résultat
      let resultText = 'Résultat de l\'analyse:\n\n';
      if (data.result && Array.isArray(data.result)) {
        data.result.forEach((condition: { name: string; probability: number; description: string; }, index: number) => {
          resultText += `${index + 1}. ${condition.name} (${Math.round(condition.probability * 100)}%)\n`;
          if (condition.description) {
            resultText += `   ${condition.description}\n\n`;
          }
        });
      } else if (typeof data.result === 'string') {
        resultText += data.result;
      } else {
        resultText += JSON.stringify(data.result, null, 2);
      }
      
      const resultMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: resultText,
        isUser: false,
        timestamp: new Date(),
      };
      
      // Remplacer le message d'analyse par le résultat
      setMessages(prev => prev.map(m => m.id === analysisMessage.id ? resultMessage : m));
      
      // Message de suivi après l'analyse
      setTimeout(() => {
        const followUpMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: 'Avez-vous d\'autres symptômes à me signaler ou souhaitez-vous des informations supplémentaires sur ces résultats ?',
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, followUpMessage]);
      }, 1500);
      
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Désolé, une erreur est survenue lors de l'analyse: ${error instanceof Error ? error.message : 'Erreur inconnue'}. Veuillez réessayer.`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => prev.map(m => m.id === analysisMessage.id ? errorMessage : m));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View 
      style={{
        maxWidth: '80%',
        padding: 16,
        borderRadius: 20,
        marginBottom: 8,
        alignSelf: item.isUser ? 'flex-end' : 'flex-start',
        backgroundColor: item.isUser ? '#059669' : '#fff',
        borderBottomRightRadius: item.isUser ? 0 : 20,
        borderBottomLeftRadius: item.isUser ? 20 : 0,
        shadowColor: item.isUser ? 'transparent' : '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Text style={{ fontSize: 16, color: item.isUser ? '#fff' : '#1f2937' }}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f3f4f6' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 15, paddingBottom: 70 }}
      />
      
      {symptoms.length >= 1 && !isAnalyzing && (
        <TouchableOpacity 
          style={{
            backgroundColor: '#059669',
            padding: 16,
            borderRadius: 12,
            marginHorizontal: 16,
            marginBottom: 16,
            alignItems: 'center',
          }}
          onPress={analyzeSymptoms}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Analyser mes symptômes</Text>
        </TouchableOpacity>
      )}
      
      <View style={{
        flexDirection: 'row',
        padding: 8,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
      }}>
        <TextInput
          style={{
            flex: 1,
            backgroundColor: '#f3f4f6',
            borderRadius: 50,
            paddingHorizontal: 16,
            paddingVertical: 8,
            maxHeight: 96,
          }}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Décrivez vos symptômes..."
          multiline
          keyboardType="default"
        />
        <TouchableOpacity 
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: '#059669',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 8,
          }}
          onPress={handleSend}
          disabled={inputText.trim() === ''}
        >
          <Ionicons name="send" size={24} color={inputText.trim() === '' ? 'rgba(255,255,255,0.5)' : '#fff'} />
        </TouchableOpacity>
      </View>
      
      {isAnalyzing && (
        <View style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={{
            backgroundColor: '#fff',
            padding: 20,
            borderRadius: 12,
            alignItems: 'center',
          }}>
            <ActivityIndicator size="large" color="#0c8a56" />
            <Text style={{ marginTop: 12, color: '#1f2937', fontWeight: '500' }}>Analyse en cours...</Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}