'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  ArrowLeft, 
  Save, 
  Calendar as CalendarIcon,
  Upload,
  GraduationCap,
  User,
  FileText,
  Home,
  Users,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

interface ProfileData {
  // Personal Details
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: Date | undefined;
  gender: string;
  aadharNumber: string;
  email: string;
  phone: string;
  alternatePhone: string;
  // Academic Details
  tenth: {
    board: string;
    school: string;
    passingYear: string;
    percentage: string;
    marksheet: File | null;
  };
  twelfth: {
    board: string;
    college: string;
    passingYear: string;
    percentage: string;
    marksheet: File | null;
  };
  // Category Details
  category: string;
  religion: string;
  caste: string;
  subCaste: string;
  // Family Details
  fatherName: string;
  motherName: string;
  guardianName: string;
  fatherOccupation: string;
  motherOccupation: string;
  annualIncome: string;
  // Address Details
  permanentAddress: string;
  currentAddress: string;
  district: string;
  state: string;
  pincode: string;
  domicileState: string;
  // Documents
  photograph: File | null;
  signature: File | null;
}

const initialData: ProfileData = {
  firstName: '',
  middleName: '',
  lastName: '',
  dateOfBirth: undefined,
  gender: '',
  aadharNumber: '',
  email: '',
  phone: '',
  alternatePhone: '',
  tenth: {
    board: '',
    school: '',
    passingYear: '',
    percentage: '',
    marksheet: null,
  },
  twelfth: {
    board: '',
    college: '',
    passingYear: '',
    percentage: '',
    marksheet: null,
  },
  category: '',
  religion: '',
  caste: '',
  subCaste: '',
  fatherName: '',
  motherName: '',
  guardianName: '',
  fatherOccupation: '',
  motherOccupation: '',
  annualIncome: '',
  permanentAddress: '',
  currentAddress: '',
  district: '',
  state: '',
  pincode: '',
  domicileState: '',
  photograph: null,
  signature: null,
};

const steps = [
  { id: 'personal', title: 'Personal Details', icon: User },
  { id: 'academic', title: 'Academic History', icon: GraduationCap },
  { id: 'category', title: 'Category Details', icon: FileText },
  { id: 'family', title: 'Family Details', icon: Users },
  { id: 'address', title: 'Address Details', icon: Home },
  { id: 'documents', title: 'Documents', icon: Upload },
];

