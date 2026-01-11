
import { GoogleGenAI, Type } from "@google/genai";
import { ThumbnailStrategy } from "../types";

const SYSTEM_INSTRUCTION = `
You are a world-class YouTube Thumbnail and CTR (Click-Through Rate) Strategist for a channel with 1 million subscribers.
Your goal is to analyze the user's input and suggest the most engaging thumbnail elements.

Rules:
1. Title: Max 2 lines. Curated to provoke curiosity or highlight strong benefits. (Korean)
2. Subtitle: Visual supplementary explanation. (Korean)
3. Badge: Impactful words like '최신', '꿀팁', '충격'. (Korean)
4. Image Prompt: Detailed English prompt for high-quality image generation (Imagen 4.0 style). Focus on background and atmosphere. (English)

You MUST respond in JSON format following the schema provided.
`;

export const generateStrategy = async (input: string): Promise<ThumbnailStrategy> => {
  // Always use {apiKey: process.env.API_KEY}
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: input,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          subtitle: { type: Type.STRING },
          badge: { type: Type.STRING },
          image_prompt: { type: Type.STRING },
        },
        required: ["title", "subtitle", "badge", "image_prompt"]
      }
    }
  });

  // Accessing response.text directly as a property
  return JSON.parse(response.text || '{}');
};

export const generateThumbnailImage = async (prompt: string): Promise<string> => {
  // Always use {apiKey: process.env.API_KEY}
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `Cinematic high-quality YouTube thumbnail background: ${prompt}. Bright colors, high contrast, clean composition, no text.` }]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Failed to generate image");
};
