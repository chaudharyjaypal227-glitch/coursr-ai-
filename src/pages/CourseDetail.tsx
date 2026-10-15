import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { 
  Clock, 
  BookOpen, 
  Star, 
  CheckCircle, 
  PlayCircle, 
  BarChart, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  FileText, 
  Download, 
  Lock, 
  Layers, 
  Video, 
  Archive, 
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Course, CourseModule, CourseFile, DEFAULT_COURSE_THUMBNAIL } from '../types';
import { getCourse, getModules, checkEnrollment, enrollUser, normalizePdfCourseFiles, getVerifiedCourseFileDownload } from '../lib/db';
import { isGoogleDriveUrl, getGoogleDrivePreviewUrl, isYouTubeUrl } from '../lib/mediaUtils';
import { initiateCoursePayment } from '../lib/razorpay';
import { useAuth } from '../contexts/AuthContext';

export function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [courseFiles, setCourseFiles] = useState<CourseFile[]>([]);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'curriculum' | 'files'>('curriculum');

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const fetchedCourse = await getCourse(id);
        setCourse(fetchedCourse);
        
        if (fetchedCourse) {
          const fetchedModules = await getModules(id);
          setModules(fetchedModules);
          if (fetchedModules.length > 0) {
            setExpandedModule(fetchedModules[0].id);
          }

          const files = normalizePdfCourseFiles(fetchedCourse);
          setCourseFiles(files);

          if (files.length > 0 && (!fetchedModules || fetchedModules.length === 0)) {
            setActiveTab('files');
          }
        }
        
        if (user) {
          const enrolled = await checkEnrollment(user.uid, id);
          setIsEnrolled(enrolled);
        }
      } catch (error) {
        console.error("Failed to load course details", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, user]);

  const toggleModule = (moduleId: string) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const handleEnroll = async () => {
    if (isEnrolled) {
      navigate(`/learn/${id}`);
      return;
    } 

    if (!user) {
      navigate('/login');
      return;
    }

    if (!course) return;
    
    setPaymentMessage(null);
    setIsEnrolling(true);

    try {
      await initiateCoursePayment({
        course,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          phoneNumber: user.phoneNumber,
        },
        onSuccess: ({ paymentId }) => {
          setIsEnrolled(true);
          setIsEnrolling(false);
          setPaymentMessage({
            type: 'success',
            text: `Payment successful! Access granted.`
          });
          setTimeout(() => {
            navigate(`/learn/${id}`);
          }, 1000);
        },
        onFailure: (errMsg) => {
          setIsEnrolling(false);
          setPaymentMessage({
            type: 'error',
            text: errMsg || 'Payment was cancelled or failed. Please try again.'
          });
        },
        onCancel: () => {
          setIsEnrolling(false);
          setPaymentMessage({
            type: 'error',
            text: 'Payment was cancelled or failed. Please try again.'
          });
        }
      });
    } catch (error: any) {
      console.error("Enrollment failed:", error);
      setIsEnrolling(false);
      setPaymentMessage({
        type: 'error',
        text: 'Payment was cancelled or failed. Please try again.'
      });
    }
  };

  const handleDownloadFile = async (file: CourseFile) => {
    if (!user || !id) {
      navigate('/login');
      return;
    }
    if (!isEnrolled) {
      alert("Please enroll in this course to download its resources.");
      return;
    }

    setDownloadingFileId(file.id);
    try {
      const verified = await getVerifiedCourseFileDownload(user.uid, id, file.id);
      if (!verified || !verified.url) {
        alert("Verification failed. Please ensure you are enrolled.");
        return;
      }

      const link = document.createElement('a');
      link.href = verified.url;
      link.download = verified.fileName || file.name;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download error:", err);
      alert("Could not start download. Please try again.");
    } finally {
      setDownloadingFileId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <Button asChild>
            <Link to="/courses">Back to Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  const price = course.price ?? course.salePrice ?? 0;
  const originalPrice = course.originalPrice;
  const totalLessons = course.totalLessons || modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const isBundle = (courseFiles.length > 0 && modules.length > 0) || course.courseType === 'bundle';
  const isPdfOnly = (courseFiles.length > 0 && modules.length === 0) || course.courseType === 'pdf';

  return (
    <div className="bg-slate-950 min-h-screen pb-24">
      {/* Header Banner */}
      <div className="bg-slate-900 border-b border-slate-800 pt-12 pb-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium mb-6">
              <span className="bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-md text-xs font-semibold">
                {course.category || 'General'}
              </span>
              
              {isBundle ? (
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Video + PDF Bundle
                </span>
              ) : isPdfOnly ? (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> PDF Handbook
                </span>
              ) : (
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                  <Video className="w-3.5 h-3.5" /> Video Course
                </span>
              )}

              {course.level && (
                <span className="text-slate-400 flex items-center text-xs">
                  <BarChart className="w-3.5 h-3.5 mr-1" /> {course.level}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              {course.title}
            </h1>
            
            <p className="text-base md:text-lg text-slate-300 mb-8 leading-relaxed">
              {course.shortDescription}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                <Star className="w-5 h-5 fill-current" />
                <span>{course.rating || 4.9}</span>
                <span className="text-slate-500 font-normal">({course.reviews || 320} reviews)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center text-xs font-bold text-indigo-400">
                  {course.instructor ? course.instructor[0] : 'C'}
                </div>
                <span>Created by <span className="text-white font-medium">{course.instructor || 'CourseAI Team'}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="grid lg:grid-cols-3 gap-12 relative items-start">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* What you'll learn */}
            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
              <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  What you'll learn & master
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {course.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Description */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Course Overview & Syllabus</h2>
              <div className="prose prose-invert max-w-none text-slate-300 text-base leading-relaxed bg-slate-900/30 p-6 rounded-2xl border border-slate-800/80">
                <p className="whitespace-pre-line">{course.description}</p>
              </div>
            </section>

            {/* Content Switcher Tabs (if both videos and files exist) */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-4">
                  {modules.length > 0 && (
                    <button
                      onClick={() => setActiveTab('curriculum')}
                      className={`text-lg font-bold pb-2 border-b-2 transition-colors flex items-center gap-2 ${
                        activeTab === 'curriculum'
                          ? 'text-white border-indigo-500'
                          : 'text-slate-500 border-transparent hover:text-slate-300'
                      }`}
                    >
                      <Video className="w-5 h-5" />
                      Video Curriculum ({totalLessons} lessons)
                    </button>
                  )}
                  {courseFiles.length > 0 && (
                    <button
                      onClick={() => setActiveTab('files')}
                      className={`text-lg font-bold pb-2 border-b-2 transition-colors flex items-center gap-2 ${
                        activeTab === 'files'
                          ? 'text-white border-indigo-500'
                          : 'text-slate-500 border-transparent hover:text-slate-300'
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                      Downloadable Materials ({courseFiles.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Tab Content: Video Curriculum */}
              {activeTab === 'curriculum' && modules.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span>{modules.length} modules • {totalLessons} total lessons</span>
                    <span>{course.duration || 'Full Lifetime Access'}</span>
                  </div>

                  <div className="space-y-3">
                    {modules.map((module, index) => (
                      <div key={module.id} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50">
                        <button 
                          className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-slate-800/50 transition-colors"
                          onClick={() => toggleModule(module.id)}
                        >
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className="flex items-center justify-center w-7 h-7 rounded bg-indigo-950 text-indigo-400 text-xs font-bold border border-indigo-800/50">
                              {index + 1}
                            </div>
                            <h3 className="text-base font-semibold text-white">{module.title}</h3>
                          </div>
                          <div className="flex items-center gap-3 text-slate-400">
                            <span className="text-xs hidden sm:inline-block">{module.lessons?.length || 0} lessons</span>
                            {expandedModule === module.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </button>
                        
                        {expandedModule === module.id && module.lessons && (
                          <div className="border-t border-slate-800 bg-slate-950/60 divide-y divide-slate-900">
                            {module.lessons.map((lesson, lessonIndex) => (
                              <div key={lesson.id} className="flex items-center justify-between p-3.5 pl-6 md:pl-14 hover:bg-slate-900/50 transition-colors">
                                <div className="flex items-center gap-3">
                                  <PlayCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                                  <span className="text-slate-300 text-sm font-medium">{lessonIndex + 1}. {lesson.title}</span>
                                  {lesson.isFree && (
                                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-semibold">
                                      Free Preview
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-slate-500">{lesson.duration || '10:00'}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab Content: Files & Resources */}
              {(activeTab === 'files' || modules.length === 0) && courseFiles.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span>{courseFiles.length} downloadable resource {courseFiles.length === 1 ? 'file' : 'files'}</span>
                    <span>High-speed secure downloads</span>
                  </div>

                  <div className="grid gap-3">
                    {courseFiles.map((file, idx) => (
                      <div 
                        key={file.id || idx}
                        className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center shrink-0">
                            {file.type === 'zip' || file.name.endsWith('.zip') ? (
                              <Archive className="w-5 h-5 text-amber-400" />
                            ) : (
                              <FileText className="w-5 h-5 text-red-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-white truncate">{file.name}</h4>
                            <p className="text-xs text-slate-400 truncate">
                              {(isGoogleDriveUrl(file.downloadUrl) || file.source === 'google_drive') ? 'Google Drive Resource' : (file.description || `${file.type?.toUpperCase() || 'DOCUMENT'} study material`)}
                              {file.size ? ` • ${(file.size / (1024 * 1024)).toFixed(1)} MB` : ''}
                            </p>
                          </div>
                        </div>

                        {isEnrolled ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              size="sm"
                              onClick={() => handleDownloadFile(file)}
                              disabled={downloadingFileId === file.id}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs shrink-0"
                            >
                              {downloadingFileId === file.id ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                              ) : (
                                <Download className="w-4 h-4 mr-1.5" />
                              )}
                              Download
                            </Button>
                            {(isGoogleDriveUrl(file.downloadUrl) || file.source === 'google_drive') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const preview = getGoogleDrivePreviewUrl(file.downloadUrl) || file.previewUrl || file.downloadUrl;
                                  window.open(preview, '_blank', 'noopener,noreferrer');
                                }}
                                className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs shrink-0"
                              >
                                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                                Drive
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 shrink-0">
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Unlock on enrollment</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border border-slate-800 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl -mt-36">
              <div className="aspect-video relative bg-slate-950">
                <img 
                  src={course.thumbnailUrl || course.thumbnail || DEFAULT_COURSE_THUMBNAIL} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_COURSE_THUMBNAIL;
                  }}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button 
                    onClick={handleEnroll}
                    className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors shadow-xl"
                  >
                    <PlayCircle className="w-8 h-8 text-white ml-1" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-3xl md:text-4xl font-extrabold text-white">₹{price}</span>
                    {originalPrice && originalPrice > price && (
                      <span className="text-base text-slate-500 line-through">₹{originalPrice}</span>
                    )}
                  </div>
                  <span className="text-xs text-emerald-400 font-medium">Instant Lifetime Access • Free Updates</span>
                </div>

                <div className="space-y-3">
                  {paymentMessage && (
                    <div 
                      className={`p-3 rounded-lg text-xs font-medium flex items-start gap-2 border ${
                        paymentMessage.type === 'success' 
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                          : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {paymentMessage.type === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <span>{paymentMessage.text}</span>
                    </div>
                  )}

                  <Button 
                    className={`w-full h-12 text-base font-bold shadow-lg ${
                      isEnrolled 
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white" 
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
                    }`}
                    onClick={handleEnroll} 
                    disabled={isEnrolling}
                  >
                    {isEnrolling ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    {isEnrolled ? (
                      <span className="flex items-center gap-2">
                        Go to Learning Portal <ArrowRight className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        {price > 0 ? `Pay ₹${price} & Enroll` : 'Enroll Now'} <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Razorpay Test Mode • Secure Checkout</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-3.5">
                  <h4 className="font-semibold text-white text-sm">Included with this course:</h4>
                  
                  {course.duration && (
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{course.duration} comprehensive instruction</span>
                    </div>
                  )}
                  {totalLessons > 0 && (
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <Video className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{totalLessons} full HD streaming lessons</span>
                    </div>
                  )}
                  {courseFiles.length > 0 && (
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{courseFiles.length} downloadable PDF & source code files</span>
                    </div>
                  )}
                  {course.benefits && course.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs text-slate-300">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
