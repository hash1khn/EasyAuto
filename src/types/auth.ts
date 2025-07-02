import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'buyer' | 'vendor' | 'admin' | 'driver' | 'sourcer';

export interface SignUpData {
  email: string;
  password: string;
  userData: {
    full_name: string;
    whatsapp_number: string;
    location: string;
    role: UserRole;
    business_name?: string;
    vendor_tags?: string[];
    delivery_address?: string;
    delivery_phone?: string;
    delivery_instructions?: string;
    google_maps_url?: string;
  };
}

export interface AuthResult {
  data: {
    user: User;
    session: Session;
  } | null;
  error: Error | null;
}

export interface SignInResponse extends AuthResult {
  role?: UserRole;
  isApproved?: boolean;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  signUp: (data: SignUpData) => Promise<{ error: Error | null; needsConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<SignInResponse>;
  signOut: () => Promise<void>;
}
