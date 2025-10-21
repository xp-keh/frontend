'use client';

import { useState, useEffect } from 'react';
import { FileItem, formatFileSize, getFileTypeIcon, getFilePreview } from '@/actions/files';

interface FilePreviewProps {
  file: FileItem;
  bucketName: string;
  currentPath: string;
  onClose: () => void;
  onDownload: () => void;
  onDelete: () => void;
  canDelete?: boolean;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  bucketName,
  currentPath,
  onClose,
  onDownload,
  onDelete,
  canDelete = false,
}) => {
  const [previewData, setPreviewData] = useState<any>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    if (file && !file.isFolder) {
      loadPreview();
    }
  }, [file]);

  const loadPreview = async () => {
    try {
      setIsLoadingPreview(true);
      setPreviewError(null);
      const fullPath = currentPath ? `${currentPath}/${file.name}` : file.name;
      const preview = await getFilePreview(bucketName, fullPath);
      setPreviewData(preview);
    } catch (error) {
      console.error('Failed to load preview:', error);
      setPreviewError('Failed to load preview');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const getFileExtension = (fileName: string): string => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  };

  const isImageFile = (fileName: string): boolean => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'];
    return imageExtensions.includes(getFileExtension(fileName));
  };

  const isTextFile = (fileName: string): boolean => {
    const textExtensions = ['txt', 'md', 'csv', 'json', 'xml', 'log', 'js', 'ts', 'html', 'css', 'py', 'java', 'cpp', 'c', 'h'];
    return textExtensions.includes(getFileExtension(fileName));
  };

  const isPdfFile = (fileName: string): boolean => {
    return getFileExtension(fileName) === 'pdf';
  };

  const renderPreview = () => {
    if (isLoadingPreview) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-gray-400">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
            Loading preview...
          </div>
        </div>
      );
    }

    if (previewError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <svg className="w-12 h-12 mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
          </svg>
          <p>{previewError}</p>
        </div>
      );
    }

    if (isImageFile(file.name)) {
      return (
        <div className="flex justify-center">
          <img
            src={previewData?.url || `/api/files/${bucketName}/${currentPath ? currentPath + '/' : ''}${file.name}`}
            alt={file.name}
            className="max-w-full max-h-64 rounded-lg"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              setPreviewError('Failed to load image');
            }}
          />
        </div>
      );
    }

    if (isTextFile(file.name) && previewData?.content) {
      return (
        <div className="bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
          <pre className="text-sm text-gray-300 whitespace-pre-wrap">{previewData.content}</pre>
        </div>
      );
    }

    if (isPdfFile(file.name)) {
      return (
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path>
          </svg>
          <p className="text-gray-400">PDF Document</p>
          <p className="text-sm text-gray-500">Click download to view</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <div className="text-6xl mb-4">{getFileTypeIcon(file.name, file.isFolder)}</div>
        <p>No preview available</p>
        <p className="text-sm text-gray-500">Click download to view file</p>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">File Preview</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* File Info */}
      <div className="mb-6 p-4 bg-[#1d1f2b] border border-[#444654] rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{getFileTypeIcon(file.name, file.isFolder)}</span>
          <div>
            <h3 className="font-medium text-white truncate">{file.name}</h3>
            <p className="text-sm text-gray-400">
              {formatFileSize(file.size)} • Modified {new Date(file.lastModified).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* File Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Type:</span>
            <span className="ml-2 text-white">{file.type || getFileExtension(file.name).toUpperCase()}</span>
          </div>
          <div>
            <span className="text-gray-400">Size:</span>
            <span className="ml-2 text-white">{formatFileSize(file.size)}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-400">Path:</span>
            <span className="ml-2 text-white break-all">
              {bucketName}/{currentPath ? currentPath + '/' : ''}{file.name}
            </span>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">File Preview</h4>
        <div className="bg-[#1d1f2b] border border-[#444654] rounded-lg p-4 min-h-64">
          {renderPreview()}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={onDownload}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1d1f2b] hover:bg-[#2a2d3e] border border-[#444654] rounded text-white font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download File
        </button>

        {canDelete && (
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
                onDelete();
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded text-red-300 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete File
          </button>
        )}
      </div>

      {/* File Metadata */}
      <div className="mt-6 p-4 bg-[#1d1f2b] border border-[#444654] rounded-lg">
        <h4 className="font-medium text-white mb-2">File Information</h4>
        <div className="text-sm text-gray-400 space-y-1">
          <div className="flex justify-between">
            <span>Created:</span>
            <span>{new Date(file.lastModified).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Extension:</span>
            <span>{getFileExtension(file.name) || 'No extension'}</span>
          </div>
          {previewData?.metadata && (
            <>
              <div className="flex justify-between">
                <span>Encoding:</span>
                <span>{previewData.metadata.encoding || 'Unknown'}</span>
              </div>
              {previewData.metadata.dimensions && (
                <div className="flex justify-between">
                  <span>Dimensions:</span>
                  <span>{previewData.metadata.dimensions}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreview;