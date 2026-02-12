import React from 'react';
import { Mic, Square } from 'lucide-react';

interface VoiceButtonProps {
  isListening: boolean;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * Note: This component logic is currently inlined in App.tsx for specific layout requirements 
 * requested in the prompt ("Botão grande de microfone... Interaction Area").
 * This file is kept for future modularity.
 */
export const VoiceButton: React.FC<VoiceButtonProps> = ({ isListening, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 shadow-lg
        ${isListening 
          ? 'bg-red-500 hover:bg-red-600 ring-4 ring-red-200' 
          : 'bg-indigo-600 hover:bg-indigo-700 ring-4 ring-indigo-100'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
      `}
    >
      {isListening ? (
        <Square className="w-6 h-6 text-white fill-current" />
      ) : (
        <Mic className="w-8 h-8 text-white" />
      )}
    </button>
  );
};