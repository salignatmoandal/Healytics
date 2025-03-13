import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api} from '../service/api';
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

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

  const handleSend = async () => {
    if (inputText.trim() === '') return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setSymptoms(prev => [...prev, inputText]);
    setInputText('');
    
    // Si l'utilisateur a entré au moins 3 symptômes, proposer l'analyse
    if (symptoms.length >= 2) {
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Souhaitez-vous que j\'analyse ces symptômes maintenant ?',
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }, 1000);
    } else {
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Avez-vous d\'autres symptômes à me signaler ?',
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }, 1000);
    }
  };

  const analyzeSymptoms = async () => {
    setIsAnalyzing(true);
    
    const analysisMessage: Message = {
      id: Date.now().toString(),
      text: 'Analyse en cours...',
      isUser: false,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, analysisMessage]);
    
    try {
      const response = await api.analyzeSymptoms(symptoms);
      
      const resultMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Résultat de l'analyse : ${JSON.stringify(response.result)}`,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev.filter(m => m.id !== analysisMessage.id), resultMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Désolé, une erreur est survenue lors de l\'analyse.',
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev.filter(m => m.id !== analysisMessage.id), errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View 
      className={`max-w-[80%] p-4 rounded-2xl mb-2 ${
        item.isUser 
          ? 'bg-green-600 self-end rounded-br-sm' 
          : 'bg-white self-start rounded-bl-sm shadow'
      }`}
    >
      <Text className={`text-base ${item.isUser ? 'text-white' : 'text-gray-800'}`}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-100"
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
      
      {symptoms.length >= 2 && !isAnalyzing && (
        <TouchableOpacity 
          className="bg-green-600 p-4 rounded-xl mx-4 mb-4 items-center"
          onPress={analyzeSymptoms}
        >
          <Text className="text-white font-bold text-base">Analyser mes symptômes</Text>
        </TouchableOpacity>
      )}
      
      <View className="flex-row p-2 bg-white border-t border-gray-200 absolute bottom-0 left-0 right-0">
        <TextInput
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 max-h-24"
          value={inputText}
          onChangeText={setInputText}
          placeholder="Décrivez vos symptômes..."
          multiline
        />
        <TouchableOpacity 
          className="w-12 h-12 rounded-full bg-green-600 justify-center items-center ml-2"
          onPress={handleSend}
        >
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}