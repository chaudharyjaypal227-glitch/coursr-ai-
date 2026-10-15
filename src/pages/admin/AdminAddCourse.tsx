import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { 
  PlusCircle, 
  Trash2, 
  Loader2, 
  Save, 
  Video, 
  FileText, 
  Layers, 
  PlayCircle, 
  Archive, 
  Plus, 
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  createCourse, 
  updateCourse, 
  saveModulesAndLessons, 
  getCourse, 
  getModules, 
  normalizePdfCourseFiles 
} from '../../lib/db';
import { 
  isYouTubeUrl, 
  validateYouTubeUrl, 
  getYouTubeVideoId, 
  isGoogleDriveUrl, 
  validateGoogleDriveUrl, 
  getGoogleDriveFileId 
} from '../../lib/mediaUtils';
import { useAuth } from '../../contexts/AuthContext';
import { Course, CourseModule, CourseFile, CourseType } from '../../types';

export function AdminAddCourse() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('id');
  const initialTypeParam = searchParams.get('type') as CourseType | null;
  const { profile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!courseId);
  const [activeSection, setActiveSection] = useState<'details' | 'curriculum' | 'files' | 'outcomes'>('details');
  
  const [courseData, setCourseData] = useState<Partial<Course>>({
    title: '',
    shortDescription: '',
    description: '',
    category: 'Full Stack Development',
    level: 'All Levels',
    price: 499,
    originalPrice: 1999,
    salePrice: 499,
    thumbnail: '',
    instructor: 'Jaypal Chaudhary',
    courseType: initialTypeParam || 'bundle',
    whatYouWillLearn: [
      'Master core architectural fundamentals',
      'Build end-to-end production ready projects',
      'Download complete reference source code and diagrams'
    ],
    benefits: [
      'Instant Lifetime Access',
      'Downloadable PDF Architecture Handbook',
      'Full Source Code Archive Included'
    ],
  });

  const [modules, setModules] = useState<CourseModule[]>(() => {
    if (initialTypeParam === 'pdf') return [];
    return [
      { 
        id: 'm_1', 
        title: 'Module 1: Introduction & Environment Setup', 
        order: 0,
        lessons: [
          { id: 'l_1', title: '1. Course Overview and Architecture', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '12:30', order: 0, isFree: true },
          { id: 'l_2', title: '2. Tooling Setup & Repository Walkthrough', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '18:45', order: 1, isFree: false }
        ] 
      }
    ];
  });

  const [courseFiles, setCourseFiles] = useState<CourseFile[]>([
    {
      id: 'f_1',
      name: 'Course-Handbook-and-CheatSheets.pdf',
      downloadUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf',
      type: 'pdf',
      description: 'Comprehensive 120-page illustrated PDF reference handbook.',
      size: 4500000
    }
  ]);

  useEffect(() => {
    if (courseId) {
      loadCourse(courseId);
    }
  }, [courseId]);

  async function loadCourse(id: string) {
    try {
      console.log(`[AdminAddCourse] Loading course ${id}...`);
      const course = await getCourse(id);
      if (course) {
        setCourseData(course);
        const courseModules = await getModules(id);
        if (courseModules && courseModules.length > 0) {
          setModules(courseModules);
        } else if (course.modules && course.modules.length > 0) {
          setModules(course.modules);
        } else {
          setModules([]);
        }

        const files = normalizePdfCourseFiles(course);
        setCourseFiles(files);
      }
    } catch (error) {
      console.error("Failed to load course", error);
    } finally {
      setInitialLoading(false);
    }
  }

  const handleSave = async (publish: boolean) => {
    if (!courseData.title) return alert("Course title is required");
    
    setLoading(true);
    try {
      // Determine format
      const hasVideos = modules.some(m => (m.lessons || []).length > 0);
      const hasFiles = courseFiles.length > 0;
      let computedType: CourseType = courseData.courseType || 'video';
      if (hasVideos && hasFiles) computedType = 'bundle';
      else if (hasFiles && !hasVideos) computedType = 'pdf';
      else if (hasVideos && !hasFiles) computedType = 'video';

      const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

      const primaryPdf = courseFiles.find(f => f.type === 'pdf') || courseFiles[0];

      const rawThumbnail = String(courseData.thumbnailUrl || courseData.thumbnail || '').trim();

      const courseToSave: Partial<Course> = {
        ...courseData,
        thumbnail: rawThumbnail,
        thumbnailUrl: rawThumbnail,
        courseType: computedType,
        totalLessons,
        modules: modules,
        files: courseFiles,
        pdfFileUrl: primaryPdf?.downloadUrl || courseData.pdfFileUrl || '',
        pdfFileName: primaryPdf?.name || courseData.pdfFileName || '',
        pdfFileSize: primaryPdf?.size || courseData.pdfFileSize || 0,
        published: publish,
        status: publish ? 'published' : 'unpublished',
        instructor: courseData.instructor || profile?.name || 'Jaypal Chaudhary',
        whatYouWillLearn: (courseData.whatYouWillLearn || []).filter(Boolean),
        benefits: (courseData.benefits || []).filter(Boolean),
        updatedAt: new Date().toISOString()
      };

      console.log('[AdminAddCourse] Saving payload to Firestore:', courseToSave);

      let savedCourseId = courseId;

      if (courseId) {
        await updateCourse(courseId, courseToSave);
      } else {
        savedCourseId = await createCourse(courseToSave);
      }

      if (savedCourseId) {
        await saveModulesAndLessons(savedCourseId, modules);
      }

      console.log('[AdminAddCourse] Saved course successfully with ID:', savedCourseId);
      navigate('/admin/courses');
    } catch (error) {
      console.error("Error saving course", error);
      alert("Failed to save course.");
    } finally {
      setLoading(false);
    }
  };

  // Module actions
  const addModule = () => {
    setModules([
      ...modules, 
      { 
        id: `mod_${Date.now()}`, 
        title: `Module ${modules.length + 1}: New Topic`, 
        order: modules.length, 
        lessons: [
          { id: `les_${Date.now()}`, title: '1. New Lesson', videoUrl: '', duration: '10:00', order: 0, isFree: false }
        ] 
      }
    ]);
  };

  const removeModule = (moduleId: string) => {
    setModules(modules.filter(m => m.id !== moduleId));
  };

  const updateModuleTitle = (moduleId: string, title: string) => {
    setModules(modules.map(m => m.id === moduleId ? { ...m, title } : m));
  };

  const addLesson = (moduleId: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        const lessons = m.lessons || [];
        return { 
          ...m, 
          lessons: [
            ...lessons, 
            { 
              id: `les_${Date.now()}_${lessons.length}`, 
              title: `${lessons.length + 1}. Next Lesson Title`, 
              videoUrl: '', 
              duration: '10:00', 
              order: lessons.length, 
              isFree: false 
            }
          ] 
        };
      }
      return m;
    }));
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: (m.lessons || []).filter(l => l.id !== lessonId)
        };
      }
      return m;
    }));
  };

  const updateLesson = (moduleId: string, lessonId: string, field: string, value: any) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: (m.lessons || []).map(l => l.id === lessonId ? { ...l, [field]: value } : l)
        };
      }
      return m;
    }));
  };

  // File Resource Actions
  const addFile = () => {
    setCourseFiles([
      ...courseFiles,
      {
        id: `file_${Date.now()}`,
        name: 'New-Resource.pdf',
        downloadUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf',
        type: 'pdf',
        description: 'Resource handbook and study notes',
        size: 2500000
      }
    ]);
  };

  const updateFile = (fileId: string, field: keyof CourseFile, value: any) => {
    setCourseFiles(courseFiles.map(f => f.id === fileId ? { ...f, [field]: value } : f));
  };

  const removeFile = (fileId: string) => {
    setCourseFiles(courseFiles.filter(f => f.id !== fileId));
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <Link to="/admin/courses" className="text-slate-400 hover:text-white text-xs flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Courses List
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            {courseId ? 'Edit Unified Course' : 'Create Unified Course'}
          </h1>
          <p className="text-slate-400 text-sm">
            Configure video lectures, PDF architecture manuals, downloadable code repositories, and pricing.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => handleSave(false)} 
            disabled={loading}
            className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 text-xs"
          >
            Save as Draft
          </Button>
          <Button 
            onClick={() => handleSave(true)} 
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {courseId ? 'Update & Publish' : 'Publish Course'}
          </Button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSection('details')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeSection === 'details'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          1. General Info & Pricing
        </button>
        <button
          onClick={() => setActiveSection('curriculum')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeSection === 'curriculum'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          2. Video Curriculum ({modules.reduce((a, m) => a + (m.lessons?.length || 0), 0)} lessons)
        </button>
        <button
          onClick={() => setActiveSection('files')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeSection === 'files'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          3. PDF Manuals & Files ({courseFiles.length})
        </button>
        <button
          onClick={() => setActiveSection('outcomes')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeSection === 'outcomes'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          4. Outcomes & Highlights
        </button>
      </div>

      {/* SECTION 1: General Info & Pricing */}
      {activeSection === 'details' && (
        <div className="space-y-6">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardContent className="p-6 space-y-5">
              <h3 className="text-lg font-bold text-white mb-4">Basic Information</h3>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Course Title *</label>
                <Input
                  placeholder="e.g., Full-Stack Next.js 15 & AI Microservices Masterclass"
                  value={courseData.title || ''}
                  onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Short Tagline / Summary</label>
                <Input
                  placeholder="A one-sentence summary for search engines and card displays"
                  value={courseData.shortDescription || ''}
                  onChange={(e) => setCourseData({ ...courseData, shortDescription: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Full Description</label>
                <textarea
                  rows={5}
                  placeholder="Describe what this course covers in detail..."
                  value={courseData.description || ''}
                  onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <Input
                    placeholder="e.g., AI Engineering, Web Dev"
                    value={courseData.category || ''}
                    onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Difficulty Level</label>
                  <select
                    value={courseData.level || 'All Levels'}
                    onChange={(e) => setCourseData({ ...courseData, level: e.target.value })}
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-md px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Instructor Name</label>
                  <Input
                    placeholder="Instructor Name"
                    value={courseData.instructor || ''}
                    onChange={(e) => setCourseData({ ...courseData, instructor: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-300">Cover Thumbnail URL</label>
                <div className="flex gap-4 items-start">
                  <div className="flex-1 space-y-1">
                    <Input
                      placeholder="https://images.unsplash.com/photo-..."
                      value={courseData.thumbnail || courseData.thumbnailUrl || ''}
                      onChange={(e) => setCourseData({ ...courseData, thumbnail: e.target.value, thumbnailUrl: e.target.value })}
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                    <p className="text-[11px] text-slate-500">Supports direct image URLs (Unsplash, Cloudinary, AWS S3, Firebase, Imgur, etc.)</p>
                  </div>
                  {(courseData.thumbnail || courseData.thumbnailUrl) && (
                    <div className="w-24 h-16 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 shrink-0">
                      <img 
                        src={courseData.thumbnail || courseData.thumbnailUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Card */}
          <Card className="bg-slate-900/60 border-slate-800">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Pricing & Format</h3>
              
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Offer / Sale Price (₹) *</label>
                  <Input
                    type="number"
                    value={courseData.price || courseData.salePrice || 0}
                    onChange={(e) => setCourseData({ 
                      ...courseData, 
                      price: Number(e.target.value),
                      salePrice: Number(e.target.value) 
                    })}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Original / Strike Price (₹)</label>
                  <Input
                    type="number"
                    value={courseData.originalPrice || 0}
                    onChange={(e) => setCourseData({ ...courseData, originalPrice: Number(e.target.value) })}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Estimated Duration</label>
                  <Input
                    placeholder="e.g. 18.5 hours"
                    value={courseData.duration || ''}
                    onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SECTION 2: Video Curriculum */}
      {activeSection === 'curriculum' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Curriculum Modules & Video Lessons</h3>
              <p className="text-xs text-slate-400">Add chapter modules, video streaming links (YouTube/Vimeo/Direct MP4), and free preview flags.</p>
            </div>
            <Button onClick={addModule} size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Module
            </Button>
          </div>

          <div className="space-y-6">
            {modules.map((module, mIdx) => (
              <Card key={module.id} className="bg-slate-900/70 border-slate-800 overflow-hidden">
                <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-950 px-2 py-1 rounded border border-indigo-800">
                      Module {mIdx + 1}
                    </span>
                    <Input
                      value={module.title}
                      onChange={(e) => updateModuleTitle(module.id, e.target.value)}
                      placeholder="Module Title (e.g., Foundations of Cloud Infrastructure)"
                      className="bg-slate-900 border-slate-800 text-white text-sm font-semibold h-9"
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeModule(module.id)}
                    className="text-slate-500 hover:text-red-400 h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <CardContent className="p-4 space-y-3">
                  <div className="space-y-3">
                    {(module.lessons || []).map((lesson, lIdx) => {
                      const isYt = isYouTubeUrl(lesson.videoUrl || '');
                      const isValidYt = isYt && validateYouTubeUrl(lesson.videoUrl || '');
                      const ytId = isYt ? getYouTubeVideoId(lesson.videoUrl || '') : null;

                      return (
                        <div 
                          key={lesson.id} 
                          className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-2"
                        >
                          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                            <div className="flex items-center gap-2 md:w-1/3">
                              <PlayCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                              <Input
                                value={lesson.title}
                                onChange={(e) => updateLesson(module.id, lesson.id, 'title', e.target.value)}
                                placeholder={`Lesson ${lIdx + 1} Title`}
                                className="bg-slate-900 border-slate-800 text-xs text-white h-8"
                              />
                            </div>

                            <div className="flex-1">
                              <Input
                                value={lesson.videoUrl}
                                onChange={(e) => updateLesson(module.id, lesson.id, 'videoUrl', e.target.value)}
                                placeholder="YouTube link (watch, youtu.be, shorts, embed) or direct video URL"
                                className="bg-slate-900 border-slate-800 text-xs text-slate-300 h-8 font-mono"
                              />
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <Input
                                value={lesson.duration}
                                onChange={(e) => updateLesson(module.id, lesson.id, 'duration', e.target.value)}
                                placeholder="12:00"
                                className="bg-slate-900 border-slate-800 text-xs text-white h-8 w-20 text-center"
                              />
                              <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={lesson.isFree || false}
                                  onChange={(e) => updateLesson(module.id, lesson.id, 'isFree', e.target.checked)}
                                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                                />
                                <span>Free Preview</span>
                              </label>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => removeLesson(module.id, lesson.id)}
                                className="h-8 w-8 text-slate-500 hover:text-red-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>

                          {lesson.videoUrl && isYt && (
                            <div className="pl-6 flex items-center gap-2 text-[11px]">
                              {isValidYt ? (
                                <span className="text-emerald-400 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Valid YouTube video (ID: <code className="bg-slate-900 px-1 py-0.5 rounded text-[10px] text-emerald-300">{ytId}</code>)
                                </span>
                              ) : (
                                <span className="text-amber-400 flex items-center gap-1">
                                  ⚠️ Invalid YouTube video link format.
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addLesson(module.id)}
                    className="w-full mt-2 text-xs border-dashed border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Lesson to Module {mIdx + 1}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: Downloadable Materials & PDFs */}
      {activeSection === 'files' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Downloadable Materials & PDF Handbooks</h3>
              <p className="text-xs text-slate-400">Attached study guides, cheatsheet PDFs, and starter source code ZIP archives.</p>
            </div>
            <Button onClick={addFile} size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Material File
            </Button>
          </div>

          <div className="space-y-4">
            {courseFiles.map((file, fIdx) => {
              const isDrive = isGoogleDriveUrl(file.downloadUrl || '');
              const isValidDrive = isDrive && validateGoogleDriveUrl(file.downloadUrl || '');
              const driveId = isDrive ? getGoogleDriveFileId(file.downloadUrl || '') : null;

              return (
              <Card key={file.id} className="bg-slate-900/70 border-slate-800 p-4 space-y-3">
                <div className="grid md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-1 flex items-center justify-center">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-indigo-400">
                      {file.type === 'zip' ? <Archive className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                  </div>

                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[11px] text-slate-400">File Name</label>
                    <Input
                      value={file.name}
                      onChange={(e) => updateFile(file.id, 'name', e.target.value)}
                      placeholder="Handbook-Architecture.pdf"
                      className="bg-slate-950 border-slate-800 text-xs text-white h-8"
                    />
                  </div>

                  <div className="md:col-span-4 space-y-1">
                    <label className="text-[11px] text-slate-400">Download URL (Google Drive / Direct / Cloud)</label>
                    <Input
                      value={file.downloadUrl}
                      onChange={(e) => updateFile(file.id, 'downloadUrl', e.target.value)}
                      placeholder="https://drive.google.com/file/d/... or direct file link"
                      className="bg-slate-950 border-slate-800 text-xs text-slate-300 font-mono h-8"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[11px] text-slate-400">File Type</label>
                    <select
                      value={file.type || 'pdf'}
                      onChange={(e) => updateFile(file.id, 'type', e.target.value)}
                      className="w-full h-8 bg-slate-950 border border-slate-800 rounded-md px-2 text-xs text-white"
                    >
                      <option value="pdf">PDF Handbook</option>
                      <option value="zip">Source Code ZIP</option>
                      <option value="file">Other Document</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 flex items-end justify-end">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeFile(file.id)}
                      className="h-8 w-8 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Google Drive Status & Hints */}
                {file.downloadUrl && isDrive && (
                  <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800 flex flex-col gap-1 text-[11px]">
                    {isValidDrive ? (
                      <>
                        <div className="text-emerald-400 flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Valid Google Drive link (File ID: <code className="bg-slate-900 px-1 py-0.5 rounded text-[10px] text-emerald-300">{driveId}</code>)
                        </div>
                        <p className="text-slate-400 text-[10px]">
                          Note: In Google Drive, ensure the file sharing setting is set to <strong className="text-slate-200">"Anyone with the link can view"</strong> so enrolled students can download and view it smoothly.
                        </p>
                      </>
                    ) : (
                      <div className="text-amber-400 flex items-center gap-1.5">
                        ⚠️ Invalid Google Drive link format. Make sure it contains a file ID or sharing link.
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800/60">
                  <Input
                    value={file.description || ''}
                    onChange={(e) => updateFile(file.id, 'description', e.target.value)}
                    placeholder="Short description of this material..."
                    className="bg-slate-950/60 border-slate-800/80 text-xs text-slate-400 h-7"
                  />
                </div>
              </Card>
            );})}

            {courseFiles.length === 0 && (
              <div className="text-center py-10 bg-slate-900/30 rounded-xl border border-slate-800 border-dashed text-slate-500 text-xs">
                No downloadable materials added yet. Click "Add Material File" to include PDFs or ZIP kits.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: Outcomes & Benefits */}
      {activeSection === 'outcomes' && (
        <div className="space-y-6">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-base font-bold text-white">What You'll Learn (Key Takeaways)</h3>
              <div className="space-y-2">
                {(courseData.whatYouWillLearn || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <Input
                      value={item}
                      onChange={(e) => {
                        const updated = [...(courseData.whatYouWillLearn || [])];
                        updated[idx] = e.target.value;
                        setCourseData({ ...courseData, whatYouWillLearn: updated });
                      }}
                      className="bg-slate-950 border-slate-800 text-xs text-white h-8"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-red-400"
                      onClick={() => {
                        const updated = (courseData.whatYouWillLearn || []).filter((_, i) => i !== idx);
                        setCourseData({ ...courseData, whatYouWillLearn: updated });
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCourseData({ ...courseData, whatYouWillLearn: [...(courseData.whatYouWillLearn || []), ''] })}
                  className="text-xs border-slate-800 bg-slate-950 text-slate-300"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Learning Point
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-base font-bold text-white">Course Highlights & Benefits</h3>
              <div className="space-y-2">
                {(courseData.benefits || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                    <Input
                      value={item}
                      onChange={(e) => {
                        const updated = [...(courseData.benefits || [])];
                        updated[idx] = e.target.value;
                        setCourseData({ ...courseData, benefits: updated });
                      }}
                      className="bg-slate-950 border-slate-800 text-xs text-white h-8"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-red-400"
                      onClick={() => {
                        const updated = (courseData.benefits || []).filter((_, i) => i !== idx);
                        setCourseData({ ...courseData, benefits: updated });
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCourseData({ ...courseData, benefits: [...(courseData.benefits || []), ''] })}
                  className="text-xs border-slate-800 bg-slate-950 text-slate-300"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Highlight Point
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
