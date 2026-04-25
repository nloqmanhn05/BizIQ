import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";
import { clsx } from "clsx";

export function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex antialiased bg-background text-on-background">
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <div className={clsx(
        "flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300",
        isCollapsed ? "md:ml-20" : "md:ml-72"
      )}>
        <TopBar onMenuClick={() => {
          if (window.innerWidth < 768) {
            setIsMobileMenuOpen(true);
          } else {
            setIsCollapsed(!isCollapsed);
          }
        }} />
        <main className="flex-1 p-6 md:p-8 space-y-8 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
