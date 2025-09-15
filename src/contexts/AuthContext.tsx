import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AuthContextType, SignUpData, AuthProvider as AuthProviderType } from '../types/auth';

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Microsoft authentication using custom OAuth implementation
// This avoids MSAL library issues that cause white page problems

// Mock user database (in a real app, this would be API calls)
const mockUsers: User[] = [
  {
    id: 'user_1',
    name: 'raya',
    email: 'raya@gmail.com',
    provider: 'email',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user_2',
    name: 'tharun',
    email: 'tharun@gmail.com',
    provider: 'email',
    createdAt: '2024-01-02T00:00:00Z'
  }
];

// Mock passwords (in a real app, these would be hashed)
const mockPasswords: { [key: string]: string } = {
  'raya@gmail.com': 'raya123',
  'tharun@gmail.com': 'tharun123'
};

interface AuthProviderComponentProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderComponentProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('cpq_user');
        const storedToken = localStorage.getItem('cpq_token');
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // Clear invalid data
        localStorage.removeItem('cpq_user');
        localStorage.removeItem('cpq_token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user exists and password matches
      const user = mockUsers.find(u => u.email === email);
      const correctPassword = mockPasswords[email];
      
      if (user && correctPassword === password) {
        // Generate simple token (timestamp)
        const token = Date.now().toString();
        
        // Store in localStorage
        localStorage.setItem('cpq_user', JSON.stringify(user));
        localStorage.setItem('cpq_token', token);
        
        // Update state
        setUser(user);
        setIsAuthenticated(true);
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // PKCE helpers for Microsoft OAuth (S256)
  const generateRandomString = (length: number): string => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const randomValues = new Uint8Array(length);
    window.crypto.getRandomValues(randomValues);
    let result = '';
    for (let i = 0; i < randomValues.length; i++) {
      result += charset[randomValues[i] % charset.length];
    }
    return result;
  };

  const base64UrlEncode = (arrayBuffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  };

  const createCodeChallenge = async (verifier: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return base64UrlEncode(digest);
  };

  const signup = async (userData: SignUpData): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email already exists
      const existingUser = mockUsers.find(u => u.email === userData.email);
      if (existingUser) {
        return false;
      }
      
      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: userData.name,
        email: userData.email,
          provider: 'email' as AuthProviderType,
        createdAt: new Date().toISOString()
      };
      
      // Add to mock database
      mockUsers.push(newUser);
      mockPasswords[userData.email] = userData.password;
      
      // Generate token
      const token = Date.now().toString();
      
      // Store in localStorage
      localStorage.setItem('cpq_user', JSON.stringify(newUser));
      localStorage.setItem('cpq_token', token);
      
      // Update state
      setUser(newUser);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithMicrosoft = async (): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Simple Microsoft OAuth redirect (no complex libraries)
      const clientId = import.meta.env.VITE_MSAL_CLIENT_ID as string;
      
      if (!clientId) {
        console.warn('Microsoft authentication is not configured - Client ID missing or invalid');
        return false;
      }
      
      // Create Microsoft OAuth URL with PKCE
      const redirectBase = (import.meta.env.VITE_MSAL_REDIRECT_URI as string) || (window.location.origin + '/auth/microsoft/callback');
      const redirectUri = encodeURIComponent(redirectBase);
      const scopes = encodeURIComponent('openid profile email User.Read');
      const state = Math.random().toString(36).substring(2, 15);

      // PKCE: generate code verifier and challenge
      const codeVerifier = generateRandomString(64);
      const codeChallenge = await createCodeChallenge(codeVerifier);
      sessionStorage.setItem('ms_pkce_verifier', codeVerifier);

      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
        `client_id=${clientId}&` +
        `response_type=code&` +
        `redirect_uri=${redirectUri}&` +
        `scope=${scopes}&` +
        `response_mode=query&` +
        `state=${state}&` +
        `code_challenge=${encodeURIComponent(codeChallenge)}&` +
        `code_challenge_method=S256&` +
        `prompt=select_account`;
      
      // Open popup window
      const popup = window.open(
        authUrl,
        'microsoft-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );
      
      if (!popup) {
        console.error('Failed to open Microsoft auth popup - popup blocked or failed');
        alert('Please allow popups for this site to use Microsoft authentication');
        return false;
      }
      
      // Wait for popup to close or receive message
      return new Promise((resolve) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            resolve(false);
          }
        }, 1000);
        
        // Listen for messages from popup
        const messageListener = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) {
            return;
          }
          
          if (event.data.type === 'MICROSOFT_AUTH_SUCCESS') {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            popup.close();
            
            // Create user from Microsoft account
            const microsoftUser = event.data.user;
            const user: User = {
              id: microsoftUser.id,
              name: microsoftUser.name,
              email: microsoftUser.email,
              provider: 'microsoft' as AuthProviderType,
              createdAt: new Date().toISOString()
            };
            
            // Check if user already exists, if not add them
            const existingUser = mockUsers.find(u => u.email === user.email);
            if (!existingUser) {
              mockUsers.push(user);
            }
            
            // Store in localStorage
            localStorage.setItem('cpq_user', JSON.stringify(user));
            localStorage.setItem('cpq_token', microsoftUser.accessToken);
            
            // Update state
            setUser(user);
            setIsAuthenticated(true);
            
            resolve(true);
          } else if (event.data.type === 'MICROSOFT_AUTH_ERROR') {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            popup.close();
            console.error('Microsoft authentication error:', event.data.error);
            resolve(false);
          }
        };
        
        window.addEventListener('message', messageListener);
      });
      
    } catch (error) {
      console.error('Microsoft login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signupWithMicrosoft = async (): Promise<boolean> => {
    // For Microsoft, signup and login are the same process
    return await loginWithMicrosoft();
  };

  const logout = () => {
    // Show thank you message with a more elegant approach
    const showThankYouMessage = () => {
      // Create a custom modal for better UX
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;
      
      modal.innerHTML = `
        <div style="
          background: white;
          padding: 2rem;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          margin: 1rem;
        ">
          <div style="
            width: 60px;
            height: 60px;
            background: #10B981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            font-size: 24px;
          ">✓</div>
          <h3 style="
            color: #1F2937;
            margin: 0 0 0.5rem;
            font-size: 1.25rem;
            font-weight: 600;
          ">Thank you for visiting CloudFuze CPQ Quote!</h3>
          <p style="
            color: #6B7280;
            margin: 0 0 1.5rem;
            font-size: 0.875rem;
          ">We hope to see you again soon for your quoting needs.</p>
          <button onclick="this.closest('div').parentElement.remove()" style="
            background: #3B82F6;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            font-size: 0.875rem;
          ">Continue</button>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Auto-remove after 3 seconds
      setTimeout(() => {
        if (modal.parentElement) {
          modal.remove();
        }
      }, 3000);
    };
    
    // Show the message
    showThankYouMessage();
    
    // Clear localStorage
    localStorage.removeItem('cpq_user');
    localStorage.removeItem('cpq_token');
    
    // Update state
    setUser(null);
    setIsAuthenticated(false);
    
    // Navigate to home page after logout
    navigate('/');
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    loginWithMicrosoft,
    logout,
    signup,
    signupWithMicrosoft,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
