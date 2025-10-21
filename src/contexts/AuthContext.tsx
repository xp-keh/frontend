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
  } | null;
  login: () => void;
  logout: () => void;
  getToken: () => string | undefined;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  canReadFiles: () => boolean;
  canWriteFiles: () => boolean;
  canDeleteFiles: () => boolean;
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
          
          const userInfo = {
            id: tokenParsed.sub,
            username: tokenParsed.preferred_username,
            email: tokenParsed.email,
            firstName: tokenParsed.given_name,
            lastName: tokenParsed.family_name,
            name: tokenParsed.name || `${tokenParsed.given_name || ''} ${tokenParsed.family_name || ''}`.trim() || tokenParsed.preferred_username,
            roles: allRoles,
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
    return hasAnyRole(['file-manager-read', 'file-manager-write', 'file-manager-admin', 'admin']);
  };

  const canWriteFiles = (): boolean => {
    return hasAnyRole(['file-manager-write', 'file-manager-admin', 'admin']);
  };

  const canDeleteFiles = (): boolean => {
    return hasAnyRole(['file-manager-admin', 'admin']);
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
