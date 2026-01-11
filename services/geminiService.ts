
import { GoogleGenAI, Type } from "@google/genai";
import { ThumbnailStrategy } from "../types";

const SYSTEM_INSTRUCTION = `
당신은 100만 구독자를 보유한 유튜브 채널의 '썸네일 및 클릭률(CTR) 전략가'입니다.
사용자가 제공한 텍스트를 분석하여 가장 매력적인 썸네일 요소를 제안하세요.

규칙:
1. Title: 최대 2줄, 호기심 유발 및 강력한 혜택 강조 (한국어).
2. Subtitle: 시각적 보조 설명 (한국어).
3. Badge: '최신', '꿀팁', '충격' 등 임팩트 있는 단어 1개.
4. Image Prompt: Imagen 4.0 스타일의 구체적인 영어 프롬프트 (배경 및 분위기 위주, 텍스트 포함 금지).

반드시 JSON 구조로 답변하세요.
`;

export const generateStrategy = async (input: string): Promise<ThumbnailStrategy> => {
  // 인스턴스를 함수 내부에서 생성하여 process.env.API_KEY가 유효한지 매번 확인
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY is not defined");
  
  const ai = new GoogleGenAI({ apiKey });
  
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

  const text = response.text;
  if (!text) throw new Error("Empty response from AI");
  return JSON.parse(text);
};

export const generateThumbnailImage = async (prompt: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY is not defined");
  
  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `High-quality cinematic 4k YouTube thumbnail background, NO TEXT, vivid lighting: ${prompt}` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  const candidate = response.candidates?.[0];
  if (candidate?.content?.parts) {
    for (const part of candidate.content.parts) {
      if (part.inlineData?.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  
  throw new Error("Image data not found in response");
};
