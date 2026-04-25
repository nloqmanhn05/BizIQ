import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router";
import { MainLayout } from "./layouts/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { Decisions } from "./pages/Decisions";
import { Simulator } from "./pages/Simulator";
import { Chat } from "./pages/Chat";
import { ChatHistory } from "./pages/ChatHistory";
import { Upload } from "./pages/Upload";
import { DataProvider } from "./lib/DataContext";

function AppRoutes() {
  const location = useLocation();
  
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="decisions" element={<Decisions />} />
        <Route path="simulator" element={<Simulator />} />
        <Route path="upload" element={<Upload />} />
        {/* chat/history MUST come before chat/:sessionId so "history" isn't treated as a sessionId */}
        <Route path="chat/history" element={<ChatHistory />} />
        <Route path="chat/:sessionId" element={<Chat key={location.key} />} />
        {/* Redirect bare /chat to a new session */}
        <Route path="chat" element={<Navigate to={`/chat/${Date.now()}`} replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </DataProvider>
  );
}
