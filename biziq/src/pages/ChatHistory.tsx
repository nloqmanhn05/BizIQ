import { clsx } from "clsx";
import { useData } from "../lib/DataContext";
import { useNavigate } from "react-router";

export function ChatHistory() {
  const { chatSessions } = useData();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-display-sm text-on-surface mb-2">Recent Chats</h2>
        <p className="text-on-surface-variant font-body-lg">Review your recent business inquiries and AI generated reports.</p>
      </div>

      <div className="bg-surface rounded-[28px] shadow-sm border border-outline-variant/20 overflow-hidden">
        {chatSessions.length > 0 ? (
          chatSessions.map((item) => (
            <div 
              key={item.id} 
              onClick={() => navigate(`/chat/${item.id}`)}
              className="flex items-center gap-4 p-5 hover:bg-surface-container-low transition-colors cursor-pointer border-b border-outline-variant/10 last:border-0"
            >
              <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined">chat</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-on-surface truncate">{item.title}</h3>
                <p className="text-on-surface-variant text-sm truncate">{item.lastMessage}</p>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1">
                <span className="text-on-surface-variant text-xs font-medium">{item.timestamp}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 text-on-surface-variant">
              <span className="material-symbols-outlined text-3xl">history</span>
            </div>
            <p className="text-on-surface-variant">No recent chats found. Start a conversation with the Biz Assistant!</p>
          </div>
        )}
      </div>
    </div>
  );
}
