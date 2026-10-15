import { Button } from '../components/ui/button';
import { CourseGrid } from '../components/ui/course-grid';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle, Sparkles, Zap, Shield, Trophy, Loader2, Video, FileText, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Course } from '../types';
import { getPublishedCourses } from '../lib/db';

export function Home() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const courses = await getPublishedCourses();
        setFeaturedCourses(courses.slice(0, 6));
      } catch (error) {
        console.error("Failed to load featured courses", error);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 lg:pt-32 lg:pb-36">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 -z-10 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[550px] h-[550px] rounded-full bg-indigo-600/15 blur-[140px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[450px] h-[450px] rounded-full bg-purple-600/15 blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-6 border border-indigo-500/20 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Unified Learning Platform • Video & PDF Masterclasses</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                Learn Practical AI & Tech. <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-teal-300">
                  Build Real Systems.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-xl leading-relaxed">
                Hands-on video lectures, downloadable architecture manuals, and code starter kits engineered for modern software developers and creators.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="h-12 px-7 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25" asChild>
                  <Link to="/courses">
                    Explore All Courses
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-7 text-sm font-medium bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800" asChild>
                  <Link to="/courses?type=pdf">
                    <FileText className="mr-2 w-4 h-4 text-amber-400" />
                    PDF Handbooks
                  </Link>
                </Button>
              </div>
              
              <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Instant Lifetime Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Downloadable PDF Blueprints</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Production Source Code</span>
                </div>
              </div>
            </motion.div>

            {/* Feature Highlights Grid */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="relative hidden lg:grid grid-cols-2 gap-4"
            >
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Video className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Full HD Video Classes</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Bite-sized, step-by-step modular video lessons with interactive chapter progression and timestamps.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 backdrop-blur-md mt-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Illustrated PDF Handbooks</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Downloadable offline architectural diagrams, cheatsheets, and production blueprints.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Hybrid Bundles</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Get the best of both worlds with video deep dives accompanied by full reference code archives.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 backdrop-blur-md mt-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Zero-Lag Streaming</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Seamless learning dashboard with instant enrollments, player progress, and fast asset downloads.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Unified Catalog Section */}
      <section className="py-16 bg-slate-950 border-t border-slate-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Featured Learning Tracks
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">Top Courses & Digital Handbooks</h2>
              <p className="text-slate-400 text-sm mt-1">
                Explore hand-picked video courses, architecture handbooks, and bundled resources.
              </p>
            </div>
            <Button variant="ghost" className="text-indigo-400 hover:text-indigo-300 text-sm" asChild>
              <Link to="/courses">View All Catalog <ArrowRight className="ml-1.5 w-4 h-4" /></Link>
            </Button>
          </div>
          
          {loading ? (
             <div className="flex justify-center items-center py-20">
               <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
             </div>
          ) : (
            <CourseGrid courses={featuredCourses} />
          )}
        </div>
      </section>

      {/* Trust & Architecture */}
      <section className="py-20 bg-slate-900/40 border-y border-slate-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">Why learn on CourseAI?</h2>
            <p className="text-slate-400 text-sm">Designed for serious learners and engineers who value clarity and execution.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Direct Execution</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                No fluff. Real code, production patterns, and practical systems ready for deployment.
              </p>
            </div>
            
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Verified Content</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                All handbooks and videos are vetted for modern framework versions (React 19, Next.js 15, Node.js).
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Lifetime Updates</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                When new chapters or updated PDF editions drop, enrolled students get instant access.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
