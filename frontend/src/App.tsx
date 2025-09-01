import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ShieldCheck, BarChart3 } from "lucide-react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { HomePage } from "./pages/HomePage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

const Navigation = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    setIsAuthenticated(authStatus === "true");
  }, []);
  
  // Don't show navigation on login page or when not authenticated
  if (location.pathname === "/login" || isAuthenticated === false) {
    return null;
  }
  
  // Don't show navigation while checking authentication
  if (isAuthenticated === null) {
    return null;
  }
  
  return (
    <header className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Birth Certificate Service</h1>
              <p className="text-sm text-muted-foreground">Generate a professionally formatted certificate securely</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const App = () => {
  return (
    <>
      <Toaster />
      <Sonner />
      <Router>
        <div className="min-h-screen bg-gradient-to-b from-accent to-background">
          <Navigation />
          <main className="container mx-auto px-4 py-10">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </>
  );
};

export default App;
