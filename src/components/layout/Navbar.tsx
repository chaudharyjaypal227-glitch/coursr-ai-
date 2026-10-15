import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X, LogOut, User, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">CourseAI</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Home</Link>
          <Link to="/courses" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5">
            <span>Explore Courses</span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded font-semibold">Video & PDF</span>
          </Link>
          <Link to="/about" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">About</Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {profile?.role === 'admin' && (
                <Link to="/admin" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors mr-1 border border-indigo-500/30 px-2.5 py-1 rounded-md bg-indigo-500/10 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Admin Panel
                </Link>
              )}
              <Link to="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                <User className="w-4 h-4" /> Dashboard
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-400 hover:text-white">
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </div>
          ) : (
            <>
              <Link to="/admin/login" className="text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors mr-2">Admin</Link>
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        <button 
          className="md:hidden p-2 text-slate-300"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-4 space-y-4">
          <nav className="flex flex-col space-y-3">
            <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link to="/courses" className="text-sm font-medium text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Courses (Video & PDF)</Link>
            <Link to="/about" className="text-sm font-medium text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
          </nav>
          <div className="flex flex-col space-y-3 pt-4 border-t border-slate-800">
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white py-2 flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <User className="w-4 h-4" /> Dashboard
                </Link>
                {profile?.role === 'admin' && (
                  <Link to="/admin" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 py-2" onClick={() => setIsMobileMenuOpen(false)}>Admin Panel</Link>
                )}
                <Button variant="ghost" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="justify-start text-slate-400">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="justify-start">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                </Button>
                <Button asChild className="justify-start">
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                </Button>
                <Link to="/admin/login" className="text-sm font-medium text-slate-500 hover:text-slate-300 py-2" onClick={() => setIsMobileMenuOpen(false)}>Admin Login</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
