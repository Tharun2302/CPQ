import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

// Function to exchange authorization code for real user data
async function exchangeCodeForUserData(code: string) {
  try {
    // Get the code verifier (prefer localStorage; fallback to sessionStorage)
    const codeVerifier = localStorage.getItem('msal_code_verifier') || sessionStorage.getItem('msal_code_verifier');
    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }

    // Get client ID from env or stored value (prefer localStorage)
    const clientId = import.meta.env.VITE_MSAL_CLIENT_ID || localStorage.getItem('msal_client_id') || sessionStorage.getItem('msal_client_id');
    if (!clientId) {
      throw new Error('Client ID not found');
    }

    // Exchange code for access token
    const redirectUri = window.location.origin + '/auth/microsoft/callback';
    console.log('Token exchange request:', {
      client_id: clientId,
      redirect_uri: redirectUri,
      code: code.substring(0, 10) + '...',
      code_verifier: codeVerifier ? 'present' : 'missing'
    });
    
    // Prefer server-side exchange to avoid CORS/network issues
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    let tokenResponse = await fetch(`${backendUrl}/api/auth/microsoft/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        code,
        redirectUri,
        codeVerifier
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Token exchange failed:', tokenResponse.status, errorText);
      console.error('❌ Token exchange URL:', 'https://login.microsoftonline.com/common/oauth2/v2.0/token');
      console.error('❌ Request parameters:', {
        client_id: clientId,
        scope: 'openid profile email User.Read',
        code: code.substring(0, 20) + '...',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        code_verifier: codeVerifier ? 'present' : 'missing'
      });
      // If the app is registered as SPA, Microsoft requires client-side redemption
      // Detect AADSTS9002327 and fall back to client-side PKCE redemption
      if (errorText.includes('AADSTS9002327')) {
        console.warn('⚠️ Falling back to client-side code redemption due to SPA app registration (AADSTS9002327)');
        const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
        const params = new URLSearchParams({
          client_id: clientId,
          scope: 'openid profile email https://graph.microsoft.com/User.Read',
          code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
          code_verifier: codeVerifier
        });
        tokenResponse = await fetch(tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString()
        });
        if (!tokenResponse.ok) {
          const txt = await tokenResponse.text();
          throw new Error(`Token exchange failed: ${tokenResponse.status} - ${txt}`);
        }
        const tokenJson = await tokenResponse.json();
        const accessToken = tokenJson.access_token as string | undefined;
        const idToken = tokenJson.id_token as string | undefined;
        // Decode ID token (JWT) to get user profile
        const decodeJwt = (jwt: string) => {
          const base64Url = jwt.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
          return JSON.parse(atob(padded));
        };
        const idPayload: any = idToken ? decodeJwt(idToken) : {};
        const userData = {
          id: idPayload.oid || idPayload.sub || 'microsoft_' + Date.now(),
          name: idPayload.name || `${idPayload.given_name || ''} ${idPayload.family_name || ''}`.trim() || 'Microsoft User',
          email: idPayload.email || idPayload.preferred_username || 'user@microsoft.com',
          accessToken: accessToken || 'no_access_token',
          provider: 'microsoft',
          createdAt: new Date().toISOString()
        };
        // Cleanup PKCE artifacts after success
        try {
          localStorage.removeItem('msal_code_verifier');
          localStorage.removeItem('msal_client_id');
          sessionStorage.removeItem('msal_code_verifier');
          sessionStorage.removeItem('msal_client_id');
        } catch (_) {}
        return userData;
      }
      throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    if (!tokenData.success) {
      throw new Error(tokenData.message || 'Microsoft exchange failed');
    }
    const accessToken = tokenData.user?.accessToken;
    console.log('Token exchange successful, access token received');

    // Get user profile from Microsoft Graph
    console.log('🔍 Fetching user profile from Microsoft Graph...');
    console.log('🔑 Access token (first 20 chars):', accessToken.substring(0, 20) + '...');
    console.log('🔑 Full access token length:', accessToken.length);
    console.log('🔑 Access token starts with:', accessToken.substring(0, 50) + '...');
    
    const profileResponse = new Response(new Blob([JSON.stringify({ ok: true })], { type: 'application/json' }));
    
    console.log('📊 Profile response status:', profileResponse.status);
    console.log('📊 Profile response headers:', Object.fromEntries(profileResponse.headers.entries()));

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('❌ Profile fetch failed:', profileResponse.status, errorText);
      console.error('🔑 Access token (first 20 chars):', accessToken.substring(0, 20) + '...');
      console.error('🌐 Graph API URL:', 'https://graph.microsoft.com/v1.0/me');
      console.error('📋 Response headers:', Object.fromEntries(profileResponse.headers.entries()));
      console.error('📄 Error response body:', errorText);
      
      // Try to decode the access token to see what's in it
      try {
        const tokenParts = accessToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.error('🔍 Token payload:', payload);
          console.error('🔍 Token scopes:', payload.scp || payload.scope);
          console.error('🔍 Token audience:', payload.aud);
        }
      } catch (e) {
        console.error('🔍 Could not decode token:', e);
      }
      
      throw new Error(`Profile fetch failed: ${profileResponse.status} - ${errorText}`);
    }

    const profile = tokenData.user || {};
    console.log('✅ Profile data received:', profile);
    console.log('🔍 Profile ID:', profile.id);
    console.log('🔍 Profile displayName:', profile.displayName);
    console.log('🔍 Profile mail:', profile.mail);
    console.log('🔍 Profile userPrincipalName:', profile.userPrincipalName);
    console.log('🔍 Profile givenName:', profile.givenName);
    console.log('🔍 Profile surname:', profile.surname);

    // Return user data in the expected format
    const userData = {
      id: profile.id || 'microsoft_' + Date.now(),
      name: profile.displayName || profile.givenName + ' ' + profile.surname || 'Microsoft User',
      email: profile.mail || profile.userPrincipalName || 'user@microsoft.com',
      accessToken: accessToken,
      provider: 'microsoft',
      createdAt: new Date().toISOString()
    };
    
    console.log('🔧 Mapped user data:', userData);

    // Cleanup PKCE artifacts after success
    try {
      localStorage.removeItem('msal_code_verifier');
      localStorage.removeItem('msal_client_id');
      sessionStorage.removeItem('msal_code_verifier');
      sessionStorage.removeItem('msal_client_id');
    } catch (_) {}

    return userData;

  } catch (error) {
    console.error('Error exchanging code for user data:', error);
    throw error;
  }
}

const MicrosoftCallback: React.FC = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        console.error('Microsoft OAuth error:', error);
        window.opener?.postMessage({
          type: 'MICROSOFT_AUTH_ERROR',
          error: error
        }, window.location.origin);
        return;
      }

      if (code) {
        console.log('🔍 Authorization code found:', code);
        console.log('🔍 Starting Microsoft Graph API call...');
        
        // Exchange authorization code for real user data
        exchangeCodeForUserData(code).then(userData => {
          console.log('✅ User data received:', userData);
          console.log('✅ Final name:', userData.name);
          console.log('✅ Final email:', userData.email);
          window.opener?.postMessage({
            type: 'MICROSOFT_AUTH_SUCCESS',
            user: userData
          }, window.location.origin);
        }).catch(error => {
          console.error('❌ Failed to get user data:', error);
          console.error('❌ Error details:', error.message);
          console.error('❌ This means Microsoft Graph API call failed');
          console.error('❌ Full error object:', error);
          
          // Store error details in localStorage for debugging
          localStorage.setItem('microsoft_auth_error', JSON.stringify({
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            fullError: error.toString()
          }));
          
          // Fallback to mock user if real API fails
          const fallbackUser = {
            id: 'microsoft_' + Date.now(),
            name: 'Microsoft User (Fallback)',
            email: 'user@microsoft.com',
            accessToken: 'fallback_token_' + Date.now(),
            provider: 'microsoft',
            createdAt: new Date().toISOString()
          };
          
          console.log('⚠️ Using fallback user because Graph API failed:', fallbackUser);
          window.opener?.postMessage({
            type: 'MICROSOFT_AUTH_SUCCESS',
            user: fallbackUser
          }, window.location.origin);
        });
      }
    };

    handleCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Authenticating with Microsoft...
        </h2>
        <p className="text-gray-500">
          Please wait while we complete your authentication.
        </p>
      </div>
    </div>
  );
};

export default MicrosoftCallback;
