import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { 
  ArrowLeft, 
  PlayCircle, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  FileText, 
  Download, 
  Archive, 
  Layers, 
  ExternalLink,
  AlertTriangle,
  Info,
  HelpCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { 
  getCourse, 
  getModules, 
  checkEnrollment, 
  normalizePdfCourseFiles, 
  getVerifiedCourseFileDownload 
} from '../lib/db';
import { 
  getYouTubeEmbedUrl, 
  isYouTubeUrl, 
  getYouTubeVideoId, 
  isGoogleDriveUrl, 
  getGoogleDrivePreviewUrl, 
  getGoogleDriveDownloadUrl 
} from '../lib/mediaUtils';
import { Course, CourseModule, Lesson, CourseFile } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function CoursePlayer() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user, profile } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [courseFiles, setCourseFiles] = useState<CourseFile[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [activeTab, setActiveTab] = useState<'lessons' | 'resources'>('lessons');
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [fileNotice, setFileNotice] = useState<{ message: string; type: 'info' | 'warning' | 'error'; fileId?: string } | null>(null);

  useEffect(() => {
    async function loadCourseData() {
      if (!courseId || !user) return;
      try {
        const enrolled = await checkEnrollment(user.uid, courseId);
        const isAdmin = profile?.role === 'admin' || user.email === 'chaudharyjaypal227@gmail.com';
        
        if (!enrolled && !isAdmin) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        const fetchedCourse = await getCourse(courseId);
        if (fetchedCourse) {
          setCourse(fetchedCourse);
          const fetchedModules = await getModules(courseId);
          setModules(fetchedModules);

          const files = normalizePdfCourseFiles(fetchedCourse);
          setCourseFiles(files);
          
          if (fetchedModules.length > 0 && fetchedModules[0].lessons?.length > 0) {
            setCurrentLesson(fetchedModules[0].lessons[0]);
          } else if (files.length > 0) {
            setActiveTab('resources');
          }
        }
      } catch (error) {
        console.error("Failed to load course for player", error);
        setAccessDenied(true);
      } finally {
        setLoading(false);
      }
    }
    loadCourseData();
  }, [courseId, user, profile]);

  const allLessons = modules.flatMap(m => m.lessons || []);
  const currentLessonIndex = currentLesson ? allLessons.findIndex(l => l.id === currentLesson.id) : -1;
  const totalLessonsCount = allLessons.length;
  const completedCount = Object.values(completedLessons).filter(Boolean).length;
  const progressPercent = totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;

  const handleNextLesson = () => {
    if (currentLessonIndex >= 0 && currentLessonIndex < allLessons.length - 1) {
      setCurrentLesson(allLessons[currentLessonIndex + 1]);
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLesson(allLessons[currentLessonIndex - 1]);
    }
  };

  const toggleLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }));
  };

  const handleDownloadFile = async (file: CourseFile) => {
    if (!user || !courseId) return;
    setDownloadingFileId(file.id);
    setFileNotice(null);

    const isDrive = isGoogleDriveUrl(file.downloadUrl) || file.source === 'google_drive';

    try {
      const verified = await getVerifiedCourseFileDownload(user.uid, courseId, file.id);
      
      if (verified && verified.url) {
        const downloadUrl = verified.url;

        // Trigger browser download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = verified.fileName || file.name;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (isDrive) {
          setFileNotice({
            fileId: file.id,
            type: 'info',
            message: 'Starting Google Drive download. If the file is large or access is restricted, use "Open in Google Drive" below.'
          });
        }
      } else {
        // Fallback directly
        window.open(file.downloadUrl, '_blank');
      }
    } catch (err: any) {
      console.error('Download error:', err);
      if (isDrive) {
        setFileNotice({
          fileId: file.id,
          type: 'error',
          message: "Google Drive file is not publicly accessible. Please change the file's sharing permission to Anyone with the link."
        });
      } else {
        setFileNotice({
          fileId: file.id,
          type: 'error',
          message: 'Unable to download this file. Try opening it directly.'
        });
      }
    } finally {
      setDownloadingFileId(null);
    }
  };

  const handleOpenFileDirectly = (file: CourseFile) => {
    const isDrive = isGoogleDriveUrl(file.downloadUrl) || file.source === 'google_drive';
    if (isDrive) {
      const previewUrl = getGoogleDrivePreviewUrl(file.downloadUrl) || file.previewUrl || file.downloadUrl;
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open(file.downloadUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (accessDenied || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
        <div className="text-center max-w-md bg-slate-900 p-8 rounded-2xl border border-slate-800">
          <h1 className="text-2xl font-bold mb-3 text-white">Enrollment Required</h1>
          <p className="text-slate-400 text-sm mb-6">
            You need to be enrolled in this course to access the interactive player and files.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link to="/courses">All Courses</Link>
            </Button>
            <Button asChild className="bg-indigo-600 hover:bg-indigo-500">
              <Link to={`/courses/${courseId}`}>View Course Page</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Determine media player types
  const isYouTube = currentLesson?.videoUrl ? isYouTubeUrl(currentLesson.videoUrl) : false;
  const youTubeEmbedUrl = currentLesson?.videoUrl ? getYouTubeEmbedUrl(currentLesson.videoUrl) : null;
  const isDirectVideo = currentLesson?.videoUrl && !isYouTube;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-slate-800 bg-slate-950 text-white z-10">
        <div className="flex items-center gap-4">
          <Link to={`/courses/${course.id}`} className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Course Overview</span>
          </Link>
          <div className="h-4 w-px bg-slate-800"></div>
          <h1 className="font-semibold text-sm md:text-base truncate max-w-xs md:max-w-md">{course.title}</h1>
        </div>
        
        <div className="flex items-center gap-4 text-xs">
          {totalLessonsCount > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-slate-400 hidden sm:inline">Progress: {progressPercent}%</span>
              <div className="w-20 md:w-28 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        {/* Media & Video Player Area */}
        <div className="flex-1 flex flex-col relative bg-black">
          {currentLesson?.videoUrl ? (
            <div className="relative w-full aspect-video lg:h-full lg:max-h-[calc(100vh-8rem)] bg-black flex items-center justify-center">
              {isYouTube ? (
                youTubeEmbedUrl ? (
                  <div className="w-full h-full aspect-video">
                    <iframe
                      src={youTubeEmbedUrl}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                      title={currentLesson.title}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-slate-300 max-w-md space-y-3">
                    <AlertTriangle className="w-10 h-10 text-amber-400" />
                    <h3 className="text-base font-semibold text-white">Invalid YouTube video link.</h3>
                    <p className="text-xs text-slate-400">
                      The video link provided for this lesson is invalid or formatted incorrectly. Please notify the instructor.
                    </p>
                  </div>
                )
              ) : isDirectVideo ? (
                <video
                  src={currentLesson.videoUrl}
                  controls
                  playsInline
                  className="w-full h-full max-h-[calc(100vh-10rem)] object-contain"
                  poster={course.thumbnail}
                >
                  Your browser does not support video playback.
                </video>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <PlayCircle className="w-10 h-10 text-slate-600 mb-2" />
                  <p className="text-xs">No playable video attached to this lesson.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950 border-b border-slate-800 lg:border-b-0 min-h-[350px]">
              <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center mb-4 text-indigo-400">
                <FileText className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Digital Handbook & Materials</h2>
              <p className="text-sm text-slate-400 max-w-md mb-6">
                This course includes complete PDF manuals and downloadable materials. Select a resource from the sidebar to access.
              </p>
              {courseFiles.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button 
                    onClick={() => handleDownloadFile(courseFiles[0])}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Primary Manual ({courseFiles[0].name})
                  </Button>
                  {(isGoogleDriveUrl(courseFiles[0].downloadUrl) || courseFiles[0].source === 'google_drive') && (
                    <Button 
                      variant="outline"
                      onClick={() => handleOpenFileDirectly(courseFiles[0])}
                      className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Google Drive File
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Player Navigation Controls */}
          {currentLesson && (
            <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between shrink-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-slate-900 border-slate-800 text-xs"
                onClick={handlePrevLesson}
                disabled={currentLessonIndex <= 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous Lesson
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => currentLesson && toggleLessonComplete(currentLesson.id)}
                className={`text-xs ${
                  completedLessons[currentLesson.id] 
                    ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30' 
                    : 'text-slate-300 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <CheckCircle className={`w-4 h-4 mr-1.5 ${completedLessons[currentLesson.id] ? 'fill-emerald-500 text-slate-950' : ''}`} />
                {completedLessons[currentLesson.id] ? 'Completed' : 'Mark as Complete'}
              </Button>

              <Button 
                size="sm" 
                className="bg-indigo-600 hover:bg-indigo-500 text-xs"
                onClick={handleNextLesson}
                disabled={currentLessonIndex >= allLessons.length - 1}
              >
                Next Lesson <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar / Curriculum & Resources */}
        <div className="w-full lg:w-96 border-l border-slate-800 bg-slate-950 flex flex-col shrink-0 lg:max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Tabs */}
          <div className="p-3 border-b border-slate-800 flex items-center gap-2 bg-slate-900/60">
            {allLessons.length > 0 && (
              <button
                onClick={() => setActiveTab('lessons')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'lessons'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <PlayCircle className="w-3.5 h-3.5" />
                Lessons ({allLessons.length})
              </button>
            )}
            {courseFiles.length > 0 && (
              <button
                onClick={() => setActiveTab('resources')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'resources'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                PDFs & Files ({courseFiles.length})
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-slate-900">
            {activeTab === 'lessons' ? (
              modules.map((module, mIndex) => (
                <div key={module.id} className="border-b border-slate-800/40">
                  <div className="p-3.5 bg-slate-900/40">
                    <h3 className="font-semibold text-slate-300 text-xs uppercase tracking-wider">
                      Module {mIndex + 1}: {module.title}
                    </h3>
                  </div>
                  <div>
                    {module.lessons && module.lessons.map((lesson, lIndex) => {
                      const isCurrent = currentLesson?.id === lesson.id;
                      const isCompleted = completedLessons[lesson.id];
                      return (
                        <button 
                          key={lesson.id} 
                          onClick={() => setCurrentLesson(lesson)}
                          className={`w-full text-left p-3.5 flex gap-3 hover:bg-slate-900/80 transition-colors border-l-2 ${
                            isCurrent ? 'bg-indigo-950/40 border-indigo-500' : 'border-transparent'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
                            ) : (
                              <PlayCircle className={`w-4 h-4 ${isCurrent ? 'text-indigo-400' : 'text-slate-600'}`} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs leading-snug truncate ${isCurrent ? 'text-white font-semibold' : 'text-slate-400'}`}>
                              {lIndex + 1}. {lesson.title}
                            </p>
                            <span className="text-[11px] text-slate-500 block mt-0.5">{lesson.duration || '10:00'}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 space-y-4">
                <p className="text-xs text-slate-400">
                  All included course resources, PDF guides, and downloadable files:
                </p>

                {fileNotice && (
                  <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                    fileNotice.type === 'error' 
                      ? 'bg-red-500/10 border-red-500/30 text-red-300' 
                      : fileNotice.type === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                  }`}>
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p>{fileNotice.message}</p>
                    </div>
                  </div>
                )}

                {courseFiles.map((file, fIndex) => {
                  const isDrive = isGoogleDriveUrl(file.downloadUrl) || file.source === 'google_drive';
                  return (
                    <div 
                      key={file.id || fIndex}
                      className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                          {file.type === 'zip' || file.name.endsWith('.zip') ? (
                            <Archive className="w-4 h-4 text-amber-400" />
                          ) : (
                            <FileText className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-semibold text-white truncate">{file.name}</h4>
                          <p className="text-[10px] text-slate-400 truncate">
                            {isDrive ? 'Google Drive Resource' : (file.description || file.type?.toUpperCase() || 'FILE')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleDownloadFile(file)}
                          disabled={downloadingFileId === file.id}
                          className="flex-1 h-8 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                        >
                          {downloadingFileId === file.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                          ) : (
                            <Download className="w-3.5 h-3.5 mr-1.5" />
                          )}
                          Download
                        </Button>

                        {isDrive && (
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenFileDirectly(file)}
                            className="h-8 text-xs border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800"
                            title="Open Google Drive File"
                          >
                            <ExternalLink className="w-3.5 h-3.5 mr-1" />
                            Open
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
