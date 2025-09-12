import { Configuration, PopupRequest } from '@azure/msal-browser';

// MSAL configuration for port 5173
export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.REACT_APP_MSAL_CLIENT_ID || 'your-client-id-here',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: 'http://localhost:5173/', // Configured for port 5173
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
  return process.env.REACT_APP_MSAL_CLIENT_ID && 
         process.env.REACT_APP_MSAL_CLIENT_ID !== 'your-client-id-here' &&
         process.env.REACT_APP_MSAL_CLIENT_ID !== 'demo-client-id';
};
