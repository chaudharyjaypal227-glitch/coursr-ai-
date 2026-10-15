import { useState, useEffect } from 'react';
import { Tag, ArrowLeft, Check, BookOpen, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Course } from '../types';
import { getPublishedCourses } from '../lib/db';
import { Card, CardContent } from '../components/ui/card';

export function Pricing() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const fetched = await getPublishedCourses();
        setCourses(fetched);
      } catch (error) {
        console.error('Failed to load pricing courses:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
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
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Tag className="w-3.5 h-3.5" /> Transparent Pricing
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Simple, Transparent Course Pricing
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            One-time purchase per course. Lifetime access to video lectures, PDF resources, and all future updates.
          </p>
        </div>

        {/* Course Pricing Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="bg-slate-900/40 border-slate-800 animate-pulse h-96" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-lg font-semibold text-white">No courses currently available</h3>
            <p className="text-sm text-slate-400">Please check back soon or browse our full catalog.</p>
            <Link 
              to="/courses"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {courses.map((course) => {
              const price = course.price ?? course.salePrice ?? 0;
              const originalPrice = course.originalPrice;
              const isBundle = course.courseType === 'bundle' || (course.files && course.files.length > 0 && course.modules && course.modules.length > 0);

              return (
                <Card 
                  key={course.id}
                  className="bg-slate-900/70 border-slate-800 text-slate-100 flex flex-col justify-between hover:border-indigo-500/40 transition-all duration-300 shadow-xl overflow-hidden group"
                >
                  <CardContent className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {course.category || 'Course'}
                        </span>
                        {isBundle && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Complete Bundle
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                        {course.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-3">
                        {course.description}
                      </p>

                      <div className="pt-2 border-t border-slate-800/80">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-extrabold text-white">
                            ₹{price}
                          </span>
                          {originalPrice && originalPrice > price && (
                            <span className="text-sm line-through text-slate-500">
                              ₹{originalPrice}
                            </span>
                          )}
                          <span className="text-xs text-slate-400 ml-auto">One-time payment</span>
                        </div>
                      </div>

                      {/* Course inclusions */}
                      <ul className="space-y-2 pt-2 text-xs text-slate-300">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Full lifetime course access</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{course.totalLessons || (course.modules?.reduce((a, b) => a + (b.lessons?.length || 0), 0)) || 'Comprehensive'} lessons & updates</span>
                        </li>
                        {course.files && course.files.length > 0 && (
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Downloadable PDF guides & materials</span>
                          </li>
                        )}
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Mobile, tablet & desktop access</span>
                        </li>
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                      <Link
                        to={`/courses/${course.id}`}
                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-colors"
                      >
                        <span>View Course & Enroll</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Guarantee Banner */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Safe & Secure Payment</h4>
              <p className="text-xs text-slate-400">Encrypted checkout with instant course activation on your account.</p>
            </div>
          </div>
          <Link
            to="/courses"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
          >
            View All Courses
          </Link>
        </div>

      </div>
    </div>
  );
}
