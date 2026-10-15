import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  writeBatch 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Course, CourseModule, Lesson, Order, CourseFile, PdfPurchase } from '../types';
import { DEFAULT_COURSES } from '../data/courses';
import { 
  getGoogleDriveDownloadUrl, 
  getGoogleDrivePreviewUrl, 
  getGoogleDriveFileId, 
  isGoogleDriveUrl, 
  getFileSourceType,
  getYouTubeVideoId,
  getVideoSourceType 
} from './mediaUtils';

// Helper to sanitize an individual course file to safe Firestore primitive fields
export function sanitizeCourseFile(file: any, index = 0): CourseFile {
  const downloadUrl = String(file?.downloadUrl || file?.url || '');
  const detectedDriveId = getGoogleDriveFileId(downloadUrl) || file?.googleDriveFileId;
  const source = file?.source || getFileSourceType(downloadUrl);

  const rawType = String(file?.type || '').toLowerCase();
  const rawName = String(file?.name || '').toLowerCase();
  let type: 'pdf' | 'zip' | 'file' = 'pdf';
  if (rawType === 'zip' || rawName.endsWith('.zip')) {
    type = 'zip';
  } else if (rawType === 'file') {
    type = 'file';
  }

  const result: CourseFile = {
    id: String(file?.id || `file_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`),
    name: String(file?.name || `file_${index + 1}`),
    type: type,
    size: Number(file?.size || 0),
    downloadUrl: downloadUrl,
    source: source,
    displayOrder: Number(file?.displayOrder || index + 1),
    downloadable: file?.downloadable !== false,
    description: String(file?.description || ''),
    uploadedAt: String(file?.uploadedAt || new Date().toISOString()),
  };

  if (detectedDriveId) {
    result.googleDriveFileId = detectedDriveId;
    result.previewUrl = getGoogleDrivePreviewUrl(detectedDriveId) || undefined;
  } else if (file?.previewUrl) {
    result.previewUrl = String(file.previewUrl);
  }

  if (file?.storagePath) {
    result.storagePath = String(file.storagePath);
  }
  return result;
}

