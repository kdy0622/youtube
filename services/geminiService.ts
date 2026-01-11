
import { GoogleGenAI, Type } from "@google/genai";
import { ThumbnailStrategy } from "../types";

const SYSTEM_INSTRUCTION = `
You are a world-class YouTube Thumbnail and CTR (Click-Through Rate) Strategist.
Analyze user input to suggest the most engaging thumbnail elements.

Rules:
1. Title: Extremely short and impactful (Korean). Keep it under 15-20 characters for readability. Max 2 lines.
2. Subtitle: Short context (Korean). 
3. Badge: Single word like '충격', '최초', '꿀팁'.
4. Image Prompt: Detailed English prompt for high-quality image generation. Focus on wide landscape, atmospheric backgrounds, vibrant colors, and cinematic lighting. Do NOT include any text in the image.

You MUST respond in JSON format.
`;

export const generateStrategy = async (input: string): Promise<ThumbnailStrategy> => {
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

  return JSON.parse(response.text || '{}');
};

export const generateThumbnailImage = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `High-quality cinematic YouTube thumbnail background, 4k, vivid colors, deep shadows, clean composition, NO TEXT: ${prompt}` }]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  // Iterate through parts to find inlineData for the image
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  
  throw new Error("Failed to generate image: No image data returned");
};
