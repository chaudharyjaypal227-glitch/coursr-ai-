import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Users, LogOut, Settings, LayoutDashboard, ShoppingCart, PlusCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export function AdminSidebar() {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Courses', href: '/admin/courses', icon: BookOpen },
    { name: 'Add Course', href: '/admin/courses/new', icon: PlusCircle },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="hidden w-64 flex-col border-r border-slate-800 bg-slate-950 md:flex">
      <div className="flex h-16 items-center border-b border-slate-800 px-6">
        <Link to="/admin" className="flex items-center gap-2 text-xl font-bold text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          Admin Panel
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
        <Link
          to="/"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-900 hover:text-slate-200"
        >
          <LogOut className="h-5 w-5" />
          Back to Store
        </Link>
      </div>
    </aside>
  );
}
