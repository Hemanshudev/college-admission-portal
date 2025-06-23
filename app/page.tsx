'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, FileCheck, CreditCard, Award, Calendar, ArrowRight, GraduationCap, Phone, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Users,
    title: 'Student Registration',
    description: 'Complete your profile with personal, academic, and category details',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: BookOpen,
    title: 'Course Selection',
    description: 'Browse available programs and check eligibility criteria',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: FileCheck,
    title: 'Document Verification',
    description: 'Upload and verify all required documents securely',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: CreditCard,
    title: 'Online Payment',
    description: 'Secure payment processing with multiple options',
    color: 'bg-orange-50 text-orange-600',
  },
];

const stats = [
  { label: 'Total Applications', value: '50,000+', icon: Users },
  { label: 'Available Courses', value: '200+', icon: BookOpen },
  { label: 'Success Rate', value: '95%', icon: Award },
  { label: 'Processing Time', value: '< 24hrs', icon: Calendar },
];

const announcements = [
  {
    title: 'Admission Open for Academic Year 2024-25',
    date: '2024-01-15',
    type: 'Important',
    description: 'Online applications are now open for all undergraduate and postgraduate programs.',
  },
  {
    title: 'Document Verification Schedule',
    date: '2024-01-20',
    type: 'Notice',
    description: 'Document verification will be conducted from March 1st to March 15th.',
  },
  {
    title: 'Last Date for Application Submission',
    date: '2024-02-28',
    type: 'Deadline',
    description: 'Ensure all applications are submitted before the deadline.',
  },
];

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white">
      {/* Header */}
      <header className="university-gradient university-pattern py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                <GraduationCap className="w-10 h-10 text-blue-600" />
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">SPPU</h1>
                <p className="text-blue-100">Savitribai Phule Pune University</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-white text-right hidden md:block">
                <p className="text-sm text-blue-100">Current Time</p>
                <p className="font-mono">{currentTime.toLocaleString()}</p>
              </div>
              <div className="flex space-x-2">
                <Link href="/auth/login">
                  <Button variant="secondary" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-blue-600">
                    Register
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto animate-fade-up">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Welcome to SPPU <br />
              <span className="text-blue-600">Admission Portal</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Secure, streamlined, and student-friendly online admission process for all undergraduate 
              and postgraduate programs at Savitribai Phule Pune University.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/auth/register">
                <Button size="lg" className="px-8 py-4">
                  Start Application
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline" size="lg" className="px-8 py-4">
                  Browse Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow animate-fade-up-delay">
                <CardContent className="p-6">
                  <stat.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                  <p className="text-gray-600">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Admission Process</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Follow our simple 4-step process to complete your admission
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Announcements */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Latest Announcements</h3>
            <div className="space-y-6">
              {announcements.map((announcement, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      <Badge variant={announcement.type === 'Important' ? 'destructive' : 
                                   announcement.type === 'Deadline' ? 'default' : 'secondary'}>
                        {announcement.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{announcement.date}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{announcement.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Need Help?</h3>
            <p className="text-xl text-blue-100">Our support team is here to assist you</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <Phone className="w-8 h-8 mx-auto mb-4 text-blue-200" />
              <h4 className="font-semibold mb-2">Phone Support</h4>
              <p className="text-blue-100">+91-20-2569-5000</p>
              <p className="text-blue-100">Mon-Fri: 9AM-6PM</p>
            </div>
            <div className="text-center">
              <Mail className="w-8 h-8 mx-auto mb-4 text-blue-200" />
              <h4 className="font-semibold mb-2">Email Support</h4>
              <p className="text-blue-100">admission@unipune.ac.in</p>
              <p className="text-blue-100">Response within 24 hours</p>
            </div>
            <div className="text-center">
              <MapPin className="w-8 h-8 mx-auto mb-4 text-blue-200" />
              <h4 className="font-semibold mb-2">Visit Us</h4>
              <p className="text-blue-100">Ganeshkhind, Pune</p>
              <p className="text-blue-100">Maharashtra 411007</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-400 mb-2">
              © 2024 Savitribai Phule Pune University. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm">
              Designed for seamless admission experience
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}