// Flatten and clean course files to prevent nested arrays or invalid entities
export function sanitizeCourseFiles(files: any): CourseFile[] {
  if (!files) return [];
  const flat = Array.isArray(files) ? files.flat(Infinity) : Object.values(files);
  return flat
    .filter((f) => f && typeof f === 'object' && !(f instanceof File) && !(f instanceof Blob))
    .map((f, i) => sanitizeCourseFile(f, i))
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

// Helper to sanitize an individual lesson
export function sanitizeLesson(lesson: any, index = 0): Lesson {
  const videoUrl = String(lesson?.videoUrl || '');
  const videoSource = lesson?.videoSource || getVideoSourceType(videoUrl);
  const youtubeVideoId = getYouTubeVideoId(videoUrl) || lesson?.youtubeVideoId;

  const result: Lesson = {
    id: String(lesson?.id || `les_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`),
    title: String(lesson?.title || `Lesson ${index + 1}`),
    description: String(lesson?.description || ''),
    duration: String(lesson?.duration || '10:00'),
    videoUrl: videoUrl,
    videoSource: videoSource,
    pdfUrl: String(lesson?.pdfUrl || ''),
    order: Number(lesson?.order ?? index),
    isFree: Boolean(lesson?.isFree),
  };

  if (youtubeVideoId) {
    result.youtubeVideoId = youtubeVideoId;
  }

  return result;
}

// Helper to sanitize array of modules and nested lessons
export function sanitizeModules(modules: any): CourseModule[] {
  if (!modules) return [];
  const list = Array.isArray(modules) ? modules : Object.values(modules);
  return list
    .filter((m) => m && typeof m === 'object')
    .map((m: any, mIdx: number) => ({
      id: String(m.id || `mod_${Date.now()}_${mIdx}`),
      title: String(m.title || `Module ${mIdx + 1}`),
      order: Number(m.order ?? mIdx),
      lessons: Array.isArray(m.lessons)
        ? m.lessons.map((l: any, lIdx: number) => sanitizeLesson(l, lIdx))
        : []
    }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// Helper to normalize course files:
// Converts legacy single pdfFileUrl or files array into standard CourseFile[] array
export function normalizePdfCourseFiles(course: any): CourseFile[] {
  if (!course) return [];
  if (course.files && (Array.isArray(course.files) || typeof course.files === 'object')) {
    const cleaned = sanitizeCourseFiles(course.files);
    if (cleaned.length > 0) return cleaned;
  }

  // Backward-compatibility: migrate single pdfFileUrl or pdfUrl into files array
  const legacyUrl = course.pdfFileUrl || course.pdfUrl;
  if (legacyUrl) {
    const fileName = course.pdfFileName || `${String(course.title || 'course').toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`;
    const isZip = fileName.toLowerCase().endsWith('.zip');
    return [
      {
        id: 'legacy-file-1',
        name: fileName,
        type: isZip ? 'zip' : 'pdf',
        size: Number(course.pdfFileSize || 0),
        downloadUrl: String(legacyUrl),
        storagePath: course.storagePath || undefined,
        displayOrder: 1,
        downloadable: true,
        description: 'Course study material',
        uploadedAt: course.createdAt || new Date().toISOString(),
      }
    ];
  }

  return [];
}

/**
 * Determine course type based on its components
 */
export function determineCourseType(course: Partial<Course>): 'video' | 'pdf' | 'bundle' {
  if (course.courseType) return course.courseType;
  const hasFiles = (course.files && course.files.length > 0) || Boolean(course.pdfFileUrl);
  const hasVideos = (course.modules && course.modules.some(m => m.lessons && m.lessons.length > 0)) || (course.totalLessons && course.totalLessons > 0);
  
  if (hasFiles && hasVideos) return 'bundle';
  if (hasFiles && !hasVideos) return 'pdf';
  return 'video';
}

/**
 * Recursively removes all `undefined` values from an object or array.
 * Flattens any nested arrays (Firestore Standard does not support nested arrays).
 * Removes any non-serializable objects (File, Blob, DOM nodes).
 */
export function sanitizeFirestoreData<T>(obj: T): T {
  if (obj === undefined || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    const flat = obj.flat(Infinity).filter((item) => item !== undefined && item !== null);
    return flat.map((item) => sanitizeFirestoreData(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    if (
      (typeof File !== 'undefined' && obj instanceof File) ||
      (typeof Blob !== 'undefined' && obj instanceof Blob)
    ) {
      return undefined as unknown as T;
    }
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        const sanitized = sanitizeFirestoreData(value);
        if (sanitized !== undefined) {
          clean[key] = sanitized;
        }
      }
    }
    return clean as T;
  }
  return obj;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const err = error as any;
  console.error("FIRESTORE ERROR:", error);
  console.error("FIRESTORE ERROR CODE:", err?.code);
  console.error("FIRESTORE ERROR MESSAGE:", err?.message);
  console.error("FIRESTORE OPERATION:", operationType, "PATH:", path);
}

// ============================================================
// UNIFIED COURSE METHODS (Single Source of Truth)
// ============================================================

export async function getPublishedCourses(): Promise<Course[]> {
  try {
    console.log('[CourseSync] Fetching published courses from Firestore...');
    const q = query(collection(db, 'courses'), where('published', '==', true));
    const snapshot = await getDocs(q);
    
    const coursesMap = new Map<string, Course>();

    if (!snapshot.empty) {
      snapshot.docs.forEach(d => {
        const data = d.data();
        const files = normalizePdfCourseFiles(data);
        const modules = data.modules ? sanitizeModules(data.modules) : undefined;
        const rawThumbnail = String(data.thumbnailUrl || data.thumbnail || '').trim();
        coursesMap.set(d.id, {
          id: d.id,
          ...data,
          modules: modules || data.modules,
          files: files.length > 0 ? files : (data.files || []),
          thumbnail: rawThumbnail,
          thumbnailUrl: rawThumbnail,
          price: data.price ?? data.salePrice ?? 0,
          salePrice: data.salePrice ?? data.price ?? 0,
          courseType: determineCourseType({ ...data, files, modules } as Partial<Course>),
        } as Course);
      });
    }

    // Also check if any courses are marked status === 'published'
    try {
      const statusQ = query(collection(db, 'courses'), where('status', '==', 'published'));
      const statusSnap = await getDocs(statusQ);
      if (!statusSnap.empty) {
        statusSnap.docs.forEach(d => {
          if (!coursesMap.has(d.id)) {
            const data = d.data();
            const files = normalizePdfCourseFiles(data);
            const modules = data.modules ? sanitizeModules(data.modules) : undefined;
            const rawThumbnail = String(data.thumbnailUrl || data.thumbnail || '').trim();
            coursesMap.set(d.id, {
              id: d.id,
              ...data,
              modules: modules || data.modules,
              files: files.length > 0 ? files : (data.files || []),
              thumbnail: rawThumbnail,
              thumbnailUrl: rawThumbnail,
              price: data.price ?? data.salePrice ?? 0,
              salePrice: data.salePrice ?? data.price ?? 0,
              courseType: determineCourseType({ ...data, files, modules } as Partial<Course>),
            } as Course);
          }
        });
      }
    } catch (sErr) {
      // Ignored
    }

    const courses = Array.from(coursesMap.values());
    if (courses.length > 0) {
      console.log(`[CourseSync] Loaded ${courses.length} published courses from Firestore.`);
      return courses.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    console.log('[CourseSync] No published courses in Firestore, using default catalog.');
    return DEFAULT_COURSES.filter(c => c.published !== false);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'courses');
    return DEFAULT_COURSES.filter(c => c.published !== false);
  }
}

export async function getAllCourses(): Promise<Course[]> {
  try {
    console.log('[CourseSync] Admin fetching all courses from Firestore...');
    const snapshot = await getDocs(collection(db, 'courses'));
    if (snapshot.empty) {
      console.log('[CourseSync] Firestore courses collection is empty, returning default catalog.');
      return DEFAULT_COURSES;
    }
    const courses = snapshot.docs.map(d => {
      const data = d.data();
      const files = normalizePdfCourseFiles(data);
      const modules = data.modules ? sanitizeModules(data.modules) : undefined;
      const rawThumbnail = String(data.thumbnailUrl || data.thumbnail || '').trim();
      return {
        id: d.id,
        ...data,
        modules: modules || data.modules,
        files: files.length > 0 ? files : (data.files || []),
        thumbnail: rawThumbnail,
        thumbnailUrl: rawThumbnail,
        price: data.price ?? data.salePrice ?? 0,
        salePrice: data.salePrice ?? data.price ?? 0,
        courseType: determineCourseType({ ...data, files, modules } as Partial<Course>),
      } as Course;
    });
    console.log(`[CourseSync] Admin loaded ${courses.length} courses from Firestore.`);
    return courses.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'courses');
    return DEFAULT_COURSES;
  }
}

export async function getCourse(courseId: string): Promise<Course | null> {
  try {
    console.log(`[CourseSync] Fetching single course: ${courseId}`);
    const docRef = doc(db, 'courses', courseId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const files = normalizePdfCourseFiles(data);
      const modules = data.modules ? sanitizeModules(data.modules) : undefined;
      const rawThumbnail = String(data.thumbnailUrl || data.thumbnail || '').trim();
      const course: Course = { 
        id: docSnap.id, 
        ...data,
        modules: modules || data.modules || [],
        files: files.length > 0 ? files : (data.files || []),
        thumbnail: rawThumbnail,
        thumbnailUrl: rawThumbnail,
        price: data.price ?? data.salePrice ?? 0,
        salePrice: data.salePrice ?? data.price ?? 0,
        courseType: determineCourseType({ ...data, files, modules } as Partial<Course>),
      } as Course;
      console.log(`[CourseSync] Found course in Firestore: "${course.title}" (${course.modules?.length || 0} modules, ${course.files?.length || 0} files)`);
      return course;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `courses/${courseId}`);
  }

  // Fallback to default catalog only if not found in Firestore
  const defaultMatch = DEFAULT_COURSES.find(c => c.id === courseId || c.slug === courseId);
  return defaultMatch ? { ...defaultMatch, files: normalizePdfCourseFiles(defaultMatch) } : null;
}

export async function createCourse(courseData: Partial<Course>): Promise<string> {
  try {
    console.log('[CourseSync] Admin creating new course in Firestore...', courseData);
    const courseRef = doc(collection(db, 'courses'));
    const now = new Date().toISOString();
    const isPublished = courseData.published ?? (courseData.status === 'published');
    const files = courseData.files ? sanitizeCourseFiles(courseData.files) : [];
    const modules = courseData.modules ? sanitizeModules(courseData.modules) : [];
    const totalLessons = courseData.totalLessons ?? modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
    const courseType = determineCourseType({ ...courseData, files, modules, totalLessons });
    const rawThumbnail = String(courseData.thumbnailUrl || courseData.thumbnail || '').trim();
    
    const newCourse: Record<string, any> = {
      ...courseData,
      courseType,
      modules,
      files,
      totalLessons,
      published: isPublished,
      status: isPublished ? 'published' : 'draft',
      thumbnail: rawThumbnail,
      thumbnailUrl: rawThumbnail,
      price: courseData.price ?? courseData.salePrice ?? 0,
      salePrice: courseData.salePrice ?? courseData.price ?? 0,
      createdAt: now,
      updatedAt: now,
    };

    if (isPublished) {
      newCourse.publishedAt = now;
    }

    const clean = sanitizeFirestoreData(newCourse);
    await setDoc(courseRef, clean);
    console.log(`[CourseSync] Created course successfully with ID: ${courseRef.id}`);
    return courseRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'courses');
    throw error;
  }
}

export async function updateCourse(courseId: string, courseData: Partial<Course>): Promise<void> {
  try {
    console.log(`[CourseSync] Admin updating course ${courseId} in Firestore...`, courseData);
    const courseRef = doc(db, 'courses', courseId);
    const now = new Date().toISOString();
    const updates: Record<string, any> = {
      ...courseData,
      updatedAt: now,
    };

    if (courseData.published !== undefined) {
      updates.published = courseData.published;
      updates.status = courseData.published ? 'published' : 'draft';
      if (courseData.published && !courseData.publishedAt) {
        updates.publishedAt = now;
      }
    } else if (courseData.status !== undefined) {
      updates.status = courseData.status;
      updates.published = courseData.status === 'published';
      if (courseData.status === 'published' && !courseData.publishedAt) {
        updates.publishedAt = now;
      }
    }

    if (courseData.files !== undefined) {
      updates.files = sanitizeCourseFiles(courseData.files);
    }

    if (courseData.modules !== undefined) {
      updates.modules = sanitizeModules(courseData.modules);
      updates.totalLessons = updates.modules.reduce((acc: number, m: CourseModule) => acc + (m.lessons?.length || 0), 0);
    }

    if (courseData.thumbnail !== undefined || courseData.thumbnailUrl !== undefined) {
      const rawThumbnail = String(courseData.thumbnailUrl ?? courseData.thumbnail ?? '').trim();
      updates.thumbnail = rawThumbnail;
      updates.thumbnailUrl = rawThumbnail;
    }

    if (courseData.price !== undefined || courseData.salePrice !== undefined) {
      updates.price = courseData.price ?? courseData.salePrice;
      updates.salePrice = courseData.salePrice ?? courseData.price;
    }

    updates.courseType = determineCourseType({ ...courseData, ...updates });

    const cleanUpdates = sanitizeFirestoreData(updates);
    await updateDoc(courseRef, cleanUpdates);
    console.log(`[CourseSync] Updated course ${courseId} successfully in Firestore.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `courses/${courseId}`);
    throw error;
  }
}

export async function deleteCourse(courseId: string): Promise<void> {
  try {
    console.log(`[CourseSync] Admin deleting course ${courseId} from Firestore...`);
    await deleteDoc(doc(db, 'courses', courseId));
    console.log(`[CourseSync] Deleted course ${courseId} successfully.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `courses/${courseId}`);
    throw error;
  }
}

// Module & Lesson methods (Subcollections and embedded sync)
export async function getModules(courseId: string): Promise<CourseModule[]> {
  try {
    console.log(`[CourseSync] Getting modules for course ${courseId}...`);
    // 1. First check if course doc has embedded modules (Single Source of Truth)
    const courseDocRef = doc(db, 'courses', courseId);
    const courseDocSnap = await getDoc(courseDocRef);
    if (courseDocSnap.exists()) {
      const courseData = courseDocSnap.data();
      if (courseData.modules && Array.isArray(courseData.modules) && courseData.modules.length > 0) {
        console.log(`[CourseSync] Retrieved ${courseData.modules.length} modules from course document.`);
        return sanitizeModules(courseData.modules);
      }
    }

    // 2. Check subcollections
    const q = query(collection(db, `courses/${courseId}/modules`), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const modules = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CourseModule));
      
      for (const module of modules) {
        try {
          const lessonsQ = query(collection(db, `courses/${courseId}/modules/${module.id}/lessons`), orderBy('order', 'asc'));
          const lessonsSnap = await getDocs(lessonsQ);
          module.lessons = lessonsSnap.docs.map(ld => ({ id: ld.id, ...ld.data() } as Lesson));
        } catch (lErr) {
          module.lessons = [];
        }
      }
      console.log(`[CourseSync] Retrieved ${modules.length} modules from subcollections.`);
      return sanitizeModules(modules);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `courses/${courseId}/modules`);
  }

  // 3. Fallback to default catalog only if course doesn't exist in Firestore
  const defaultCourse = DEFAULT_COURSES.find(c => c.id === courseId || c.slug === courseId);
  return defaultCourse?.modules ? sanitizeModules(defaultCourse.modules) : [];
}

