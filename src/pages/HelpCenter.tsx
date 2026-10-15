import { HelpCircle, ArrowLeft, ShoppingCart, KeyRound, PlayCircle, FileText, AlertCircle, CreditCard, RefreshCw, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';

export function HelpCenter() {
  const contactEmail = 'chaudharyjaypal227@gmail.com';

  const helpSections = [
    {
      id: 'purchase',
      icon: ShoppingCart,
      title: 'How to purchase a course',
      content: 'Browse through our available courses on the Browse Courses or Pricing page. Click on any course to open its details page, review the curriculum, pricing, and benefits, then click the "Enroll Now" or "Buy Now" button to complete checkout through our secure payment gateway.'
    },
    {
      id: 'access',
      icon: KeyRound,
      title: 'How to access a purchased course',
      content: 'Once your purchase is completed successfully, your course is automatically linked to your account. Log into CourseAI, navigate to your Student Dashboard or "My Courses" / "My PDF Courses" from the navigation menu, and click "Start Learning" or "Access Course" to open the materials.'
    },
    {
      id: 'videos',
      icon: PlayCircle,
      title: 'How to watch course videos',
      content: 'Inside the Course Player, select any lesson from the module sidebar on the right. Video lessons will load in our high-definition responsive player. You can pause, play, adjust speed, and track your completion progress.'
    },
    {
      id: 'pdfs',
      icon: FileText,
      title: 'How to access/download PDFs',
      content: 'For courses with study materials, PDFs and bonus resources can be accessed directly from the Course Player or PDF Courses section. Click "View PDF" for browser preview or "Download PDF" / "Open Google Drive File" to save or open the file locally.'
    },
    {
      id: 'not-showing',
      icon: AlertCircle,
      title: 'What to do if course content is not showing',
      content: 'If a purchased course does not immediately appear in your dashboard: 1) Refresh the browser page. 2) Ensure you are logged in with the same email address used during purchase. 3) If content still does not appear, send your payment details and registered email to support.'
    },
    {
      id: 'payment',
      icon: CreditCard,
      title: 'Payment-related help',
      content: 'CourseAI supports secure online payments via Razorpay / Card / UPI / NetBanking. If your payment was deducted but you did not receive immediate access, payments typically reconcile automatically within a few minutes. If needed, share your transaction ID with support.'
    },
    {
      id: 'refunds',
      icon: RefreshCw,
      title: 'Refund request information',
      content: 'Because digital course content becomes available immediately after purchase, refunds are not automatically guaranteed for every purchase. However, if you experienced an accidental wrong course purchase or a genuine technical issue that cannot be resolved, you can submit a refund request for individual review.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
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
            <HelpCircle className="w-3.5 h-3.5" /> Student Support
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Help Center
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl">
            Find quick answers, learn how to manage your courses, and resolve common questions about CourseAI.
          </p>
        </div>

        {/* Help Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {helpSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.id} className="bg-slate-900/60 border-slate-800 text-slate-100 shadow-md hover:border-slate-700 transition-colors">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20 shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white">
                      {section.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {section.content}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Support Callout Box */}
        <Card className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border-indigo-900/40 text-slate-100 shadow-xl">
          <CardContent className="p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-indigo-400" /> Need more help?
                </h3>
                <p className="text-sm text-slate-400">
                  Have a specific question not listed here? Our support team is ready to help.
                </p>
              </div>
              <a 
                href={`mailto:${contactEmail}`}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-indigo-500/20 transition-all shrink-0 inline-flex items-center gap-2"
              >
                <Mail className="w-4 h-4" /> Contact Support
              </a>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
