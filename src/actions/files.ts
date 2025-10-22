import keycloak from '@/lib/keycloak';

export interface FileItem {
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

// Helper function to create UserPermissions object from AuthContext
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

// Helper function to serialize permissions for backend
export function serializePermissionsForBackend(userPermissions: UserPermissions) {
  return {
    readableBuckets: userPermissions.readableBuckets.join(','),
    writableBuckets: userPermissions.writableBuckets.join(','),
    // You can also send the full permissions object as JSON if your backend prefers that
    fullPermissions: JSON.stringify({
      readableBuckets: userPermissions.readableBuckets,
      writableBuckets: userPermissions.writableBuckets,
    })
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Helper function to get authorization headers
function getAuthHeaders(userPermissions?: UserPermissions): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (keycloak.token) {
    headers['Authorization'] = `Bearer ${keycloak.token}`;
  }
  
  // Add bucket permissions to headers for backend validation
  if (userPermissions) {
    const serialized = serializePermissionsForBackend(userPermissions);
    headers['X-Readable-Buckets'] = serialized.readableBuckets;
    headers['X-Writable-Buckets'] = serialized.writableBuckets;
    headers['X-User-Permissions'] = serialized.fullPermissions;
  }
  
  return headers;
}

// Helper function to get auth headers for FormData requests
function getAuthHeadersForFormData(userPermissions?: UserPermissions): Record<string, string> {
  const headers: Record<string, string> = {};
  
  if (keycloak.token) {
    headers['Authorization'] = `Bearer ${keycloak.token}`;
  }
  
  // Add bucket permissions to headers for backend validation
  if (userPermissions) {
    const serialized = serializePermissionsForBackend(userPermissions);
    headers['X-Readable-Buckets'] = serialized.readableBuckets;
    headers['X-Writable-Buckets'] = serialized.writableBuckets;
    headers['X-User-Permissions'] = serialized.fullPermissions;
  }
  
  return headers;
}

export async function getBuckets(userPermissions?: UserPermissions): Promise<Bucket[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/files/buckets`, {
      method: 'GET',
      headers: getAuthHeaders(userPermissions),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch buckets: ${response.statusText}`);
    }

    const buckets = await response.json();
    
    // Filter buckets based on user permissions (client-side filtering as backup)
    if (userPermissions) {
      return buckets.filter((bucket: Bucket) => 
        userPermissions.canReadFromBucket(bucket.name)
      );
    }
    
    return buckets;
  } catch (error) {
    console.error('Error fetching buckets:', error);
    // Return mock data for development, filtered by permissions
    const mockBuckets = [
      { name: 'seismic', permissions: ['read', 'write'] },
      { name: 'weather', permissions: ['read', 'write'] },
      { name: 'general', permissions: ['read'] },
      { name: 'uploads', permissions: ['read', 'write'] }
    ];
    
    if (userPermissions) {
      return mockBuckets.filter(bucket => 
        userPermissions.canReadFromBucket(bucket.name)
      );
    }
    
    return mockBuckets;
  }
}

// Get files and folders in a specific bucket and path
export async function getFiles(bucketName: string, path: string = '', userPermissions?: UserPermissions): Promise<FileItem[]> {
  // Client-side permission check
  if (userPermissions && !userPermissions.canReadFromBucket(bucketName)) {
    throw new Error(`Access denied: You don't have permission to read from bucket '${bucketName}'`);
  }

  try {
    const encodedPath = encodeURIComponent(path);
    const response = await fetch(`${API_BASE_URL}/api/files/${bucketName}?path=${encodedPath}`, {
      method: 'GET',
      headers: getAuthHeaders(userPermissions),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch files: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching files:', error);
    
    // Return empty array if no permission, otherwise return mock data
    if (userPermissions && !userPermissions.canReadFromBucket(bucketName)) {
      return [];
    }
    
    // Return mock data for development
    return [
      {
        name: 'documents',
        size: 0,
        lastModified: new Date().toISOString(),
        isFolder: true
      },
      {
        name: 'images',
        size: 0,
        lastModified: new Date().toISOString(),
        isFolder: true
      },
      {
        name: 'sample.pdf',
        size: 1024000,
        lastModified: new Date().toISOString(),
        isFolder: false,
        type: 'application/pdf'
      },
      {
        name: 'data.csv',
        size: 512000,
        lastModified: new Date().toISOString(),
        isFolder: false,
        type: 'text/csv'
      }
    ];
  }
}

// Upload a file to a specific bucket and path
export async function uploadFile(bucketName: string, path: string, file: File, userPermissions?: UserPermissions): Promise<void> {
  // Client-side permission check
  if (userPermissions && !userPermissions.canWriteToBucket(bucketName)) {
    throw new Error(`Access denied: You don't have permission to write to bucket '${bucketName}'`);
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    const response = await fetch(`${API_BASE_URL}/api/files/${bucketName}/upload`, {
      method: 'POST',
      headers: getAuthHeadersForFormData(userPermissions),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Delete a file or folder
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

// Download a file
export async function downloadFile(bucketName: string, filePath: string, userPermissions?: UserPermissions): Promise<void> {
  // Client-side permission check
  if (userPermissions && !userPermissions.canReadFromBucket(bucketName)) {
    throw new Error(`Access denied: You don't have permission to read from bucket '${bucketName}'`);
  }

  try {
    const encodedPath = encodeURIComponent(filePath);
    const response = await fetch(`${API_BASE_URL}/api/files/${bucketName}/${encodedPath}/download`, {
      method: 'GET',
      headers: getAuthHeadersForFormData(userPermissions),
    });

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    // Create download link
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filePath.split('/').pop() || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}

// Create a new folder
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

// Get file preview/metadata
export async function getFilePreview(bucketName: string, filePath: string, userPermissions?: UserPermissions): Promise<any> {
  // Client-side permission check
  if (userPermissions && !userPermissions.canReadFromBucket(bucketName)) {
    throw new Error(`Access denied: You don't have permission to read from bucket '${bucketName}'`);
  }

  try {
    const encodedPath = encodeURIComponent(filePath);
    const response = await fetch(`${API_BASE_URL}/api/files/${bucketName}/${encodedPath}/preview`, {
      method: 'GET',
      headers: getAuthHeaders(userPermissions),
    });

    if (!response.ok) {
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
    case 'svg': return '🖼️';
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
    default: return '📄';
  }
}