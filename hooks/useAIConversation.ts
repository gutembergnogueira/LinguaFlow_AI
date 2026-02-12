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

      // Construct history for context
      // We only send the last few messages to keep context relevant but concise, 
      // although Gemini handles large context windows well.
      // For simplicity in this demo, we'll just rely on the new message + system instruction.
      // To properly implement history, we would convert `messages` to Content objects.
      
      // Let's create a Chat session ideally, or just send history in contents.
      // Using `ai.models.generateContent` with a system prompt and the current input 
      // is robust for a "turn-based" app where we want JSON output enforcement each time.
      
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
    clearHistory
  };
};