export default function StudentProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState<ProfileData>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    // Pre-fill email from user account
    setProfileData(prev => ({
      ...prev,
      email: user.email,
      firstName: user.name.split(' ')[0] || '',
      lastName: user.name.split(' ').slice(1).join(' ') || '',
    }));
  }, [user, router]);

  const updateProfileData = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateNestedData = (section: string, field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof ProfileData],
        [field]: value,
      },
    }));
  };

  const handleFileUpload = (field: string, file: File | null) => {
    updateProfileData(field, file);
  };

  const validateStep = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Personal Details
        return !!(profileData.firstName && profileData.lastName && profileData.dateOfBirth && 
                 profileData.gender && profileData.aadharNumber && profileData.phone);
      case 1: // Academic Details
        return !!(profileData.tenth.board && profileData.tenth.percentage && 
                 profileData.twelfth.board && profileData.twelfth.percentage);
      case 2: // Category Details
        return !!(profileData.category && profileData.religion);
      case 3: // Family Details
        return !!(profileData.fatherName && profileData.motherName && profileData.annualIncome);
      case 4: // Address Details
        return !!(profileData.permanentAddress && profileData.district && 
                 profileData.state && profileData.pincode);
      case 5: // Documents
        return !!(profileData.photograph && profileData.signature);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
      toast.error('Please fill all required fields before proceeding');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success('Profile saved successfully!');
    setIsLoading(false);
    
    // If this is the last step, redirect to dashboard
    if (currentStep === steps.length - 1) {
      router.push('/student/dashboard');
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

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
                <h1 className="text-xl font-semibold text-gray-900">Complete Your Profile</h1>
                <p className="text-sm text-gray-500">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Section */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Profile Completion</CardTitle>
                <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                {steps.map((step, index) => (
                  <div 
                    key={step.id}
                    className={`flex flex-col items-center space-y-2 ${
                      index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index < currentStep ? 'bg-blue-600 text-white' :
                      index === currentStep ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-center">{step.title}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Form Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <steps[currentStep].icon className="w-6 h-6 mr-2" />
                {steps[currentStep].title}
              </CardTitle>
              <CardDescription>
                Please provide accurate information as it will be used for verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === 0 && (
                <PersonalDetailsForm 
                  data={profileData} 
                  updateData={updateProfileData}
                />
              )}
              {currentStep === 1 && (
                <AcademicDetailsForm 
                  data={profileData} 
                  updateNestedData={updateNestedData}
                />
              )}
              {currentStep === 2 && (
                <CategoryDetailsForm 
                  data={profileData} 
                  updateData={updateProfileData}
                />
              )}
              {currentStep === 3 && (
                <FamilyDetailsForm 
                  data={profileData} 
                  updateData={updateProfileData}
                />
              )}
              {currentStep === 4 && (
                <AddressDetailsForm 
                  data={profileData} 
                  updateData={updateProfileData}
                />
              )}
              {currentStep === 5 && (
                <DocumentsForm 
                  data={profileData} 
                  handleFileUpload={handleFileUpload}
                />
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={handleSave} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Draft'}
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSave} disabled={isLoading}>
                  Complete Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Personal Details Form Component
function PersonalDetailsForm({ data, updateData }: { data: ProfileData; updateData: (field: string, value: any) => void }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name *</Label>
        <Input
          id="firstName"
          value={data.firstName}
          onChange={(e) => updateData('firstName', e.target.value)}
          placeholder="Enter first name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="middleName">Middle Name</Label>
        <Input
          id="middleName"
          value={data.middleName}
          onChange={(e) => updateData('middleName', e.target.value)}
          placeholder="Enter middle name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name *</Label>
        <Input
          id="lastName"
          value={data.lastName}
          onChange={(e) => updateData('lastName', e.target.value)}
          placeholder="Enter last name"
        />
      </div>
      <div className="space-y-2">
        <Label>Date of Birth *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !data.dateOfBirth && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {data.dateOfBirth ? format(data.dateOfBirth, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={data.dateOfBirth}
              onSelect={(date) => updateData('dateOfBirth', date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        <Label>Gender *</Label>
        <RadioGroup value={data.gender} onValueChange={(value) => updateData('gender', value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" />
            <Label htmlFor="male">Male</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" />
            <Label htmlFor="female">Female</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="other" id="other" />
            <Label htmlFor="other">Other</Label>
          </div>
        </RadioGroup>
      </div>
      <div className="space-y-2">
        <Label htmlFor="aadhar">Aadhar Number *</Label>
        <Input
          id="aadhar"
          value={data.aadharNumber}
          onChange={(e) => updateData('aadharNumber', e.target.value)}
          placeholder="Enter 12-digit Aadhar number"
          maxLength={12}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Mobile Number *</Label>
        <Input
          id="phone"
          value={data.phone}
          onChange={(e) => updateData('phone', e.target.value)}
          placeholder="Enter mobile number"
          maxLength={10}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="alternatePhone">Alternate Mobile Number</Label>
        <Input
          id="alternatePhone"
          value={data.alternatePhone}
          onChange={(e) => updateData('alternatePhone', e.target.value)}
          placeholder="Enter alternate mobile number"
          maxLength={10}
        />
      </div>
    </div>
  );
}

// Academic Details Form Component
function AcademicDetailsForm({ data, updateNestedData }: { data: ProfileData; updateNestedData: (section: string, field: string, value: any) => void }) {
  return (
    <div className="space-y-8">
      {/* 10th Class Details */}
      <div>
        <h3 className="text-lg font-medium mb-4">10th Class Details</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tenthBoard">Board *</Label>
            <Select value={data.tenth.board} onValueChange={(value) => updateNestedData('tenth', 'board', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select board" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cbse">CBSE</SelectItem>
                <SelectItem value="icse">ICSE</SelectItem>
                <SelectItem value="state">State Board</SelectItem>
                <SelectItem value="others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenthSchool">School Name *</Label>
            <Input
              id="tenthSchool"
              value={data.tenth.school}
              onChange={(e) => updateNestedData('tenth', 'school', e.target.value)}
              placeholder="Enter school name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenthYear">Passing Year *</Label>
            <Select value={data.tenth.passingYear} onValueChange={(value) => updateNestedData('tenth', 'passingYear', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => 2024 - i).map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenthPercentage">Percentage *</Label>
            <Input
              id="tenthPercentage"
              value={data.tenth.percentage}
              onChange={(e) => updateNestedData('tenth', 'percentage', e.target.value)}
              placeholder="Enter percentage"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* 12th Class Details */}
      <div>
        <h3 className="text-lg font-medium mb-4">12th Class Details</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="twelfthBoard">Board *</Label>
            <Select value={data.twelfth.board} onValueChange={(value) => updateNestedData('twelfth', 'board', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select board" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cbse">CBSE</SelectItem>
                <SelectItem value="icse">ICSE</SelectItem>
                <SelectItem value="state">State Board</SelectItem>
                <SelectItem value="others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="twelfthCollege">College/School Name *</Label>
            <Input
              id="twelfthCollege"
              value={data.twelfth.college}
              onChange={(e) => updateNestedData('twelfth', 'college', e.target.value)}
              placeholder="Enter college/school name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twelfthYear">Passing Year *</Label>
            <Select value={data.twelfth.passingYear} onValueChange={(value) => updateNestedData('twelfth', 'passingYear', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => 2024 - i).map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="twelfthPercentage">Percentage *</Label>
            <Input
              id="twelfthPercentage"
              value={data.twelfth.percentage}
              onChange={(e) => updateNestedData('twelfth', 'percentage', e.target.value)}
              placeholder="Enter percentage"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Category Details Form Component
function CategoryDetailsForm({ data, updateData }: { data: ProfileData; updateData: (field: string, value: any) => void }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select value={data.category} onValueChange={(value) => updateData('category', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="obc">OBC</SelectItem>
            <SelectItem value="sc">SC</SelectItem>
            <SelectItem value="st">ST</SelectItem>
            <SelectItem value="ews">EWS</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="religion">Religion *</Label>
        <Select value={data.religion} onValueChange={(value) => updateData('religion', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select religion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hindu">Hindu</SelectItem>
            <SelectItem value="muslim">Muslim</SelectItem>
            <SelectItem value="christian">Christian</SelectItem>
            <SelectItem value="sikh">Sikh</SelectItem>
            <SelectItem value="buddhist">Buddhist</SelectItem>
            <SelectItem value="jain">Jain</SelectItem>
            <SelectItem value="others">Others</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="caste">Caste</Label>
        <Input
          id="caste"
          value={data.caste}
          onChange={(e) => updateData('caste', e.target.value)}
          placeholder="Enter caste"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subCaste">Sub-Caste</Label>
        <Input
          id="subCaste"
          value={data.subCaste}
          onChange={(e) => updateData('subCaste', e.target.value)}
          placeholder="Enter sub-caste"
        />
      </div>
    </div>
  );
}

// Family Details Form Component
function FamilyDetailsForm({ data, updateData }: { data: ProfileData; updateData: (field: string, value: any) => void }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="fatherName">Father's Name *</Label>
        <Input
          id="fatherName"
          value={data.fatherName}
          onChange={(e) => updateData('fatherName', e.target.value)}
          placeholder="Enter father's name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="motherName">Mother's Name *</Label>
        <Input
          id="motherName"
          value={data.motherName}
          onChange={(e) => updateData('motherName', e.target.value)}
          placeholder="Enter mother's name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="guardianName">Guardian's Name</Label>
        <Input
          id="guardianName"
          value={data.guardianName}
          onChange={(e) => updateData('guardianName', e.target.value)}
          placeholder="Enter guardian's name (if applicable)"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fatherOccupation">Father's Occupation</Label>
        <Input
          id="fatherOccupation"
          value={data.fatherOccupation}
          onChange={(e) => updateData('fatherOccupation', e.target.value)}
          placeholder="Enter father's occupation"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="motherOccupation">Mother's Occupation</Label>
        <Input
          id="motherOccupation"
          value={data.motherOccupation}
          onChange={(e) => updateData('motherOccupation', e.target.value)}
          placeholder="Enter mother's occupation"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="annualIncome">Annual Family Income *</Label>
        <Select value={data.annualIncome} onValueChange={(value) => updateData('annualIncome', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select income range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="below-1-lakh">Below ₹1 Lakh</SelectItem>
            <SelectItem value="1-2-lakh">₹1-2 Lakh</SelectItem>
            <SelectItem value="2-3-lakh">₹2-3 Lakh</SelectItem>
            <SelectItem value="3-5-lakh">₹3-5 Lakh</SelectItem>
            <SelectItem value="5-8-lakh">₹5-8 Lakh</SelectItem>
            <SelectItem value="above-8-lakh">Above ₹8 Lakh</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Address Details Form Component
function AddressDetailsForm({ data, updateData }: { data: ProfileData; updateData: (field: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="permanentAddress">Permanent Address *</Label>
        <Textarea
          id="permanentAddress"
          value={data.permanentAddress}
          onChange={(e) => updateData('permanentAddress', e.target.value)}
          placeholder="Enter permanent address"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="currentAddress">Current Address</Label>
        <Textarea
          id="currentAddress"
          value={data.currentAddress}
          onChange={(e) => updateData('currentAddress', e.target.value)}
          placeholder="Enter current address (if different from permanent)"
          rows={3}
        />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="district">District *</Label>
          <Input
            id="district"
            value={data.district}
            onChange={(e) => updateData('district', e.target.value)}
            placeholder="Enter district"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Select value={data.state} onValueChange={(value) => updateData('state', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="maharashtra">Maharashtra</SelectItem>
              <SelectItem value="gujarat">Gujarat</SelectItem>
              <SelectItem value="karnataka">Karnataka</SelectItem>
              <SelectItem value="rajasthan">Rajasthan</SelectItem>
              <SelectItem value="mp">Madhya Pradesh</SelectItem>
              <SelectItem value="up">Uttar Pradesh</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pincode">Pincode *</Label>
          <Input
            id="pincode"
            value={data.pincode}
            onChange={(e) => updateData('pincode', e.target.value)}
            placeholder="Enter pincode"
            maxLength={6}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="domicileState">Domicile State</Label>
          <Select value={data.domicileState} onValueChange={(value) => updateData('domicileState', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select domicile state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="maharashtra">Maharashtra</SelectItem>
              <SelectItem value="gujarat">Gujarat</SelectItem>
              <SelectItem value="karnataka">Karnataka</SelectItem>
              <SelectItem value="rajasthan">Rajasthan</SelectItem>
              <SelectItem value="mp">Madhya Pradesh</SelectItem>
              <SelectItem value="up">Uttar Pradesh</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

// Documents Form Component
function DocumentsForm({ data, handleFileUpload }: { data: ProfileData; handleFileUpload: (field: string, file: File | null) => void }) {
  const handleFileChange = (field: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    handleFileUpload(field, file);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="photograph">Recent Photograph *</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <Input
              id="photograph"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange('photograph', e)}
              className="hidden"
            />
            <Label htmlFor="photograph" className="cursor-pointer">
              <span className="text-sm text-gray-600">
                {data.photograph ? data.photograph.name : 'Click to upload photograph'}
              </span>
              <br />
              <span className="text-xs text-gray-400">
                Max size: 2MB, Format: JPG, PNG
              </span>
            </Label>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="signature">Digital Signature *</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <Input
              id="signature"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange('signature', e)}
              className="hidden"
            />
            <Label htmlFor="signature" className="cursor-pointer">
              <span className="text-sm text-gray-600">
                {data.signature ? data.signature.name : 'Click to upload signature'}
              </span>
              <br />
              <span className="text-xs text-gray-400">
                Max size: 1MB, Format: JPG, PNG
              </span>
            </Label>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Document Guidelines:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Photograph should be recent passport-size with clear face visibility</li>
          <li>• Signature should be clear and match the one on official documents</li>
          <li>• Files should be in JPG or PNG format only</li>
          <li>• Ensure good quality and proper lighting</li>
        </ul>
      </div>
    </div>
  );
}