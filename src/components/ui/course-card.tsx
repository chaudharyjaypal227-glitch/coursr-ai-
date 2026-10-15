import { Course, DEFAULT_COURSE_THUMBNAIL } from '../../types';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, Star, FileText, Video, Layers, Sparkles } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { normalizePdfCourseFiles } from '../../lib/db';

interface CourseCardProps {
  course: Course;
  isEnrolled?: boolean;
}

export function CourseCard({ course, isEnrolled = false }: CourseCardProps) {
  const files = normalizePdfCourseFiles(course);
  const hasFiles = files.length > 0 || Boolean(course.pdfFileUrl);
  const totalLessons = course.totalLessons || course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  const hasVideos = totalLessons > 0;
  
  const isBundle = (hasFiles && hasVideos) || course.courseType === 'bundle';
  const isPdfOnly = (hasFiles && !hasVideos) || course.courseType === 'pdf';

  const price = course.price ?? course.salePrice ?? 0;
  const originalPrice = course.originalPrice;
  const thumbnailSrc = course.thumbnailUrl || course.thumbnail || DEFAULT_COURSE_THUMBNAIL;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 transition-colors duration-300">
        <div className="relative aspect-video overflow-hidden bg-slate-950">
          <img 
            src={thumbnailSrc} 
            alt={course.title} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_COURSE_THUMBNAIL;
            }}
          />
          <div className="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-md shadow">
            {course.category}
          </div>

          {/* Type Badge */}
          <div className="absolute top-3 right-3 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow border border-white/10">
            {isBundle ? (
              <span className="bg-purple-600/90 text-purple-100 flex items-center gap-1 px-1.5 py-0.5 rounded">
                <Layers className="w-3.5 h-3.5 text-purple-200" />
                Video + PDF
              </span>
            ) : isPdfOnly ? (
              <span className="bg-amber-600/90 text-amber-100 flex items-center gap-1 px-1.5 py-0.5 rounded">
                <FileText className="w-3.5 h-3.5 text-amber-200" />
                PDF Handbook
              </span>
            ) : (
              <span className="bg-blue-600/90 text-blue-100 flex items-center gap-1 px-1.5 py-0.5 rounded">
                <Video className="w-3.5 h-3.5 text-blue-200" />
                Video Course
              </span>
            )}
          </div>

          {course.featured && (
            <div className="absolute bottom-3 left-3 bg-amber-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow">
              <Sparkles className="w-3 h-3" />
              <span>Featured</span>
            </div>
          )}
        </div>
        
        <CardContent className="flex-1 p-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1 text-amber-400 font-medium text-sm">
              <Star className="w-4 h-4 fill-current" />
              <span>{course.rating || 4.9}</span>
              <span className="text-slate-500 text-xs ml-1">({course.reviews || 420})</span>
            </div>
            {course.level && (
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs">
                {course.level}
              </span>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white line-clamp-2 mb-1.5 leading-snug">
              {course.title}
            </h3>
            <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
              {course.shortDescription}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
            {course.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{course.duration}</span>
              </div>
            )}
            {totalLessons > 0 && (
              <div className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>{totalLessons} lessons</span>
              </div>
            )}
            {files.length > 0 && (
              <div className="flex items-center gap-1 text-indigo-400 font-medium">
                <FileText className="w-3.5 h-3.5" />
                <span>{files.length} {files.length === 1 ? 'file' : 'files'}</span>
              </div>
            )}
          </div>
          
          <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center text-xs text-indigo-400 font-bold">
                {course.instructor ? course.instructor[0] : 'C'}
              </div>
              <span className="text-xs font-medium text-slate-300">{course.instructor || 'CourseAI Expert'}</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-5 pt-0 flex items-center justify-between border-t border-slate-800/50 mt-auto bg-slate-900/30">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white">₹{price}</span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-slate-500 line-through">₹{originalPrice}</span>
            )}
          </div>
          <Button size="sm" asChild className={isEnrolled ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"}>
            <Link to={`/courses/${course.id}`}>
              {isEnrolled ? "Access Content" : "View Course"}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
