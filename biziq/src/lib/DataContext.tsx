import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

export interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messages: Message[];
}

export interface DataContextType {
  data: any[];
  fileName: string | null;
  chatSessions: ChatSession[];
  setData: (data: any[], fileName: string) => void;
  clearData: () => void;
  saveSession: (session: ChatSession) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem("biziq_chat_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("biziq_chat_history", JSON.stringify(chatSessions));
  }, [chatSessions]);

  const setData = useCallback((newData: any[], newFileName: string) => {
    setDataState(newData);
    setFileName(newFileName);
  }, []);

  const clearData = useCallback(() => {
    setDataState([]);
    setFileName(null);
  }, []);

  const saveSession = useCallback((newSession: ChatSession) => {
    setChatSessions(prev => {
      const exists = prev.findIndex(s => s.id === newSession.id);
      if (exists >= 0) {
        // Only update if content actually changed to prevent unnecessary re-renders
        const existing = prev[exists];
        if (existing.messages.length === newSession.messages.length &&
            existing.lastMessage === newSession.lastMessage) {
          return prev; // No change, return same reference
        }
        const updated = [...prev];
        updated[exists] = newSession;
        return updated;
      }
      return [newSession, ...prev];
    });
  }, []);

  return (
    <DataContext.Provider value={{ data, fileName, chatSessions, setData, clearData, saveSession }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
