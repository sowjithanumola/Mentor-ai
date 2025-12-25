
import { GoogleGenAI, GenerateContentResponse, Type, Modality, LiveServerMessage } from "@google/genai";
import { StudentLevel, Message, Quiz } from './types';

// Helper for Base64 decoding
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper for Base64 encoding
function encodeBase64(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper for PCM Decoding
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const generateMentorResponse = async (
  prompt: string,
  history: Message[],
  level: StudentLevel
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey || '' });
  
  const systemInstruction = `
    You are Mentor AI, a friendly, intelligent, and supportive virtual mentor. 
    Your mission is to help students learn effectively across ANY subject or question they have.
    
    IDENTITY & CREATOR:
    - You were created by Sowjith Anumola.
    - If a user asks who created you, who developed you, or who your creator is, you MUST reply: "I was created by Sowjith Anumola. You can reach him at sowjith.anumola@gmail.com."
    
    CAPABILITIES:
    - You can answer ANY question, whether it is academic, technical, or general knowledge.
    - Current Student Level: ${level}. Adapt your depth and tone accordingly.
    
    GUIDELINES:
    - Answer clearly and accurately.
    - Encourage critical thinking and curiosity.
    - Use Markdown for formatting (bold, headers, bullet points).
    - Be encouraging. If a question is unclear, ask for clarification politely.
    - Always end your response with a helpful follow-up question to keep the learning going.
  `;

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
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents as any,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });
    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error: any) {
    console.error("Gemini Response Error:", error);
    return `I encountered an error while thinking: ${error.message || 'Unknown Error'}. Please try again!`;
  }
};

export const generateQuiz = async (
  history: Message[],
  level: StudentLevel
): Promise<Quiz> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: 'user',
        parts: [{ text: `Based on the following conversation history, generate a 5-question multiple choice quiz for a student at ${level} level. 
        Conversation History: ${JSON.stringify(history.slice(-5))}
        Ensure the questions are challenging but appropriate for the level.` }]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.INTEGER, description: "Index (0-3) of the correct option" },
                explanation: { type: Type.STRING }
              },
              required: ["id", "question", "options", "correctAnswer", "explanation"]
            }
          }
        },
        required: ["title", "questions"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const playTextToSpeech = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return;

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBytes = decodeBase64(base64Audio);
    const audioBuffer = await decodeAudioData(audioBytes, audioCtx, 24000, 1);
    
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start();
  } catch (err) {
    console.error("TTS Error:", err);
  }
};

export const startLiveTranscription = async (
  onTranscript: (text: string) => void,
  onComplete: () => void
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  let fullTranscript = '';

  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks: {
      onopen: () => {
        const source = inputAudioContext.createMediaStreamSource(stream);
        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
        
        scriptProcessor.onaudioprocess = (event) => {
          const inputData = event.inputBuffer.getChannelData(0);
          const l = inputData.length;
          const int16 = new Int16Array(l);
          for (let i = 0; i < l; i++) {
            int16[i] = inputData[i] * 32768;
          }
          const pcmBlob = {
            data: encodeBase64(new Uint8Array(int16.buffer)),
            mimeType: 'audio/pcm;rate=16000',
          };
          
          sessionPromise.then(session => {
            session.sendRealtimeInput({ media: pcmBlob });
          });
        };

        source.connect(scriptProcessor);
        scriptProcessor.connect(inputAudioContext.destination);
      },
      onmessage: async (message: LiveServerMessage) => {
        if (message.serverContent?.inputTranscription) {
          const text = message.serverContent.inputTranscription.text;
          fullTranscript += text;
          onTranscript(fullTranscript);
        }
        if (message.serverContent?.turnComplete) {
          onComplete();
        }
      },
      onerror: (e) => console.error('Live Error:', e),
      onclose: () => {
        stream.getTracks().forEach(track => track.stop());
        inputAudioContext.close();
      }
    },
    config: {
      responseModalities: [Modality.AUDIO],
      inputAudioTranscription: {},
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
      },
    },
  });

  return {
    stop: async () => {
      const session = await sessionPromise;
      session.close();
    }
  };
};
