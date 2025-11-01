'use client';
import { useState } from 'react';
import { DynamicGamifiedProfile } from '@/components/profile/dynamic-gamified-profile';
import { ProfileEditForm } from '@/components/profile/profile-edit-form';
import { Button } from '@/components/ui/button';
import { Eye, Edit } from 'lucide-react';

export default function ProfilePage() {
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  return (
    <div>
      {/* Toggle Button */}
      <div className="fixed top-20 right-6 z-50">
        <Button
          onClick={() => setMode(mode === 'view' ? 'edit' : 'view')}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {mode === 'view' ? (
            <>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              View Dashboard
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      {mode === 'view' ? <DynamicGamifiedProfile /> : <ProfileEditForm />}
    </div>
  );
}
