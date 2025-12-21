
import React, { useState } from 'react';
import { X, Volume2, CheckCircle, AlertCircle, ArrowRight, RotateCcw, Award, Loader2 } from 'lucide-react';
import { Quiz, QuizQuestion } from '../types';
import { playTextToSpeech } from '../geminiService';

interface QuizModalProps {
  quiz: Quiz;
  onClose: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ quiz, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentQuestion = quiz.questions[currentIdx];

  const handleSelect = (idx: number) => {
    if (showFeedback) return;
    setSelectedOption(idx);
  };

  const handleNext = () => {
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    if (isCorrect) setScore(prev => prev + 1);
    
    setShowFeedback(true);
  };

  const handleAdvance = () => {
    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handleVoice = async (text: string) => {
    setIsSpeaking(true);
    await playTextToSpeech(text);
    setIsSpeaking(false);
  };

  if (isCompleted) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
          <div className="p-8 text-center space-y-6">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
              <Award size={48} className="text-indigo-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-800">Quiz Complete!</h2>
              <p className="text-slate-500">You scored {score} out of {quiz.questions.length}</p>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-3xl space-y-2">
              <p className="font-bold text-slate-700">
                {score === quiz.questions.length ? "Perfect score! You're a master!" : score >= quiz.questions.length / 2 ? "Great job! Keep learning!" : "Keep practicing, you'll get there!"}
              </p>
              <button 
                onClick={() => handleVoice(`You finished the quiz with a score of ${score} out of ${quiz.questions.length}. ${score === quiz.questions.length ? "Excellent work!" : "Great effort!"}`)}
                className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline"
                disabled={isSpeaking}
              >
                {isSpeaking ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
                Listen to Summary
              </button>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95"
            >
              Back to Mentor
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <CheckCircle size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 truncate max-w-[200px] sm:max-w-xs">{quiz.title}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Question {currentIdx + 1} of {quiz.questions.length}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Question */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-bold text-slate-800 leading-tight">{currentQuestion.question}</h3>
              <button 
                onClick={() => handleVoice(currentQuestion.question)}
                className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 hover:bg-indigo-100 transition-colors"
                disabled={isSpeaking}
              >
                {isSpeaking ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={18} />}
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQuestion.correctAnswer;
              
              let style = "border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/30";
              if (showFeedback) {
                if (isCorrect) style = "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm shadow-emerald-100";
                else if (isSelected) style = "border-rose-500 bg-rose-50 text-rose-900";
              } else if (isSelected) {
                style = "border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-4 ${style}`}
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="font-medium text-sm sm:text-base">{option}</span>
                  {showFeedback && isCorrect && <CheckCircle size={18} className="ml-auto text-emerald-500 shrink-0" />}
                  {showFeedback && isSelected && !isCorrect && <AlertCircle size={18} className="ml-auto text-rose-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className="bg-slate-50 p-6 rounded-[2rem] animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-xl shrink-0 ${selectedOption === currentQuestion.correctAnswer ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                   {selectedOption === currentQuestion.correctAnswer ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-800">
                    {selectedOption === currentQuestion.correctAnswer ? "Spot on!" : "Not quite!"}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">{currentQuestion.explanation}</p>
                  <button 
                    onClick={() => handleVoice(currentQuestion.explanation)}
                    className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 uppercase tracking-widest hover:text-indigo-600"
                  >
                    <Volume2 size={12} />
                    Hear Explanation
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-white">
          {!showFeedback ? (
            <button
              onClick={handleNext}
              disabled={selectedOption === null}
              className="w-full py-4 bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Submit Answer</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleAdvance}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>{currentIdx < quiz.questions.length - 1 ? 'Next Question' : 'View Results'}</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
