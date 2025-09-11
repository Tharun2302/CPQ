// Authentication types for the CPQ application

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (userData: SignUpData) => Promise<boolean>;
  loading: boolean;
}

export interface AuthError {
  field: string;
  message: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: AuthError[];
}