export async function saveModulesAndLessons(courseId: string, modules: CourseModule[]): Promise<void> {
  try {
    console.log(`[CourseSync] Admin saving ${modules.length} modules for course ${courseId}...`);
    const cleanModules = sanitizeModules(modules);
    const totalLessons = cleanModules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
    const now = new Date().toISOString();

    // 1. Update the parent course document directly (Single Source of Truth)
    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, sanitizeFirestoreData({
      modules: cleanModules,
      totalLessons: totalLessons,
      updatedAt: now,
    }));

    // 2. Also mirror to subcollections for backwards compatibility
    const batch = writeBatch(db);
    
    cleanModules.forEach((module, mIndex) => {
      let moduleRef;
      if (module.id && !module.id.startsWith('new_')) {
        moduleRef = doc(db, `courses/${courseId}/modules`, module.id);
      } else {
        moduleRef = doc(collection(db, `courses/${courseId}/modules`));
      }
      
      batch.set(moduleRef, sanitizeFirestoreData({
        title: module.title,
        order: mIndex,
      }));

      if (module.lessons) {
        module.lessons.forEach((lesson, lIndex) => {
          let lessonRef;
          if (lesson.id && !lesson.id.startsWith('new_')) {
            lessonRef = doc(db, `courses/${courseId}/modules/${moduleRef.id}/lessons`, lesson.id);
          } else {
            lessonRef = doc(collection(db, `courses/${courseId}/modules/${moduleRef.id}/lessons`));
          }
          
          const videoUrl = lesson.videoUrl || '';
          const videoSource = lesson.videoSource || getVideoSourceType(videoUrl);
          const youtubeVideoId = getYouTubeVideoId(videoUrl) || lesson.youtubeVideoId;

          batch.set(lessonRef, sanitizeFirestoreData({
            title: lesson.title,
            videoUrl: videoUrl,
            videoSource: videoSource,
            youtubeVideoId: youtubeVideoId || undefined,
            pdfUrl: lesson.pdfUrl || '',
            duration: lesson.duration || '10:00',
            order: lIndex,
            isFree: lesson.isFree || false,
            description: lesson.description || '',
          }));
        });
      }
    });
    
    await batch.commit();
    console.log(`[CourseSync] Saved modules & lessons successfully for ${courseId}.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `courses/${courseId}/modules`);
    throw error;
  }
}

// ============================================================
// UNIFIED ENROLLMENT & ORDER TRANSACTIONS
// ============================================================

export async function enrollUser(
  userId: string, 
  courseId: string, 
  amount: number,
  options?: {
    userEmail?: string;
    courseTitle?: string;
    courseType?: 'video' | 'pdf' | 'bundle';
    paymentId?: string;
  }
): Promise<string> {
  try {
    const batch = writeBatch(db);
    const now = new Date().toISOString();
    const paymentId = options?.paymentId || `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // 1. Enrollment document
    const enrollmentRef = doc(db, 'enrollments', `${userId}_${courseId}`);
    batch.set(enrollmentRef, sanitizeFirestoreData({
      userId,
      courseId,
      userEmail: options?.userEmail || auth.currentUser?.email || '',
      courseTitle: options?.courseTitle || '',
      courseType: options?.courseType || 'video',
      enrolledAt: now,
      status: 'active'
    }));

    // 2. Order document
    const orderRef = doc(collection(db, 'orders'));
    const orderData: Order = {
      id: orderRef.id,
      userId,
      userEmail: options?.userEmail || auth.currentUser?.email || '',
      courseId,
      courseTitle: options?.courseTitle || '',
      courseType: options?.courseType || 'video',
      amount,
      status: 'completed',
      createdAt: now,
      paymentId: paymentId,
      paymentStatus: 'Successful',
    };
    batch.set(orderRef, sanitizeFirestoreData(orderData));

    // 3. User profile increment (purchasedCourses)
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const currentPurchases = Number(userSnap.data()?.purchasedCourses || 0);
        batch.update(userRef, { purchasedCourses: currentPurchases + 1 });
      }
    } catch (uErr) {
      console.warn("Could not update user purchased count:", uErr);
    }

    await batch.commit();
    return orderRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `enrollments/${userId}_${courseId}`);
    throw error;
  }
}

