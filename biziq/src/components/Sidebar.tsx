import React from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useData } from "../lib/DataContext";
import { clsx } from "clsx";

interface SidebarProps {
  isOpen?: boolean;
  isCollapsed?: boolean;
  onClose?: () => void;
  onToggleCollapse?: () => void;
}

export function Sidebar({ isOpen, isCollapsed, onClose, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { chatSessions } = useData();
  const [expandedMenus, setExpandedMenus] = React.useState<Record<string, boolean>>({ Chat: true });
  const createSessionId = () =>
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Date.now().toString();

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const links = [
    { to: "/", icon: "dashboard", label: "Dashboard" },
    { to: "/decisions", icon: "map", label: "Roadmap" },
    { to: "/simulator", icon: "science", label: "Simulator" },
    { to: "/chat", icon: "chat", label: "Chat" },
    { to: "/upload", icon: "upload_file", label: "Upload" }
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}
      <aside className={clsx(
        "fixed left-0 top-0 h-screen flex flex-col z-50 bg-surface-container-lowest border-r border-outline-variant transition-all duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        isCollapsed ? "w-72 md:w-20" : "w-72"
      )}>
        <div className={clsx("px-6 py-8 flex items-center h-[96px]", isCollapsed ? "justify-center px-0" : "justify-between")}>
          <span className={clsx("text-primary-container font-headline-lg font-extrabold tracking-tight flex items-center gap-2", isCollapsed ? "" : "text-2xl")}>
            <button 
              onClick={() => {
                if (window.innerWidth < 768) {
                  onClose?.();
                } else {
                  onToggleCollapse?.();
                }
              }} 
              className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full flex items-center justify-center shrink-0"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className={clsx("transition-opacity duration-300", isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>BizIQ</span>
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 gap-2 flex flex-col">
          {links.map((link) => {
            const isActive = location.pathname === link.to || (link.label === "Chat" && location.pathname.startsWith("/chat/history"));
            const isChat = link.label === "Chat";
            const isExpanded = expandedMenus[link.label];

            return (
              <div key={link.to} className="flex flex-col gap-1">
                <div className="flex items-center">
                  <Link
                    to={link.to}
                    onClick={onClose}
                    title={isCollapsed ? link.label : undefined}
                    className={clsx(
                      "flex-1 flex items-center rounded-xl transition-all font-medium text-sm overflow-hidden whitespace-nowrap",
                      isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3",
                      isActive 
                        ? "bg-primary-container/10 text-primary-container font-bold" 
                        : "text-on-surface-variant hover:bg-surface-container"
                    )}
                  >
                    <span 
                      className="material-symbols-outlined shrink-0"
                      style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {link.icon}
                    </span>
                    <span className={clsx("transition-opacity duration-300", isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>
                      {link.label}
                    </span>
                  </Link>
                  {isChat && !isCollapsed && (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        toggleMenu(link.label);
                      }}
                      className={clsx(
                        "p-2 rounded-full hover:bg-surface-container transition-colors ml-1 shrink-0",
                        isActive ? "text-primary-container" : "text-on-surface-variant"
                      )}
                    >
                      <span className="material-symbols-outlined transition-transform duration-200" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                        expand_more
                      </span>
                    </button>
                  )}
                </div>
                {isChat && !isCollapsed && isExpanded && (
                  <div className="pl-11 pr-2 flex flex-col gap-1 mt-1 mb-2 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                    <button
                      onClick={() => {
                        navigate(`/chat/${createSessionId()}`);
                        onClose?.();
                      }}
                      className="w-full flex items-center gap-2 py-2.5 px-3 mb-2 rounded-lg bg-[#0096FF] text-white font-bold text-xs hover:opacity-90 transition-opacity shadow-md"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      New Chat
                    </button>
                    <Link to="/chat/history" onClick={onClose} className={clsx("text-sm py-2 px-3 rounded-lg transition-colors font-medium border-b border-outline-variant/10 mb-1 pb-2", location.pathname === "/chat/history" ? "text-primary bg-primary/5 font-bold" : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface")}>
                      History
                    </Link>
                    {chatSessions.slice(0, 5).map(session => (
                      <Link 
                        key={session.id} 
                        to={`/chat/${session.id}`} 
                        onClick={onClose} 
                        className={clsx(
                          "text-xs py-2 px-3 rounded-lg transition-colors truncate font-medium", 
                          location.pathname === `/chat/${session.id}` ? "text-primary bg-primary/5 font-bold" : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                        )}
                        title={session.title}
                      >
                        {session.title}
                      </Link>
                    ))}
                  </div>
                )}
                {isChat && isCollapsed && (
                  <div className="flex flex-col items-center gap-2 mt-2">
                    <button
                      onClick={() => {
                        navigate(`/chat/${createSessionId()}`);
                        onClose?.();
                      }}
                      title="New Chat"
                      className="w-10 h-10 rounded-full bg-[#0096FF] text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-md"
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
