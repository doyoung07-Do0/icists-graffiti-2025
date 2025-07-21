import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { compare } from 'bcrypt-ts';
import { auth } from '@/app/(auth)/auth';
import { getUser, updateUserPassword } from '@/lib/db/queries';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const validatedData = changePasswordSchema.parse(body);

    // Get current user data
    if (!session.user.email) {
      return NextResponse.json(
        { success: false, error: 'User email not found' },
        { status: 400 },
      );
    }

    const users = await getUser(session.user.email);
    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 },
      );
    }

    const user = users[0];

    // Verify current password
    if (!user.password) {
      return NextResponse.json(
        { success: false, error: 'Invalid current password' },
        { status: 400 },
      );
    }

    const isCurrentPasswordValid = await compare(
      validatedData.currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid current password' },
        { status: 400 },
      );
    }

    // Update password
    await updateUserPassword(user.id, validatedData.newPassword);

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 },
      );
    }

    console.error('Password change error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to change password' },
      { status: 500 },
    );
  }
}
