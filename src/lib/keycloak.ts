import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:7080/',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'data-station',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'data-station-client',
};

console.log('🔧 Keycloak config loaded:', keycloakConfig);
console.log('🌍 Environment variables:', {
  NEXT_PUBLIC_KEYCLOAK_URL: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
  NEXT_PUBLIC_KEYCLOAK_REALM: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
  NEXT_PUBLIC_KEYCLOAK_CLIENT_ID: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID
});

const keycloak = new Keycloak(keycloakConfig);

// Add event listeners for debugging
keycloak.onReady = (authenticated) => {
  console.log('🎯 Keycloak onReady:', authenticated);
};

keycloak.onAuthSuccess = () => {
  console.log('✅ Keycloak onAuthSuccess');
};

keycloak.onAuthError = (error) => {
  console.error('❌ Keycloak onAuthError:', error);
};

keycloak.onAuthRefreshSuccess = () => {
  console.log('🔄 Keycloak onAuthRefreshSuccess');
};

keycloak.onAuthRefreshError = () => {
  console.error('❌ Keycloak onAuthRefreshError');
};

keycloak.onAuthLogout = () => {
  console.log('🚪 Keycloak onAuthLogout');
};

keycloak.onTokenExpired = () => {
  console.warn('⏰ Keycloak onTokenExpired');
};

export default keycloak;