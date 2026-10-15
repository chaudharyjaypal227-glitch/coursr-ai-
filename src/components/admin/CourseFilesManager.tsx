import React, { useState, useRef } from 'react';
import { CourseFile } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  FileText, 
  Archive, 
  Upload, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  RefreshCw, 
  Plus, 
  Link as LinkIcon, 
  AlertCircle, 
  ExternalLink,
  CheckCircle2,
  Loader2,
  Edit3
} from 'lucide-react';
import { uploadFileWithDetails } from '../../lib/storage';
import { sanitizeCourseFiles } from '../../lib/db';

interface CourseFilesManagerProps {
  files: CourseFile[];
  onChange: (files: CourseFile[]) => void;
}

export function CourseFilesManager({ files, onChange }: CourseFilesManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replacingFileId, setReplacingFileId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // External / Cloud URL modal state
  const [showExternalInput, setShowExternalInput] = useState(false);
  const [externalName, setExternalName] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [externalType, setExternalType] = useState<'zip' | 'pdf'>('zip');
  const [externalSizeMb, setExternalSizeMb] = useState('');
  const [externalDesc, setExternalDesc] = useState('');

  // Editing file URL inline state
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editUrlValue, setEditUrlValue] = useState('');
  const [editDescValue, setEditDescValue] = useState('');

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) return '0 KB';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const detectFileType = (fileName: string): 'pdf' | 'zip' | null => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.pdf')) return 'pdf';
    if (lower.endsWith('.zip')) return 'zip';
    return null;
  };

  // Upload or process a file
  const processAndUploadFile = async (file: File): Promise<CourseFile | null> => {
    const type = detectFileType(file.name);
    if (!type) {
      setErrorMessage(`Invalid file "${file.name}". Only PDF (.pdf) and ZIP (.zip) files are allowed.`);
      return null;
    }

    // Try uploading to Firebase Cloud Storage first
    try {
      setIsUploading(true);
      const fileKey = `${file.name}_${Date.now()}`;
      setUploadProgress(prev => ({ ...prev, [fileKey]: 10 }));

      const uploadResult = await uploadFileWithDetails(file, 'course_files', (pct) => {
        setUploadProgress(prev => ({ ...prev, [fileKey]: pct }));
      });

      const newFile: CourseFile = {
        id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        type: type,
        size: file.size,
        downloadUrl: uploadResult.downloadUrl,
        storagePath: uploadResult.storagePath,
        displayOrder: files.length + 1,
        downloadable: true,
        uploadedAt: new Date().toISOString(),
        description: type === 'zip' ? 'Source code & resources archive' : 'Documentation handbook'
      };

      setSuccessMessage(`File "${file.name}" uploaded successfully to Cloud Storage!`);
      setTimeout(() => setSuccessMessage(null), 4000);
      return newFile;
    } catch (storageError: any) {
      console.warn('Firebase Storage upload error, checking fallback options:', storageError);

      // If file is very small (< 200KB), fallback to data URL is safe for Firestore
      if (file.size <= 200 * 1024) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const fallbackFile: CourseFile = {
              id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              name: file.name,
              type: type,
              size: file.size,
              downloadUrl: reader.result as string,
              displayOrder: files.length + 1,
              downloadable: true,
              uploadedAt: new Date().toISOString(),
              description: type === 'zip' ? 'Source code & resources archive' : 'Documentation handbook'
            };
            resolve(fallbackFile);
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        });
      }

      // For larger files (> 200KB), do NOT store base64 in Firestore! Guide user to Cloud URL
      setErrorMessage(
        `Cloud storage upload not configured (${storageError?.message || 'Storage unavailable'}). Large files (${(file.size / (1024 * 1024)).toFixed(1)}MB) cannot be saved directly in database. Please upload your file to Google Drive, Dropbox, or AWS S3 and use "Add Cloud URL" below.`
      );
      // Pre-fill the external URL form
      setExternalName(file.name);
      setExternalType(type);
      setExternalSizeMb((file.size / (1024 * 1024)).toFixed(1));
      setShowExternalInput(true);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Handle uploading one or multiple files
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setErrorMessage(null);
    const addedFiles: CourseFile[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const parsed = await processAndUploadFile(selectedFiles[i]);
      if (parsed) {
        parsed.displayOrder = files.length + addedFiles.length + 1;
        addedFiles.push(parsed);
      }
    }

    if (addedFiles.length > 0) {
      const combined = sanitizeCourseFiles([...files, ...addedFiles]);
      onChange(combined);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle replacing a specific file
  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !replacingFileId) return;

    setErrorMessage(null);
    const parsed = await processAndUploadFile(selectedFile);
    if (parsed) {
      const updated = files.map((item) => {
        if (item.id === replacingFileId) {
          return {
            ...parsed,
            id: item.id, // preserve existing file id
            displayOrder: item.displayOrder,
            description: item.description || parsed.description,
          };
        }
        return item;
      });
      onChange(sanitizeCourseFiles(updated));
    }

    setReplacingFileId(null);
    if (replaceInputRef.current) replaceInputRef.current.value = '';
  };

  // Delete a specific file
  const handleDelete = (id: string) => {
    const updated = files
      .filter(f => f.id !== id)
      .map((f, i) => ({ ...f, displayOrder: i + 1 }));
    onChange(sanitizeCourseFiles(updated));
  };

  // Reorder up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newFiles = [...files];
    const temp = newFiles[index - 1];
    newFiles[index - 1] = newFiles[index];
    newFiles[index] = temp;
    const reordered = newFiles.map((f, i) => ({ ...f, displayOrder: i + 1 }));
    onChange(sanitizeCourseFiles(reordered));
  };

  // Reorder down
  const handleMoveDown = (index: number) => {
    if (index === files.length - 1) return;
    const newFiles = [...files];
    const temp = newFiles[index + 1];
    newFiles[index + 1] = newFiles[index];
    newFiles[index] = temp;
    const reordered = newFiles.map((f, i) => ({ ...f, displayOrder: i + 1 }));
    onChange(sanitizeCourseFiles(reordered));
  };

  // Add external cloud URL (Google Drive, Dropbox, AWS S3, Cloudflare, CDN, etc.)
  const handleAddExternalFile = () => {
    if (!externalUrl.trim()) {
      setErrorMessage('Please provide a valid download URL.');
      return;
    }
    const derivedName = externalName.trim() || externalUrl.split('/').pop()?.split('?')[0] || `download-${files.length + 1}.${externalType}`;
    const sizeInBytes = externalSizeMb ? Math.round(parseFloat(externalSizeMb) * 1024 * 1024) : 0;

    const newFile: CourseFile = {
      id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: derivedName,
      type: externalType,
      size: sizeInBytes,
      downloadUrl: externalUrl.trim(),
      displayOrder: files.length + 1,
      downloadable: true,
      uploadedAt: new Date().toISOString(),
      description: externalDesc.trim() || (externalType === 'zip' ? 'Source code & resources archive' : 'Documentation guide')
    };

    const updated = sanitizeCourseFiles([...files, newFile]);
    onChange(updated);
    setExternalUrl('');
    setExternalName('');
    setExternalSizeMb('');
    setExternalDesc('');
    setShowExternalInput(false);
    setSuccessMessage(`Added "${derivedName}" successfully!`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Save inline edit for file URL / description
  const handleSaveInlineEdit = (fileId: string) => {
    if (!editUrlValue.trim()) return;
    const updated = files.map(f => {
      if (f.id === fileId) {
        return {
          ...f,
          downloadUrl: editUrlValue.trim(),
          description: editDescValue.trim() || f.description
        };
      }
      return f;
    });
    onChange(sanitizeCourseFiles(updated));
    setEditingFileId(null);
    setEditUrlValue('');
    setEditDescValue('');
  };

  return (
    <div className="space-y-4">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.zip,application/pdf,application/zip,application/x-zip-compressed"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />
      <input
        type="file"
        ref={replaceInputRef}
        accept=".pdf,.zip,application/pdf,application/zip,application/x-zip-compressed"
        className="hidden"
        onChange={handleReplaceFile}
      />

      {/* Success banner */}
      {successMessage && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error notification banner */}
      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-white text-xs underline ml-2 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Upload in progress indicator */}
      {isUploading && (
        <div className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-950/40 text-indigo-300 text-xs flex items-center gap-3">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
          <div className="flex-1">
            <div className="font-semibold text-white">Uploading file to Cloud Storage...</div>
            <div className="text-[11px] text-indigo-300/80">Storing file safely outside Firestore document. Please wait...</div>
          </div>
        </div>
      )}

      {/* Uploaded Files List */}
      {files.length > 0 ? (
        <div className="space-y-3">
          {files.map((file, index) => {
            const isZip = file.type === 'zip' || file.name.toLowerCase().endsWith('.zip');
            const isData = file.downloadUrl?.startsWith('data:');
            const isEditing = editingFileId === file.id;

            return (
              <div
                key={file.id || index}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-slate-700 transition-colors flex flex-col gap-3"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* File Details */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* File Type Icon badge */}
                    <div
                      className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border ${
                        isZip
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                          : 'bg-red-500/15 border-red-500/30 text-red-400'
                      }`}
                    >
                      {isZip ? <Archive className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white truncate max-w-[280px] sm:max-w-md">
                          {file.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            isZip
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}
                        >
                          {isZip ? 'ZIP Archive' : 'PDF Document'}
                        </span>
                        {isData ? (
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                            Embedded Base64
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-500/15 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Cloud Hosted
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span className="text-slate-500">Order #{index + 1}</span>
                        {file.description && (
                          <>
                            <span>•</span>
                            <span className="text-slate-300 italic truncate max-w-xs">{file.description}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Ordering */}
                  <div className="flex items-center gap-1.5 self-end md:self-center shrink-0 flex-wrap">
                    {/* Test Download link */}
                    {file.downloadUrl && (
                      <a
                        href={file.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="h-8 px-2.5 text-xs inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                        title="Open file / Test download link"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                        Test Link
                      </a>
                    )}

                    {/* Edit URL */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800"
                      onClick={() => {
                        if (isEditing) {
                          setEditingFileId(null);
                        } else {
                          setEditingFileId(file.id);
                          setEditUrlValue(file.downloadUrl || '');
                          setEditDescValue(file.description || '');
                        }
                      }}
                      title="Edit direct link or description"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1" />
                      {isEditing ? 'Close' : 'Edit URL'}
                    </Button>

                    {/* Move Up */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-white disabled:opacity-30"
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                      title="Move up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>

                    {/* Move Down */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-white disabled:opacity-30"
                      disabled={index === files.length - 1}
                      onClick={() => handleMoveDown(index)}
                      title="Move down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>

                    {/* Replace */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5 text-xs border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
                      onClick={() => {
                        setReplacingFileId(file.id);
                        replaceInputRef.current?.click();
                      }}
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                      Replace
                    </Button>

                    {/* Delete */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Inline URL / Description editor if opened */}
                {isEditing && (
                  <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-2 mt-1">
                    <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Edit Direct Download Link & Details</span>
                      <span className="text-[10px] text-slate-500 font-normal">Supports Google Drive, Dropbox, AWS S3, Cloudflare, etc.</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Download URL</label>
                        <Input
                          value={editUrlValue}
                          onChange={(e) => setEditUrlValue(e.target.value)}
                          placeholder="https://drive.google.com/... or https://..."
                          className="bg-slate-950 border-slate-700 text-xs font-mono h-8 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">File Description / Note</label>
                        <Input
                          value={editDescValue}
                          onChange={(e) => setEditDescValue(e.target.value)}
                          placeholder="e.g. Complete Source Code + Assets"
                          className="bg-slate-950 border-slate-700 text-xs h-8 text-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingFileId(null)}
                        className="text-xs text-slate-400 h-7"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSaveInlineEdit(file.id)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-7 px-3"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer border-2 border-dashed border-slate-700 hover:border-indigo-500/80 bg-slate-950 hover:bg-slate-900/40 p-8 rounded-xl text-center transition-colors group"
        >
          <div className="w-12 h-12 rounded-full bg-indigo-600/10 group-hover:bg-indigo-600/20 flex items-center justify-center text-indigo-400 mx-auto mb-3 transition-colors">
            <Upload className="w-6 h-6" />
          </div>
          <div className="text-sm font-medium text-white mb-1">
            Click to upload course digital files (.pdf, .zip)
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Upload multiple files for this product: Source Code ZIPs, Buyer Guides, Setup Guides, or Handbooks. Or click &quot;Add Cloud URL&quot; below for Google Drive / Dropbox files.
          </p>
        </div>
      )}

      {/* Primary Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold h-9 px-4 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            {files.length > 0 ? 'Upload More Files' : 'Upload Files (.pdf / .zip)'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowExternalInput(!showExternalInput)}
            className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs h-9 px-3"
          >
            <LinkIcon className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
            {showExternalInput ? 'Hide Cloud Link Form' : 'Add Cloud URL (Google Drive / Dropbox / S3)'}
          </Button>
        </div>

        <span className="text-xs text-slate-500">
          {files.length} file{files.length === 1 ? '' : 's'} configured
        </span>
      </div>

      {/* External Cloud URL Input Drawer */}
      {showExternalInput && (
        <div className="p-4 rounded-xl border border-indigo-500/30 bg-slate-950 space-y-3.5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="text-xs font-semibold text-white flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-indigo-400" />
              <span>Add Cloud / External Download Link</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Recommended for large ZIP source codes &amp; PDF bundles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Direct Download / Cloud Link *
              </label>
              <Input
                placeholder="https://drive.google.com/file/d/... or https://..."
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                className="bg-slate-900 border-slate-800 text-xs font-mono text-white"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Supports Google Drive, Dropbox, AWS S3, Cloudflare, OneDrive, etc.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                File Name *
              </label>
              <Input
                placeholder="Arrow-Puzzle-Max-Source-Code.zip"
                value={externalName}
                onChange={(e) => setExternalName(e.target.value)}
                className="bg-slate-900 border-slate-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                File Type *
              </label>
              <select
                value={externalType}
                onChange={(e) => setExternalType(e.target.value as 'zip' | 'pdf')}
                className="w-full h-9 rounded-md bg-slate-900 border border-slate-800 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="zip">ZIP Archive (.zip)</option>
                <option value="pdf">PDF Handbook (.pdf)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                File Size (MB, optional)
              </label>
              <Input
                type="number"
                step="0.1"
                placeholder="24.5"
                value={externalSizeMb}
                onChange={(e) => setExternalSizeMb(e.target.value)}
                className="bg-slate-900 border-slate-800 text-xs text-white"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Description / Details (optional)
              </label>
              <Input
                placeholder="e.g. Complete Android Studio Project Source Code + Graphics"
                value={externalDesc}
                onChange={(e) => setExternalDesc(e.target.value)}
                className="bg-slate-900 border-slate-800 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowExternalInput(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleAddExternalFile}
              disabled={!externalUrl.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4"
            >
              Add This File
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
