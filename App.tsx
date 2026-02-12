import React, { useState, useEffect } from 'react';
import { Chat } from './components/Chat';
import { ScenarioSelector } from './components/ScenarioSelector';
import { useAIConversation } from './hooks/useAIConversation';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useTextToSpeech } from './hooks/useTextToSpeech';
import { Scenario, SCENARIOS } from './constants';
import { Bot, MessageSquare, Volume2, Mic } from 'lucide-react';

export default function App() {
  const [currentScenario, setCurrentScenario] = useState<Scenario>(SCENARIOS[0]);
  
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    clearHistory 
  } = useAIConversation(currentScenario);
  
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    browserSupportsSpeechRecognition 
  } = useSpeechRecognition();
  
  const { speak, isSpeaking, stopSpeaking } = useTextToSpeech();

  // Handle scenario change
  const handleScenarioChange = (scenario: Scenario) => {
    setCurrentScenario(scenario);
    clearHistory();
    stopSpeaking();
  };

  // When transcript is finalized (listening stops), send message
  useEffect(() => {
    if (!isListening && transcript) {
      sendMessage(transcript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, transcript]);

  // Automatically speak the last AI message
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'model' && lastMessage.content) {
      speak(lastMessage.content);
    }
  }, [messages, speak]);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">LinguaFlow AI</h1>
            <p className="text-xs text-gray-500 font-medium">Virtual English Tutor</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <ScenarioSelector 
            scenarios={SCENARIOS} 
            currentScenario={currentScenario} 
            onSelect={handleScenarioChange} 
          />
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-hidden relative flex flex-col max-w-4xl mx-auto w-full">
        {!browserSupportsSpeechRecognition && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
            <p className="text-red-700 text-sm">
              Your browser does not support Speech Recognition. Please use Chrome or Edge.
            </p>
          </div>
        )}

        <Chat 
          messages={messages} 
          isLoading={isLoading} 
          isSpeaking={isSpeaking}
          onSpeakMessage={speak}
        />
        
        {/* Interaction Area */}
        <div className="p-6 bg-white/80 backdrop-blur-md border-t border-gray-200 shrink-0">
          <div className="flex flex-col items-center justify-center gap-4 max-w-md mx-auto w-full">
            
            <div className="w-full text-center">
               <p className="text-sm text-gray-400 mb-2 h-6 truncate transition-all duration-300">
                  {isListening ? (
                    <span className="text-indigo-600 font-medium animate-pulse">Listening: {transcript}</span>
                  ) : isLoading ? (
                    <span className="text-gray-400">AI is thinking...</span>
                  ) : (
                    "Tap microphone to speak"
                  )}
               </p>
            </div>

            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading || !browserSupportsSpeechRecognition}
              className={`
                relative group flex items-center justify-center w-20 h-20 rounded-full shadow-lg transition-all duration-300
                ${isListening 
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-200 ring-4 ring-red-100' 
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 ring-4 ring-indigo-50 hover:scale-105'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed grayscale' : ''}
              `}
            >
              {isListening ? (
                <div className="w-8 h-8 rounded bg-white animate-pulse" />
              ) : (
                <Mic className="w-10 h-10 text-white" />
              )}
              
              {/* Ripple Effect when listening */}
              {isListening && (
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
              )}
            </button>
            
            <p className="text-xs text-gray-400 mt-2">
              Current Mode: <span className="font-semibold text-gray-600">{currentScenario.label}</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}