'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Plus,
  FileText,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Eye,
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Application {
  id: string;
  applicationNumber: string;
  status: string;
  currentStep: number;
  totalSteps: number;
  isEligible: boolean;
  eligibilityReason?: string;
  applicationFee: number;
  paymentStatus: string;
  submittedAt?: string;
  course: {
    name: string;
    code: string;
    department: string;
  };
  admissionPeriod: {
    name: string;
    academicYear: string;
  };
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  WAITLISTED: 'bg-purple-100 text-purple-700',
};

const paymentStatusColors = {
  PENDING: 'bg-orange-100 text-orange-700',
  SUCCESS: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
};

export default function ApplicationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    fetchApplications();
  }, [user, router]);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      } else {
        toast.error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Fetch applications error:', error);
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />;
      case 'UNDER_REVIEW':
        return <Clock className="w-4 h-4" />;
      case 'REJECTED':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/student/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">My Applications</h1>
                <p className="text-sm text-gray-500">Track your admission applications</p>
              </div>
            </div>
            <Link href="/student/courses">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Application
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                <p className="text-gray-600 mb-6">
                  You haven't submitted any applications. Start by browsing available courses.
                </p>
                <Link href="/student/courses">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Browse Courses
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList>
                <TabsTrigger value="all">All Applications</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="submitted">Submitted</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6">
                {applications.map((application) => (
                  <ApplicationCard key={application.id} application={application} />
                ))}
              </TabsContent>

              <TabsContent value="draft" className="space-y-6">
                {applications
                  .filter(app => app.status === 'DRAFT')
                  .map((application) => (
                    <ApplicationCard key={application.id} application={application} />
                  ))}
              </TabsContent>

              <TabsContent value="submitted" className="space-y-6">
                {applications
                  .filter(app => ['SUBMITTED', 'UNDER_REVIEW'].includes(app.status))
                  .map((application) => (
                    <ApplicationCard key={application.id} application={application} />
                  ))}
              </TabsContent>

              <TabsContent value="approved" className="space-y-6">
                {applications
                  .filter(app => app.status === 'APPROVED')
                  .map((application) => (
                    <ApplicationCard key={application.id} application={application} />
                  ))}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}

function ApplicationCard({ application }: { application: Application }) {
  const progress = (application.currentStep / application.totalSteps) * 100;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(application.status)}
              <span>{application.course.name}</span>
            </CardTitle>
            <CardDescription>
              Application #{application.applicationNumber} • {application.course.department}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={statusColors[application.status as keyof typeof statusColors]}>
              {application.status.replace('_', ' ')}
            </Badge>
            <Badge className={paymentStatusColors[application.paymentStatus as keyof typeof paymentStatusColors]}>
              Payment: {application.paymentStatus}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Application Progress</span>
            <span>{application.currentStep}/{application.totalSteps} steps completed</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Application Details */}
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Academic Year</p>
            <p className="font-medium">{application.admissionPeriod.academicYear}</p>
          </div>
          <div>
            <p className="text-gray-600">Application Fee</p>
            <p className="font-medium">₹{application.applicationFee}</p>
          </div>
          {application.submittedAt && (
            <div>
              <p className="text-gray-600">Submitted On</p>
              <p className="font-medium">
                {new Date(application.submittedAt).toLocaleDateString()}
              </p>
            </div>
          )}
          <div>
            <p className="text-gray-600">Eligibility</p>
            <p className={`font-medium ${application.isEligible ? 'text-green-600' : 'text-red-600'}`}>
              {application.isEligible ? 'Eligible' : 'Not Eligible'}
            </p>
          </div>
        </div>

        {/* Eligibility Reason */}
        {!application.isEligible && application.eligibilityReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
              <p className="text-sm text-red-700">{application.eligibilityReason}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            {application.paymentStatus === 'SUCCESS' && (
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
            )}
          </div>
          
          {application.status === 'DRAFT' && application.isEligible && (
            <div className="flex space-x-2">
              {application.paymentStatus === 'PENDING' && (
                <Button size="sm">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay Fee
                </Button>
              )}
              <Button variant="outline" size="sm">
                Continue Application
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}