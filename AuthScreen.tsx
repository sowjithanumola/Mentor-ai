
import React, { useState } from 'react';
import { GraduationCap, Mail, Lock, User, ArrowRight, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from './lib/supabase';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (loginError) {
          if (loginError.message.includes('Email not confirmed')) {
            throw new Error('Please confirm your email address before logging in, or disable email confirmation in your Supabase dashboard.');
          }
          throw loginError;
        }
      } else {
        const { data, error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });
        
        if (signupError) throw signupError;

        // If data.session exists, it means auto-confirm is ON in Supabase
        if (data.session) {
          // Redirect handled by App.tsx listener
        } else {
          // If auto-confirm is OFF, show the success message
          setIsSuccess(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500 border border-slate-100">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Verify your Email</h2>
          <p className="text-slate-500 leading-relaxed">
            A confirmation link has been sent to <span className="font-bold text-slate-700">{email}</span>. 
            Once confirmed, you can log in to meet your mentor!
          </p>
          <div className="pt-4 border-t border-slate-50">
            <button 
              onClick={() => setIsSuccess(false)}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100/40 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-[2rem] shadow-2xl shadow-indigo-200 mb-6 rotate-3">
            <GraduationCap size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Mentor AI</h1>
          <p className="text-slate-500 font-medium">Your personal path to mastery</p>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 p-8 lg:p-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {isLogin ? 'Welcome Back' : 'Join Mentor AI'}
          </h2>
          <p className="text-sm text-slate-400 mb-8">
            {isLogin ? 'Sign in to access your learning sessions.' : 'Start learning effectively with your AI mentor today.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="flex gap-3 text-xs font-semibold text-rose-500 bg-rose-50 p-4 rounded-xl border border-rose-100 animate-in slide-in-from-top-2 duration-200">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-95 mt-4 group"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {isLogin ? "New here? Create an account" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
          <Sparkles size={14} className="text-amber-500" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Learn Faster with Mentor AI</p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
