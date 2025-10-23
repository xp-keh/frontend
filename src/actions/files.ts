import keycloak from '@/lib/keycloak';

// API interfaces matching the MinIO backend contract
export interface Dataset {
  name: string;
  displayName: string;
  description: string;
}

export interface FileItem {
  type: 'file' | 'folder';
  name: string;
  size: number;
  modified: string; // ISO8601
}

export interface FolderExploration {
  path: string;
  folders: FileItem[];
  files: FileItem[];
}

export interface FileMetadata {
  name: string;
  size: number;
  contentType: string;
  modified: string;
  etag: string;
}

export interface UploadResponse {
  uploaded: boolean;
  path: string;
  size: number;
}

export interface LegacyFileItem {
  name: string;
  size: number;
  lastModified: string;
  isFolder: boolean;
  type?: string;
  url?: string;
}

export interface Bucket {
  name: string;
  permissions?: string[];
  creationDate?: string;
}

export interface UserPermissions {
  readableBuckets: string[];
  writableBuckets: string[];
  canReadFromBucket: (bucketName: string) => boolean;
  canWriteToBucket: (bucketName: string) => boolean;
  canDeleteFromBucket: (bucketName: string) => boolean;
}

export function createUserPermissions(authContext: {
  getReadableBuckets: () => string[];
  getWritableBuckets: () => string[];
  canReadFromBucket: (bucketName: string) => boolean;
  canWriteToBucket: (bucketName: string) => boolean;
  canDeleteFromBucket: (bucketName: string) => boolean;
}): UserPermissions {
  return {
    readableBuckets: authContext.getReadableBuckets(),
    writableBuckets: authContext.getWritableBuckets(),
    canReadFromBucket: authContext.canReadFromBucket,
    canWriteToBucket: authContext.canWriteToBucket,
    canDeleteFromBucket: authContext.canDeleteFromBucket,
  };
}

