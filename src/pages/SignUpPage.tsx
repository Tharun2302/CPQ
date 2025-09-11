import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calculator } from 'lucide-react';
import SignUpForm from '../components/auth/SignUpForm';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  const handleError = (message: string) => {
    console.error('Sign up error:', message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center">
              <Calculator className="h-8 w-8 text-green-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">CloudFuze CPQ Quote</span>
            </Link>
            <div className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/signin" className="text-green-600 hover:text-green-700 font-medium">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <SignUpForm onSuccess={handleSuccess} onError={handleError} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500">
            © 2024 CloudFuze CPQ Quote. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SignUpPage;
