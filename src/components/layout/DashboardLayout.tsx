import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from './DashboardSidebar';
import { Bell, Menu } from 'lucide-react';
import { useState } from 'react';

export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      {/* Desktop Sidebar */}
      <DashboardSidebar />
      
      {/* Mobile Sidebar overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
      
      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-950 transition-transform duration-200 ease-in-out md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <DashboardSidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-4 md:px-6">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="mr-4 text-slate-400 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold">Student Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-indigo-500"></span>
            </button>
            <div className="h-8 w-8 overflow-hidden rounded-full border border-slate-800 bg-slate-800">
              <img src="https://ui-avatars.com/api/?name=Student&background=random" alt="Avatar" className="h-full w-full object-cover" />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
