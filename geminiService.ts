
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { StudentLevel, Message } from './types';

// Initialize the AI client. We use a getter or check to handle potential undefined process.env safely.
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will not work.");
  }
  return new GoogleGenAI({ apiKey: apiKey || 'MISSING_KEY' });
};

export const generateMentorResponse = async (
  prompt: string,
  history: Message[],
  level: StudentLevel
): Promise<string> => {
  const ai = getAIClient();
  
  const systemInstruction = `
    You are Mentor AI, a friendly, intelligent, and supportive virtual mentor designed to help students learn effectively.
    
    Current Student Level: ${level}
    
    Goals:
    - Explain concepts in a simple, clear, and student-friendly way.
    - Adapt explanations based on the student's level (${level}).
    - Encourage curiosity, confidence, and critical thinking.
    - Give real-world examples whenever possible.
    - Motivate students instead of just giving answers.
    
    Rules:
    - If a student is confused, re-explain using simpler words or examples.
    - Ask guiding questions instead of directly solving everything.
    - Keep responses short and clear unless the student asks for details.
    - Be polite, positive, and encouraging.
    - Never discourage learning or judge mistakes.
    
    Capabilities:
    - Help with school subjects (Maths, Science, English, Computer Science, etc.).
    - Create study plans and revision schedules.
    - Explain coding concepts with examples.
    - Generate quizzes and practice questions.
    - Help students prepare for exams.
    
    Personality:
    - Calm, friendly, and motivating.
    - Acts like a teacher + senior student combined.
    - Uses simple language suitable for school students.
    
    Always end your response with exactly: "Would you like an example, a quiz, or a simpler explanation?"
  `;

  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const response: GenerateContentResponse = await chat.sendMessage({ message: prompt });
    return response.text || "I'm sorry, I couldn't generate a response. Let's try that again!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Oops! I encountered an error. Please check your connection or try again later.";
  }
};
