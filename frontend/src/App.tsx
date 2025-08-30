import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BirthCertificateForm } from "./components/BirthCertificateForm";
import { ShieldCheck } from "lucide-react";

const App = () => {
  return (
    <>
      <Toaster />
      <Sonner />
      <div className="min-h-screen bg-gradient-to-b from-accent to-background">
        <header className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
          <div className="container mx-auto px-4 py-6 flex items-center justify-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Birth Certificate Service</h1>
              <p className="text-sm text-muted-foreground">Generate a professionally formatted certificate securely</p>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-10">
          <div className="mx-auto max-w-5xl">
            <BirthCertificateForm />
          </div>
        </main>
      </div>
    </>
  );
};

export default App;