export async function getUserEnrollments(userId: string): Promise<string[]> {
  try {
    const q = query(collection(db, 'enrollments'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const enrollmentIds = snapshot.docs.map(d => d.data().courseId);

    // Also check pdfPurchases collection for legacy consistency
    try {
      const pdfQ = query(collection(db, 'pdfPurchases'), where('userId', '==', userId), where('paymentStatus', '==', 'Successful'));
      const pdfSnap = await getDocs(pdfQ);
      const pdfIds = pdfSnap.docs.map(d => d.data().pdfCourseId);
      return Array.from(new Set([...enrollmentIds, ...pdfIds]));
    } catch (pErr) {
      return enrollmentIds;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'enrollments');
    return [];
  }
}

export async function checkEnrollment(userId: string, courseId: string): Promise<boolean> {
  try {
    // Check in enrollments
    const docRef = doc(db, 'enrollments', `${userId}_${courseId}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return true;

    // Check in pdfPurchases for legacy or backward-compatibility
    const pdfRef = doc(db, 'pdfPurchases', `${userId}_${courseId}`);
    const pdfSnap = await getDoc(pdfRef);
    if (pdfSnap.exists() && pdfSnap.data()?.paymentStatus === 'Successful') return true;

    return false;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `enrollments/${userId}_${courseId}`);
    return false;
  }
}

// Secure Verified File Download Endpoint
export async function getVerifiedCourseFileDownload(
  userId: string,
  courseId: string,
  fileId?: string
): Promise<{ 
  url: string; 
  fileName: string; 
  fileType: 'pdf' | 'zip' | 'file';
  source?: 'google_drive' | 'firebase_storage' | 'direct';
  googleDriveFileId?: string;
  previewUrl?: string;
  isGoogleDrive?: boolean;
} | null> {
  try {
    const isEnrolled = await checkEnrollment(userId, courseId);
    if (!isEnrolled) {
      return null;
    }
    const course = await getCourse(courseId);
    if (!course) {
      return null;
    }

    const files = normalizePdfCourseFiles(course);
    if (files.length === 0) {
      return null;
    }

    const targetFile = fileId ? files.find(f => f.id === fileId) : files[0];
    if (!targetFile || !targetFile.downloadUrl) {
      return null;
    }

    const isDrive = isGoogleDriveUrl(targetFile.downloadUrl) || targetFile.source === 'google_drive';
    const driveId = getGoogleDriveFileId(targetFile.downloadUrl) || targetFile.googleDriveFileId;

    const downloadUrl = isDrive && driveId 
      ? getGoogleDriveDownloadUrl(driveId) || targetFile.downloadUrl 
      : targetFile.downloadUrl;

    const previewUrl = isDrive && driveId 
      ? getGoogleDrivePreviewUrl(driveId) || undefined 
      : targetFile.previewUrl;

    return {
      url: downloadUrl,
      fileName: targetFile.name,
      fileType: targetFile.type || (targetFile.name.toLowerCase().endsWith('.zip') ? 'zip' : 'pdf'),
      source: isDrive ? 'google_drive' : targetFile.source || getFileSourceType(targetFile.downloadUrl),
      googleDriveFileId: driveId || undefined,
      previewUrl: previewUrl,
      isGoogleDrive: isDrive,
    };
  } catch (error) {
    console.error("Verification error:", error);
    return null;
  }
}

// User & Order queries for Admin
export async function getAllUsers(): Promise<any[]> {
  try {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ uid: d.id, ...d.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
    return [];
  }
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'orders');
    return [];
  }
}

// ============================================================
// BACKWARD COMPATIBILITY WRAPPERS
// (Ensures any legacy calls gracefully map to unified course engine)
// ============================================================

export async function getPublishedPdfCourses(): Promise<Course[]> {
  const all = await getPublishedCourses();
  return all.filter(c => c.courseType === 'pdf' || c.courseType === 'bundle' || (c.files && c.files.length > 0));
}

export async function getAllPdfCourses(): Promise<Course[]> {
  const all = await getAllCourses();
  return all.filter(c => c.courseType === 'pdf' || c.courseType === 'bundle' || (c.files && c.files.length > 0));
}

export async function getPdfCourse(id: string): Promise<Course | null> {
  return getCourse(id);
}

export async function createPdfCourse(courseData: Partial<Course>): Promise<string> {
  return createCourse({ ...courseData, courseType: 'pdf' });
}

export async function updatePdfCourse(id: string, courseData: Partial<Course>): Promise<void> {
  return updateCourse(id, courseData);
}

export async function deletePdfCourse(id: string): Promise<void> {
  return deleteCourse(id);
}

export async function checkPdfPurchase(userId: string, pdfCourseId: string): Promise<boolean> {
  return checkEnrollment(userId, pdfCourseId);
}

export async function purchasePdfCourse(params: {
  userId: string;
  userEmail: string;
  pdfCourseId: string;
  courseTitle: string;
  amount: number;
  paymentId?: string;
  paymentStatus?: 'Successful' | 'Pending' | 'Failed';
}): Promise<string> {
  return enrollUser(params.userId, params.pdfCourseId, params.amount, {
    userEmail: params.userEmail,
    courseTitle: params.courseTitle,
    courseType: 'pdf',
    paymentId: params.paymentId,
  });
}

export async function getUserPdfPurchases(userId: string): Promise<PdfPurchase[]> {
  try {
    const courseIds = await getUserEnrollments(userId);
    const courses = await Promise.all(courseIds.map(id => getCourse(id)));
    const pdfCourses = courses.filter(c => c && (c.courseType === 'pdf' || c.courseType === 'bundle' || (c.files && c.files.length > 0))) as Course[];
    
    return pdfCourses.map(c => ({
      id: `${userId}_${c.id}`,
      userId,
      userEmail: auth.currentUser?.email || '',
      pdfCourseId: c.id,
      courseId: c.id,
      courseTitle: c.title,
      amount: c.price,
      paymentId: `pay_${c.id}`,
      paymentStatus: 'Successful',
      status: 'completed',
      purchasedAt: c.createdAt || new Date().toISOString(),
    }));
  } catch (error) {
    return [];
  }
}

export async function getVerifiedPdfDownloadUrl(userId: string, pdfCourseId: string): Promise<{ url: string; fileName?: string } | null> {
  const res = await getVerifiedCourseFileDownload(userId, pdfCourseId);
  if (!res) return null;
  return {
    url: res.url,
    fileName: res.fileName,
  };
}
