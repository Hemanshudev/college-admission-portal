import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import { createAuditLog, getClientInfo } from '@/lib/audit';

const createApplicationSchema = z.object({
  courseId: z.string(),
  admissionPeriodId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['STUDENT']);
    const body = await request.json();
    const { courseId, admissionPeriodId } = createApplicationSchema.parse(body);

    // Check if user has a complete profile
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });

    if (!studentProfile || !studentProfile.isComplete) {
      return NextResponse.json(
        { error: 'Please complete your profile before applying' },
        { status: 400 }
      );
    }

    // Check if course exists and is active
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        admissionPeriodId,
        isActive: true,
      },
      include: {
        admissionPeriod: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found or not available' },
        { status: 404 }
      );
    }

    // Check if admission period is active
    const now = new Date();
    if (now < course.admissionPeriod.startDate || now > course.admissionPeriod.endDate) {
      return NextResponse.json(
        { error: 'Admission period is not active' },
        { status: 400 }
      );
    }

    // Check if user already has an application for this course
    const existingApplication = await prisma.application.findFirst({
      where: {
        userId: user.id,
        courseId,
        admissionPeriodId,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this course' },
        { status: 400 }
      );
    }

    // Check eligibility
    const isEligible = checkEligibility(studentProfile, course);
    
    // Generate application number
    const applicationNumber = `SPPU${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;

    // Determine application fee based on category
    let applicationFee = course.admissionPeriod.applicationFee;
    if (studentProfile.category === 'SC' || studentProfile.category === 'ST') {
      applicationFee = applicationFee * 0.5; // 50% discount for SC/ST
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        applicationNumber,
        userId: user.id,
        studentProfileId: studentProfile.id,
        admissionPeriodId,
        courseId,
        applicationFee,
        isEligible: isEligible.eligible,
        eligibilityReason: isEligible.reason,
        status: isEligible.eligible ? 'DRAFT' : 'REJECTED',
      },
      include: {
        course: true,
        admissionPeriod: true,
      },
    });

    // Create audit log
    const clientInfo = getClientInfo(request);
    await createAuditLog({
      userId: user.id,
      action: 'APPLICATION_CREATED',
      entity: 'Application',
      entityId: application.id,
      newValues: {
        applicationNumber,
        courseId,
        isEligible: isEligible.eligible,
        applicationFee,
      },
      ...clientInfo,
    });

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error('Create application error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}

function checkEligibility(profile: any, course: any) {
  // Check minimum percentage
  if (profile.twelfthPercentage < course.minPercentage) {
    return {
      eligible: false,
      reason: `Minimum ${course.minPercentage}% required in 12th standard`,
    };
  }

  // Check eligible boards
  if (course.eligibleBoards.length > 0 && 
      !course.eligibleBoards.includes(profile.twelfthBoard.toLowerCase())) {
    return {
      eligible: false,
      reason: `Your board (${profile.twelfthBoard}) is not eligible for this course`,
    };
  }

  return { eligible: true, reason: null };
}