import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BirthCertificateForm } from "./components/BirthCertificateForm";
import { PdfList } from "./components/PdfList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, FormInput } from "lucide-react";

const App = () => {
  const [activeTab, setActiveTab] = useState("form");

  return (
    <>
      <Toaster />
      <Sonner />
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Birth Certificate Microservice</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="form" className="flex items-center gap-2">
              <FormInput className="h-4 w-4" />
              Submit Application
            </TabsTrigger>
            <TabsTrigger value="pdfs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              View Certificates
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="form" className="mt-6">
            <BirthCertificateForm />
          </TabsContent>
          
          <TabsContent value="pdfs" className="mt-6">
            <PdfList />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default App;
