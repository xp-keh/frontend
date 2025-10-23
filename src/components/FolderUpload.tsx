'use client';

import { useState, useRef } from 'react';
import { formatFileSize } from '@/actions/files';

interface FolderUploadProps {
  onUpload: (folderName: string, files: File[]) => void;
  onClose: () => void;
  isLoading: boolean;
}

const FolderUpload: React.FC<FolderUploadProps> = ({ onUpload, onClose, isLoading }) => {
  const [folderName, setFolderName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [step, setStep] = useState<'folder' | 'files'>('folder');
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

  const handleFolderNameSubmit = () => {
    if (folderName.trim()) {
      setStep('files');
    }
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0 && folderName.trim()) {
      onUpload(folderName.trim(), selectedFiles);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const getTotalSize = () => {
    return selectedFiles.reduce((total, file) => total + file.size, 0);
  };

  const handleBack = () => {
    if (step === 'files') {
      setStep('folder');
      setSelectedFiles([]);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#14151d] p-6 rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            {step === 'folder' ? 'Create New Folder' : `Upload Files to "${folderName}"`}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step === 'folder' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Folder Name
              </label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name"
                className="w-full px-3 py-2 bg-[#2a2d3e] border border-[#444654] rounded text-white placeholder-gray-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFolderNameSubmit();
                  if (e.key === 'Escape') onClose();
                }}
                autoFocus
              />
            </div>
            
            <div className="flex items-start gap-2 p-3 bg-[#1d1f2b] border border-[#444654] rounded-lg">
              <svg className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-gray-400">
                <p>After creating the folder name, you'll be able to select and upload files directly into this folder.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#1d1f2b] hover:bg-[#2a2d3e] border border-[#444654] text-gray-300 font-medium rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFolderNameSubmit}
                disabled={!folderName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded transition-colors"
              >
                Next: Select Files
              </button>
            </div>
          </div>
        )}

        {step === 'files' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={handleBack}
                className="p-1 hover:bg-[#2a2d3e] rounded text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm text-gray-400">Back to folder name</span>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver ? 'border-blue-500 bg-blue-500/10' : 'border-[#444654] hover:border-gray-500'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center space-y-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div>
                  <p className="text-lg font-medium text-white">Drop files here</p>
                  <p className="text-gray-400">or</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    browse files
                  </button>
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-white">Selected Files ({selectedFiles.length})</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-[#1d1f2b] border border-[#444654] rounded">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-white truncate">{file.name}</span>
                        <span className="text-xs text-gray-400">({formatFileSize(file.size)})</span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-400">
                  Total size: {formatFileSize(getTotalSize())}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-[#1d1f2b] hover:bg-[#2a2d3e] border border-[#444654] text-gray-300 font-medium rounded transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || isLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded transition-colors"
              >
                {isLoading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s) to "${folderName}"`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderUpload;