import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import LoadingSpinner from "./LoadingSpinner.tsx";

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  uploadProgress?: number;
  fileData?: any;
  label: string;
  accept?: string;
  disabled?: boolean;
  selectedFile?: File | null;
}

const dragActive = signal<boolean>(false);

export default function FileUploadZone({
  onFileSelect,
  isUploading,
  uploadProgress = 0,
  fileData,
  label,
  accept = ".xlsx,.xls,.csv",
  disabled = false,
  selectedFile = null
}: FileUploadZoneProps) {
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      dragActive.value = true;
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    dragActive.value = false;
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    dragActive.value = false;
    
    if (disabled) return;

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isValidFileType(file.name)) {
        onFileSelect(file);
      }
    }
  };

  const handleFileInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0] && !disabled) {
      onFileSelect(target.files[0]);
    }
  };

  const isValidFileType = (filename: string): boolean => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return validExtensions.includes(extension);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename: string): string => {
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    switch (extension) {
      case '.xlsx':
        return '📊';
      case '.xls':
        return '📈';
      case '.csv':
        return '📋';
      default:
        return '📄';
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
        {label}
      </label>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        class={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
          ${dragActive.value && !disabled
            ? 'border-blue-500 dark:border-blue-400 bg-blue-50/80 dark:bg-blue-900/30 scale-105 shadow-lg dark:shadow-blue-900/50 dark:shadow-2xl'
            : fileData 
              ? 'border-emerald-300 dark:border-emerald-600/70 bg-emerald-50/50 dark:bg-gray-800/90 shadow-lg dark:shadow-2xl dark:shadow-emerald-900/30'
              : 'border-gray-300 dark:border-gray-600/80 bg-gray-50/50 dark:bg-gray-800/70 shadow-md dark:shadow-xl dark:shadow-black/40'
          }
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-blue-900/40 cursor-pointer hover:scale-[1.02]'
          }
          dark:backdrop-blur-sm
        `}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileInput}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        {isUploading ? (
          <div className="space-y-4">
            <LoadingSpinner size="lg" text="Processing file..." />
            {uploadProgress > 0 && (
              <div className="w-full bg-gray-200 dark:bg-gray-700/80 rounded-full h-3 shadow-inner dark:shadow-black/50 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-purple-500 h-3 rounded-full transition-all duration-300 shadow-sm dark:shadow-blue-500/30"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        ) : fileData ? (
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/40 rounded-full flex items-center justify-center shadow-lg dark:shadow-emerald-900/50 ring-2 ring-emerald-200/50 dark:ring-emerald-700/30">
              <svg className="w-10 h-10 text-emerald-600 dark:text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="mb-3">
                <p className="font-bold text-emerald-800 dark:text-emerald-200 text-xl mb-1">
                  ✅ File Uploaded Successfully!
                </p>
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-3 border border-emerald-200/50 dark:border-emerald-700/50 shadow-sm">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg break-all">
                    {getFileIcon(fileData.filename)} {fileData.filename}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <div className="flex justify-center space-x-4">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50 shadow-sm dark:shadow-emerald-900/30">
                    📊 {fileData.rowCount} rows
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50 shadow-sm dark:shadow-emerald-900/30">
                    📋 {fileData.columns.length} columns
                  </span>
                </div>
                <p className="text-emerald-700 dark:text-emerald-400 font-medium text-center">
                  📁 File Size: {fileData.size}
                </p>
              </div>
            </div>
          </div>
        ) : selectedFile ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center shadow-lg dark:shadow-blue-900/30 ring-2 ring-blue-200/50 dark:ring-blue-700/30">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">
                📄 File Selected
              </p>
              <div className="bg-blue-50/80 dark:bg-blue-900/30 backdrop-blur-sm rounded-lg p-3 border border-blue-200/50 dark:border-blue-700/50 shadow-sm">
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-base break-all">
                  {getFileIcon(selectedFile.name)} {selectedFile.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Size: {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                Click "Process Files" to upload and analyze
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center shadow-lg dark:shadow-blue-900/30 ring-2 ring-blue-200/50 dark:ring-blue-700/30">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {dragActive.value ? "Drop file here" : "Click to upload or drag & drop"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Supports .xlsx, .xls, .csv files
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                No file size limits
              </p>
            </div>
          </div>
        )}
      </div>
      
      {fileData && (
        <div className="bg-white/90 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl p-5 border border-gray-200/70 dark:border-gray-600/60 shadow-lg dark:shadow-xl dark:shadow-black/30">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
              📋 Available Columns ({fileData.columns.length})
            </h4>
            <div className="flex space-x-2">
              <button className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-700/50 rounded-lg transition-all duration-200 hover:shadow-md dark:hover:shadow-blue-900/30">
                ✏️ Edit
              </button>
              <button className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-700/50 rounded-lg transition-all duration-200 hover:shadow-md dark:hover:shadow-red-900/30">
                🗑️ Remove
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {fileData.columns.map((column: string, index: number) => (
              <span 
                key={index}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-800 dark:text-blue-200 text-sm rounded-lg border border-blue-200/70 dark:border-blue-700/40 font-medium shadow-sm hover:shadow-md transition-all duration-200 dark:shadow-blue-900/20"
              >
                {column}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}