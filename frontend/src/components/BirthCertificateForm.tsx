import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BirthCertificateForm as BirthCertificateFormType } from "@/types/birth-certificate";
import { AadhaarConsentDialog } from "./AadhaarConsentDialog";

export const BirthCertificateForm = () => {
  const [step, setStep] = useState<'form' | 'submitted' | 'preview'>('form');
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [certificateId, setCertificateId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<BirthCertificateFormType>({
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: "",
      gender: 'male',
      timeOfBirth: "",
      placeOfBirth: "",
      fatherName: "",
      fatherAadhaarNumber: "",
      motherName: "",
      motherAadhaarNumber: "",
      issuingAuthority: "",
      registrationNumber: "",
      aadhaarConsentGiven: false,
    },
  });

  const onSubmit = async (data: BirthCertificateFormType) => {
    if (!data.aadhaarConsentGiven) {
      setShowConsentDialog(true);
      return;
    }
    await handleFormSubmission(data);
  };

  const handleConsentGiven = async () => {
    setShowConsentDialog(false);
    form.setValue('aadhaarConsentGiven', true);
    const data = form.getValues();
    await handleFormSubmission(data);
  };

  const handleFormSubmission = async (data: BirthCertificateFormType) => {
    setIsSubmitting(true);
    try {
      // Build multipart form data for backend
      const formData = new FormData();
      const payload = {
        firstName: data.firstName,
        middleName: data.middleName || undefined,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        timeOfBirth: data.timeOfBirth || undefined,
        placeOfBirth: data.placeOfBirth,
        fatherName: data.fatherName,
        fatherAadhaarNumber: data.fatherAadhaarNumber,
        motherName: data.motherName,
        motherAadhaarNumber: data.motherAadhaarNumber,
        issuingAuthority: data.issuingAuthority || undefined,
        registrationNumber: data.registrationNumber || undefined,
        aadhaarConsentGiven: data.aadhaarConsentGiven,
      };
      formData.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      if (data.fatherAadhaarFile) formData.append("fatherAadhaarFile", data.fatherAadhaarFile);
      if (data.motherAadhaarFile) formData.append("motherAadhaarFile", data.motherAadhaarFile);

      const res = await fetch("http://localhost:8080/api/v1/birth-certificates", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to submit application");
      const certificate = await res.json();

      setCertificateId(certificate.id);
      setStep('submitted');
      toast({
        title: "Success",
        description: "Birth certificate application submitted successfully!",
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to submit birth certificate application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShowPreview = () => {
    setStep('preview');
  };

  const handleDownloadCertificate = () => {
    if (!certificateId) return;
    window.open(`http://localhost:8080/api/v1/birth-certificates/${certificateId}/certificate`, '_blank');
  };

  if (step === 'preview') {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Birth Certificate Preview</CardTitle>
          <CardDescription>Review your birth certificate details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border rounded-lg p-6 bg-muted/50">
            <h3 className="text-lg font-semibold mb-4 text-center">BIRTH CERTIFICATE</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Name:</strong> {form.getValues('firstName')} {form.getValues('middleName')} {form.getValues('lastName')}</div>
              <div><strong>Date of Birth:</strong> {form.getValues('dateOfBirth')}</div>
              <div><strong>Gender:</strong> {form.getValues('gender')}</div>
              <div><strong>Time of Birth:</strong> {form.getValues('timeOfBirth') || 'Not specified'}</div>
              <div><strong>Place of Birth:</strong> {form.getValues('placeOfBirth')}</div>
              <div><strong>Father's Name:</strong> {form.getValues('fatherName')}</div>
              <div><strong>Mother's Name:</strong> {form.getValues('motherName')}</div>
              <div><strong>Registration Number:</strong> {form.getValues('registrationNumber') || 'To be assigned'}</div>
            </div>
          </div>
          <Button onClick={handleDownloadCertificate} className="w-full" size="lg">
            Download Certificate
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'submitted') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Application Submitted</CardTitle>
          <CardDescription>Your birth certificate application has been submitted successfully</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p>Application ID: {certificateId}</p>
            <Button onClick={handleShowPreview} size="lg">
              Show Preview
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formValues = form.watch();
  const isFormComplete = formValues.firstName && formValues.lastName && formValues.dateOfBirth && 
                        formValues.placeOfBirth && formValues.fatherName && formValues.fatherAadhaarNumber && 
                        formValues.motherName && formValues.motherAadhaarNumber;

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Birth Certificate Application</CardTitle>
          <CardDescription>Fill in the required information to generate a birth certificate</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="middleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="timeOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time of Birth</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="placeOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Place of Birth *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Father's Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Father's Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fatherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father's Name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fatherAadhaarNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father's AADHAAR Number *</FormLabel>
                        <FormControl>
                          <Input {...field} maxLength={12} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="fatherAadhaarFile"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Father's AADHAAR Document (Image/PDF)</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => onChange(e.target.files?.[0])}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Mother's Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Mother's Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="motherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mother's Name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="motherAadhaarNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mother's AADHAAR Number *</FormLabel>
                        <FormControl>
                          <Input {...field} maxLength={12} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="motherAadhaarFile"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Mother's AADHAAR Document (Image/PDF)</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => onChange(e.target.files?.[0])}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Official Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Official Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="issuingAuthority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issuing Authority</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="registrationNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {isFormComplete && (
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      <AadhaarConsentDialog
        open={showConsentDialog}
        onConsentGiven={handleConsentGiven}
        onCancel={() => setShowConsentDialog(false)}
      />
    </>
  );
};