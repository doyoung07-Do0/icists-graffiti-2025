'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        type: 'error',
        description: 'New passwords do not match!',
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        type: 'error',
        description: 'New password must be at least 6 characters!',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          type: 'success',
          description: 'Password changed successfully!',
        });
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast({
          type: 'error',
          description: result.error || 'Failed to change password!',
        });
      }
    } catch (error) {
      toast({
        type: 'error',
        description: 'An error occurred while changing password!',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-black">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-8">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold text-zinc-50">
            Change Password
          </h3>
          <p className="text-sm text-zinc-400">
            Enter your current password and choose a new one
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 px-4 sm:px-16"
        >
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="currentPassword"
              className="text-zinc-400 font-normal"
            >
              Current Password
            </Label>
            <Input
              id="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={(e) =>
                handleInputChange('currentPassword', e.target.value)
              }
              className="bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500 text-md md:text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="newPassword" className="text-zinc-400 font-normal">
              New Password
            </Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500 text-md md:text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="confirmPassword"
              className="text-zinc-400 font-normal"
            >
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange('confirmPassword', e.target.value)
              }
              className="bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500 text-md md:text-sm"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading ? 'Changing Password...' : 'Change Password'}
          </Button>
        </form>
      </div>
    </div>
  );
}
