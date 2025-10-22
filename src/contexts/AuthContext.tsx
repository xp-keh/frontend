"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import keycloak from '@/lib/keycloak';
import { KeycloakInstance } from 'keycloak-js';

interface AuthContextType {
  keycloak: KeycloakInstance | null;
  authenticated: boolean;
  loading: boolean;
  user: {
    id?: string;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    roles?: string[];
    roleAttributes?: Record<string, Record<string, string[]>>;
  } | null;
  login: () => void;
  logout: () => void;
  getToken: () => string | undefined;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  canReadFiles: () => boolean;
  canWriteFiles: () => boolean;
  canDeleteFiles: () => boolean;
  canReadFromBucket: (bucketName: string) => boolean;
  canWriteToBucket: (bucketName: string) => boolean;
  canDeleteFromBucket: (bucketName: string) => boolean;
  getReadableBuckets: () => string[];
  getWritableBuckets: () => string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [keycloakInstance, setKeycloakInstance] = useState<KeycloakInstance | null>(null);

  useEffect(() => {
    const initKeycloak = async () => {
      try {
        const authenticated = await keycloak.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          checkLoginIframe: false,
          pkceMethod: 'S256',
        });

        setKeycloakInstance(keycloak);
        setAuthenticated(authenticated);

        if (authenticated && keycloak.tokenParsed) {
          const tokenParsed = keycloak.tokenParsed as any;
          
          // Extract roles from token
          const realmRoles = tokenParsed.realm_access?.roles || [];
          const clientId = keycloak.clientId || 'data-station-client';
          const clientRoles = tokenParsed.resource_access?.[clientId]?.roles || [];
          const allRoles = [...realmRoles, ...clientRoles];
          
          // Extract role attributes from the token (now working!)
          const roleAttributes: Record<string, Record<string, string[]>> = {};
          
          // Method 1: Check if roleAttributes exist directly in token
          if (tokenParsed.roleAttributes) {
            Object.assign(roleAttributes, tokenParsed.roleAttributes);
          }
          
          // Method 2: Check each role as a direct property in the token
          allRoles.forEach(role => {
            if (tokenParsed[role] && typeof tokenParsed[role] === 'object') {
              roleAttributes[role] = {};
              
              // Extract read_bucket and write_bucket attributes
              if (tokenParsed[role].read_bucket) {
                roleAttributes[role].read_bucket = Array.isArray(tokenParsed[role].read_bucket) 
                  ? tokenParsed[role].read_bucket 
                  : [tokenParsed[role].read_bucket];
              }
              
              if (tokenParsed[role].write_bucket) {
                roleAttributes[role].write_bucket = Array.isArray(tokenParsed[role].write_bucket) 
                  ? tokenParsed[role].write_bucket 
                  : [tokenParsed[role].write_bucket];
              }
              
              // Extract any other attributes
              Object.entries(tokenParsed[role]).forEach(([key, value]) => {
                if (key !== 'read_bucket' && key !== 'write_bucket') {
                  roleAttributes[role][key] = Array.isArray(value) ? value : [value];
                }
              });
            }
          });
          
          // Method 3: Fallback - if no attributes found, add temporary hardcoded values for testing
          if (Object.keys(roleAttributes).length === 0) {
            allRoles.forEach(role => {
              switch (role) {
                case 'user_seismic':
                  roleAttributes[role] = {
                    read_bucket: ['seismic'],
                    write_bucket: ['seismic']
                  };
                  break;
                case 'user_weather':
                  roleAttributes[role] = {
                    read_bucket: ['weather'],
                    write_bucket: ['weather']
                  };
                  break;
                case 'admin':
                  roleAttributes[role] = {
                    read_bucket: ['*'],
                    write_bucket: ['*']
                  };
                  break;
              }
            });
          }
          
          const userInfo = {
            id: tokenParsed.sub,
            username: tokenParsed.preferred_username,
            email: tokenParsed.email,
            firstName: tokenParsed.given_name,
            lastName: tokenParsed.family_name,
            name: tokenParsed.name || `${tokenParsed.given_name || ''} ${tokenParsed.family_name || ''}`.trim() || tokenParsed.preferred_username,
            roles: allRoles,
            roleAttributes: roleAttributes,
          };
          
          setUser(userInfo);
        }

        if (authenticated) {
          setInterval(() => {
            keycloak.updateToken(70).catch(() => {
              setAuthenticated(false);
              setUser(null);
            });
          }, 60000);
        }
      } catch (error) {
        console.error('Failed to initialize Keycloak', error);
        setKeycloakInstance(keycloak);
      } finally {
        setLoading(false);
      }
    };

