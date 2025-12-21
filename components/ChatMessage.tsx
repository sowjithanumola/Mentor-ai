
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

  const formatContent = (text: string) => {
    return text.split('\n').map((line, idx) => {
      let content: any = line;

      // Handle Bold text **text**
      if (content.includes('**')) {
        const parts = content.split('**');
        content = parts.map((part: string, i: number) => 
          i % 2 === 1 ? <strong key={i} className="font-bold text-slate-900">{part}</strong> : part
        );
      }

      // Handle simple list items
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <div key={idx} className="flex gap-2 mb-1.5 pl-2 animate-in fade-in slide-in-from-left-2">
            <span className="text-indigo-500 font-bold">•</span>
            <div className="flex-1">{content}</div>
          </div>
        );
      }

      // Handle headers
      if (line.startsWith('### ')) return <h3 key={idx} className="text-lg font-bold mt-4 mb-2 text-slate-800">{line.replace('### ', '')}</h3>;
      if (line.startsWith('## ')) return <h2 key={idx} className="text-xl font-bold mt-6 mb-3 text-slate-900 border-b border-slate-100 pb-1">{line.replace('## ', '')}</h2>;

      if (line.trim() === '') return <div key={idx} className="h-3" />;

      return <p key={idx} className="mb-3 leading-relaxed last:mb-0">{content}</p>;
    });
  };

  return (
    <div className={`flex w-full gap-4 ${isAi ? 'justify-start' : 'justify-end animate-in slide-in-from-bottom-2 duration-300'}`}>
      {isAi && (
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100 ring-2 ring-white">
          <GraduationCap size={20} className="text-white" />
        </div>
      )}

      <div className={`
        group relative max-w-[85%] lg:max-w-[80%] p-5 rounded-2xl shadow-sm border transition-all
        ${isAi 
          ? 'bg-white border-slate-100 rounded-tl-none text-slate-700' 
          : 'bg-indigo-600 border-indigo-500 text-white rounded-tr-none'}
      `}>
        {isAi && (
           <button 
             onClick={handleCopy}
             className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-50 rounded-lg text-slate-400"
             title="Copy response"
           >
             {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
           </button>
        )}
        
        <div className="text-sm md:text-base">
          {formatContent(message.content)}
        </div>

        <div className={`text-[10px] mt-4 font-medium flex items-center gap-1.5 tracking-wide uppercase ${isAi ? 'text-slate-400' : 'text-indigo-200'}`}>
          <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="opacity-30">•</span>
          <span>{isAi ? 'Mentor AI' : 'You'}</span>
        </div>
      </div>

      {!isAi && (
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
          <User size={20} className="text-slate-400" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
