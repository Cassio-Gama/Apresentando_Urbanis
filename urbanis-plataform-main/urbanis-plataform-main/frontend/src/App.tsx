import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { Compare } from "@/pages/Compare";
import { Login } from "@/pages/Login";
import { useUrbanStore } from "@/store/useUrbanStore";

function App() {
  const { session, offlineMode, authLoading } = useUrbanStore();

  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0b0d] font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
            Iniciando Motor Seguro...
          </span>
        </div>
      </div>
    );
  }

  if (!session && !offlineMode) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
