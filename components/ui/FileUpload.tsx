'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, FileText, Image, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface FileUploadProps {
  /** Accepted file types (e.g. ".pdf,.jpg,.png") */
  accept?: string;
  /** Max file size in MB */
  maxSizeMB?: number;
  /** Callback when a file is selected and ready to upload */
  onUpload: (file: File) => Promise<void>;
  /** Callback when the user removes the file */
  onRemove?: () => Promise<void>;
  /** Currently uploaded file info */
  currentFile?: {
    name: string;
    url: string;
    uploadedAt?: string;
  } | null;
  /** Label for the upload zone */
  label?: string;
  /** Compact mode for inline usage */
  compact?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

export function FileUpload({
  accept = '.pdf,.jpg,.jpeg,.png,.webp',
  maxSizeMB = 10,
  onUpload,
  onRemove,
  currentFile,
  label = 'Upload Document',
  compact = false,
  disabled = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndUpload = useCallback(
    async (file: File) => {
      setError(null);

      // Validate size
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        setError(`File too large (${sizeMB.toFixed(1)}MB). Max: ${maxSizeMB}MB`);
        return;
      }

      // Validate type
      const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
      const acceptedExts = accept.split(',').map((a) => a.trim().toLowerCase());
      if (!acceptedExts.includes(ext) && !acceptedExts.includes('*')) {
        setError(`Invalid file type. Accepted: ${accept}`);
        return;
      }

      setIsUploading(true);
      try {
        await onUpload(file);
      } catch (err: any) {
        setError(err?.message || 'Upload failed. Please try again.');
      } finally {
        setIsUploading(false);
      }
    },
    [accept, maxSizeMB, onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled || isUploading) return;

      const file = e.dataTransfer.files?.[0];
      if (file) validateAndUpload(file);
    },
    [disabled, isUploading, validateAndUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndUpload(file);
      // Reset input so same file can be re-selected
      e.target.value = '';
    },
    [validateAndUpload]
  );

  const handleRemove = useCallback(async () => {
    if (!onRemove || isRemoving) return;
    setIsRemoving(true);
    try {
      await onRemove();
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to remove file.');
    } finally {
      setIsRemoving(false);
    }
  }, [onRemove, isRemoving]);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext || '')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    return <FileText className="h-5 w-5 text-orange-500" />;
  };

  // ─── File Already Uploaded State ──────────────────────────────────────────
  if (currentFile) {
    return (
      <div className={`rounded-2xl border ${compact ? 'p-3' : 'p-4'} bg-emerald-50/50 border-emerald-200/60 transition-all`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-100 border border-emerald-200 shrink-0">
            {getFileIcon(currentFile.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <p className="text-xs font-bold text-emerald-800 truncate">{currentFile.name}</p>
            </div>
            {currentFile.uploadedAt && (
              <p className="text-[10px] text-emerald-600/70 font-semibold mt-0.5">
                Uploaded {new Date(currentFile.uploadedAt).toLocaleDateString('en-IN')}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:8000'}${currentFile.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 hover:underline transition-colors"
            >
              View
            </a>
            {onRemove && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isRemoving}
                className="p-1 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-40"
              >
                {isRemoving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Upload Zone ──────────────────────────────────────────────────────────
  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => { if (!disabled && !isUploading) inputRef.current?.click(); }}
        className={`
          relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
          ${compact ? 'p-4' : 'p-6'}
          ${disabled
            ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
            : isDragOver
            ? 'border-orange-400 bg-orange-50/50 scale-[1.01] shadow-lg shadow-orange-500/5'
            : error
            ? 'border-rose-300 bg-rose-50/30 hover:border-rose-400'
            : 'border-slate-200 bg-slate-50/50 hover:border-orange-300 hover:bg-orange-50/30'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center">
              <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />
            </div>
            <p className="text-xs font-bold text-slate-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className={`rounded-xl border flex items-center justify-center transition-colors ${
              isDragOver
                ? 'bg-orange-100 border-orange-200'
                : 'bg-white border-slate-200'
            } ${compact ? 'h-9 w-9' : 'h-11 w-11'}`}>
              <Upload className={`text-slate-400 ${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">{label}</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                {isDragOver ? 'Drop file here...' : `Drag & drop or click to browse • Max ${maxSizeMB}MB`}
              </p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                {accept.replace(/\./g, '').replace(/,/g, ' • ')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-1.5 mt-2 px-1">
          <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
          <p className="text-[11px] font-semibold text-rose-600">{error}</p>
        </div>
      )}
    </div>
  );
}
