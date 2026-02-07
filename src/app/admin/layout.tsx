'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Leaf, Menu, X, Shield, Settings, Gamepad2, Printer, ScrollText, LayoutDashboard, ChevronLeft } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'mraaziqp@gmail.com';

// Navigation items
const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Mission Control', emoji: '📊' },
  { href: '/admin/qr-studio', icon: Printer, label: 'QR Design Studio', emoji: '🖨️' },
  { href: '/admin/logs', icon: ScrollText, label: 'System Logs', emoji: '📜' },
  { href: '/admin/settings', icon: Settings, label: 'Settings', emoji: '⚙️' },
];

const gameMasterItems = [
  { href: '/admin/dashboard', icon: Gamepad2, label: 'Party Dashboard', emoji: '🎮' },
  { href: '/admin/controls', icon: Settings, label: 'Game Controls', emoji: '🔧' },
];

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  
  return (
    <nav className="space-y-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 text-sm rounded transition border border-transparent",
            pathname === item.href
              ? "bg-red-500/20 text-white border-red-500/30"
              : "text-gray-300 hover:text-white hover:bg-red-500/10 hover:border-red-500/30"
          )}
        >
          <span className="text-lg">{item.emoji}</span>
          {item.label}
        </Link>
      ))}

      <div className="pt-6 mt-6 border-t border-red-500/30">
        <p className="text-xs text-gray-500 mb-2 px-3">GAME MASTER</p>
        {gameMasterItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 text-sm rounded transition border border-transparent",
              pathname === item.href
                ? "bg-red-500/20 text-white border-red-500/30"
                : "text-gray-300 hover:text-white hover:bg-red-500/10 hover:border-red-500/30"
            )}
          >
            <span className="text-lg">{item.emoji}</span>
            {item.label}
          </Link>
        ))}
      </div>

      <div className="pt-6 mt-6 border-t border-red-500/30">
        <Link 
          href="/" 
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded transition"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to FamilyVerse
        </Link>
      </div>
    </nav>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userProfile, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!userProfile) {
      router.replace('/login?redirect=/admin');
      return;
    }
    if (userProfile.email !== ADMIN_EMAIL && userProfile.role !== 'admin') {
      router.replace('/?error=access_denied');
      return;
    }
    setAuthorized(true);
  }, [userProfile, loading, router]);

  if (loading || !authorized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex flex-col items-center space-y-4">
          <Leaf className="h-16 w-16 text-red-500 animate-pulse" />
          <p className="text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  const session = { user: { email: userProfile?.email } };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-red-500/30 bg-black/30 backdrop-blur-sm sticky top-0 z-40">
        <div>
          <h1 className="text-lg font-bold text-red-500 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            MISSION CONTROL
          </h1>
          <p className="text-[10px] text-gray-500">IRON DOME ACTIVE</p>
        </div>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-slate-900/95 backdrop-blur-xl border-red-500/30 p-0">
            <div className="p-4 border-b border-red-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-red-500">Navigation</h2>
                  <p className="text-xs text-gray-400">{session.user?.email}</p>
                </div>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="text-gray-400">
                    <X className="h-5 w-5" />
                  </Button>
                </SheetClose>
              </div>
            </div>
            <div className="p-4">
              <NavContent onClose={() => setMobileMenuOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Header - Hidden on Mobile */}
      <div className="hidden md:block bg-black/30 backdrop-blur-sm border-b border-red-500/30 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-red-500 tracking-wider">🚨 MISSION CONTROL</h1>
            <p className="text-xs text-gray-400 mt-1">Authorized: {session.user?.email}</p>
          </div>
          <div className="text-xs text-gray-500">IRON DOME ACTIVE</div>
        </div>
      </div>

      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {/* Desktop Sidebar - Hidden on Mobile */}
        <aside className="hidden md:block w-64 shrink-0 min-h-full bg-black/20 backdrop-blur-sm border-r border-red-500/20 p-4">
          <NavContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-full overflow-x-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
