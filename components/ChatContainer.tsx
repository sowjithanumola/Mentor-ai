
import React, { useRef, useEffect, useState } from 'react';
import { Send, Loader2, GraduationCap, Sparkles, Mic, MicOff } from 'lucide-react';
import { Message, StudentLevel } from '../types';
import ChatMessage from './ChatMessage';
import { startLiveTranscription } from '../geminiService';

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string, isVoice?: boolean) => void;
  level: StudentLevel;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ messages, isLoading, onSendMessage, level }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [transcriptionSession, setTranscriptionSession] = useState<{ stop: () => Promise<void> } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input, isListening);
      setInput('');
      if (isListening) handleToggleMic();
    }
  };

  const handleToggleMic = async () => {
    if (isListening) {
      if (transcriptionSession) {
        await transcriptionSession.stop();
        setTranscriptionSession(null);
      }
      setIsListening(false);
    } else {
      setIsListening(true);
      try {
        const session = await startLiveTranscription(
          (text) => setInput(text),
          () => {} // Handled by stop button
        );
        setTranscriptionSession(session);
      } catch (err) {
        console.error("Mic error:", err);
        setIsListening(false);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
      {/* Messages Window */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-8 lg:px-12 custom-scrollbar space-y-8"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-4 opacity-50">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
              <Sparkles size={32} className="text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">Start your learning journey by asking a question or choosing a topic!</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div className="flex justify-start items-start gap-4">
             <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
               <GraduationCap size={20} className="text-indigo-600" />
             </div>
             <div className="bg-white p-5 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-3">
               <Loader2 size={18} className="animate-spin text-indigo-500" />
               <span className="text-slate-500 font-medium">Mentor is thinking...</span>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 lg:p-6 bg-white border-t border-slate-100">
        <form 
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto flex items-end gap-3"
        >
          <div className="flex-1 relative group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={isListening ? "Listening..." : "Ask anything (e.g., 'How do black holes work?' or 'Make me a study plan for Biology')"}
              className={`w-full min-h-[56px] max-h-48 p-4 pr-12 bg-slate-50 border ${isListening ? 'border-indigo-400 ring-2 ring-indigo-500/20' : 'border-slate-200'} rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all`}
              rows={1}
            />
            {isListening && (
              <div className="absolute left-4 -top-8 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                LIVE TRANSCRIPTION
              </div>
            )}
            <div className="absolute right-4 bottom-4 text-[10px] font-bold text-slate-400 opacity-0 group-focus-within:opacity-100 transition-opacity uppercase tracking-tighter">
              Level: {level}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={handleToggleMic}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 shrink-0 ${isListening ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {isListening ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 transition-all active:scale-95 shrink-0"
            >
              <Send size={24} />
            </button>
          </div>
        </form>
        <p className="text-[10px] text-center mt-3 text-slate-400 font-medium uppercase tracking-widest">
          Mentor AI focuses on critical thinking and conceptual clarity
        </p>
      </div>
    </div>
  );
};

export default ChatContainer;
