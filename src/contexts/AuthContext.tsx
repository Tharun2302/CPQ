import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, SignUpData } from '../types/auth';

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database (in a real app, this would be API calls)
const mockUsers: User[] = [
  {
    id: 'user_1',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user_2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    createdAt: '2024-01-02T00:00:00Z'
  }
];

// Mock passwords (in a real app, these would be hashed)
const mockPasswords: { [key: string]: string } = {
  'john@example.com': 'password123',
  'jane@example.com': 'password456'
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
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
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    signup,
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
