import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  Loader2, 
  Search, 
  Eye, 
  EyeOff, 
  Video, 
  FileText, 
  Layers, 
  ExternalLink,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { getAllCourses, updateCourse, deleteCourse } from '../../lib/db';
import { Course } from '../../types';

export function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    setLoading(true);
    try {
      const fetchedCourses = await getAllCourses();
      setCourses(fetchedCourses);
    } catch (error) {
      console.error("Failed to load courses:", error);
    } finally {
      setLoading(false);
    }
  }

  const togglePublish = async (course: Course) => {
    const newStatus = !course.published;
    try {
      await updateCourse(course.id, { 
        published: newStatus,
        status: newStatus ? 'published' : 'unpublished'
      });
      setCourses(courses.map(c => c.id === course.id ? { ...c, published: newStatus, status: newStatus ? 'published' : 'unpublished' } : c));
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update publication status.");
    }
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCourse(courseToDelete.id);
      setCourses(courses.filter(c => c.id !== courseToDelete.id));
      setCourseToDelete(null);
    } catch (error) {
      console.error("Failed to delete course", error);
      alert("Failed to delete course.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.instructor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (typeFilter === 'video') {
      return course.courseType === 'video' || ((course.modules?.length || 0) > 0 && (!course.files || course.files.length === 0));
    }
    if (typeFilter === 'pdf') {
      return course.courseType === 'pdf' || ((!course.modules || course.modules.length === 0) && ((course.files?.length || 0) > 0 || Boolean(course.pdfFileUrl)));
    }
    if (typeFilter === 'bundle') {
      return course.courseType === 'bundle' || ((course.modules?.length || 0) > 0 && ((course.files?.length || 0) > 0 || Boolean(course.pdfFileUrl)));
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Delete Modal */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Delete Course</h3>
            </div>
            <p className="text-slate-300 text-sm">
              Are you sure you want to delete <span className="font-bold text-white">"{courseToDelete.title}"</span>? This will permanently remove the course, modules, and associated files.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setCourseToDelete(null)}
                disabled={isDeleting}
                className="border-slate-700 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-500 text-white"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Trash2 className="w-4 h-4 mr-1.5" />}
                Delete Course
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Unified Course Catalog
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Course Management</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage Video masterclasses, PDF handbooks, and bundle resources.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
            <Link to="/admin/courses/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Course
            </Link>
          </Button>
        </div>
      </div>

      <Card className="bg-slate-900/60 border-slate-800">
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input 
                placeholder="Search by title, instructor, category..." 
                className="pl-9 bg-slate-950 border-slate-800 h-10 text-white text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Type tabs */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  typeFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({courses.length})
              </button>
              <button
                onClick={() => setTypeFilter('video')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                  typeFilter === 'video' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" /> Video
              </button>
              <button
                onClick={() => setTypeFilter('pdf')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                  typeFilter === 'pdf' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> PDF
              </button>
              <button
                onClick={() => setTypeFilter('bundle')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                  typeFilter === 'bundle' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Bundle
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th scope="col" className="px-6 py-4">Course Info</th>
                  <th scope="col" className="px-4 py-4">Format</th>
                  <th scope="col" className="px-4 py-4">Instructor</th>
                  <th scope="col" className="px-4 py-4">Price</th>
                  <th scope="col" className="px-4 py-4">Status</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                      <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-indigo-500" />
                      Loading catalog...
                    </td>
                  </tr>
                ) : filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => {
                    const isPublished = course.published ?? (course.status === 'published');
                    const hasVideos = (course.modules?.length || 0) > 0;
                    const hasFiles = (course.files?.length || 0) > 0 || Boolean(course.pdfFileUrl);
                    const courseType = course.courseType || (hasVideos && hasFiles ? 'bundle' : hasFiles ? 'pdf' : 'video');
                    const price = course.price ?? course.salePrice ?? 0;

                    return (
                      <tr key={course.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="h-12 w-20 overflow-hidden rounded-lg bg-slate-950 shrink-0 border border-slate-800">
                              {course.thumbnail || course.thumbnailUrl ? (
                                <img 
                                  src={course.thumbnailUrl || course.thumbnail} 
                                  alt="" 
                                  className="h-full w-full object-cover" 
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600 text-[10px]">No Thumbnail</div>
                              )}
                            </div>
                            <div className="min-w-0 max-w-xs md:max-w-sm">
                              <div className="font-semibold text-white truncate text-sm">{course.title}</div>
                              <div className="text-xs text-slate-400 truncate mt-0.5">{course.category || 'General'}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          {courseType === 'bundle' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              <Layers className="w-3 h-3" /> Bundle
                            </span>
                          ) : courseType === 'pdf' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <FileText className="w-3 h-3" /> PDF Handbook
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              <Video className="w-3 h-3" /> Video
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4 text-xs text-slate-300">{course.instructor || 'Instructor'}</td>
                        
                        <td className="px-4 py-4 font-semibold text-white text-xs">
                          ₹{price}
                        </td>

                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isPublished 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                            {isPublished ? 'Live' : 'Draft'}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-white"
                            title={isPublished ? "Set to Draft" : "Publish to Catalog"}
                            onClick={() => togglePublish(course)}
                          >
                            {isPublished ? <EyeOff className="h-4 w-4 text-amber-400" /> : <Eye className="h-4 w-4 text-emerald-400" />}
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-indigo-400" 
                            asChild
                            title="Edit Course"
                          >
                            <Link to={`/admin/courses/new?id=${course.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>

                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-white" 
                            asChild
                            title="Public Course Page"
                          >
                            <Link to={`/courses/${course.id}`} target="_blank">
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>

                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-red-400" 
                            onClick={() => setCourseToDelete(course)}
                            title="Delete Course"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                      No courses match your filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
