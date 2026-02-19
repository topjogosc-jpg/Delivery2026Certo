
import { GoogleGenAI } from "@google/genai";

export const getFoodRecommendation = async (mood: string, availableRestaurants: any[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  if (availableRestaurants.length === 0) {
    return "No momento não temos restaurantes cadastrados, mas em breve teremos opções deliciosas!";
  }

  const restaurantContext = availableRestaurants.map(r => 
    `${r.name} (Descrição: ${r.description}, Itens: ${r.menu.map((m: any) => m.name).join(', ')})`
  ).join('\n');

  const prompt = `
    Você é um assistente virtual do aplicativo 'Delivery Certo'.
    
    Contexto de Restaurantes:
    ${restaurantContext}

    Desejo do usuário: "${mood}".

    Sua tarefa:
    1. Recomende 1 ou 2 pratos específicos dos restaurantes acima que combinem com o desejo.
    2. Seja muito breve (máximo 40 palavras).
    3. Use um tom amigável.
    4. Responda em Português (Brasil).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Não consegui encontrar uma recomendación exata, mas explore nossos menus!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Estou com dificuldades para acessar as recomendações agora. Explore os cardápios manualmente, há muitas opções boas!";
  }
};
