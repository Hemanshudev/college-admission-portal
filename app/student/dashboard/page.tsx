'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  BookOpen, 
  FileCheck, 
  CreditCard, 
  Award,
  Calendar,
  Bell,
  LogOut,
  GraduationCap,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

const applicationSteps = [
  {
    id: 1,
    title: 'Personal Information',
    description: 'Complete your profile with personal and academic details',
    status: 'pending',
    href: '/student/profile',
    icon: User,
  },
  {
    id: 2,
    title: 'Course Selection',
    description: 'Choose your preferred courses and check eligibility',
    status: 'locked',
    href: '/student/courses',
    icon: BookOpen,
  },
  {
    id: 3,
    title: 'Document Upload',
    description: 'Upload and verify all required documents',
    status: 'locked',
    href: '/student/documents',
    icon: FileCheck,
  },
  {
    id: 4,
    title: 'Payment',
    description: 'Complete the application fee payment',
    status: 'locked',
    href: '/student/payment',
    icon: CreditCard,
  },
];

const recentActivities = [
  {
    title: 'Profile creation started',
    description: 'You created your account and started the admission process',
    time: '2 minutes ago',
    icon: User,
    type: 'info',
  },
  {
    title: 'Welcome to SPPU Portal',
    description: 'Complete your profile to proceed with course selection',
    time: '5 minutes ago',
    icon: Bell,
    type: 'success',
  },
];

const importantDates = [
  {
    title: 'Application Deadline',
    date: 'February 28, 2024',
    description: 'Last date for online application submission',
    type: 'deadline',
  },
  {
    title: 'Document Verification',
    date: 'March 1-15, 2024',
    description: 'Physical verification of uploaded documents',
    type: 'process',
  },
  {
    title: 'Merit List Publication',
    date: 'March 20, 2024',
    description: 'First merit list will be published',
    type: 'announcement',
  },
];

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const completedSteps = applicationSteps.filter(step => step.status === 'completed').length;
  const progressPercentage = (completedSteps / applicationSteps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">SPPU Admission Portal</h1>
                <p className="text-sm text-gray-500">Student Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Welcome Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="text-2xl mr-2">👋</span>
                  Welcome back, {user.name.split(' ')[0]}!
                </CardTitle>
                <CardDescription>
                  Complete your application to secure your admission for Academic Year 2024-25
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Application Progress</span>
                      <span>{completedSteps}/{applicationSteps.length} completed</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                  {!user.profileComplete && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
                        <div>
                          <p className="font-medium text-orange-800">Action Required</p>
                          <p className="text-sm text-orange-700">Please complete your profile to proceed with course selection.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Application Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Application Process</CardTitle>
                <CardDescription>
                  Follow these steps to complete your admission application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applicationSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center space-x-4 p-4 rounded-lg border hover:shadow-sm transition-shadow">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.status === 'completed' ? 'bg-green-100 text-green-600' :
                        step.status === 'pending' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : step.status === 'pending' ? (
                          <Clock className="w-5 h-5" />
                        ) : (
                          <step.icon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{step.title}</h4>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {step.status === 'completed' && (
                          <Badge variant="default" className="bg-green-100 text-green-700">
                            Completed
                          </Badge>
                        )}
                        {step.status === 'pending' && (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                        {step.status === 'locked' && (
                          <Badge variant="outline">Locked</Badge>
                        )}
                        <Link href={step.status !== 'locked' ? step.href : '#'}>
                          <Button 
                            size="sm" 
                            variant={step.status === 'pending' ? 'default' : 'outline'}
                            disabled={step.status === 'locked'}
                          >
                            {step.status === 'completed' ? 'View' : 
                             step.status === 'pending' ? 'Continue' : 'Locked'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Application Status</span>
                  <Badge variant="secondary">In Progress</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Profile Completion</span>
                  <span className="text-sm font-medium">{progressPercentage}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Documents Uploaded</span>
                  <span className="text-sm font-medium">0/8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment Status</span>
                  <Badge variant="outline">Pending</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Important Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {importantDates.map((date, index) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-4">
                      <h4 className="font-medium text-sm text-gray-900">{date.title}</h4>
                      <p className="text-xs text-blue-600 font-medium">{date.date}</p>
                      <p className="text-xs text-gray-600 mt-1">{date.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        <activity.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900">{activity.title}</h4>
                        <p className="text-xs text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}