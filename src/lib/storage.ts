import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Check if a URL string is an inline data URL (base64)
 */
export function isDataUrl(url?: string): boolean {
  if (!url) return false;
  return url.startsWith('data:');
}

/**
 * Approximate byte length of a base64 Data URL
 */
export function estimateDataUrlSize(dataUrl: string): number {
  if (!dataUrl) return 0;
  const parts = dataUrl.split(',');
  if (parts.length < 2) return dataUrl.length;
  return Math.floor((parts[1].length * 3) / 4);
}

/**
 * Convert a base64 Data URL to a native Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const binary = atob(parts[1] || '');
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}

export interface StorageUploadResult {
  downloadUrl: string;
  storagePath: string;
}

/**
 * Upload a native File to Firebase Storage and return its public download URL
 */
export async function uploadFileToStorage(
  file: File,
  folder = 'course_files',
  onProgress?: (percent: number) => void
): Promise<string> {
  const result = await uploadFileWithDetails(file, folder, onProgress);
  return result.downloadUrl;
}

/**
 * Upload a native File to Firebase Storage and return download URL along with storage path
 */
export async function uploadFileWithDetails(
  file: File,
  folder = 'course_files',
  onProgress?: (percent: number) => void
): Promise<StorageUploadResult> {
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${folder}/${Date.now()}_${sanitizedName}`;
  const fileRef = ref(storage, path);

  const uploadTask = uploadBytesResumable(fileRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (snapshot.totalBytes > 0 && onProgress) {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(progress);
        }
      },
      (error: any) => {
        console.error("STORAGE UPLOAD ERROR:", error);
        console.error("STORAGE ERROR CODE:", error?.code);
        console.error("STORAGE ERROR MESSAGE:", error?.message);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ downloadUrl, storagePath: path });
        } catch (err: any) {
          console.error("STORAGE GET DOWNLOAD URL ERROR:", err);
          console.error("STORAGE ERROR CODE:", err?.code);
          console.error("STORAGE ERROR MESSAGE:", err?.message);
          reject(err);
        }
      }
    );
  });
}

/**
 * Upload a Data URL to Firebase Storage as a Blob
 */
export async function uploadDataUrlToStorage(
  dataUrl: string,
  fileName: string,
  folder = 'course_files'
): Promise<string> {
  const blob = dataUrlToBlob(dataUrl);
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${folder}/${Date.now()}_${sanitizedName}`;
  const fileRef = ref(storage, path);

  const uploadTask = uploadBytesResumable(fileRef, blob);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      null,
      (error: any) => {
        console.error("STORAGE UPLOAD ERROR:", error);
        console.error("STORAGE ERROR CODE:", error?.code);
        console.error("STORAGE ERROR MESSAGE:", error?.message);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (err: any) {
          console.error("STORAGE GET DOWNLOAD URL ERROR:", err);
          console.error("STORAGE ERROR CODE:", err?.code);
          console.error("STORAGE ERROR MESSAGE:", err?.message);
          reject(err);
        }
      }
    );
  });
}

/**
 * Compress an image data URL via canvas to prevent Firestore document bloating
 */
export async function compressImageDataUrl(
  dataUrl: string,
  maxWidth = 800,
  maxHeight = 600,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve) => {
    if (!isDataUrl(dataUrl) || !dataUrl.startsWith('data:image/')) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    img.onerror = () => {
      resolve(dataUrl);
    };
    img.src = dataUrl;
  });
}
