import { Configuration, PopupRequest } from '@azure/msal-browser';

// MSAL configuration for port 5173
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID || 'e71e69a8-07fd-4110-8d77-9e4326027969',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin + '/auth/microsoft/callback', // Dynamic redirect URI
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

// Add scopes here for Microsoft Graph API
export const loginRequest: PopupRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
  prompt: 'select_account',
};

// Add scopes here for Microsoft Graph API
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};

// Check if Microsoft authentication is properly configured
export const isMicrosoftAuthConfigured = () => {
  return import.meta.env.VITE_MSAL_CLIENT_ID && 
         import.meta.env.VITE_MSAL_CLIENT_ID !== 'your-client-id-here' &&
         import.meta.env.VITE_MSAL_CLIENT_ID !== 'demo-client-id';
};
