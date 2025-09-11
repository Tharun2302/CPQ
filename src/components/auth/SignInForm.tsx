import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { validateSignInForm, getFieldError } from '../../utils/validation';
import { AuthError } from '../../types/auth';

interface SignInFormProps {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSuccess, onError }) => {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<AuthError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateSignInForm(formData.email, formData.password);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await login(formData.email, formData.password);
      
      if (success) {
        onSuccess?.();
      } else {
        setErrors([{ field: 'general', message: 'Invalid email or password' }]);
        onError?.('Invalid email or password');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setErrors([{ field: 'general', message: 'An error occurred. Please try again.' }]);
      onError?.('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const emailError = getFieldError(errors, 'email');
  const passwordError = getFieldError(errors, 'password');
  const generalError = getFieldError(errors, 'general');

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
          <p className="text-gray-600 mt-2">Welcome back to CPQ Pro</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error */}
          {generalError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {generalError}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                emailError ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
              required
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-600">{emailError}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                passwordError ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
              required
            />
            {passwordError && (
              <p className="mt-1 text-sm text-red-600">{passwordError}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting || loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600 mb-2">Demo Credentials:</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>Email: john@example.com</p>
            <p>Password: password123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