export function serializePermissionsForBackend(userPermissions: UserPermissions) {
  return {
    readableBuckets: userPermissions.readableBuckets.join(','),
    writableBuckets: userPermissions.writableBuckets.join(','),
    fullPermissions: JSON.stringify({
      readableBuckets: userPermissions.readableBuckets,
      writableBuckets: userPermissions.writableBuckets,
    })
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

// Temporary debug logs
console.log('🌐 API_BASE_URL being used:', API_BASE_URL);

function getAuthHeaders(userPermissions?: UserPermissions): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Temporarily comment out auth header to test if it's causing CORS issues
  // if (keycloak.token) {
  //   headers['Authorization'] = `Bearer ${keycloak.token}`;
  // }
  
  // Temporarily comment out custom headers to fix CORS issues
  // Add bucket permissions to headers for backend validation
  // if (userPermissions) {
  //   const serialized = serializePermissionsForBackend(userPermissions);
  //   headers['X-Readable-Buckets'] = serialized.readableBuckets;
  //   headers['X-Writable-Buckets'] = serialized.writableBuckets;
  //   headers['X-User-Permissions'] = serialized.fullPermissions;
  // }
  
  return headers;
}

// Helper function to get auth headers for FormData requests
function getAuthHeadersForFormData(userPermissions?: UserPermissions): Record<string, string> {
  const headers: Record<string, string> = {};
  
  // Temporarily comment out auth header to test if it's causing CORS issues
  // if (keycloak.token) {
  //   headers['Authorization'] = `Bearer ${keycloak.token}`;
  // }
  
  // Temporarily comment out custom headers to fix CORS issues
  // Add bucket permissions to headers for backend validation
  // if (userPermissions) {
  //   const serialized = serializePermissionsForBackend(userPermissions);
  //   headers['X-Readable-Buckets'] = serialized.readableBuckets;
  //   headers['X-Writable-Buckets'] = serialized.writableBuckets;
  //   headers['X-User-Permissions'] = serialized.fullPermissions;
  // }
  
  return headers;
}

// 1. List datasets (MinIO API)
export async function getDatasets(userPermissions?: UserPermissions): Promise<Dataset[]> {
  console.log('🔍 Fetching datasets from:', `${API_BASE_URL}/files/datasets`);
  console.log('🔐 User permissions:', userPermissions);
  
  try {
    const headers = getAuthHeaders(userPermissions);
    console.log('📡 Request headers:', headers);
    
    const response = await fetch(`${API_BASE_URL}/files/datasets`, {
      method: 'GET',
      headers,
    });

    console.log('📥 Response status:', response.status, response.statusText);
    console.log('📥 Response ok:', response.ok);

    if (!response.ok) {
      throw new Error(`Failed to fetch datasets: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📊 Raw API response:', data);
    
    let datasets: Dataset[];
    if (data.datasets && Array.isArray(data.datasets)) {
      datasets = data.datasets.map((dataset: any) => ({
        name: dataset.bucketName || dataset.id,
        displayName: dataset.name || dataset.displayName,
        description: `${dataset.name} - Created: ${new Date(dataset.created).toLocaleDateString()}`
      }));
    } else if (Array.isArray(data)) {
      datasets = data;
    } else {
      console.warn('Unexpected API response format:', data);
      datasets = [];
    }
    
    console.log('✅ Processed datasets:', datasets);
    
    // Filter datasets based on user permissions
    if (userPermissions) {
      const filtered = datasets.filter(dataset => 
        userPermissions.canReadFromBucket(dataset.name)
      );
      console.log('🔒 Filtered datasets based on permissions:', filtered);
      return filtered;
    }
    
    return datasets;
  } catch (error) {
    console.error('❌ Error fetching datasets:', error);
    throw error;
  }
}

// 2. Browse bucket (MinIO API)
export async function browseBucket(bucket: string, userPermissions?: UserPermissions): Promise<FileItem[]> {
  if (userPermissions && !userPermissions.canReadFromBucket(bucket)) {
    throw new Error(`No permission to read from bucket: ${bucket}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/files/browse/${encodeURIComponent(bucket)}`, {
      method: 'GET',
      headers: getAuthHeaders(userPermissions),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Bucket not found: ${bucket}`);
      }
      throw new Error(`Failed to browse bucket: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle new API response format with immediateItems
    if (data.immediateItems && Array.isArray(data.immediateItems)) {
      return data.immediateItems.map((item: any) => ({
        type: item.type as 'file' | 'folder',
        name: item.displayName || item.name || item.relativePath,
        size: item.size || 0,
        modified: item.lastModified || new Date().toISOString()
      }));
    }
    
    // Handle legacy API response format with items array
    if (data.items && Array.isArray(data.items)) {
      return data.items.map((item: any) => ({
        type: item.type as 'file' | 'folder',
        name: item.displayName || item.name,
        size: item.size || 0,
        modified: item.lastModified || new Date().toISOString()
      }));
    } else if (Array.isArray(data)) {
      return data;
    } else {
      console.warn('Unexpected browse bucket response format:', data);
      return [];
    }
  } catch (error) {
    console.error(`Error browsing bucket ${bucket}:`, error);
    throw error;
  }
}

// 3. Explore deep folder structure (MinIO API)
export async function exploreFolder(
  bucket: string, 
  path: string, 
  userPermissions?: UserPermissions
): Promise<FolderExploration> {
  if (userPermissions && !userPermissions.canReadFromBucket(bucket)) {
    throw new Error(`No permission to read from bucket: ${bucket}`);
  }

  try {
    const url = new URL(`${API_BASE_URL}/files/explore/${encodeURIComponent(bucket)}`);
    url.searchParams.set('path', path);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders(userPermissions),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Folder not found: ${path} in bucket ${bucket}`);
      }
      throw new Error(`Failed to explore folder: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle the new API response format
    if (data.immediateItems && Array.isArray(data.immediateItems)) {
      // Separate folders and files from immediateItems
      const folders: FileItem[] = [];
      const files: FileItem[] = [];
      
      data.immediateItems.forEach((item: any) => {
        const fileItem: FileItem = {
          type: item.type as 'file' | 'folder',
          name: item.displayName || item.name || item.relativePath,
          size: item.size || 0,
          modified: item.lastModified || new Date().toISOString()
        };
        
        if (item.type === 'folder') {
          folders.push(fileItem);
        } else {
          files.push(fileItem);
        }
      });
      
      return {
        path: data.currentPath || path,
        folders,
        files
      };
    }
    
    // Fallback to old format for backward compatibility
    return {
      path: data.path || path,
      folders: Array.isArray(data.folders) ? data.folders : [],
      files: Array.isArray(data.files) ? data.files : []
    };
  } catch (error) {
    console.error(`Error exploring folder ${path} in bucket ${bucket}:`, error);
    throw error;
  }
}

// 4. Read file (returns parsed content) (MinIO API)
export async function readFile(
  bucket: string, 
  filename: string, 
  userPermissions?: UserPermissions
): Promise<any> {
  if (userPermissions && !userPermissions.canReadFromBucket(bucket)) {
    throw new Error(`No permission to read from bucket: ${bucket}`);
  }

  try {
    const url = new URL(`${API_BASE_URL}/files/read/${encodeURIComponent(bucket)}`);
    url.searchParams.set('file', filename);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders(userPermissions),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`File not found: ${filename}`);
      }
      throw new Error(`Failed to read file: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error(`Error reading file ${filename} from bucket ${bucket}:`, error);
    throw error;
  }
}

// 5. Download file (binary download) (MinIO API)
export async function downloadFile(
  bucket: string, 
  filename: string, 
  userPermissions?: UserPermissions
): Promise<Blob> {
  if (userPermissions && !userPermissions.canReadFromBucket(bucket)) {
    throw new Error(`No permission to read from bucket: ${bucket}`);
  }

  try {
    const url = new URL(`${API_BASE_URL}/files/download/${encodeURIComponent(bucket)}`);
    url.searchParams.set('file', filename);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders(userPermissions),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`File not found: ${filename}`);
      }
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error(`Error downloading file ${filename} from bucket ${bucket}:`, error);
    throw error;
  }
}

