
import { GoogleGenAI } from "@google/genai";

export const getFoodRecommendation = async (mood: string, availableRestaurants: any[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  if (availableRestaurants.length === 0) {
    return "No momento não temos restaurantes cadastrados, mas fique de olho que em breve teremos opções deliciosas!";
  }

  // Prepare context about available restaurants from the provided list
  const restaurantContext = availableRestaurants.map(r => 
    `${r.name} (Cozinha: ${r.description}, Menu: ${r.menu.map((m: any) => m.name).join(', ')})`
  ).join('\n');

  const prompt = `
    Você é um assistente útil para pedir comida no aplicativo 'Delivery Certo'.
    
    Aqui estão os restaurantes e menus disponíveis:
    ${restaurantContext}

    O usuário diz que está com vontade de: "${mood}".

    Com base nos menus disponíveis, sugira 1-2 pratos específicos de restaurantes específicos.
    Seja entusiasmado e breve (máximo de 50 words).
    Responda SEMPRE em Português do Brasil.
    Se o desejo não corresponder a nada, sugira educadamente um item do cardápio que pareça mais próximo ou ofereça ajuda geral.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Não consegui encontrar uma recomendação específica, mas tudo parece delicioso!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Estou com problemas para conectar ao meu guia gastronômico agora. Dê uma olhada nos cardápios, tem muita coisa boa!";
  }
};
