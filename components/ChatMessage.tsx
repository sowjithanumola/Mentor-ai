
import React from 'react';
import { User, GraduationCap, Copy, Check } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAi = message.role === 'model';
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple formatter for bold text and list items
  const formatContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bold text using **
      let formattedLine: any = line;
      
      // Basic markdown detection and conversion for UI clarity
      // Replace **text** with <b>text</b>
      if (line.includes('**')) {
        const parts = line.split('**');
        formattedLine = parts.map((part, i) => i % 2 === 1 ? <b key={i} className="text-slate-900 font-bold">{part}</b> : part);
      }

      // Check for list item
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return <div key={idx} className="flex gap-2 mb-1 pl-2">
          <span className="text-indigo-500 mt-1">•</span>
          <p className="flex-1">{formattedLine.length > 1 ? line.substring(2) : formattedLine}</p>
        </div>;
      }

      if (line.trim() === '') return <div key={idx} className="h-3" />;

      return <p key={idx} className="mb-2 leading-relaxed">{formattedLine}</p>;
    });
  };

  return (
    <div className={`flex w-full gap-4 ${isAi ? 'justify-start' : 'justify-end animate-in slide-in-from-right-4 duration-300'}`}>
      {isAi && (
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100 ring-2 ring-white">
          <GraduationCap size={20} className="text-white" />
        </div>
      )}

      <div className={`
        group relative max-w-[85%] lg:max-w-[75%] p-5 rounded-2xl shadow-sm border
        ${isAi 
          ? 'bg-white border-slate-100 rounded-tl-none' 
          : 'bg-indigo-600 border-indigo-500 text-white rounded-tr-none'}
      `}>
        {isAi && (
           <button 
             onClick={handleCopy}
             className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100 rounded-lg text-slate-400"
             title="Copy response"
           >
             {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
           </button>
        )}
        
        <div className={`text-sm ${isAi ? 'text-slate-700' : 'text-indigo-50'}`}>
          {formatContent(message.content)}
        </div>

        <div className={`text-[10px] mt-3 opacity-50 flex items-center gap-1 ${isAi ? 'text-slate-400' : 'text-indigo-200'}`}>
          <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span>•</span>
          <span>{isAi ? 'Mentor AI' : 'You'}</span>
        </div>
      </div>

      {!isAi && (
        <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center shrink-0 border border-slate-300">
          <User size={20} className="text-slate-500" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
