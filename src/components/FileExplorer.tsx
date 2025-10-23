'use client';

import { useState } from 'react';
import { LegacyFileItem as FileItem, formatFileSize, getFileTypeIcon } from '@/actions/files';

interface FileExplorerProps {
  files: FileItem[];
  currentPath: string;
  bucketName: string;
  isLoading: boolean;
  onFileSelect: (file: FileItem) => void;
  onFolderOpen: (folderName: string) => void;
  onBackNavigation: () => void;
  onUpload: () => void;
  onDelete: (fileName: string) => void;
  onDownload: (fileName: string) => void;
  onFolderUpload: () => void;
  canWrite?: boolean;
  canDelete?: boolean;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  currentPath,
  bucketName,
  isLoading,
  onFileSelect,
  onFolderOpen,
  onBackNavigation,
  onUpload,
  onDelete,
  onDownload,
  onFolderUpload,
  canWrite = false,
  canDelete = false,
}) => {
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleFileClick = (file: FileItem) => {
    setSelectedFileName(file.name);
    onFileSelect(file);
    
    if (file.isFolder) {
      onFolderOpen(file.name);
    }
  };

  const sortedFiles = [...files].sort((a, b) => {
    let comparison = 0;
    
    // Always put folders first
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'date':
        comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">File Explorer</h2>
          {currentPath && (
            <button
              onClick={onBackNavigation}
              className="p-2 hover:bg-[#2a2d3e] rounded border border-[#444654] text-gray-400 hover:text-white transition-colors"
              title="Go back"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Sort options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'size' | 'date')}
            className="bg-[#1d1f2b] border border-[#444654] text-white text-sm px-3 py-1 rounded"
          >
            <option value="name">Name</option>
            <option value="size">Size</option>
            <option value="date">Date</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 hover:bg-[#2a2d3e] rounded border border-[#444654] text-gray-400 hover:text-white transition-colors"
            title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            <svg className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Path breadcrumb */}
      <div className="mb-4 p-3 bg-[#1d1f2b] border border-[#444654] rounded-lg text-sm text-gray-300">
        <span className="text-blue-400 font-medium">{bucketName}</span>
        {currentPath && (
          <>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-white">{currentPath}</span>
          </>
        )}
      </div>

      {/* Action buttons */}
      {canWrite && (
        <div className="flex gap-3 mb-6">
          <button
            onClick={onUpload}
            className="flex items-center gap-2 px-4 py-2 bg-[#1d1f2b] hover:bg-[#2a2d3e] border border-[#444654] text-white font-medium rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Files
          </button>
          
          <button
            onClick={onFolderUpload}
            className="flex items-center gap-2 px-4 py-2 bg-[#1d1f2b] hover:bg-[#2a2d3e] border border-[#444654] text-white font-medium rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Folder
          </button>
        </div>
      )}

      {/* File list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-gray-400">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
              Loading files...
            </div>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <svg className="w-12 h-12 mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"></path>
            </svg>
            <p>No files in this folder</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sortedFiles.map((file) => (
              <div
                key={file.name}
                onClick={() => handleFileClick(file)}
                className={`group flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors border ${
                  selectedFileName === file.name
                    ? 'bg-[#2a2d3e] border-[#444654] text-white'
                    : 'hover:bg-[#1d1f2b] border-transparent text-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl">{getFileTypeIcon(file.name, file.isFolder)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{file.name}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-2">
                      <span>{file.isFolder ? 'Folder' : formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{new Date(file.lastModified).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                {!file.isFolder && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload(file.name);
                      }}
                      className="p-2 hover:bg-[#2a2d3e] rounded border border-[#444654] text-gray-400 hover:text-white transition-colors"
                      title="Download"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    {canDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(file.name);
                        }}
                        className="p-2 hover:bg-red-600 rounded border border-[#444654] text-gray-400 hover:text-red-200 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;