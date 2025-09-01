import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Activity, 
  FileText, 
  Users, 
  Clock, 
  Download, 
  Eye,
  RefreshCw,
  TrendingUp,
  LogOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SubmissionData {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  timeOfBirth?: string;
  placeOfBirth: string;
  fatherName: string;
  fatherAadhaarNumber: string;
  motherName: string;
  motherAadhaarNumber: string;
  issuingAuthority?: string;
  registrationNumber?: string;
}

interface PdfRecord {
  id: number;
  submissionId: number;
  fileName: string;
  submissionData: SubmissionData | null;
  createdAt: string;
}

interface DashboardStats {
  totalSubmissions: number;
  totalPdfs: number;
  todaySubmissions: number;
  todayPdfs: number;
}

export const Dashboard = () => {
  const [pdfs, setPdfs] = useState<PdfRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSubmissions: 0,
    totalPdfs: 0,
    todaySubmissions: 0,
    todayPdfs: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3001/pdfs');
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      setPdfs(data);
      
      // Calculate stats
      const today = new Date().toDateString();
      const todayPdfs = data.filter((pdf: PdfRecord) => 
        new Date(pdf.createdAt).toDateString() === today
      );
      
      setStats({
        totalSubmissions: data.length,
        totalPdfs: data.length,
        todaySubmissions: todayPdfs.length,
        todayPdfs: todayPdfs.length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up real-time updates every 5 seconds
    const interval = setInterval(fetchData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const viewPdf = (pdfId: number) => {
    window.open(`http://localhost:3001/pdf/${pdfId}`, '_blank');
  };

  const downloadPdf = (pdfId: number, fileName: string) => {
    const link = document.createElement('a');
    link.href = `http://localhost:3001/pdf/${pdfId}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("adminUser");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of birth certificate submissions and PDF generation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleLogout} variant="outline" className="text-red-600 hover:text-red-700">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              All time submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total PDFs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPdfs}</div>
            <p className="text-xs text-muted-foreground">
              Generated certificates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Submissions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todaySubmissions}</div>
            <p className="text-xs text-muted-foreground">
              New today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's PDFs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayPdfs}</div>
            <p className="text-xs text-muted-foreground">
              Generated today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Live Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Live Submissions
          </CardTitle>
          <CardDescription>
            Real-time updates of all birth certificate submissions and generated PDFs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pdfs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No submissions yet</p>
              <p className="text-sm">Submissions will appear here in real-time</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pdfs.map((pdf) => (
                <div key={pdf.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">#{pdf.submissionId}</Badge>
                        <Badge variant="outline">PDF #{pdf.id}</Badge>
                        <span className="text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {formatDate(pdf.createdAt)}
                        </span>
                      </div>

                      {/* Applicant Info */}
                      {pdf.submissionData && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">
                              Applicant Details
                            </h4>
                            <div className="space-y-1 text-sm">
                              <p>
                                <span className="font-medium">Name:</span>{" "}
                                {pdf.submissionData.firstName} {pdf.submissionData.middleName} {pdf.submissionData.lastName}
                              </p>
                              <p>
                                <span className="font-medium">DOB:</span> {pdf.submissionData.dateOfBirth}
                              </p>
                              <p>
                                <span className="font-medium">Gender:</span> {pdf.submissionData.gender}
                              </p>
                              <p>
                                <span className="font-medium">Place:</span> {pdf.submissionData.placeOfBirth}
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">
                              Parents
                            </h4>
                            <div className="space-y-1 text-sm">
                              <p>
                                <span className="font-medium">Father:</span> {pdf.submissionData.fatherName}
                              </p>
                              <p>
                                <span className="font-medium">Mother:</span> {pdf.submissionData.motherName}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* File Info */}
                      <div className="pt-2 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">{pdf.fileName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewPdf(pdf.id)}
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadPdf(pdf.id, pdf.fileName)}
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
