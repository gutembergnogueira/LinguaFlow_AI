import React from 'react';
import { Message } from '../types/message';
import { Bot, User, Volume2, Info, CheckCircle, Sparkles } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isSpeaking: boolean;
  onSpeak: (text: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isSpeaking, onSpeak }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 shadow-sm
          ${isUser ? 'bg-indigo-600 text-white' : 'bg-emerald-500 text-white'}`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        <div className="flex flex-col gap-2">
          {/* Main Bubble */}
          <div className={`relative px-5 py-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed
            ${isUser 
              ? 'bg-indigo-600 text-white rounded-tr-sm' 
              : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
            }`}>
            {message.content}
            
            {/* Play Button for AI messages */}
            {!isUser && (
              <button 
                onClick={() => onSpeak(message.content)}
                className="absolute -right-10 top-2 p-2 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-gray-100 transition-colors"
                title="Listen"
              >
                <Volume2 size={18} className={isSpeaking ? 'animate-pulse text-indigo-600' : ''} />
              </button>
            )}
          </div>

          {/* Feedback Section (AI Only) */}
          {!isUser && message.metadata && (message.metadata.correction || message.metadata.naturalVersion) && (
             <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 text-sm space-y-3 shadow-sm animate-fade-in mt-1">
                {message.metadata.correction && (
                  <div className="flex gap-2 items-start">
                    <Info className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-orange-800 block text-xs uppercase tracking-wide mb-1">Correction</span>
                      <p className="text-gray-700">{message.metadata.correction}</p>
                      {message.metadata.explanation && (
                        <p className="text-gray-500 text-xs mt-1 italic">{message.metadata.explanation}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {message.metadata.naturalVersion && (
                  <div className="flex gap-2 items-start pt-2 border-t border-orange-100">
                    <Sparkles className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                       <span className="font-semibold text-emerald-800 block text-xs uppercase tracking-wide mb-1">Native Speaker Way</span>
                       <p className="text-gray-700">{message.metadata.naturalVersion}</p>
                    </div>
                  </div>
                )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};