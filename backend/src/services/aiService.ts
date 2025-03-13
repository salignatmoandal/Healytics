import axios from 'axios';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export class AIService {
  /**
   * Analyse les symptômes en utilisant l'API OpenAI avec le modèle gpt-3.5-turbo.
   * @param symptoms Chaîne décrivant les symptômes.
   * @returns Un objet contenant l'analyse.
   */
  static async analyzeSymptoms(symptoms: string) {
    // Construction du prompt à envoyer
    const prompt = `Analyser les symptômes suivants et proposer des diagnostics possibles :
    
Symptômes : ${symptoms}

Diagnostics possibles :`;

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "Vous êtes un assistant médical expert en diagnostic." },
            { role: "user", content: prompt }
          ],
          max_tokens: 150,
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      // Dans la réponse de chat, le résultat se trouve dans choices[0].message.content
      const analysis = response.data.choices[0].message.content.trim();
      return { result: analysis };
    } catch (error: any) {
      console.error("Erreur lors de l'appel à OpenAI :", error.response?.data || error.message);
      throw new Error("Échec de l'analyse des symptômes via OpenAI.");
    }
  }
}