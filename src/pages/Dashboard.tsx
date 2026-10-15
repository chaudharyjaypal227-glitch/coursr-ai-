import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BookOpen, Trophy, Clock, PlayCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserEnrollments, getCourse } from '../lib/db';
import { Course } from '../types';

export function Dashboard() {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back, {profile?.name || 'Student'}!</h1>
        <p className="text-slate-400 mt-2">Here is what's happening with your courses today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{courses.length}</div>
            <p className="text-xs text-slate-500">Total active courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Lessons</CardTitle>
            <Trophy className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-slate-500">Keep up the good work!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Learned</CardTitle>
            <Clock className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0.0</div>
            <p className="text-xs text-slate-500">This week</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold text-white mt-8 mb-4">Continue Learning</h2>
      
      {courses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
              <div className="flex flex-col sm:flex-row h-full">
                <div className="w-full sm:w-1/3 aspect-video sm:aspect-auto shrink-0 bg-slate-800">
                  {course.thumbnailUrl || course.thumbnail ? (
                    <img 
                      src={course.thumbnailUrl || course.thumbnail} 
                      alt={course.title} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-slate-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white line-clamp-1 mb-1">{course.title}</h3>
                    <p className="text-xs text-slate-400 mb-4">Instructor: {course.instructor}</p>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>0% Complete</span>
                        <span>0/{course.totalLessons || 0} Lessons</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 w-[0%]"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button size="sm" className="w-full" asChild>
                      <Link to={`/learn/${course.id}`}>
                        <PlayCircle className="w-4 h-4 mr-2" /> Resume Course
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No courses yet</h3>
          <p className="text-slate-400 mb-6 max-w-sm mx-auto">You haven't enrolled in any courses yet. Browse our catalog to start learning.</p>
          <Button asChild>
            <Link to="/courses">Browse Courses</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
