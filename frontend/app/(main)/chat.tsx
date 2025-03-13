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

  /**
   * handleSend : interprète "oui" ou "non", sinon ajoute un symptôme
   */
  const handleSend = () => {
    if (inputText.trim() === '') return;

    // 1) Création du message utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    // On l'ajoute immédiatement à la liste des messages
    setMessages(prev => [...prev, userMessage]);

    // 2) Interprétation de la saisie
    const normalized = inputText.trim().toLowerCase();

    // Copie du tableau actuel pour mise à jour si c'est un symptôme
    const newSymptoms = [...symptoms];

    // Si l'utilisateur tape "oui" et qu'il y a déjà au moins 2 symptômes
    if (normalized === 'oui' && newSymptoms.length >= 2) {
      // On lance l'analyse après un léger délai (optionnel)
      setTimeout(() => {
        analyzeSymptoms();
      }, 1000);

    // Si l'utilisateur tape "non"
    } else if (normalized === 'non') {
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'D\'accord, n\'hésitez pas à me décrire d\'autres symptômes plus tard ou à taper "oui" pour analyser.',
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }, 1000);

    // Sinon, on considère la saisie comme un nouveau symptôme
    } else {
      newSymptoms.push(inputText);
      setSymptoms(newSymptoms);

      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: newSymptoms.length >= 2
            ? 'Souhaitez-vous que j\'analyse ces symptômes maintenant ? (Tapez "oui" ou appuyez sur le bouton Analyser)'
            : 'Avez-vous d\'autres symptômes à me signaler ?',
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }, 1000);
    }

    // On vide le champ de saisie
    setInputText('');
  };

  /**
   * analyzeSymptoms : envoie les symptômes à l'API pour analyse
   */
  const analyzeSymptoms = async () => {
    setIsAnalyzing(true);

    // Message "Analyse en cours..."
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

      // Remplacer le message "Analyse en cours..." par le résultat
      setMessages(prev => prev.map(m => (m.id === analysisMessage.id ? resultMessage : m)));

      // Message de suivi
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
        text: `Désolé, une erreur est survenue lors de l'analyse: ${
          error instanceof Error ? error.message : 'Erreur inconnue'
        }. Veuillez réessayer.`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => prev.map(m => (m.id === analysisMessage.id ? errorMessage : m)));
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Affichage d'un message dans la FlatList
   */
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
      
      {/* Bouton "Analyser mes symptômes" si on a déjà au moins 1 symptôme et qu'on n'est pas en cours d'analyse */}
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
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
            Analyser mes symptômes
          </Text>
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
          placeholder="Décrivez vos symptômes ou tapez 'oui'/'non'..."
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
          <Ionicons
            name="send"
            size={24}
            color={inputText.trim() === '' ? 'rgba(255,255,255,0.5)' : '#fff'}
          />
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
            <Text style={{ marginTop: 12, color: '#1f2937', fontWeight: '500' }}>
              Analyse en cours...
            </Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}