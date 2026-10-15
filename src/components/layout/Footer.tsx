import { BookOpen, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  const contactEmail = 'chaudharyjaypal227@gmail.com';

  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-12 px-4 md:px-6">
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        
        {/* Brand & Support Contact */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">CourseAI</span>
          </Link>
          <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
            Practical digital courses designed for creators, developers, and learners.
          </p>
          <div className="pt-1">
            <a 
              href={`mailto:${contactEmail}`}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-xs font-semibold transition-colors"
            >
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span>Contact Support</span>
            </a>
          </div>
        </div>
        
        {/* Platform */}
        <div>
          <h3 className="font-semibold text-white mb-4 text-sm tracking-wide">Platform</h3>
          <ul className="space-y-2.5">
            <li>
              <Link to="/courses" className="text-sm text-slate-400 hover:text-white transition-colors">
                Browse Courses
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors">
                Pricing
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-sm text-slate-400 hover:text-white transition-colors">
                About Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="font-semibold text-white mb-4 text-sm tracking-wide">Support</h3>
          <ul className="space-y-2.5">
            <li>
              <Link to="/help" className="text-sm text-slate-400 hover:text-white transition-colors">
                Help Center
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-sm text-slate-400 hover:text-white transition-colors">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="/faq" className="text-sm text-slate-400 hover:text-white transition-colors">
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="font-semibold text-white mb-4 text-sm tracking-wide">Legal</h3>
          <ul className="space-y-2.5">
            <li>
              <Link to="/terms" className="text-sm text-slate-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="text-sm text-slate-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/refund" className="text-sm text-slate-400 hover:text-white transition-colors">
                Refund Policy
              </Link>
            </li>
          </ul>
        </div>

      </div>
      
      <div className="container mx-auto mt-12 border-t border-slate-800/80 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} CourseAI. All rights reserved.
        </p>
        <p className="text-xs text-slate-500">
          Need help? <a href={`mailto:${contactEmail}`} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Contact Support</a>
        </p>
      </div>
    </footer>
  );
}
