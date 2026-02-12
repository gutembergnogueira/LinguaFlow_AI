import React, { useEffect, useRef } from 'react';
import { Message } from '../types/message';
import { MessageBubble } from './MessageBubble';

interface ChatProps {
  messages: Message[];
  isLoading: boolean;
  isSpeaking: boolean;
  onSpeakMessage: (text: string, lang?: 'en-US' | 'pt-BR') => void;
  onExplainMessage: (id: string, text: string) => Promise<string | null>;
}

export const Chat: React.FC<ChatProps> = ({ 
  messages, 
  isLoading, 
  isSpeaking, 
  onSpeakMessage,
  onExplainMessage
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, messages.length]); // Added messages.length to trigger on new messages

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 no-scrollbar bg-gray-50">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center opacity-40 select-none">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
             <span className="text-4xl">👋</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-400 mb-2">Ready to practice?</h2>
          <p className="text-gray-400 max-w-xs">
            Select a scenario and tap the microphone to start speaking.
          </p>
        </div>
      ) : (
        <>
          {messages.map((msg) => (
            <MessageBubble 
              key={msg.id} 
              message={msg} 
              isSpeaking={isSpeaking}
              onSpeak={onSpeakMessage}
              onExplain={onExplainMessage}
            />
          ))}
          
          {isLoading && (
            <div className="flex justify-start w-full mb-6">
               <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 flex items-center gap-2">
                 <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                 <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};