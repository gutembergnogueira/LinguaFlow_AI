import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  browserSupportsSpeechRecognition: boolean;
}

// Augment window type for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [browserSupportsSpeechRecognition, setBrowserSupportsSpeechRecognition] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef(''); // Armazena o texto finalizado para evitar duplicação

  // Configuration for silence detection (in milliseconds)
  const SILENCE_TIMEOUT = 2000; 

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      setBrowserSupportsSpeechRecognition(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Keep listening even after pauses
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        // Clear any pending silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        setIsListening(false);
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    }
  }, [isListening]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        // Reset transcripts
        setTranscript('');
        finalTranscriptRef.current = '';
        
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
      }
    }
  }, [isListening]);

  useEffect(() => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;

    recognition.onresult = (event: any) => {
      // Clear existing timer as user is speaking
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      let interimTranscript = '';

      // Usamos resultIndex para iterar apenas sobre os NOVOS resultados ou atualizações
      // Isso evita processar todo o histórico desde o início, que causa o bug de duplicação
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        const transcriptText = result[0].transcript;
        
        if (result.isFinal) {
          // Se for final, adicionamos ao nosso ref de histórico
          finalTranscriptRef.current += transcriptText + ' ';
        } else {
          // Se for interim, guardamos para exibir, mas não salvamos no ref ainda
          interimTranscript += transcriptText;
        }
      }

      // O transcript final é a soma do que já foi confirmado + o que está sendo falado agora
      const currentFullTranscript = (finalTranscriptRef.current + interimTranscript).trim();
      setTranscript(currentFullTranscript);

      // Set a timer to stop listening if silence persists
      silenceTimerRef.current = setTimeout(() => {
        // Only stop if we actually have some text (prevent stopping on noise)
        if (currentFullTranscript.length > 0) {
            stopListening();
        }
      }, SILENCE_TIMEOUT);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      // Ignore 'no-speech' errors as they might happen during pauses
      if (event.error !== 'no-speech') {
        setIsListening(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [stopListening]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition
  };
};