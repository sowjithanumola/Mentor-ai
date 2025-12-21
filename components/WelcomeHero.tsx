
import React from 'react';
import { 
  Atom, 
  Calculator, 
  Languages, 
  Code2, 
  ScrollText, 
  Dna, 
  ChevronRight,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';
import { Subject } from '../types';

interface WelcomeHeroProps {
  onStartSubject: (subject: string) => void;
  onSendMessage: (text: string) => void;
}

const subjects = [
  { name: 'Physics', icon: <Atom className="text-blue-500" />, prompt: "Explain Einstein's Relativity in simple terms." },
  { name: 'Algebra', icon: <Calculator className="text-emerald-500" />, prompt: "Help me understand quadratic equations." },
  { name: 'Coding', icon: <Code2 className="text-indigo-500" />, prompt: "What are loops in programming? Give me a Python example." },
  { name: 'Biology', icon: <Dna className="text-rose-500" />, prompt: "How does DNA replication work?" },
];

const WelcomeHero: React.FC<WelcomeHeroProps> = ({ onStartSubject, onSendMessage }) => {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-12 lg:py-24">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Main Hero */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full font-bold text-xs uppercase tracking-widest animate-bounce">
            <Sparkles size={16} />
            <span>AI-Powered Learning Support</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-black text-slate-800 tracking-tight leading-tight">
            Hi, I'm your <span className="text-indigo-600 bg-indigo-50 px-3 rounded-2xl">Virtual Mentor</span>.
          </h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
            Ready to ace your studies? I'm here to explain concepts, help with homework, and build study plans that actually work.
          </p>
        </div>

        {/* Action Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjects.map((subj) => (
            <button
              key={subj.name}
              onClick={() => onSendMessage(subj.prompt)}
              className="group p-6 bg-white border border-slate-100 rounded-3xl text-left hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-100 transition-all active:scale-[0.98]"
            >
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {subj.icon}
              </div>
              <h3 className="font-bold text-slate-800 mb-1">{subj.name}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">Quick help with concepts & exercises.</p>
              <div className="mt-4 flex items-center text-indigo-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Start Learning</span>
                <ChevronRight size={14} />
              </div>
            </button>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="grid sm:grid-cols-3 gap-8 pt-8">
           <div className="flex flex-col items-center text-center space-y-3">
             <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
               <Zap size={24} />
             </div>
             <h4 className="font-bold text-slate-800">Clear Explanations</h4>
             <p className="text-sm text-slate-500">I break down complex topics into simple, understandable blocks.</p>
           </div>
           <div className="flex flex-col items-center text-center space-y-3">
             <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
               <Target size={24} />
             </div>
             <h4 className="font-bold text-slate-800">Exam Ready</h4>
             <p className="text-sm text-slate-500">Generate quizzes and mock test questions to check your knowledge.</p>
           </div>
           <div className="flex flex-col items-center text-center space-y-3">
             <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
               <ScrollText size={24} />
             </div>
             <h4 className="font-bold text-slate-800">Study Paths</h4>
             <p className="text-sm text-slate-500">Get personalized revision schedules tailored to your exams.</p>
           </div>
        </div>

        {/* Footnote */}
        <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 text-center space-y-4">
           <p className="text-slate-500 font-medium italic">"The beautiful thing about learning is that no one can take it away from you."</p>
           <div className="flex items-center justify-center gap-4">
              <span className="w-12 h-px bg-slate-200"></span>
              <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">Mentor AI Wisdom</span>
              <span className="w-12 h-px bg-slate-200"></span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHero;
