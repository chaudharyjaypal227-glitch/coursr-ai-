import { BookOpen, ArrowLeft, Mail, Compass, Layers, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';

export function AboutUs() {
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
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/30">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Platform Overview</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                About CourseAI
              </h1>
            </div>
          </div>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            A practical digital learning platform built for creators, developers, and modern learners.
          </p>
        </div>

        {/* About Details */}
        <Card className="bg-slate-900/60 border-slate-800 text-slate-200 shadow-xl">
          <CardContent className="p-6 sm:p-8 space-y-8 leading-relaxed">
            
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-400" /> Our Focus
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                CourseAI was created to deliver straightforward, high-quality digital educational courses. We believe learning should be practical, focused, and free from unnecessary complexity. Whether you are expanding your programming skills, mastering prompt engineering, or learning digital tools, our courses provide structured curricula you can apply immediately.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-800 pt-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" /> What We Offer
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <h3 className="font-semibold text-white text-sm">Video Learning</h3>
                  <p className="text-xs text-slate-400">Step-by-step modular video lessons with structured lessons and practical walkthroughs.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <h3 className="font-semibold text-white text-sm">PDF Reference Guides</h3>
                  <p className="text-xs text-slate-400">Downloadable and readable reference handbooks, cheat sheets, and course summaries.</p>
                </div>
              </div>
            </section>

            <section className="space-y-3 border-t border-slate-800 pt-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> Direct Access & Ownership
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                When you enroll in a course on CourseAI, your materials remain organized inside your account dashboard, allowing you to learn at your own pace across mobile and desktop devices.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-800 pt-6">
              <h2 className="text-xl font-bold text-white">Contact & Inquiries</h2>
              <p className="text-sm sm:text-base text-slate-300">
                Have questions about our platform or suggestions for new courses? Reach out to our team at:
              </p>
              <div className="pt-1">
                <a 
                  href={`mailto:${contactEmail}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors shadow-md shadow-indigo-600/20"
                >
                  <Mail className="w-4 h-4" />
                  <span>Contact Our Team</span>
                </a>
              </div>
            </section>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}
