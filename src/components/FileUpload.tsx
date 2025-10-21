'use client';

import { useState, useRef } from 'react';
import { formatFileSize } from '@/actions/files';

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  onClose: () => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, onClose, isLoading }) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const getTotalSize = () => {
    return selectedFiles.reduce((total, file) => total + file.size, 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#14151d] rounded-xl shadow-md p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto border border-[#444654]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Upload Files</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-6 ${
            dragOver
              ? 'border-blue-400 bg-blue-500/10'
              : 'border-[#444654] hover:border-[#555666] bg-[#1d1f2b]'
          }`}
        >
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-lg font-medium text-white mb-2">
            {dragOver ? 'Drop files here' : 'Drag and drop files here'}
          </p>
          <p className="text-gray-400">or click to browse files</p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={isLoading}
          />
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-3">
              Selected Files ({selectedFiles.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-3 bg-[#1d1f2b] border border-[#444654] rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <svg className="w-6 h-6 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{file.name}</p>
                      <p className="text-sm text-gray-400">
                        {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-gray-400 hover:text-red-400 ml-2"
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-3 text-sm text-gray-400">
              Total size: {formatFileSize(getTotalSize())}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isLoading && (
          <div className="mb-6 p-4 bg-[#1d1f2b] border border-[#444654] rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
              <span className="text-white">Uploading files...</span>
            </div>
            <div className="w-full bg-[#2a2d3e] rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isLoading}
            className="px-6 py-2 bg-[#1d1f2b] hover:bg-[#2a2d3e] border border-[#444654] disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
          >
            {isLoading ? 'Uploading...' : `Upload ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}`}
          </button>
        </div>

        {/* Upload Tips */}
        <div className="mt-6 p-4 bg-[#1d1f2b] border border-[#444654] rounded-lg">
          <h4 className="font-medium text-white mb-2">Upload Guidelines:</h4>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Drag and drop multiple files at once</li>
            <li>• Maximum file size: 100MB per file</li>
            <li>• All file types are supported</li>
            <li>• Files will be uploaded to the current folder</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;