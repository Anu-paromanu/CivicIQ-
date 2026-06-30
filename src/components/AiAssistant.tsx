import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { ChatMessage } from "../types";

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Hello! I am CivicIQ's grounded Municipal AI Assistant. Ask me about active city-wide pothole fixes, emergency water line leaks, contractor assignments, or how our 8-stage dispatch pipeline operates!",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "What is the status of the Broad St pothole?",
    "Show me critical water leaks in the city.",
    "Who is the contractor for Buene Vista Trail?",
    "Explain CivicIQ's 8-stage lifecycle.",
  ];

  // Auto scroll to latest message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      text: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      const data = await response.json();
      const botMessage: ChatMessage = {
        role: "model",
        text: data.response || "I had trouble accessing our central registry database. Running diagnostic repair, please retry.",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Communication timeout with the municipal AI grid. Please ensure your API secrets are registered.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#070A13] to-[#00C2FF] text-[#070A13] shadow-xl hover:shadow-[#00C2FF]/20 hover:scale-105 transition-all duration-300 relative group cursor-pointer"
          id="toggle-assistant-floating-button"
        >
          <MessageSquare className="h-6 w-6 text-white" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C2FF] opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#00C2FF] text-[8px] font-extrabold text-[#070A13] items-center justify-center">AI</span>
          </span>
          
          {/* Subtle tooltip on hover */}
          <span className="absolute right-16 scale-0 group-hover:scale-100 bg-[#0B0F19] border border-white/10 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-md transition-all duration-300">
            Ask CivicIQ AI
          </span>
        </button>
      )}

      {/* Main chat dialogue panel */}
      {isOpen && (
        <div 
          className="w-[360px] sm:w-[380px] h-[500px] rounded-[24px] border border-white/10 bg-[#0B0F19] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300"
          id="assistant-dialogue-panel"
        >
          
          {/* Top Header */}
          <div className="bg-[#070A13] p-4 text-white flex items-center justify-between border-b border-white/5 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00C2FF]/10 text-[#00C2FF]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-none">CivicIQ Assistant</h4>
                <span className="text-[9px] text-[#00C2FF] font-mono leading-none">Powered by Gemini AI</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Conversation Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#070A13]/30">
            {messages.map((m, midx) => {
              const isUser = m.role === "user";
              return (
                <div key={midx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    isUser 
                      ? "bg-gradient-to-r from-[#1D9BF0] to-[#00C2FF] text-[#070A13] font-bold rounded-br-none shadow-md" 
                      : "bg-[#0F1422] border border-white/5 text-slate-200 rounded-bl-none shadow-xl font-medium"
                  }`}>
                    {m.text}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#0F1422] border border-white/5 rounded-2xl rounded-bl-none p-3 shadow-xl flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                  <Loader2 className="h-3.5 w-3.5 text-[#00C2FF] animate-spin" />
                  <span>Consulting city archives...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Prompt Recommendations (Show only if conversation is starting/empty user messages) */}
          {messages.length === 1 && (
            <div className="p-3 bg-[#070A13] border-t border-white/5 space-y-1.5 shrink-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block px-1">Common Questions:</span>
              <div className="grid grid-cols-2 gap-1.5">
                {quickPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSendMessage(p)}
                    className="text-left text-[10px] font-bold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/5 p-1.5 rounded-lg truncate transition-all cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom input area */}
          <div className="p-3 border-t border-white/5 flex items-center gap-2 shrink-0 bg-[#0B0F19]">
            <input
              type="text"
              placeholder="Ask about repairs, budgets, timelines..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputText)}
              className="flex-1 rounded-xl border border-white/10 bg-[#070A13] px-3 py-2.5 text-xs text-white outline-none focus:border-[#00C2FF] focus:ring-1 focus:ring-[#00C2FF]/20 transition-all font-medium placeholder-slate-500"
            />
            <button
              onClick={() => handleSendMessage(inputText)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-[#00C2FF] hover:text-[#070A13] shadow-sm transition-colors cursor-pointer shrink-0"
              id="send-message-button"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
