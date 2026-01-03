
import React, { useState, useEffect } from 'react';
import { Menu, GraduationCap, Sparkles, Loader2, BookOpen } from 'lucide-react';
import { StudentLevel, Message, ChatSession, User, Quiz } from './types';
import { generateMentorResponse, generateQuiz, playTextToSpeech } from './geminiService';
import { supabase } from './lib/supabase';
import Sidebar from './components/Sidebar';
import ChatContainer from './components/ChatContainer';
import WelcomeHero from './components/WelcomeHero';
import AuthScreen from './AuthScreen';
import QuizModal from './components/QuizModal';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [level, setLevel] = useState<StudentLevel>('Beginner');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const syncUserFromSession = (session: any) => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'Student',
        email: session.user.email || '',
      });
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncUserFromSession(session);
      setIsInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUserFromSession(session);
      if (!session) {
        setSessions([]);
        setActiveSession(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchSessions = async () => {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setSessions(data.map(d => ({
            id: d.id,
            userId: d.user_id,
            title: d.title,
            level: d.level as StudentLevel,
            subject: d.subject,
            createdAt: new Date(d.created_at).getTime(),
            messages: [] 
          })));
        }
      };
      fetchSessions();
    }
  }, [user]);

  useEffect(() => {
    if (activeSession && activeSession.messages.length === 0) {
      const fetchMessages = async () => {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('session_id', activeSession.id)
          .order('timestamp', { ascending: true });

        if (!error && data) {
          setActiveSession(prev => prev ? {
            ...prev,
            messages: data.map(m => ({
              id: m.id,
              role: m.role as 'user' | 'model',
              content: m.content,
              timestamp: m.timestamp
            }))
          } : null);
        }
      };
      fetchMessages();
    }
  }, [activeSession?.id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const createNewSession = async (subject?: string) => {
    if (!user) return;
    
    const newSessionData = {
      user_id: user.id,
      title: subject ? `Learning ${subject}` : 'New Mentor Session',
      level: level,
      subject: subject,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('sessions')
      .insert([newSessionData])
      .select()
      .single();

    if (!error && data) {
      const initialGreeting = `Hello! I'm Mentor AI, your virtual guide for ${subject || 'learning'}. I was created by Sowjith Anumola to help you master any subject. What shall we explore together today?`;
      
      const { data: msgData } = await supabase.from('messages').insert([{
        session_id: data.id,
        role: 'model',
        content: initialGreeting,
        timestamp: Date.now()
      }]).select().single();

      const newSession: ChatSession = {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        messages: msgData ? [{
          id: msgData.id,
          role: 'model',
          content: msgData.content,
          timestamp: msgData.timestamp
        }] : [],
        level: data.level,
        subject: data.subject,
        createdAt: new Date(data.created_at).getTime(),
      };
      
      setSessions(prev => [newSession, ...prev]);
      setActiveSession(newSession);
      setIsSidebarOpen(false);
    }
  };

  const handleSendMessage = async (text: string, isVoice: boolean = false) => {
    if (!text.trim() || !user) return;

    let currentSession = activeSession;
    
    if (!currentSession) {
      const newSessionData = {
        user_id: user.id,
        title: text.length > 30 ? text.substring(0, 30) + '...' : text,
        level: level,
        created_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('sessions').insert([newSessionData]).select().single();
      if (error || !data) return;
      
      const helloMsg = `Hello! I'm Mentor AI, created by Sowjith Anumola. Let's get started with your question.`;
      const { data: helloData } = await supabase.from('messages').insert([{
        session_id: data.id,
        role: 'model',
        content: helloMsg,
        timestamp: Date.now()
      }]).select().single();

      currentSession = {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        messages: helloData ? [{
          id: helloData.id,
          role: 'model',
          content: helloData.content,
          timestamp: helloData.timestamp
        }] : [],
        level: data.level,
        createdAt: new Date(data.created_at).getTime(),
      };
      setSessions(prev => [currentSession!, ...prev]);
      setActiveSession(currentSession);
    }

    const timestamp = Date.now();
    const tempUserId = 'temp-u-' + timestamp;
    const optimisticUserMsg: Message = { 
      id: tempUserId,
      role: 'user', 
      content: text, 
      timestamp 
    };

    // Show user message immediately
    setActiveSession(prev => prev ? { 
      ...prev, 
      messages: [...prev.messages, optimisticUserMsg] 
    } : null);
    setIsLoading(true);

    try {
      // 1. Save user message to database
      const { data: userData, error: userError } = await supabase.from('messages').insert([{
        session_id: currentSession.id,
        role: 'user',
        content: text,
        timestamp: timestamp
      }]).select().single();

      if (userError) throw userError;

      // Update state to use the real database ID for the user message
      const persistentUserMsg: Message = {
        id: userData.id,
        role: 'user',
        content: userData.content,
        timestamp: userData.timestamp
      };

      // 2. Get AI Response
      const aiResponseText = await generateMentorResponse(text, currentSession.messages, level);
      
      const aiTimestamp = Date.now();
      const { data: aiData, error: aiError } = await supabase.from('messages').insert([{
        session_id: currentSession.id,
        role: 'model',
        content: aiResponseText,
        timestamp: aiTimestamp,
      }]).select().single();

      if (aiError) throw aiError;

      const persistentAiMsg: Message = {
        id: aiData.id,
        role: 'model',
        content: aiData.content,
        timestamp: aiData.timestamp
      };

      // Final state update: remove ALL temp messages and ensure both permanent user and AI messages are present
      setActiveSession(prev => {
        if (!prev) return null;
        // Remove the temporary message that started this turn
        const historyWithoutTemp = prev.messages.filter(m => m.id !== tempUserId);
        // Ensure the persistent user message is in history if it wasn't already updated
        const historyWithUser = historyWithoutTemp.some(m => m.id === persistentUserMsg.id) 
          ? historyWithoutTemp 
          : [...historyWithoutTemp, persistentUserMsg];
          
        return {
          ...prev,
          messages: [...historyWithUser, persistentAiMsg]
        };
      });

      if (isVoice && aiResponseText) {
        playTextToSpeech(aiResponseText);
      }
    } catch (error: any) {
      console.error("HandleSendMessage Error:", error);
      const errorMsg: Message = {
        id: 'error-' + Date.now(),
        role: 'model',
        content: "I'm having trouble connecting to my knowledge base. Please check your internet connection or API settings.",
        timestamp: Date.now()
      };
      setActiveSession(prev => prev ? { ...prev, messages: [...prev.messages, errorMsg] } : null);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (id: string) => {
    const { error } = await supabase.from('sessions').delete().eq('id', id);
    if (!error) {
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSession?.id === id) {
        setActiveSession(null);
      }
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Delete all your learning history permanently?') && user) {
      const { error } = await supabase.from('sessions').delete().eq('user_id', user.id);
      if (!error) {
        setSessions([]);
        setActiveSession(null);
      }
    }
  };

  const handleStartQuiz = async () => {
    if (!activeSession || activeSession.messages.length < 2) {
      alert("We need a bit more conversation to generate a relevant quiz! Try asking me a few questions first.");
      return;
    }
    setIsGeneratingQuiz(true);
    try {
      const quiz = await generateQuiz(activeSession.messages, level);
      setActiveQuiz(quiz);
    } catch (err) {
      console.error(err);
      alert("Oops! Failed to generate the quiz. Let's try chatting a bit more first.");
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  if (!isInitialized) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
      <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white animate-bounce shadow-xl shadow-indigo-200">
        <GraduationCap size={32} />
      </div>
      <div className="flex items-center gap-2 text-slate-400 font-medium">
        <Loader2 className="animate-spin" size={18} />
        <span>Syncing with your Learning Hub...</span>
      </div>
    </div>
  );

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-inter animate-in fade-in duration-700">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      {activeQuiz && (
        <QuizModal quiz={activeQuiz} onClose={() => setActiveQuiz(null)} />
      )}

      <Sidebar 
        user={user}
        onLogout={handleLogout}
        sessions={sessions}
        activeSessionId={activeSession?.id}
        isOpen={isSidebarOpen}
        onSelectSession={(s) => {
          setActiveSession(s);
          setIsSidebarOpen(false);
        }}
        onNewChat={() => createNewSession()}
        onDeleteSession={deleteSession}
        onClearHistory={handleClearHistory}
        level={level}
        setLevel={setLevel}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-white relative shadow-2xl">
        <header className="h-16 border-b border-slate-100 flex items-center justify-between px-4 lg:px-8 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg lg:hidden transition-colors">
              <Menu size={20} className="text-slate-600" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setActiveSession(null)}>
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
                <GraduationCap size={24} />
              </div>
              <div className="hidden xs:block">
                <h1 className="font-bold text-slate-800 leading-none text-sm md:text-base">Mentor AI</h1>
                <span className="text-[10px] md:text-xs text-indigo-500 font-medium tracking-wide uppercase">Your Path to Mastery</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {activeSession && activeSession.messages.length >= 2 && (
               <button 
                 onClick={handleStartQuiz}
                 disabled={isGeneratingQuiz}
                 className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs md:text-sm font-bold border border-indigo-100 transition-all hover:bg-indigo-100 disabled:opacity-50"
               >
                 {isGeneratingQuiz ? <Loader2 className="animate-spin" size={14} /> : <BookOpen size={14} />}
                 <span>{isGeneratingQuiz ? 'Generating...' : 'Take Quiz'}</span>
               </button>
             )}
             <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-slate-600 text-xs md:text-sm font-semibold">
               <Sparkles size={14} className="text-amber-500" />
               <span className="hidden sm:inline">Difficulty:</span> {level}
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col">
          {activeSession ? (
            <ChatContainer 
              messages={activeSession.messages} 
              isLoading={isLoading} 
              onSendMessage={handleSendMessage}
              level={level}
            />
          ) : (
            <WelcomeHero 
              onStartSubject={(subject) => createNewSession(subject)} 
              onSendMessage={handleSendMessage}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
