import React, { useState, useRef, useEffect, useCallback } from "react";
import { clsx } from "clsx";
import { useParams, useNavigate } from "react-router";
import ReactMarkdown from "react-markdown";
import { useData, Message } from "../lib/DataContext";
import { useSession } from "../context/SessionContext";

const DEFAULT_MESSAGE: Message = {
  id: "init",
  role: "ai",
  text: "Hello! I am Biz Assistant. Ask me anything about your revenue, customers, or business operations."
};

export function Chat() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { chatSessions, saveSession } = useData();
  
  // Use refs to avoid dependency cycles
  const saveSessionRef = useRef(saveSession);
  saveSessionRef.current = saveSession;
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;

  // If no sessionId in URL, redirect to a new one
  useEffect(() => {
    if (!sessionId) {
      navigate(`/chat/${Date.now()}`, { replace: true });
    }
  }, [sessionId, navigate]);

  const [messages, setMessages] = useState<Message[]>([DEFAULT_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Sync messages when session ID changes
  useEffect(() => {
    if (!sessionId) return;
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setMessages(session.messages);
    } else {
      setMessages([DEFAULT_MESSAGE]);
    }
    setInput("");
    setStreamingText("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Auto-scroll to bottom on new content
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, streamingText]);

  // Save session helper
  const persistSession = useCallback((msgs: Message[]) => {
    const sid = sessionIdRef.current;
    if (!sid || msgs.length <= 1) return;
    
    const firstUserMsg = msgs.find(m => m.role === "user")?.text || "New Chat";
    const title = firstUserMsg.length > 40 ? firstUserMsg.substring(0, 37) + "..." : firstUserMsg;
    
    saveSessionRef.current({
      id: sid,
      title,
      lastMessage: msgs[msgs.length - 1].text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: msgs
    });
  }, []);

  if (!sessionId) {
    return null;
  }

  const { previewKPIs, simulationResult } = useSession();

  const buildLocalStorageContext = () => {
    try {
      const raw = localStorage.getItem("biziq_local_business_preset_v1");
      if (!raw) return "No local business dataset found.";
      const parsed = JSON.parse(raw) as {
        parsedData?: Record<string, unknown>;
        previewKPIs?: Record<string, unknown>;
        baselineSimulation?: Record<string, unknown>;
      };
      return JSON.stringify(
        {
          previewKPIs: parsed.previewKPIs ?? null,
          parsedData: parsed.parsedData ?? null,
          baselineSimulation: parsed.baselineSimulation ?? null,
        },
        null,
        2,
      );
    } catch {
      return "Local business dataset exists but failed to parse.";
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    const newMsg: Message = { id: Date.now().toString(), role: "user", text: userMessage };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    persistSession(updatedMessages);
    setIsLoading(true);
    setStreamingText("");

    try {
      let businessContext = "";
      if (previewKPIs) {
        businessContext = `
[BUSINESS THEORY CONTEXT]
- Health Status: ${previewKPIs.profitFirstStatus}
- Total Revenue: RM${previewKPIs.totalRevenueRM}
- Real Revenue: RM${previewKPIs.realRevenueRM}
- Gross Margin: ${previewKPIs.grossMarginPct}%
- Best Location: ${previewKPIs.bestLocation}
- Growth Rate: ${previewKPIs.yoyGrowthPct}%

[SIMULATOR REPORT]
${simulationResult?.report || "No simulation run yet."}

[DETERMINISTIC STRATEGIES]
- Focus on top performer: ${previewKPIs.bestLocation}
- Correct margins to industry 65% benchmark.
- Scale based on ${previewKPIs.yoyGrowthPct}% growth.

[LOCAL STORAGE DATASET JSON]
${buildLocalStorageContext()}
        `.trim();
      }

      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage,
          businessContext,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate AI response");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();

          if (payload === "[DONE]") continue;

          try {
            const parsed = JSON.parse(payload);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.content) {
              fullText += parsed.content;
              setStreamingText(fullText);
            }
          } catch (parseErr) {
            continue;
          }
        }
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: fullText || "No response received."
      };

      setMessages(prev => {
        const next = [...prev, aiMsg];
        persistSession(next);
        return next;
      });
      setStreamingText("");

    } catch (err) {
      if ((err as Error).name === "AbortError") return;

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: err instanceof Error ? err.message : "Error communicating with AI service."
      };
      
      setMessages(prev => {
        const next = [...prev, errorMsg];
        persistSession(next);
        return next;
      });
      setStreamingText("");
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] -m-6 md:-m-8 bg-[#F8FAFC] md:border-l border-outline-variant/30 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col items-center custom-scrollbar" ref={scrollRef}>
        <div className="w-full max-w-4xl flex flex-col gap-8">
          {messages.map(msg => (
            <div key={msg.id} className={clsx("flex flex-col gap-2 w-full", msg.role === "user" ? "items-end" : "items-start")}>
              {msg.role === "ai" && (
                <div className="flex items-center gap-2 ml-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-[#0096FF] text-white flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                  </div>
                  <span className="font-bold text-xs uppercase tracking-wider text-[#0096FF]">Biz Assistant</span>
                </div>
              )}
              <div className={clsx(
                "p-5 md:p-6 rounded-2xl text-body-lg max-w-[85%] shadow-sm transition-all duration-300",
                msg.role === "user"
                  ? "bg-[#0096FF] text-white rounded-tr-none"
                  : "bg-white text-slate-800 rounded-tl-none border border-slate-200"
              )}>
                <div className="prose prose-slate max-w-none prose-sm md:prose-base dark:prose-invert">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {isLoading && streamingText && (
            <div className="flex flex-col gap-2 w-full items-start">
              <div className="flex items-center gap-2 ml-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-[#0096FF] text-white flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                </div>
                <span className="font-bold text-xs uppercase tracking-wider text-[#0096FF]">Biz Assistant</span>
              </div>
              <div className="p-5 md:p-6 rounded-2xl rounded-tl-none text-body-lg max-w-[85%] bg-white text-slate-800 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="prose prose-slate max-w-none prose-sm md:prose-base">
                  <ReactMarkdown>{streamingText}</ReactMarkdown>
                  <span className="inline-block w-2 h-5 bg-[#0096FF]/40 ml-1 animate-pulse rounded-full align-middle"></span>
                </div>
              </div>
            </div>
          )}

          {isLoading && !streamingText && (
            <div className="flex flex-col items-start gap-2 w-full">
              <div className="flex items-center gap-2 ml-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-[#0096FF] text-white flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                </div>
                <span className="font-bold text-xs uppercase tracking-wider text-[#0096FF]">Biz Assistant</span>
              </div>
              <div className="bg-white p-5 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#0096FF] animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-[#0096FF] animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 rounded-full bg-[#0096FF] animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 md:p-8 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-50 rounded-3xl p-2 flex items-center gap-2 border border-slate-200 focus-within:border-[#0096FF] focus-within:ring-4 focus-within:ring-[#0096FF]/5 transition-all shadow-inner">
            <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-[#0096FF] transition-colors rounded-full hover:bg-white shrink-0">
              <span className="material-symbols-outlined">add_circle</span>
            </button>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 text-slate-700 font-medium placeholder:text-slate-400"
              placeholder="Ask anything about your business..."
              rows={1}
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 flex items-center justify-center bg-[#0096FF] text-white rounded-2xl hover:bg-[#0086E6] transition-all shrink-0 disabled:bg-slate-200 disabled:text-slate-400 shadow-md shadow-[#0096FF]/20"
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_upward</span>
            </button>
          </div>
          <div className="text-center mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Powered by BizAI Intelligence
          </div>
        </div>
      </div>
    </div>
  );
}
