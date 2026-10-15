import { RefreshCw, ArrowLeft, Mail, AlertTriangle, FileText, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';

export function RefundPolicy() {
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
            <RefreshCw className="w-3.5 h-3.5" /> Policy & Guidelines
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Refund Policy
          </h1>
          <p className="text-sm text-slate-400">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Policy Body */}
        <Card className="bg-slate-900/60 border-slate-800 text-slate-200 shadow-xl">
          <CardContent className="p-6 sm:p-8 space-y-6 leading-relaxed">
            
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">Digital Content Overview</h2>
              <p className="text-sm sm:text-base text-slate-300">
                CourseAI provides digital courses and digital learning content. Because digital course content may become available immediately after purchase, refunds are not automatically guaranteed for every purchase.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-800 pt-6">
              <h2 className="text-xl font-bold text-white">Eligibility & Review Process</h2>
              <p className="text-sm sm:text-base text-slate-300">
                However, if a customer has a genuine and reasonable reason for requesting a refund, the request can be submitted for review.
              </p>
              <p className="text-sm sm:text-base text-slate-300 font-medium">
                Examples of situations that may be considered include:
              </p>
              <ul className="space-y-2.5 text-sm sm:text-base text-slate-300 list-disc list-inside">
                <li>Customer accidentally purchased a different course than intended.</li>
                <li>Customer intended to purchase one course but mistakenly purchased another course.</li>
                <li>A genuine technical issue prevents the customer from accessing the purchased course and the issue cannot reasonably be resolved.</li>
                <li>Another legitimate circumstance that requires support review.</li>
              </ul>
            </section>

            <section className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-sm space-y-1">
              <div className="flex items-center gap-2 font-semibold text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0" /> Important Clarification
              </div>
              <p>
                Refund requests are reviewed individually on a case-by-case basis. A refund is <strong>NOT</strong> guaranteed simply because a customer changes their mind or no longer wants the course.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-800 pt-6">
              <h2 className="text-xl font-bold text-white">How to Submit a Refund Request</h2>
              <p className="text-sm sm:text-base text-slate-300">
                For a refund request, please email our support team directly at:
              </p>
              <div className="pt-1">
                <a 
                  href={`mailto:${contactEmail}?subject=${encodeURIComponent('CourseAI Refund Request')}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors shadow-md shadow-indigo-600/20"
                >
                  <Mail className="w-4 h-4" />
                  <span>Submit Refund Request via Email</span>
                </a>
              </div>
              <p className="text-sm sm:text-base text-slate-300 pt-2 font-medium">
                Please include the following details in your email:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Full Name</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Email used for purchase</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Course name</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Purchase / payment details</span>
                </div>
                <div className="sm:col-span-2 flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Clear explanation / reason for the request</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 pt-2">
                CourseAI will review the request and respond appropriately within 24 to 48 business hours.
              </p>
            </section>

          </CardContent>
        </Card>

        {/* Contact Footer Card */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="text-base font-bold text-white">Have questions about our policy?</h4>
            <p className="text-xs text-slate-400">Feel free to reach out to our team at any time.</p>
          </div>
          <a
            href={`mailto:${contactEmail}`}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2 transition-colors shrink-0"
          >
            <Mail className="w-3.5 h-3.5" /> Email Support
          </a>
        </div>

      </div>
    </div>
  );
}
