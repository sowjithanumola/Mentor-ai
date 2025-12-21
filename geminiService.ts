
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { StudentLevel, Message } from './types';

export const generateMentorResponse = async (
  prompt: string,
  history: Message[],
  level: StudentLevel
): Promise<string> => {
  // Ensure the key exists before initializing, but let the SDK handle the error if it's missing
  const apiKey = process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey || '' });
  
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

  // Filter out any temporary optimistic messages from history
  const validHistory = history.filter(m => !m.id.startsWith('temp-'));

  const contents = [
    ...validHistory.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    })),
    {
      role: 'user',
      parts: [{ text: prompt }]
    }
  ];

  try {
    // Attempt the API call
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents as any,
      config: {
        systemInstruction,
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
      },
    });

    const text = response.text;
    if (!text) {
      console.error("AI returned an empty response object:", response);
      throw new Error("Empty response received from the AI model.");
    }
    
    return text;
  } catch (error: any) {
    // Log the full error to the browser console for debugging
    console.group("Mentor AI - API Error Details");
    console.error("Error Message:", error.message);
    console.error("Full Error Object:", error);
    console.groupEnd();

    // Check for common issues
    if (!apiKey) {
      return "Critical: API_KEY is missing. Please go to your Vercel Project Settings > Environment Variables, add 'API_KEY', and then REDEPLOY your project.";
    }

    if (error.message?.includes('401') || error.message?.includes('API_KEY_INVALID')) {
      return "The API key provided is invalid. Please double-check the key you added to Vercel settings.";
    }

    if (error.message?.includes('403') || error.message?.includes('PERMISSION_DENIED')) {
      return "Access denied. Ensure your API key has access to the Gemini API and that billing (if required) is in good standing.";
    }

    if (error.message?.includes('429')) {
      return "I'm a bit overwhelmed with requests right now! Please wait a moment and try again.";
    }
    
    return `I encountered an unexpected error: ${error.message || 'Unknown Error'}. Please check your browser console for more details.`;
  }
};
