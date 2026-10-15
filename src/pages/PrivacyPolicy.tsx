import { Lock, ArrowLeft, Mail, Database, ShieldCheck, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';

export function PrivacyPolicy() {
  const contactEmail = 'chaudharyjaypal227@gmail.com';

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
            <Lock className="w-3.5 h-3.5" /> Privacy & Security
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-400">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Privacy Policy Body */}
        <Card className="bg-slate-900/60 border-slate-800 text-slate-200 shadow-xl">
          <CardContent className="p-6 sm:p-8 space-y-8 leading-relaxed">
            
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-400" /> 1. Information We Collect
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                CourseAI only collects information strictly necessary to provide and manage your account and course access:
              </p>
              <ul className="space-y-2 text-sm sm:text-base text-slate-300 list-disc list-inside pl-2">
                <li><strong>Account Information:</strong> Name and email address when you register or sign in.</li>
                <li><strong>Authentication Data:</strong> Secure user identifier (UID) managed via Firebase Authentication.</li>
                <li><strong>Enrollment & Order Records:</strong> Course purchase records, order identifiers, and access timestamps.</li>
              </ul>
            </section>

            <section className="space-y-3 border-t border-slate-800 pt-6">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" /> 2. How Your Data Is Stored & Handled
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                We store user profiles and enrollment information securely using Google Firebase (Firestore and Firebase Authentication). Data transmission is encrypted using industry-standard SSL/TLS protocols.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-800 pt-6">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" /> 3. Payment Processing
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                Payments on CourseAI are processed through secure payment service providers (e.g., Razorpay). CourseAI does not store your full debit/credit card numbers or banking passwords on our servers. We only store payment reference identifiers necessary to confirm enrollment.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-800 pt-6">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                4. Data Protection & No Unauthorized Sharing
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                We do not sell, rent, or trade your personal information to third-party marketers or advertisers. Your data is used exclusively to facilitate course delivery, student support, and account management.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-800 pt-6">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                5. Contacting Us About Privacy
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                If you have questions regarding this Privacy Policy or wish to request information regarding your account data, please reach out to us:
              </p>
              <div className="pt-1">
                <a 
                  href={`mailto:${contactEmail}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors shadow-md shadow-indigo-600/20"
                >
                  <Mail className="w-4 h-4" />
                  <span>Contact Privacy Support</span>
                </a>
              </div>
            </section>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}
