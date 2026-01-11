
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
  
  // YouTube 썸네일 최적화 모델 사용
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `A high-quality cinematic 4k YouTube thumbnail background with NO TEXT. Vibrant colors, deep contrast, wide-angle cinematic shot: ${prompt}` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  // response.candidates[0].content.parts 배열 전체를 순회하여 inlineData(이미지)를 찾음
  const candidate = response.candidates?.[0];
  if (candidate?.content?.parts) {
    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  
  // 만약 이미지가 반환되지 않았을 경우, 재시도하거나 대체 텍스트 에러 발생
  console.error("Gemini Image Response:", response);
  throw new Error("No image data in response candidates");
};
