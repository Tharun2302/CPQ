import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

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
        // Simulate successful authentication with mock data
        const mockUser = {
          id: 'microsoft_' + Date.now(),
          name: 'Microsoft User',
          email: 'user@microsoft.com',
          accessToken: 'mock_access_token_' + Date.now()
        };

        window.opener?.postMessage({
          type: 'MICROSOFT_AUTH_SUCCESS',
          user: mockUser
        }, window.location.origin);
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
