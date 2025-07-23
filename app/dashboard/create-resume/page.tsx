import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Clock, Sparkles, Target } from 'lucide-react';

export default function CreateResumePage() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Resume</h1>
          <p className="text-muted-foreground">
            Build a professional resume with AI assistance
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card className="border-2 border-dashed">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              <Clock className="h-5 w-5" />
              Coming Soon
            </CardTitle>
            <CardDescription className="text-lg">
              We&apos;re working hard to bring you an AI-powered resume builder
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Our resume builder will help you create professional, ATS-friendly resumes tailored to your target roles.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium">AI-Powered</h3>
                  <p className="text-sm text-muted-foreground">
                    Smart suggestions and content optimization
                  </p>
                </div>

                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-medium">ATS-Friendly</h3>
                  <p className="text-sm text-muted-foreground">
                    Optimized for applicant tracking systems
                  </p>
                </div>

                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Plus className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium">Customizable</h3>
                  <p className="text-sm text-muted-foreground">
                    Multiple templates and layouts
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Badge variant="secondary" className="text-sm">
                Expected Release: Q4 2025
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}