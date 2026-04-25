import { useLocation } from "react-router";

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const location = useLocation();
  const getTitle = () => {
    switch (location.pathname) {
      case "/": return "Dashboard";
      case "/decisions": return "AI Decisions";
      case "/simulator": return "System Simulator";
      case "/chat": return "Biz Assistant";
      case "/chat/history": return "Recent Chats";
      case "/upload": return "Data Ingestion";
      default: return "BizIQ";
    }
  };

  return (
    <header className="flex items-center justify-between px-6 h-16 w-full bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="md:hidden p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="font-title-lg text-primary-container font-semibold tracking-tight">
          {getTitle()}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center overflow-hidden cursor-pointer">
          <svg viewBox="0 0 400 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <rect x="40" y="40" width="320" height="320" rx="40" ry="40" fill="#1B2D4F"/>
            <rect x="88" y="68" width="108" height="108" rx="18" ry="18" fill="white"/>
            <path d="M 212 68 Q 312 68 312 168 L 262 168 Q 262 118 212 118 Z" fill="white"/>
            <circle cx="222" cy="178" r="14" fill="white"/>
            <path d="M 88 192 L 88 292 Q 88 292 188 292 L 188 242 Q 138 242 138 192 Z" fill="white"/>
            <circle cx="178" cy="182" r="14" fill="white"/>
            <rect x="204" y="192" width="108" height="108" rx="18" ry="18" fill="white"/>
          </svg>
        </div>
      </div>
    </header>
  );
}
