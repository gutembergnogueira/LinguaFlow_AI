import React from 'react';
import { Message } from '../types/message';
import { Bot, User, Volume2, Info, Sparkles, Globe, Loader2 } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isSpeaking: boolean;
  onSpeak: (text: string, lang?: 'en-US' | 'pt-BR') => void;
  onExplain?: (id: string, text: string) => Promise<string | null>;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isSpeaking, 
  onSpeak,
  onExplain 
}) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[95%] md:max-w-[80%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 shadow-sm
          ${isUser ? 'bg-indigo-600 text-white' : 'bg-emerald-500 text-white'}`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        <div className="flex flex-col gap-2 min-w-0 flex-1">
          {/* Main Bubble */}
          <div className={`relative px-5 py-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed group
            ${isUser 
              ? 'bg-indigo-600 text-white rounded-tr-sm' 
              : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
            }`}>
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
            
            {/* Action Buttons for AI messages (Inline/Bottom) */}
            {!isUser && (
              <div className="flex flex-wrap items-center justify-end gap-2 mt-2 pt-2 border-t border-gray-100">
                
                {/* Traduzir Button */}
                {onExplain && !message.metadata?.explanationPt && (
                  <button 
                    onClick={() => onExplain(message.id, message.content)}
                    disabled={message.isExplaining}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-gray-500 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                  >
                    {message.isExplaining ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Globe size={14} />
                    )}
                    <span>Traduzir</span>
                  </button>
                )}

                {/* Ouvir Inglês Button */}
                <button 
                  onClick={() => onSpeak(message.content, 'en-US')}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <Volume2 size={14} className={isSpeaking ? 'animate-pulse text-indigo-600' : ''} />
                  <span>Ouvir</span>
                </button>
              </div>
            )}
          </div>

          {/* Grammar & Style Correction (User Errors) */}
          {!isUser && message.metadata && (message.metadata.correction || message.metadata.naturalVersion) && (
             <div className="bg-orange-50/80 rounded-xl p-4 border border-orange-100 text-sm space-y-3 shadow-sm animate-in fade-in slide-in-from-top-2 mt-1">
                {message.metadata.correction && (
                  <div className="flex gap-2 items-start">
                    <Info className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-orange-800 block text-xs uppercase tracking-wide mb-1">Correction</span>
                      <p className="text-gray-800 font-medium break-words">{message.metadata.correction}</p>
                      {message.metadata.explanation && (
                        <p className="text-gray-600 text-xs mt-1 leading-relaxed bg-white/50 p-2 rounded-md break-words">
                          {message.metadata.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {message.metadata.naturalVersion && (
                  <div className={`flex gap-2 items-start ${message.metadata.correction ? 'pt-3 border-t border-orange-200/50' : ''}`}>
                    <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                       <span className="font-bold text-emerald-800 block text-xs uppercase tracking-wide mb-1">Better Alternative</span>
                       <p className="text-gray-800 italic break-words">"{message.metadata.naturalVersion}"</p>
                    </div>
                  </div>
                )}
             </div>
          )}

          {/* Portuguese Translation Box (On Demand) */}
          {!isUser && message.metadata?.explanationPt && (
             <div className="bg-teal-50 rounded-xl p-4 border border-teal-100 text-sm flex gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 mt-1">
                <Globe className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-teal-800 block text-xs uppercase tracking-wide mb-1">Tradução</span>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                    {message.metadata.explanationPt}
                  </p>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};