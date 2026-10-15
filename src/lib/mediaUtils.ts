/**
 * Unified Media & File Storage Utilities
 * Handles YouTube video ID extraction, responsive embeds,
 * and Google Drive file ID parsing with download/preview generation.
 */

// ==========================================
// YOUTUBE HELPERS
// ==========================================

/**
 * Extracts YouTube Video ID from any standard or shortened YouTube URL format.
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://youtube-nocookie.com/embed/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
export function getYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  // Direct 11-char alphanumeric/underscore/dash ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex patterns for YouTube variations
  const patterns = [
    // Standard watch URL: youtube.com/watch?v=ID or with extra query params
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})(?:&.*)?/i,
    // Shortened URL: youtu.be/ID
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?.*)?/i,
    // Shorts URL: youtube.com/shorts/ID
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(?:\?.*)?/i,
    // Embed URL: youtube.com/embed/ID or youtube-nocookie.com/embed/ID
    /(?:https?:\/\/)?(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\?.*)?/i,
    // Live / Direct v/ URL: youtube.com/v/ID or youtube.com/live/ID
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:v|live)\/([a-zA-Z0-9_-]{11})(?:\?.*)?/i,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Fallback query parameter parsing if URL is valid
  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        return v;
      }
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts.length >= 2 && (parts[0] === 'shorts' || parts[0] === 'embed' || parts[0] === 'v')) {
        if (/^[a-zA-Z0-9_-]{11}$/.test(parts[1])) {
          return parts[1];
        }
      }
    } else if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.replace(/^\//, '');
      if (/^[a-zA-Z0-9_-]{11}$/.test(id)) {
        return id;
      }
    }
  } catch {
    // Ignore URL parse error
  }

  return null;
}

/**
 * Returns privacy-friendly YouTube embed URL for iframe embedding.
 */
export function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`;
}

/**
 * Checks if the given URL is a recognizable YouTube link.
 */
export function isYouTubeUrl(url: string | null | undefined): boolean {
  return !!getYouTubeVideoId(url);
}

/**
 * Validates YouTube URL and provides user-friendly status message.
 */
export function validateYouTubeUrl(url: string | null | undefined): { isValid: boolean; videoId: string | null; error?: string } {
  if (!url || !url.trim()) {
    return { isValid: false, videoId: null, error: 'Please provide a YouTube video URL' };
  }
  const videoId = getYouTubeVideoId(url);
  if (!videoId) {
    return { isValid: false, videoId: null, error: 'Invalid YouTube video link. Please use a valid YouTube watch, youtu.be, or shorts link.' };
  }
  return { isValid: true, videoId };
}

// ==========================================
// GOOGLE DRIVE HELPERS
// ==========================================

/**
 * Extracts Google Drive / Google Docs File ID from standard sharing URLs.
 * Supports:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - https://drive.google.com/uc?export=download&id=FILE_ID
 * - https://docs.google.com/document/d/FILE_ID/...
 * - https://docs.google.com/presentation/d/FILE_ID/...
 * - https://docs.google.com/spreadsheets/d/FILE_ID/...
 */
export function getGoogleDriveFileId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  // Direct alphanumeric ID check (Google Drive IDs are typically 25-50 characters long)
  if (/^[a-zA-Z0-9_-]{25,60}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex patterns for Google Drive variations
  const patterns = [
    // drive.google.com/file/d/ID/view...
    /(?:https?:\/\/)?drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{20,})/i,
    // drive.google.com/open?id=ID
    /(?:https?:\/\/)?drive\.google\.com\/open\?(?:.*&)?id=([a-zA-Z0-9_-]{20,})/i,
    // drive.google.com/uc?id=ID or uc?export=download&id=ID
    /(?:https?:\/\/)?drive\.google\.com\/uc\?(?:.*&)?id=([a-zA-Z0-9_-]{20,})/i,
    // docs.google.com/document/d/ID or presentation/d/ID or spreadsheets/d/ID
    /(?:https?:\/\/)?docs\.google\.com\/(?:document|presentation|spreadsheets|file)\/d\/([a-zA-Z0-9_-]{20,})/i,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Fallback URL query search param check
  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (parsed.hostname.includes('google.com')) {
      const id = parsed.searchParams.get('id');
      if (id && id.length >= 20) {
        return id;
      }
      const parts = parsed.pathname.split('/').filter(Boolean);
      const dIndex = parts.indexOf('d');
      if (dIndex !== -1 && parts[dIndex + 1]) {
        return parts[dIndex + 1];
      }
    }
  } catch {
    // Ignore URL parsing errors
  }

  return null;
}

/**
 * Checks if the given URL is a Google Drive link.
 */
export function isGoogleDriveUrl(url: string | null | undefined): boolean {
  return !!getGoogleDriveFileId(url);
}

/**
 * Constructs direct browser download URL for Google Drive file ID.
 */
export function getGoogleDriveDownloadUrl(urlOrId: string | null | undefined): string | null {
  const fileId = getGoogleDriveFileId(urlOrId) || (urlOrId && urlOrId.length >= 20 ? urlOrId : null);
  if (!fileId) return null;
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Constructs web preview / sharing viewer URL for Google Drive file ID.
 */
export function getGoogleDrivePreviewUrl(urlOrId: string | null | undefined): string | null {
  const fileId = getGoogleDriveFileId(urlOrId) || (urlOrId && urlOrId.length >= 20 ? urlOrId : null);
  if (!fileId) return null;
  return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
}

/**
 * Validates Google Drive URL and provides helpful feedback.
 */
export function validateGoogleDriveUrl(url: string | null | undefined): { isValid: boolean; fileId: string | null; error?: string } {
  if (!url || !url.trim()) {
    return { isValid: false, fileId: null, error: 'Please enter a Google Drive link' };
  }
  const fileId = getGoogleDriveFileId(url);
  if (!fileId) {
    return { isValid: false, fileId: null, error: 'Invalid Google Drive link. Please make sure it is a valid drive.google.com or docs.google.com file URL.' };
  }
  return { isValid: true, fileId };
}

// ==========================================
// SOURCE DISCRIMINATORS
// ==========================================

export function getVideoSourceType(url: string | null | undefined): 'youtube' | 'uploaded' | 'direct' {
  if (isYouTubeUrl(url)) return 'youtube';
  if (url && (url.includes('firebasestorage.googleapis.com') || url.includes('/storage/'))) return 'uploaded';
  return 'direct';
}

export function getFileSourceType(url: string | null | undefined): 'google_drive' | 'firebase_storage' | 'direct' {
  if (isGoogleDriveUrl(url)) return 'google_drive';
  if (url && (url.includes('firebasestorage.googleapis.com') || url.includes('/storage/'))) return 'firebase_storage';
  return 'direct';
}
