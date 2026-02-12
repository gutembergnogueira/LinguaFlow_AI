import { useState, useCallback } from 'react';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { Message, AIResponseSchema } from '../types/message';
import { Scenario, SYSTEM_INSTRUCTION_BASE } from '../constants';

export const useAIConversation = (scenario: Scenario) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const clearHistory = useCallback(() => {
    setMessages([]);
  }, []);

  const explainInPortuguese = useCallback(async (messageId: string, textToExplain: string) => {
    // Set loading state for the specific message
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isExplaining: true } : msg
    ));

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `
        Translate the following English text to Portuguese.
        
        Text to translate: "${textToExplain}"
        
        Output format: Return ONLY the Portuguese translation. Do not add any explanation, notes, or preamble.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const translation = response.text;

      // Update message with the translation
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { 
          ...msg, 
          isExplaining: false, 
          metadata: { ...msg.metadata, explanationPt: translation } 
        } : msg
      ));
      
      return translation; // Return for immediate use (e.g. by TTS)

    } catch (error) {
      console.error("Translation Error:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isExplaining: false } : msg
      ));
      return null;
    }
  }, []);

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim()) return;

    // Add user message to UI immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
          reply: { type: Type.STRING, description: "The conversational reply." },
          correction: { type: Type.STRING, description: "Grammar correction of user input.", nullable: true },
          explanation: { type: Type.STRING, description: "Explanation of the correction.", nullable: true },
          natural_version: { type: Type.STRING, description: "More natural phrasing.", nullable: true },
        },
        required: ["reply"]
      };
      
      const prompt = `
        Current Scenario: ${scenario.label}
        Role Description: ${scenario.systemPrompt}
        
        User Input: "${userText}"
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          role: 'user',
          parts: [{ text: prompt }]
        },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_BASE,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        }
      });

      const responseText = response.text;
      if (!responseText) throw new Error("No response from AI");

      const parsedResponse: AIResponseSchema = JSON.parse(responseText);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: parsedResponse.reply,
        timestamp: Date.now(),
        metadata: {
          correction: parsedResponse.correction,
          explanation: parsedResponse.explanation,
          naturalVersion: parsedResponse.natural_version
        }
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [scenario]);

  return {
    messages,
    sendMessage,
    isLoading,
    clearHistory,
    explainInPortuguese
  };
};