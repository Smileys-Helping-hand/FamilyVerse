import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const adminEmail = process.env.ADMIN_EMAIL || 'mraaziqp@gmail.com';

  if (!session || session.user?.email !== adminEmail) {
    redirect('/?error=access_denied');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Top Bar */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-red-500/30 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-red-500 tracking-wider">🚨 MISSION CONTROL</h1>
            <p className="text-xs text-gray-400 mt-1">Authorized: {session.user?.email}</p>
          </div>
          <div className="text-xs text-gray-500">IRON DOME ACTIVE</div>
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-black/20 backdrop-blur-sm border-r border-red-500/20 p-4">
          <nav className="space-y-2">
            <NavLink href="/admin" icon="📊">Overview</NavLink>
            <NavLink href="/admin/logs" icon="📜">System Logs</NavLink>
            <NavLink href="/admin/settings" icon="⚙️">Settings</NavLink>

            <div className="pt-6 mt-6 border-t border-red-500/30">
              <p className="text-xs text-gray-500 mb-2 px-3">GOD MODE</p>
              <NavLink href="/admin/controls" icon="🎮">Game Control</NavLink>
            </div>

            <div className="pt-6 mt-6 border-t border-red-500/30">
              <Link href="/" className="block px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded transition">← Back to FamilyVerse</Link>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

function NavLink({ href, icon, children }: { href: string; icon: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-red-500/10 rounded transition border border-transparent hover:border-red-500/30">
      <span className="text-lg">{icon}</span>
      {children}
    </Link>
  );
}
