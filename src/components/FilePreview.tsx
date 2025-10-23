'use client';

import { useState, useEffect } from 'react';
import { LegacyFileItem as FileItem, formatFileSize, getFileTypeIcon, getFilePreview } from '@/actions/files';

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
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (file && !file.isFolder) {
      loadPreview();
    }
  }, [file, currentPage]);

  const loadPreview = async () => {
    try {
      setIsLoadingPreview(true);
      setPreviewError(null);
      const fullPath = currentPath ? `${currentPath}/${file.name}` : file.name;
      
      // Configure preview options based on file type
      const options: any = {
        preview: true,
        format: 'auto',
        quality: 80,
        maxWidth: 800,
        maxHeight: 600,
        maxSize: 10, // 10MB max for preview
        maxResponseSize: 5, // 5MB max response size
        compress: true
      };

      // For PDFs, include page number
      if (isPdfFile(file.name)) {
        options.page = currentPage;
        options.format = 'text'; // Get text content for PDFs
      }

      const preview = await getFilePreview(bucketName, fullPath, undefined, options);
      setPreviewData(preview);
    } catch (error: any) {
      console.error('Failed to load preview:', error);
      setPreviewError(error.message || 'Failed to load preview');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const getFileExtension = (fileName: string): string => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  };

  const isImageFile = (fileName: string): boolean => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'tiff'];
    return imageExtensions.includes(getFileExtension(fileName));
  };

  const isTextFile = (fileName: string): boolean => {
    const textExtensions = ['txt', 'md', 'csv', 'json', 'xml', 'log', 'js', 'ts', 'html', 'css', 'py', 'java', 'cpp', 'c', 'h'];
    return textExtensions.includes(getFileExtension(fileName));
  };

  const isPdfFile = (fileName: string): boolean => {
    return getFileExtension(fileName) === 'pdf';
  };

  const renderImagePreview = () => {
    if (previewData?.content?.base64) {
      return (
        <div className="flex flex-col items-center">
          <img
            src={previewData.content.dataUrl}
            alt={file.name}
            className="max-w-full max-h-96 rounded-lg shadow-lg"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              setPreviewError('Failed to load image');
            }}
          />
          {previewData.content.optimized && (
            <div className="mt-2 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
              Optimized: {previewData.content.compressionRatio} size reduction
            </div>
          )}
          {previewData.metadata?.dimensions && (
            <div className="mt-1 text-xs text-gray-400">
              {previewData.metadata.dimensions.width} × {previewData.metadata.dimensions.height}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const renderPdfPreview = () => {
    if (previewData?.content?.text) {
      const { content, metadata } = previewData;
      return (
        <div className="space-y-4">
          {/* PDF Page Navigation */}
          {metadata?.pages > 1 && (
            <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1 || isLoadingPreview}
                className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
              >
                Previous
              </button>
              <span className="text-sm text-gray-300">
                Page {currentPage} of {metadata.pages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(metadata.pages, currentPage + 1))}
                disabled={currentPage >= metadata.pages || isLoadingPreview}
                className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
              >
                Next
              </button>
            </div>
          )}
          
          {/* PDF Text Content */}
          <div className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">
              {content.text}
            </pre>
            {content.truncated && (
              <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded text-yellow-200 text-sm">
                <strong>Note:</strong> Content was truncated. {content.note}
              </div>
            )}
          </div>
          
          {/* PDF Metadata */}
          {metadata && (
            <div className="text-xs text-gray-400 bg-gray-800 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                <div>Pages: {metadata.pages}</div>
                <div>Word Count: {content.wordCount}</div>
                <div>Version: {metadata.version}</div>
                <div>Characters: {content.characterCount}</div>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const renderTextPreview = () => {
    if (previewData?.content) {
      const content = previewData.content;
      
      if (content.rows && Array.isArray(content.rows)) {
        // CSV data
        return (
          <div className="space-y-4">
            {content.limited && (
              <div className="p-3 bg-yellow-900/30 border border-yellow-600/50 rounded text-yellow-200 text-sm">
                <strong>Note:</strong> {content.note}
              </div>
            )}
            <div className="overflow-x-auto max-h-96 bg-gray-800 rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-700 sticky top-0">
                  <tr>
                    {content.headers?.map((header: string, idx: number) => (
                      <th key={idx} className="px-3 py-2 text-left text-gray-200 border-b border-gray-600">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {content.rows.slice(0, 50).map((row: any, idx: number) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                      {content.headers?.map((header: string, cellIdx: number) => (
                        <td key={cellIdx} className="px-3 py-2 text-gray-300 border-b border-gray-700">
                          {row[header] || ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      } else if (content.lines && Array.isArray(content.lines)) {
        // Log/text file with lines
        return (
          <div className="space-y-4">
            {content.limited && (
              <div className="p-3 bg-yellow-900/30 border border-yellow-600/50 rounded text-yellow-200 text-sm">
                <strong>Note:</strong> {content.note}
              </div>
            )}
            <div className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                {content.lines.join('\n')}
              </pre>
            </div>
          </div>
        );
      } else if (typeof content === 'object') {
        // JSON data
        return (
          <div className="space-y-4">
            {content.truncated && (
              <div className="p-3 bg-yellow-900/30 border border-yellow-600/50 rounded text-yellow-200 text-sm">
                <strong>Note:</strong> {content.note}
              </div>
            )}
            <div className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                {JSON.stringify(content, null, 2)}
              </pre>
            </div>
          </div>
        );
      } else {
        // Plain text
        const textContent = content.raw || content;
        return (
          <div className="space-y-4">
            {content.truncated && (
              <div className="p-3 bg-yellow-900/30 border border-yellow-600/50 rounded text-yellow-200 text-sm">
                <strong>Note:</strong> {content.note}
              </div>
            )}
            <div className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                {textContent}
              </pre>
            </div>
          </div>
        );
      }
    }
    return null;
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
          <p className="text-center mb-2">{previewError}</p>
          {previewError.includes('too large') && (
            <div className="text-sm text-gray-500 text-center">
              <p>Try downloading the file instead</p>
              <p>or the file may be too large for preview</p>
            </div>
          )}
        </div>
      );
    }

    if (!previewData) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <div className="text-6xl mb-4">{getFileTypeIcon(file.name, file.isFolder)}</div>
          <p>No preview available</p>
        </div>
      );
    }

    // Handle different preview types based on the backend response
    if (previewData.type === 'image' && isImageFile(file.name)) {
      return renderImagePreview();
    }

    if ((previewData.type === 'pdf-page-text' || previewData.type === 'pdf-binary') && isPdfFile(file.name)) {
      return renderPdfPreview();
    }

    if ((previewData.type === 'text' || previewData.type === 'csv' || previewData.type === 'json' || previewData.type === 'log') && isTextFile(file.name)) {
      return renderTextPreview();
    }

    // Fallback for unsupported file types
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <div className="text-6xl mb-4">{getFileTypeIcon(file.name, file.isFolder)}</div>
        <p>Preview not supported for this file type</p>
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

      {/* Preview Controls */}
      {(isPdfFile(file.name) || isImageFile(file.name)) && (
        <div className="mb-4 p-3 bg-[#1d1f2b] border border-[#444654] rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Preview Options</h4>
          <div className="flex gap-2 flex-wrap">
            {isPdfFile(file.name) && (
              <button
                onClick={() => {
                  setCurrentPage(1);
                  loadPreview();
                }}
                disabled={isLoadingPreview}
                className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50"
              >
                Refresh Text
              </button>
            )}
            {isImageFile(file.name) && (
              <>
                <button
                  onClick={() => {
                    const fullPath = currentPath ? `${currentPath}/${file.name}` : file.name;
                    getFilePreview(bucketName, fullPath, undefined, {
                      preview: false,
                      format: 'base64',
                      quality: 100
                    }).then(setPreviewData);
                  }}
                  disabled={isLoadingPreview}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50"
                >
                  Full Quality
                </button>
                <button
                  onClick={() => {
                    const fullPath = currentPath ? `${currentPath}/${file.name}` : file.name;
                    getFilePreview(bucketName, fullPath, undefined, {
                      preview: true,
                      format: 'base64',
                      quality: 50,
                      maxWidth: 400,
                      maxHeight: 300
                    }).then(setPreviewData);
                  }}
                  disabled={isLoadingPreview}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50"
                >
                  Small Preview
                </button>
              </>
            )}
          </div>
        </div>
      )}

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
        <h4 className="font-medium text-white mb-3">File Information</h4>
        <div className="text-sm text-gray-400 space-y-2">
          <div className="flex justify-between">
            <span>Size:</span>
            <span>{formatFileSize(file.size)}</span>
          </div>
          <div className="flex justify-between">
            <span>Modified:</span>
            <span>{new Date(file.lastModified).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Extension:</span>
            <span>{getFileExtension(file.name) || 'No extension'}</span>
          </div>
          <div className="flex justify-between">
            <span>Type:</span>
            <span>{previewData?.type || 'Unknown'}</span>
          </div>
          
          {/* Enhanced metadata from backend */}
          {previewData?.metadata && (
            <>
              {previewData.metadata.contentType && (
                <div className="flex justify-between">
                  <span>Content Type:</span>
                  <span>{previewData.metadata.contentType}</span>
                </div>
              )}
              {previewData.metadata.encoding && (
                <div className="flex justify-between">
                  <span>Encoding:</span>
                  <span>{previewData.metadata.encoding}</span>
                </div>
              )}
              
              {/* Image-specific metadata */}
              {previewData.metadata.dimensions && (
                <>
                  <div className="flex justify-between">
                    <span>Dimensions:</span>
                    <span>{previewData.metadata.dimensions.width} × {previewData.metadata.dimensions.height}</span>
                  </div>
                  {previewData.metadata.format && (
                    <div className="flex justify-between">
                      <span>Image Format:</span>
                      <span>{previewData.metadata.format.toUpperCase()}</span>
                    </div>
                  )}
                  {previewData.metadata.channels && (
                    <div className="flex justify-between">
                      <span>Channels:</span>
                      <span>{previewData.metadata.channels}</span>
                    </div>
                  )}
                  {previewData.metadata.hasAlpha !== undefined && (
                    <div className="flex justify-between">
                      <span>Has Alpha:</span>
                      <span>{previewData.metadata.hasAlpha ? 'Yes' : 'No'}</span>
                    </div>
                  )}
                </>
              )}
              
              {/* PDF-specific metadata */}
              {previewData.metadata.pages && (
                <>
                  <div className="flex justify-between">
                    <span>Total Pages:</span>
                    <span>{previewData.metadata.pages}</span>
                  </div>
                  {previewData.metadata.version && (
                    <div className="flex justify-between">
                      <span>PDF Version:</span>
                      <span>{previewData.metadata.version}</span>
                    </div>
                  )}
                  {previewData.metadata.info?.Title && (
                    <div className="flex justify-between">
                      <span>Title:</span>
                      <span className="text-right max-w-48 truncate">{previewData.metadata.info.Title}</span>
                    </div>
                  )}
                  {previewData.metadata.info?.Author && (
                    <div className="flex justify-between">
                      <span>Author:</span>
                      <span className="text-right max-w-48 truncate">{previewData.metadata.info.Author}</span>
                    </div>
                  )}
                </>
              )}
              
              {/* Compression information */}
              {previewData.metadata.compressed && (
                <>
                  <div className="flex justify-between">
                    <span>Optimized:</span>
                    <span>Yes</span>
                  </div>
                  {previewData.metadata.compressionRatio && (
                    <div className="flex justify-between">
                      <span>Size Reduction:</span>
                      <span>{previewData.metadata.compressionRatio}</span>
                    </div>
                  )}
                </>
              )}
            </>
          )}
          
          {/* Content-specific information */}
          {previewData?.content && (
            <>
              {previewData.content.wordCount && (
                <div className="flex justify-between">
                  <span>Word Count:</span>
                  <span>{previewData.content.wordCount.toLocaleString()}</span>
                </div>
              )}
              {previewData.content.characterCount && (
                <div className="flex justify-between">
                  <span>Character Count:</span>
                  <span>{previewData.content.characterCount.toLocaleString()}</span>
                </div>
              )}
              {previewData.content.lineCount && (
                <div className="flex justify-between">
                  <span>Line Count:</span>
                  <span>{previewData.content.lineCount.toLocaleString()}</span>
                </div>
              )}
              {previewData.content.totalRows && (
                <div className="flex justify-between">
                  <span>Total Rows:</span>
                  <span>{previewData.content.totalRows.toLocaleString()}</span>
                </div>
              )}
              {previewData.content.headers && (
                <div className="flex justify-between">
                  <span>CSV Columns:</span>
                  <span>{previewData.content.headers.length}</span>
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