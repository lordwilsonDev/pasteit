/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef, FormEvent } from 'react';
import type { Chat } from "@google/genai";
import { ai } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    role: 'user' | 'model';
    text: string;
}

const STARTER_PROMPTS = [
    "Brainstorm background ideas for a fantasy character.",
    "How can I make my prompt 'a city street' more interesting?",
    "Suggest a surreal background concept.",
    "Give me some creative ideas for a product photoshoot background.",
];

const ChatAssistant = ({ onClose }: { onClose: () => void }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [history, setHistory] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const newChat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: "You are 'Weaver', a creative AI assistant for artists using the AI Background Weaver tool. Your goal is to help them brainstorm ideas, refine their prompts, and think outside the box. Be encouraging, imaginative, and concise. Your responses should be formatted with markdown.",
            },
        });
        setChat(newChat);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isLoading]);

    const handleSendMessage = async (messageText: string) => {
        if (!chat || !messageText.trim()) return;

        setIsLoading(true);
        const userMessage: Message = { role: 'user', text: messageText };
        // Add user message and an empty model message placeholder
        setHistory(prev => [...prev, userMessage, { role: 'model', text: '' }]);
        setUserInput('');

        try {
            const result = await chat.sendMessageStream({ message: messageText });
            let accumulatedText = '';

            for await (const chunk of result) {
                accumulatedText += chunk.text;
                setHistory(prev => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1] = { role: 'model', text: accumulatedText };
                    return newHistory;
                });
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setHistory(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1] = { role: 'model', text: `Sorry, something went wrong: ${errorMessage}` };
                return newHistory;
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleSendMessage(userInput);
    };

    const handleStarterClick = (prompt: string) => {
        setUserInput(prompt);
        handleSendMessage(prompt);
    }
    
    const CopyButton = ({ text }: { text: string }) => {
        const [copied, setCopied] = useState(false);
        const handleCopy = () => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };

        return (
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1.5 bg-neutral-700 rounded-md text-neutral-300 hover:bg-neutral-600 transition-colors"
                aria-label="Copy prompt"
            >
                {copied ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                )}
            </button>
        );
    };


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-end md:items-center z-50"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 400, damping: 40 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-neutral-900 border-t-2 md:border-2 border-neutral-700 w-full max-w-2xl h-[85vh] md:h-[70vh] md:max-h-[700px] rounded-t-2xl md:rounded-lg flex flex-col overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-neutral-800">
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L10 12l-2.293 2.293a1 1 0 01-1.414 0L4 12m16 8l-2.293-2.293a1 1 0 00-1.414 0L14 16l2.293-2.293a1 1 0 000-1.414L14 10" />
                        </svg>
                        <h2 className="font-permanent-marker text-xl text-neutral-200">Creative Assistant</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {history.length === 0 && (
                        <div className="text-center flex flex-col items-center justify-center h-full">
                           <p className="text-neutral-400 mb-4">Need inspiration? Ask me anything!</p>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-md">
                                {STARTER_PROMPTS.map(prompt => (
                                    <button 
                                        key={prompt}
                                        onClick={() => handleStarterClick(prompt)}
                                        className="text-left p-3 bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700 rounded-md text-sm text-neutral-300 transition-colors"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                           </div>
                        </div>
                    )}
                    {history.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-prose p-3 rounded-lg relative ${msg.role === 'user' ? 'bg-yellow-500 text-black' : 'bg-neutral-800 text-neutral-200'}`}>
                                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                {msg.role === 'model' && msg.text && !isLoading && <CopyButton text={msg.text} />}
                            </div>
                        </div>
                    ))}
                    {isLoading && history[history.length -1]?.role === 'model' && (
                         <div className="flex justify-start">
                             <div className="max-w-prose p-3 rounded-lg bg-neutral-800 text-neutral-200">
                                 <div className="flex items-center gap-2">
                                     <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-75"></div>
                                     <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-150"></div>
                                     <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-300"></div>
                                 </div>
                             </div>
                         </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Form */}
                <div className="flex-shrink-0 p-4 border-t border-neutral-800 bg-neutral-900">
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            placeholder="Ask for creative ideas..."
                            className="w-full max-h-32 p-3 bg-neutral-800 border border-neutral-700 rounded-md text-neutral-200 placeholder:text-neutral-500 focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-all duration-200 resize-none"
                            aria-label="Chat input"
                            rows={1}
                        />
                         <button type="submit" disabled={isLoading || !userInput.trim()} className="p-3 bg-yellow-400 text-black rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-300 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ChatAssistant;