// Helper function to trigger file download in browser
export async function downloadFileAndSave(
  bucket: string, 
  filename: string, 
  userPermissions?: UserPermissions
): Promise<void> {
  try {
    const blob = await downloadFile(bucket, filename, userPermissions);
    
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`Error downloading and saving file ${filename}:`, error);
    throw error;
  }
}

// 6. Upload file (MinIO API)
export async function uploadFile(
  bucket: string,
  file: File,
  path?: string,
  userPermissions?: UserPermissions
): Promise<UploadResponse> {
  if (userPermissions && !userPermissions.canWriteToBucket(bucket)) {
    throw new Error(`No permission to write to bucket: ${bucket}`);
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    if (path) {
      formData.append('path', path);
    }

    const response = await fetch(`${API_BASE_URL}/files/upload/${encodeURIComponent(bucket)}`, {
      method: 'POST',
      headers: getAuthHeadersForFormData(userPermissions),
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('Invalid file or missing required fields');
      }
      if (response.status === 413) {
        throw new Error('File too large');
      }
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      uploaded: true,
      path: data.object || `${path}/${file.name}`,
      size: data.size || file.size
    };
  } catch (error) {
    console.error(`Error uploading file to bucket ${bucket}:`, error);
    throw error;
  }
}

// 7. File metadata / stat (MinIO API)
export async function getFileMetadata(
  bucket: string, 
  filename: string, 
  userPermissions?: UserPermissions
): Promise<FileMetadata> {
  if (userPermissions && !userPermissions.canReadFromBucket(bucket)) {
    throw new Error(`No permission to read from bucket: ${bucket}`);
  }

  try {
    const url = new URL(`${API_BASE_URL}/files/stat/${encodeURIComponent(bucket)}`);
    url.searchParams.set('file', filename);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders(userPermissions),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`File not found: ${filename}`);
      }
      throw new Error(`Failed to get file metadata: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error getting metadata for file ${filename} from bucket ${bucket}:`, error);
    throw error;
  }
}

