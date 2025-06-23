'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Search,
  Filter,
  GraduationCap,
  Users,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Course {
  id: string;
  name: string;
  code: string;
  department: string;
  degree: string;
  duration: number;
  totalSeats: number;
  generalSeats: number;
  scSeats: number;
  stSeats: number;
  obcSeats: number;
  ewsSeats: number;
  minPercentage: number;
  eligibleBoards: string[];
  eligibleStreams: string[];
  generalFee: number;
  scFee: number;
  stFee: number;
  obcFee: number;
  ewsFee: number;
  description?: string;
  admissionPeriod: {
    name: string;
    academicYear: string;
    startDate: string;
    endDate: string;
    applicationFee: number;
  };
}

const departments = [
  'Computer Science',
  'Electronics',
  'Mechanical',
  'Civil',
  'Chemical',
  'Information Technology',
  'Electrical',
  'Biotechnology',
];

export default function CoursesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedDegree, setSelectedDegree] = useState('all');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    fetchCourses();
  }, [user, router]);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, selectedDepartment, selectedDegree]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses);
      } else {
        toast.error('Failed to fetch courses');
      }
    } catch (error) {
      console.error('Fetch courses error:', error);
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(course => course.department === selectedDepartment);
    }

    if (selectedDegree !== 'all') {
      filtered = filtered.filter(course => course.degree === selectedDegree);
    }

    setFilteredCourses(filtered);
  };

  const getFeeForCategory = (course: Course, category: string) => {
    switch (category) {
      case 'SC': return course.scFee;
      case 'ST': return course.stFee;
      case 'OBC': return course.obcFee;
      case 'EWS': return course.ewsFee;
      default: return course.generalFee;
    }
  };

  const getAvailableSeats = (course: Course, category: string) => {
    switch (category) {
      case 'SC': return course.scSeats;
      case 'ST': return course.stSeats;
      case 'OBC': return course.obcSeats;
      case 'EWS': return course.ewsSeats;
      default: return course.generalSeats;
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
                <h1 className="text-xl font-semibold text-gray-900">Available Courses</h1>
                <p className="text-sm text-gray-500">Browse and apply for admission</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Search & Filter Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedDegree} onValueChange={setSelectedDegree}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Degrees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Degrees</SelectItem>
                    <SelectItem value="B.E.">B.E.</SelectItem>
                    <SelectItem value="B.Tech">B.Tech</SelectItem>
                    <SelectItem value="M.E.">M.E.</SelectItem>
                    <SelectItem value="M.Tech">M.Tech</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setSelectedDepartment('all');
                  setSelectedDegree('all');
                }}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Found</h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria or filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  userCategory={user.studentProfile?.category || 'GENERAL'}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course, userCategory }: { course: Course; userCategory: string }) {
  const [applying, setApplying] = useState(false);
  const router = useRouter();

  const userFee = getFeeForCategory(course, userCategory);
  const availableSeats = getAvailableSeats(course, userCategory);
  
  const isEligible = checkEligibility(course);
  const admissionOpen = new Date() >= new Date(course.admissionPeriod.startDate) && 
                       new Date() <= new Date(course.admissionPeriod.endDate);

  const handleApply = async () => {
    if (!isEligible || !admissionOpen) return;

    setApplying(true);
    try {
      const response = await fetch('/api/applications/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          courseId: course.id,
          admissionPeriodId: course.admissionPeriod.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Application created successfully!');
        router.push(`/student/applications/${data.application.id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create application');
      }
    } catch (error) {
      console.error('Apply error:', error);
      toast.error('Failed to create application');
    } finally {
      setApplying(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{course.name}</CardTitle>
            <CardDescription>
              {course.code} • {course.department} • {course.degree}
            </CardDescription>
          </div>
          <Badge variant={admissionOpen ? 'default' : 'secondary'}>
            {admissionOpen ? 'Open' : 'Closed'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Course Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-gray-500" />
            <span>{course.duration} years</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-gray-500" />
            <span>{availableSeats} seats</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
            <span>₹{userFee.toLocaleString()}/year</span>
          </div>
          <div className="flex items-center">
            <GraduationCap className="w-4 h-4 mr-2 text-gray-500" />
            <span>{course.minPercentage}% min</span>
          </div>
        </div>

        {/* Description */}
        {course.description && (
          <p className="text-sm text-gray-600">{course.description}</p>
        )}

        {/* Eligibility Status */}
        <div className={`flex items-center p-3 rounded-lg ${
          isEligible ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          {isEligible ? (
            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
          )}
          <span className={`text-sm font-medium ${
            isEligible ? 'text-green-700' : 'text-red-700'
          }`}>
            {isEligible ? 'You are eligible for this course' : 'You are not eligible for this course'}
          </span>
        </div>

        {/* Seat Matrix */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="seats">Seat Matrix</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-2">
            <div className="text-sm">
              <p><strong>Eligible Boards:</strong> {course.eligibleBoards.join(', ')}</p>
              <p><strong>Academic Year:</strong> {course.admissionPeriod.academicYear}</p>
              <p><strong>Application Fee:</strong> ₹{course.admissionPeriod.applicationFee}</p>
            </div>
          </TabsContent>
          <TabsContent value="seats" className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 p-2 rounded">
                <p className="font-medium">General: {course.generalSeats}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="font-medium">SC: {course.scSeats}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="font-medium">ST: {course.stSeats}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="font-medium">OBC: {course.obcSeats}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" size="sm">
            View Details
          </Button>
          <Button 
            onClick={handleApply}
            disabled={!isEligible || !admissionOpen || applying}
            size="sm"
          >
            {applying ? 'Applying...' : 'Apply Now'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function getFeeForCategory(course: Course, category: string) {
  switch (category) {
    case 'SC': return course.scFee;
    case 'ST': return course.stFee;
    case 'OBC': return course.obcFee;
    case 'EWS': return course.ewsFee;
    default: return course.generalFee;
  }
}

function getAvailableSeats(course: Course, category: string) {
  switch (category) {
    case 'SC': return course.scSeats;
    case 'ST': return course.stSeats;
    case 'OBC': return course.obcSeats;
    case 'EWS': return course.ewsSeats;
    default: return course.generalSeats;
  }
}

function checkEligibility(course: Course) {
  // This would normally check against user's profile
  // For demo purposes, returning true
  return true;
}