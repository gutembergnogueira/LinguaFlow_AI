import { useState, useCallback, useEffect } from 'react';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speak = useCallback((text: string, lang: 'en-US' | 'pt-BR' = 'en-US') => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop any current speech

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find best voice for the requested language
    const preferredVoice = voices.find(v => 
      v.lang === lang || v.lang.startsWith(lang.split('-')[0])
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.lang = lang;
    utterance.rate = 1.0; 
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [voices]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return { speak, isSpeaking, stopSpeaking };
};