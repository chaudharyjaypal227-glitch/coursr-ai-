import { useState, useEffect } from 'react';
import { CourseGrid } from '../components/ui/course-grid';
import { BookOpen, Search, Loader2, Video, FileText, Layers, Sparkles } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserEnrollments, getCourse } from '../lib/db';
import { Course } from '../types';

export function MyCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'pdf' | 'bundle'>('all');

  useEffect(() => {
    async function loadEnrolledCourses() {
      if (!user) return;
      try {
        const courseIds = await getUserEnrollments(user.uid);
        const coursePromises = courseIds.map(id => getCourse(id));
        const fetchedCourses = (await Promise.all(coursePromises)).filter(Boolean) as Course[];
        setCourses(fetchedCourses);
      } catch (error) {
        console.error("Failed to load enrolled courses", error);
      } finally {
        setLoading(false);
      }
    }
    loadEnrolledCourses();
  }, [user]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (course.shortDescription || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterType === 'video') {
      return course.courseType === 'video' || ((course.modules?.length || 0) > 0 && (!course.files || course.files.length === 0));
    }
    if (filterType === 'pdf') {
      return course.courseType === 'pdf' || ((!course.modules || course.modules.length === 0) && ((course.files?.length || 0) > 0 || Boolean(course.pdfFileUrl)));
    }
    if (filterType === 'bundle') {
      return course.courseType === 'bundle' || ((course.modules?.length || 0) > 0 && ((course.files?.length || 0) > 0 || Boolean(course.pdfFileUrl)));
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Enrolled Courses</h1>
          <p className="text-slate-400">Access all your video classes, PDF handbooks, and resource kits.</p>
        </div>
        
        <div className="w-full md:w-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <Input 
            type="text" 
            placeholder="Search my courses..." 
            className="pl-10 h-11 w-full md:w-80 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 rounded-lg text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      {courses.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-slate-900/50 p-1.5 rounded-lg border border-slate-800 w-fit">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              filterType === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Courses ({courses.length})
          </button>
          <button
            onClick={() => setFilterType('video')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filterType === 'video' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" /> Videos
          </button>
          <button
            onClick={() => setFilterType('pdf')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filterType === 'pdf' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> PDF Handbooks
          </button>
          <button
            onClick={() => setFilterType('bundle')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filterType === 'bundle' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Bundles
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : courses.length > 0 ? (
        <div className="space-y-8">
          <CourseGrid courses={filteredCourses} />
          {filteredCourses.length === 0 && (
            <div className="text-center py-12 bg-slate-900/30 rounded-xl border border-slate-800">
              <p className="text-slate-400 text-sm">No courses match your filter.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-slate-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">You haven't enrolled in any courses yet</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm">
            Explore our video courses and PDF handbooks to start learning immediately.
          </p>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-500">
            <Link to="/courses">Browse Catalog</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
