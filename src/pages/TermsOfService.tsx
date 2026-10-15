import { Shield, ArrowLeft, Mail, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';

export function TermsOfService() {
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
            <Shield className="w-3.5 h-3.5" /> Legal & Terms
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-400">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Terms Content */}
        <Card className="bg-slate-900/60 border-slate-800 text-slate-200 shadow-xl">
          <CardContent className="p-6 sm:p-8 space-y-8 leading-relaxed">
            
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" /> 1. Platform Purpose & Educational Content
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                CourseAI provides digital educational courses, practical learning materials, video lessons, and PDF resources for creators, developers, and learners. All content is provided for learning, personal development, and skill-building purposes.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-800 pt-6">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" /> 2. User Accounts & Registration
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                When registering on CourseAI, you agree to provide accurate, current, and complete account information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-800 pt-6">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" /> 3. License, Access & Intellectual Property
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                Purchased course access is granted exclusively to the individual purchasing user. Users may not:
              </p>
              <ul className="space-y-2 text-sm sm:text-base text-slate-300 list-disc list-inside pl-2">
                <li>Redistribute, resell, sublicense, or rent any course materials.</li>
                <li>Copy, re-upload, or publicly share paid course videos, PDFs, code files, or other protected course assets.</li>
                <li>Attempt to bypass, defeat, or circumvent access restrictions or authentication mechanisms.</li>
              </ul>
            </section>

            <section className="space-y-3 border-t border-slate-800 pt-6">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                4. Course Content Updates & Availability
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                CourseAI continuously improves learning materials. Course content, video lessons, and PDF resources may be updated, modified, or refreshed from time to time to keep the educational value current.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-800 pt-6">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                5. Purchases, Payments & Refunds
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                Course fees are clearly indicated prior to purchase. All refund requests are handled strictly in accordance with our <Link to="/refund" className="text-indigo-400 hover:underline">Refund Policy</Link>.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-800 pt-6">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                6. Contact & Technical Support
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                For any questions regarding these terms, account inquiries, or technical support, please contact our team at:
              </p>
              <div className="pt-1">
                <a 
                  href={`mailto:${contactEmail}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors shadow-md shadow-indigo-600/20"
                >
                  <Mail className="w-4 h-4" />
                  <span>Contact Support Team</span>
                </a>
              </div>
            </section>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}
