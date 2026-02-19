
import { GoogleGenAI } from "@google/genai";

export const getFoodRecommendation = async (mood: string, availableRestaurants: any[]): Promise<string> => {
  // A API Key é obtida do ambiente configurado na Vercel
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  if (availableRestaurants.length === 0) {
    return "No momento não temos restaurantes cadastrados, mas em breve teremos opções deliciosas!";
  }

  const restaurantContext = availableRestaurants.map(r => 
    `${r.name} (Descrição: ${r.description}, Itens: ${r.menu.map((m: any) => m.name).join(', ')})`
  ).join('\n');

  const promptText = `
    Você é um assistente virtual do aplicativo 'Delivery Certo'.
    
    Contexto de Restaurantes Disponíveis:
    ${restaurantContext}

    O usuário disse que está com vontade de: "${mood}".

    Sua tarefa:
    1. Recomende de forma bem humorada 1 ou 2 opções que combinem com o desejo dele.
    2. Seja muito breve (máximo 35 palavras).
    3. Responda em Português (Brasil).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite-latest',
      contents: [{ parts: [{ text: promptText }] }],
    });
    
    return response.text || "Explore nossos cardápios, temos ótimas opções para você hoje!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Estou com um pequeno problema técnico para sugerir algo agora, mas dê uma olhadinha nos restaurantes abaixo!";
  }
};
