import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Mic, Send, X, Bot, Search, Loader2, Volume2, VolumeX, Sparkles } from 'lucide-react';
import Markdown from 'markdown-to-jsx';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isSearch?: boolean;
}

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Audio refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Initialize AI client
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let responseText = '';
      
      if (useSearch) {
        // Use Gemini 3 Flash Preview with Google Search
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: input,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });
        responseText = response.text || "I couldn't find anything on that.";
      } else {
        // Use Gemini 2.5 Flash Lite for fast responses
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-lite-preview-02-05", // Using specific preview model or alias if available
          contents: input,
        });
        responseText = response.text || "I'm not sure how to respond to that.";
      }

      const modelMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: responseText,
        isSearch: useSearch
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: "Sorry, I encountered an error. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoiceMode = async () => {
    if (isVoiceActive) {
      // Stop voice mode
      stopVoiceSession();
    } else {
      // Start voice mode
      await startVoiceSession();
    }
  };

  const startVoiceSession = async () => {
    try {
      setIsVoiceActive(true);
      
      // Initialize Audio Context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      // Get microphone stream
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: {
        channelCount: 1,
        sampleRate: 16000,
      } });

      // Connect to Live API
      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        callbacks: {
          onopen: () => {
            console.log("Live API Connected");
            // Start processing audio
            const source = audioContextRef.current!.createMediaStreamSource(mediaStreamRef.current!);
            processorRef.current = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            processorRef.current.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // Convert float32 to int16 PCM
              const pcmData = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
              }
              
              // Convert to base64
              const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: {
                    mimeType: "audio/pcm;rate=16000",
                    data: base64Audio
                  }
                });
              });
            };

            source.connect(processorRef.current);
            processorRef.current.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle audio output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
               playAudioChunk(base64Audio);
            }
            
            // Handle text output (transcription) if available/needed
            // For now, we focus on audio-in/audio-out
          },
          onclose: () => {
            console.log("Live API Disconnected");
            stopVoiceSession();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            stopVoiceSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: { parts: [{ text: "You are a helpful shopping assistant for MoonShop. Keep responses concise and friendly." }] },
        },
      });
      
      sessionRef.current = sessionPromise;

    } catch (error) {
      console.error("Failed to start voice session:", error);
      stopVoiceSession();
    }
  };

  const stopVoiceSession = () => {
    setIsVoiceActive(false);
    
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (sessionRef.current) {
      sessionRef.current.then((session: any) => session.close());
      sessionRef.current = null;
    }
  };

  const playAudioChunk = async (base64Audio: string) => {
    try {
      // Decode base64 to array buffer
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Create audio context for playback if not exists (or reuse existing)
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }); // Gemini output is usually 24kHz
      
      // Create buffer (assuming 1 channel, 24kHz)
      // Note: Raw PCM decoding in browser is tricky without headers. 
      // Gemini sends raw PCM. We need to put it into an AudioBuffer.
      // The output format is typically PCM 16-bit 24kHz mono.
      
      const float32Data = new Float32Array(bytes.length / 2);
      const dataView = new DataView(bytes.buffer);
      
      for (let i = 0; i < bytes.length / 2; i++) {
        const int16 = dataView.getInt16(i * 2, true); // Little endian
        float32Data[i] = int16 / 0x7FFF;
      }
      
      const audioBuffer = ctx.createBuffer(1, float32Data.length, 24000);
      audioBuffer.getChannelData(0).set(float32Data);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();
      
    } catch (e) {
      console.error("Error playing audio chunk:", e);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
      >
        <Sparkles size={24} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot size={20} className="text-indigo-400" />
                <h3 className="font-bold">MoonShop AI</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Mode Toggle */}
            <div className="p-2 bg-slate-50 border-b border-slate-100 flex gap-2">
              <button 
                onClick={() => setUseSearch(false)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors ${!useSearch ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <Bot size={14} /> Fast Chat
              </button>
              <button 
                onClick={() => setUseSearch(true)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors ${useSearch ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <Search size={14} /> Web Search
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <Bot size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm font-medium">How can I help you today?</p>
                  <p className="text-xs mt-2">Try asking about products, trends, or order status.</p>
                </div>
              )}
              
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none shadow-sm'
                  }`}>
                    {msg.isSearch && msg.role === 'model' && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 mb-1 uppercase tracking-wider">
                        <Search size={10} /> Sources Included
                      </div>
                    )}
                    <Markdown>{msg.text}</Markdown>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm">
                    <Loader2 size={16} className="animate-spin text-indigo-600" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Voice Mode Overlay */}
            <AnimatePresence>
              {isVoiceActive && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-white"
                >
                  <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center mb-8 animate-pulse shadow-[0_0_40px_rgba(79,70,229,0.5)]">
                    <Mic size={40} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Listening...</h3>
                  <p className="text-slate-400 text-sm mb-12">Speak naturally to MoonShop AI</p>
                  <button 
                    onClick={stopVoiceSession}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full font-bold text-sm transition-colors flex items-center gap-2"
                  >
                    <X size={16} /> End Voice Session
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleVoiceMode}
                  className={`p-3 rounded-xl transition-colors ${isVoiceActive ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  {isVoiceActive ? <VolumeX size={20} /> : <Mic size={20} />}
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={useSearch ? "Ask anything..." : "Chat with AI..."}
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    disabled={isLoading || isVoiceActive}
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading || isVoiceActive}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
