import { Link, useLocation } from 'react-router-dom';
import { BookOpen, User, LogOut, Settings, LayoutDashboard, ShoppingCart } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

export function DashboardSidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', href: '/my-courses', icon: BookOpen },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden w-64 flex-col border-r border-slate-800 bg-slate-950 md:flex">
      <div className="flex h-16 items-center border-b border-slate-800 px-6">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          CourseAI
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-indigo-600/10 text-indigo-400" 
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-800 p-4">
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-900 hover:text-slate-200 text-left"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
