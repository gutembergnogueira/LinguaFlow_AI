import React from 'react';
import { Message } from '../types/message';
import { Bot, User, Volume2, Info, Sparkles, Globe, Loader2 } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isSpeaking: boolean;
  onSpeak: (text: string) => void;
  onExplain?: (id: string, text: string) => void;
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
      <div className={`flex max-w-[90%] md:max-w-[80%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 shadow-sm
          ${isUser ? 'bg-indigo-600 text-white' : 'bg-emerald-500 text-white'}`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        <div className="flex flex-col gap-2 w-full">
          {/* Main Bubble */}
          <div className={`relative px-5 py-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed group
            ${isUser 
              ? 'bg-indigo-600 text-white rounded-tr-sm' 
              : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
            }`}>
            {message.content}
            
            {/* Action Buttons for AI messages */}
            {!isUser && (
              <div className="absolute -right-20 top-1 flex flex-col gap-1">
                {/* Audio Button */}
                <button 
                  onClick={() => onSpeak(message.content)}
                  className="p-2 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-gray-100 transition-colors"
                  title="Listen"
                >
                  <Volume2 size={18} className={isSpeaking ? 'animate-pulse text-indigo-600' : ''} />
                </button>
                
                {/* Portuguese Explanation Button */}
                {onExplain && !message.metadata?.explanationPt && (
                  <button 
                    onClick={() => onExplain(message.id, message.content)}
                    disabled={message.isExplaining}
                    className="p-2 rounded-full text-gray-400 hover:text-teal-600 hover:bg-gray-100 transition-colors"
                    title="Explicar em Português"
                  >
                    {message.isExplaining ? (
                      <Loader2 size={18} className="animate-spin text-teal-600" />
                    ) : (
                      <Globe size={18} />
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Grammar & Style Correction (User Errors) */}
          {!isUser && message.metadata && (message.metadata.correction || message.metadata.naturalVersion) && (
             <div className="bg-orange-50/80 rounded-xl p-4 border border-orange-100 text-sm space-y-3 shadow-sm animate-in fade-in slide-in-from-top-2 mt-1">
                {message.metadata.correction && (
                  <div className="flex gap-2 items-start">
                    <Info className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <span className="font-bold text-orange-800 block text-xs uppercase tracking-wide mb-1">Correction</span>
                      <p className="text-gray-800 font-medium">{message.metadata.correction}</p>
                      {message.metadata.explanation && (
                        <p className="text-gray-600 text-xs mt-1 leading-relaxed bg-white/50 p-2 rounded-md">
                          {message.metadata.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {message.metadata.naturalVersion && (
                  <div className={`flex gap-2 items-start ${message.metadata.correction ? 'pt-3 border-t border-orange-200/50' : ''}`}>
                    <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                       <span className="font-bold text-emerald-800 block text-xs uppercase tracking-wide mb-1">Better Alternative</span>
                       <p className="text-gray-800 italic">"{message.metadata.naturalVersion}"</p>
                    </div>
                  </div>
                )}
             </div>
          )}

          {/* Portuguese Explanation Box (On Demand) */}
          {!isUser && message.metadata?.explanationPt && (
             <div className="bg-teal-50 rounded-xl p-4 border border-teal-100 text-sm flex gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 mt-1">
                <Globe className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-teal-800 block text-xs uppercase tracking-wide mb-1">Explicação em Português</span>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
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