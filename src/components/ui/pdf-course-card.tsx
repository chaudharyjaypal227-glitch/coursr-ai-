import { Course } from '../../types';
import { CourseCard } from './course-card';

interface PdfCourseCardProps {
  course: Course;
  isPurchased?: boolean;
}

export function PdfCourseCard({ course, isPurchased = false }: PdfCourseCardProps) {
  return <CourseCard course={course} isEnrolled={isPurchased} />;
}
