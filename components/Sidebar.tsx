
import React from 'react';
import { PlusCircle, History, Trash2, GraduationCap, X, Settings, Star, LogOut, User as UserIcon } from 'lucide-react';
import { ChatSession, StudentLevel, User } from '../types';

interface SidebarProps {
  user: User;
  onLogout: () => void;
  sessions: ChatSession[];
  activeSessionId?: string;
  isOpen: boolean;
  onSelectSession: (session: ChatSession) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onClearHistory: () => void;
  level: StudentLevel;
  setLevel: (level: StudentLevel) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  user,
  onLogout,
  sessions,
  activeSessionId,
  isOpen,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearHistory,
  level,
  setLevel
}) => {
  return (
    <aside className={`
      fixed inset-y-0 left-0 w-80 bg-slate-900 text-white z-50 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      flex flex-col
    `}>
      {/* Sidebar Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="text-indigo-400" size={28} />
          <span className="font-bold text-xl tracking-tight">Learning Hub</span>
        </div>
        <button onClick={onNewChat} className="lg:hidden p-2 hover:bg-slate-800 rounded-lg">
          <X size={20} />
        </button>
      </div>

      {/* Level Selection */}
      <div className="p-4 border-b border-slate-800">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 block">Current Level</label>
        <div className="grid grid-cols-3 gap-2">
          {(['Beginner', 'Intermediate', 'Advanced'] as StudentLevel[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevel(lvl)}
              className={`py-2 px-1 text-[10px] rounded-lg font-bold transition-all ${
                level === lvl 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {lvl.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* New Session Button */}
      <div className="p-4">
        <button 
          onClick={onNewChat}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors shadow-lg shadow-indigo-900/20 group"
        >
          <PlusCircle size={18} className="group-hover:rotate-90 transition-transform" />
          <span>New Session</span>
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4">
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-slate-900 py-2 z-10">
          <div className="flex items-center gap-2 text-slate-400">
            <History size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">History</span>
          </div>
          {sessions.length > 0 && (
            <button 
              onClick={onClearHistory}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <Trash2 size={12} />
              Clear
            </button>
          )}
        </div>

        <div className="space-y-2">
          {sessions.length === 0 ? (
            <div className="text-center py-8 px-4 border border-dashed border-slate-800 rounded-xl">
              <p className="text-sm text-slate-500 italic">No recent sessions.</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div 
                key={session.id}
                className={`
                  group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border
                  ${activeSessionId === session.id 
                    ? 'bg-slate-800 border-indigo-500 text-white' 
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
                `}
                onClick={() => onSelectSession(session)}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activeSessionId === session.id ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  <Star size={16} fill={activeSessionId === session.id ? "currentColor" : "none"} />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-sm font-medium truncate">{session.title}</p>
                  <p className="text-[10px] opacity-50">{new Date(session.createdAt).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer User Info */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-800">
           <div className="flex items-center gap-3 min-w-0">
             <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0">
               <UserIcon size={16} />
             </div>
             <div className="min-w-0">
               <p className="text-xs font-bold truncate">{user.name}</p>
               <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
             </div>
           </div>
           <button 
             onClick={onLogout}
             className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-all"
             title="Logout"
           >
             <LogOut size={16} />
           </button>
        </div>
        <div className="flex items-center gap-3 px-3 py-1 text-slate-400 text-[10px] italic opacity-50">
          <Settings size={12} />
          <span>v1.0.3 Secure</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