export async function getBuckets(userPermissions?: UserPermissions): Promise<Bucket[]> {
  try {
    const datasets = await getDatasets(userPermissions);
    
    // Convert datasets to legacy bucket format
    return datasets.map(dataset => ({
      name: dataset.name,
      permissions: userPermissions ? [
        ...(userPermissions.canReadFromBucket(dataset.name) ? ['read'] : []),
        ...(userPermissions.canWriteToBucket(dataset.name) ? ['write'] : []),
        ...(userPermissions.canDeleteFromBucket(dataset.name) ? ['delete'] : []),
      ] : [],
      creationDate: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching buckets:', error);
    throw error;
  }
}

export async function getFiles(bucketName: string, path: string = '', userPermissions?: UserPermissions): Promise<LegacyFileItem[]> {
  // Client-side permission check
  if (userPermissions && !userPermissions.canReadFromBucket(bucketName)) {
    throw new Error(`Access denied: You don't have permission to read from bucket '${bucketName}'`);
  }

  try {
    let files: FileItem[] = [];
    
    if (path) {
      // Use explore folder API for deeper paths
      const exploration = await exploreFolder(bucketName, path, userPermissions);
      files = [
        ...(exploration.folders || []), 
        ...(exploration.files || [])
      ];
    } else {
      // Use browse bucket API for root level
      files = await browseBucket(bucketName, userPermissions);
    }
    
    // Ensure files is always an array
    if (!Array.isArray(files)) {
      console.warn('Files is not an array, defaulting to empty array:', files);
      files = [];
    }
    
    // Convert to legacy format
    return files.map(file => ({
      name: file.name,
      size: file.size,
      lastModified: file.modified,
      isFolder: file.type === 'folder',
      type: file.type === 'folder' ? undefined : 'file',
    }));
  } catch (error) {
    console.error(`Error fetching files from bucket ${bucketName}:`, error);
    // Re-throw the error instead of returning mock data
    throw error;
  }
}

// Legacy upload function - now uses the MinIO API
export async function uploadFileToPath(bucketName: string, path: string, file: File, userPermissions?: UserPermissions): Promise<void> {
  try {
    await uploadFile(bucketName, file, path, userPermissions);
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Delete a file or folder (not in MinIO API contract, keeping for compatibility)
export async function deleteFile(bucketName: string, filePath: string, userPermissions?: UserPermissions): Promise<void> {
  // Client-side permission check
  if (userPermissions && !userPermissions.canDeleteFromBucket(bucketName)) {
    throw new Error(`Access denied: You don't have permission to delete from bucket '${bucketName}'`);
  }

  try {
    const encodedPath = encodeURIComponent(filePath);
    const response = await fetch(`${API_BASE_URL}/api/files/${bucketName}/${encodedPath}`, {
      method: 'DELETE',
      headers: getAuthHeaders(userPermissions),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

// Legacy download function - now uses the MinIO API
export async function downloadFileFromPath(bucketName: string, filePath: string, userPermissions?: UserPermissions): Promise<void> {
  try {
    await downloadFileAndSave(bucketName, filePath, userPermissions);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}

// Create a new folder (not in MinIO API contract, keeping for compatibility)
export async function createFolder(bucketName: string, folderPath: string, userPermissions?: UserPermissions): Promise<void> {
  // Client-side permission check
  if (userPermissions && !userPermissions.canWriteToBucket(bucketName)) {
    throw new Error(`Access denied: You don't have permission to write to bucket '${bucketName}'`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/files/${bucketName}/folder`, {
      method: 'POST',
      headers: getAuthHeaders(userPermissions),
      body: JSON.stringify({ path: folderPath }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create folder: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
}

// Get file preview/metadata - Enhanced version using the new backend
export async function getFilePreview(
  bucketName: string, 
  filePath: string, 
  userPermissions?: UserPermissions,
  options: {
    preview?: boolean;
    format?: 'auto' | 'base64' | 'text' | 'metadata';
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
    page?: number;
    maxSize?: number;
    maxResponseSize?: number;
    compress?: boolean;
  } = {}
): Promise<any> {
  if (userPermissions && !userPermissions.canReadFromBucket(bucketName)) {
    throw new Error(`No permission to read from bucket: ${bucketName}`);
  }

  try {
    const url = new URL(`${API_BASE_URL}/files/read/${encodeURIComponent(bucketName)}`);
    url.searchParams.set('file', filePath);
    
    // Set preview mode by default for better performance
    url.searchParams.set('preview', options.preview !== false ? 'true' : 'false');
    
    // Add all the enhanced options
    if (options.format) url.searchParams.set('format', options.format);
    if (options.quality) url.searchParams.set('quality', options.quality.toString());
    if (options.maxWidth) url.searchParams.set('maxWidth', options.maxWidth.toString());
    if (options.maxHeight) url.searchParams.set('maxHeight', options.maxHeight.toString());
    if (options.page) url.searchParams.set('page', options.page.toString());
    if (options.maxSize) url.searchParams.set('maxSize', options.maxSize.toString());
    if (options.maxResponseSize) url.searchParams.set('maxResponseSize', options.maxResponseSize.toString());
    if (options.compress) url.searchParams.set('compress', 'true');
    
    // Enable gzip compression for large responses
    url.searchParams.set('gzip', 'auto');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders(userPermissions),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`File not found: ${filePath}`);
      }
      if (response.status === 413) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'File too large for preview');
      }
      throw new Error(`Failed to get file preview: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting file preview:', error);
    throw error;
  }
}

// Helper function to format file sizes
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to get file type icon
export function getFileTypeIcon(fileName: string, isFolder: boolean): string {
  if (isFolder) return '📁';
  
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf': return '📄';
    case 'doc':
    case 'docx': return '📝';
    case 'xls':
    case 'xlsx': return '📊';
    case 'ppt':
    case 'pptx': return '📋';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
    case 'webp':
    case 'bmp':
    case 'tiff': return '🖼️';
    case 'mp3':
    case 'wav':
    case 'flac': return '🎵';
    case 'mp4':
    case 'avi':
    case 'mov': return '🎬';
    case 'zip':
    case 'rar':
    case '7z': return '🗜️';
    case 'txt': return '📄';
    case 'csv': return '📊';
    case 'json': return '📋';
    case 'log': return '📜';
    case 'md': return '📝';
    case 'xml': return '📄';
    case 'js':
    case 'ts':
    case 'py':
    case 'java':
    case 'cpp':
    case 'c':
    case 'h': return '💻';
    case 'html':
    case 'css': return '🌐';
    default: return '📄';
  }
}