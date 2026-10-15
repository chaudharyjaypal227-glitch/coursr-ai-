export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  photoURL?: string;
  createdAt?: string;
  purchasedCourses?: number;
  status?: 'active' | 'inactive';
}

export type CourseType = 'video' | 'pdf' | 'bundle';

export interface CourseFile {
  id: string;
  name: string;
  type: 'pdf' | 'zip' | 'file';
  size?: number;
  downloadUrl: string;
  source?: 'google_drive' | 'firebase_storage' | 'direct';
  googleDriveFileId?: string;
  previewUrl?: string;
  storagePath?: string;
  displayOrder?: number;
  description?: string;
  downloadable?: boolean;
  uploadedAt?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  videoUrl?: string;
  videoSource?: 'youtube' | 'uploaded' | 'direct';
  youtubeVideoId?: string;
  pdfUrl?: string;
  order?: number;
  isFree?: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  order?: number;
  lessons: Lesson[];
}

export const DEFAULT_COURSE_THUMBNAIL = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80';

export interface Course {
  id: string;
  title: string;
  slug?: string;
  shortDescription: string;
  description: string;
  instructor: string;
  thumbnail: string;
  thumbnailUrl?: string; // alias for compatibility
  price: number;
  originalPrice?: number;
  salePrice?: number; // alias for compatibility
  rating?: number;
  reviews?: number;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  duration?: string;
  totalLessons?: number;
  category: string;
  courseType?: CourseType;
  status?: 'published' | 'draft' | 'unpublished';
  published?: boolean;
  featured?: boolean;
  modules?: CourseModule[];
  files?: CourseFile[]; // Downloadable PDFs, source code ZIPs, resources
  pdfFileUrl?: string;  // direct single PDF URL if provided
  pdfFileName?: string;
  pdfFileSize?: number;
  pages?: number | string;
  benefits?: string[];
  whatYouWillLearn?: string[];
  createdAt?: string;
  publishedAt?: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  userId?: string;
  userEmail?: string;
  studentId?: string;
  studentName?: string;
  courseId: string;
  courseTitle?: string;
  courseType?: 'video' | 'pdf' | 'bundle';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date?: string;
  createdAt?: string;
  paymentId?: string;
  paymentStatus?: string;
}

// Backward compatibility types
export type PdfCourse = Course;
export interface PdfPurchase extends Order {
  pdfCourseId: string;
  purchasedAt: string;
}

