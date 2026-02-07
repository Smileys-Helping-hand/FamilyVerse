'use client';

import { useRouter } from 'next/navigation';
import { logoutAction } from '@/app/actions/party-logic';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logoutAction();
    router.push('/party/join');
    router.refresh();
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={loading}
      variant="destructive"
      size="sm"
      className="gap-2"
    >
      <LogOut className="h-4 w-4" />
      {loading ? 'Logging out...' : 'Logout'}
    </Button>
  );
}
