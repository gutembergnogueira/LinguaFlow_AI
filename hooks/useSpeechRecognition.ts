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
  // Ref to store the committed final text to avoid dependency on the buggy event.results history on Android
  const finalTranscriptRef = useRef('');

  // Configuration for silence detection (in milliseconds)
  const SILENCE_TIMEOUT = 2500; 

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      setBrowserSupportsSpeechRecognition(true);
      
      // Initialize only once to prevent multiple instances
      if (!recognitionRef.current) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
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
        // Reset everything
        setTranscript('');
        finalTranscriptRef.current = '';
        
        // Re-assign handlers to ensure they use the fresh state context if needed
        const recognition = recognitionRef.current;
        
        recognition.onresult = (event: any) => {
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          let interimTranscript = '';

          // CRITICAL FIX FOR MOBILE/ANDROID:
          // Instead of iterating from 0 to length (which includes the whole buggy history on Android),
          // we respect `event.resultIndex`. This points to the start of the *new* information.
          // We append finalized parts to our own Ref, ignoring the browser's accumulated history array.
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            const transcriptText = result[0].transcript;
            
            if (result.isFinal) {
              finalTranscriptRef.current += transcriptText + ' ';
            } else {
              interimTranscript += transcriptText;
            }
          }

          // Combine our safe stored final text with the current interim text
          const currentFullTranscript = (finalTranscriptRef.current + interimTranscript).trim();
          setTranscript(currentFullTranscript);

          // Silence detection
          silenceTimerRef.current = setTimeout(() => {
            if (currentFullTranscript.length > 0) {
                stopListening();
            }
          }, SILENCE_TIMEOUT);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          if (event.error !== 'no-speech') {
            setIsListening(false);
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        };

        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
      }
    }
  }, [isListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition
  };
};