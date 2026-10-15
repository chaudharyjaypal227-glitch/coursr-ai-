import React, { useState } from 'react';
import { Mail, MessageSquare, ArrowLeft, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export function ContactUs() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const contactEmail = 'chaudharyjaypal227@gmail.com';

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoUrl = `mailto:${contactEmail}?subject=${encodeURIComponent(subject || 'CourseAI Support Request')}&body=${encodeURIComponent(`Name: ${name}\n\nMessage:\n${message}`)}`;
    window.location.href = mailtoUrl;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div>
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-slate-400 hover:text-indigo-400 transition-colors gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <MessageSquare className="w-3.5 h-3.5" /> Support & Assistance
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Contact Us
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            Have a question about a course, payment, access, or any other issue? Contact us and we will review your request.
          </p>
        </div>

        {/* Direct Email Card */}
        <Card className="bg-slate-900/70 border-slate-800 text-slate-100 shadow-xl overflow-hidden">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30 shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Direct Email Support</h3>
                <p className="text-sm text-slate-400">
                  Our primary support channel for all course inquiries, payment queries, and technical assistance.
                </p>
                <div className="pt-2">
                  <a 
                    href={`mailto:${contactEmail}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors shadow-md shadow-indigo-600/20"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email Support</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-6">
              <h4 className="text-sm font-semibold text-slate-200 mb-4">
                Quick Email Launcher
              </h4>
              
              {submitted ? (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Opening your mail client...</p>
                    <p className="text-xs text-emerald-400/80">If your email client didn't open automatically, please click the "Email Support" button above to send your message.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendEmail} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Subject / Course Name</label>
                    <input 
                      type="text" 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Question regarding course access"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Message Details</label>
                    <textarea 
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please describe your question or issue in detail..."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <Button 
                    type="submit"
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Compose & Send Email
                  </Button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Response Time
            </h4>
            <p className="text-xs text-slate-400">
              We review every inquiry individually and typically respond within 24 to 48 business hours.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1">
            <h4 className="text-sm font-semibold text-white">Helpful Links</h4>
            <p className="text-xs text-slate-400">
              Need immediate answers? Check our <Link to="/faq" className="text-indigo-400 hover:underline">FAQ</Link> or <Link to="/help" className="text-indigo-400 hover:underline">Help Center</Link>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
