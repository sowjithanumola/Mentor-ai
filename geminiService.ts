
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { StudentLevel, Message } from './types';

export const generateMentorResponse = async (
  prompt: string,
  history: Message[],
  level: StudentLevel
): Promise<string> => {
  // Always create a fresh instance to ensure the latest API key from environment is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const systemInstruction = `
    You are Mentor AI, a friendly, intelligent, and supportive virtual mentor designed to help students learn effectively.
    
    Current Student Level: ${level}
    
    Goals:
    - Explain concepts in a simple, clear, and student-friendly way.
    - Adapt explanations based on the student's level (${level}).
    - Encourage curiosity and critical thinking.
    - Ask guiding questions instead of just giving answers immediately.
    
    Formatting:
    - Use Markdown for bolding, lists, and headers.
    - If explaining math or code, use clear formatting.
    
    Always end your response with exactly: "Would you like an example, a quiz, or a simpler explanation?"
  `;

  // Prepare the content array including history
  const contents = [
    ...history.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    })),
    {
      role: 'user',
      parts: [{ text: prompt }]
    }
  ];

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents as any, // Cast to any to handle library type nuances
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return text;
  } catch (error: any) {
    console.error("Gemini API Detailed Error:", error);
    
    if (error.message?.includes('API_KEY_INVALID') || !process.env.API_KEY) {
      return "I can't access my brain right now! Please make sure the API_KEY environment variable is set correctly in Vercel settings.";
    }
    
    return "Oops! I encountered an error. Please check your connection or try again later.";
  }
};