    initKeycloak();
  }, []);

  const login = () => {
    keycloak.login();
  };

  const logout = () => {
    setUser(null);
    setAuthenticated(false);
    keycloak.logout();
  };

  const getToken = () => {
    return keycloak.token;
  };

  // Role checking functions
  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) || false;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  // File manager specific permissions
  const canReadFiles = (): boolean => {
    // If user has global write permission, they automatically get read permission
    if (hasAnyRole(['user_writer', 'user_weather', 'user_seismic'])) {
      return true;
    }
    // Otherwise check for explicit read permissions
    return hasAnyRole(['user_reader']);
  };

  const canWriteFiles = (): boolean => {
    return hasAnyRole(['user_writer', 'user_weather', 'user_seismic']);
  };

  const canDeleteFiles = (): boolean => {
    return hasAnyRole(['file-manager-admin', 'admin']);
  };

  // Bucket-specific permissions based on role attributes
  // Helper function to check if user has write access to a bucket (without checking read permissions)
  const hasWriteAccessToBucket = (bucketName: string): boolean => {
    // Admin and file-manager-admin can write to any bucket
    if (hasAnyRole(['file-manager-admin', 'admin'])) {
      return true;
    }

    // Global write permission - user_writer can write to all buckets
    if (hasRole('user_writer')) {
      return true;
    }

    if (!user?.roleAttributes || Object.keys(user.roleAttributes).length === 0) {
      return hasRole('file-manager-write');
    }

    // Check role attributes for write_bucket permissions
    const writableBuckets = getWritableBuckets();
    return writableBuckets.includes(bucketName) || writableBuckets.includes('*');
  };

  // Helper function to check if user has read access to a bucket (without checking write permissions)
  const hasReadAccessToBucket = (bucketName: string): boolean => {
    // Admin and file-manager-admin can read from any bucket
    if (hasAnyRole(['file-manager-admin', 'admin'])) {
      return true;
    }

    // Global read permission - user_reader can read from all buckets
    if (hasRole('user_reader')) {
      return true;
    }

    if (!user?.roleAttributes || Object.keys(user.roleAttributes).length === 0) {
      return hasRole('file-manager-read');
    }

    // Check role attributes for read_bucket permissions only
    if (!user?.roleAttributes) {
      return false;
    }

    const readableBuckets: string[] = [];
    Object.entries(user.roleAttributes).forEach(([roleName, attributes]) => {
      if (attributes.read_bucket) {
        const buckets = Array.isArray(attributes.read_bucket) 
          ? attributes.read_bucket 
          : [attributes.read_bucket];
        readableBuckets.push(...buckets);
      }
    });

    const uniqueBuckets = [...new Set(readableBuckets)];
    return uniqueBuckets.includes(bucketName) || uniqueBuckets.includes('*');
  };

  const canReadFromBucket = (bucketName: string): boolean => {
    // If user has write access to this bucket, they automatically get read permission
    if (hasWriteAccessToBucket(bucketName)) {
      return true;
    }

    // Otherwise check for explicit read permissions
    return hasReadAccessToBucket(bucketName);
  };

  const canWriteToBucket = (bucketName: string): boolean => {
    return hasWriteAccessToBucket(bucketName);
  };

  const canDeleteFromBucket = (bucketName: string): boolean => {
    // Only admin and file-manager-admin can delete, regardless of bucket
    // You could extend this to check for delete_bucket attributes if needed
    return hasAnyRole(['file-manager-admin', 'admin']);
  };

  const getReadableBuckets = (): string[] => {
    // Check for global write permission first - if user can write to all, they can read from all
    if (hasRole('user_writer')) {
      return ['*']; // Wildcard means can read from all buckets
    }

    // Check for global read permission
    if (hasRole('user_reader')) {
      return ['*']; // Wildcard means can read from all buckets
    }

    if (!user?.roleAttributes) {
      return [];
    }

    const readableBuckets: string[] = [];

    // Iterate through all role attributes to find read_bucket and write_bucket attributes
    Object.entries(user.roleAttributes).forEach(([roleName, attributes]) => {
      // Add buckets from read_bucket attributes
      if (attributes.read_bucket) {
        const buckets = Array.isArray(attributes.read_bucket) 
          ? attributes.read_bucket 
          : [attributes.read_bucket];
        readableBuckets.push(...buckets);
      }
      
      // Add buckets from write_bucket attributes (write permission grants read permission)
      if (attributes.write_bucket) {
        const buckets = Array.isArray(attributes.write_bucket) 
          ? attributes.write_bucket 
          : [attributes.write_bucket];
        readableBuckets.push(...buckets);
      }
    });

    // Remove duplicates and return
    const uniqueBuckets = [...new Set(readableBuckets)];
    return uniqueBuckets;
  };

  const getWritableBuckets = (): string[] => {
    // Check for global write permission first
    if (hasRole('user_writer')) {
      return ['*']; // Wildcard means can write to all buckets
    }

    if (!user?.roleAttributes) {
      return [];
    }

    const writableBuckets: string[] = [];

    // Iterate through all role attributes to find write_bucket attributes
    Object.entries(user.roleAttributes).forEach(([roleName, attributes]) => {
      if (attributes.write_bucket) {
        // write_bucket can be an array of bucket names or a single string
        const buckets = Array.isArray(attributes.write_bucket) 
          ? attributes.write_bucket 
          : [attributes.write_bucket];
        writableBuckets.push(...buckets);
      }
    });

    // Remove duplicates and return
    const uniqueBuckets = [...new Set(writableBuckets)];
    return uniqueBuckets;
  };

  const value: AuthContextType = {
    keycloak: keycloakInstance,
    authenticated,
    loading,
    user,
    login,
    logout,
    getToken,
    hasRole,
    hasAnyRole,
    canReadFiles,
    canWriteFiles,
    canDeleteFiles,
    canReadFromBucket,
    canWriteToBucket,
    canDeleteFromBucket,
    getReadableBuckets,
    getWritableBuckets,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
