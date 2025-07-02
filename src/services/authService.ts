import { AuthResult, SignUpData } from '@/types/auth';  // Import the types from auth.ts
import { supabase } from '@/integrations/supabase/client';
import { ensureUserRecordsExist } from './userRecordService';

export const signUp = async (data: SignUpData) => {
  try {
    const redirectUrl = `${window.location.origin}/`;
    
    // 1. First create the auth user
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: data.userData.full_name,
          whatsapp_number: data.userData.whatsapp_number,
          role: data.userData.role // IMPORTANT: Keep role in auth metadata
        }
      }
    });

    if (error) {
      console.error('Sign up error:', error);
      return { error };
    }

    if (authData.user) {
      const userId = authData.user.id;

      // 2. Create user record in users table with upsert to avoid duplicates
      const { error: userError } = await supabase
        .from('users')
        .upsert([{
          id: userId,
          email: data.email,
        }], {
          onConflict: 'id',
          ignoreDuplicates: true
        });

      if (userError) throw userError;

      // Update user_roles to require approval for all users
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert([{
          user_id: userId,
          role: data.userData.role,
          is_approved: false  // Set to false for all users initially
        }], {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (roleError) {
        console.error('Role creation error:', roleError);
        throw roleError;
      }

      // Update user_profiles with application status for all users
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert([{
          id: userId,
          user_id: userId,
          full_name: data.userData.full_name,
          whatsapp_number: data.userData.whatsapp_number,
          location: data.userData.location,
          business_name: data.userData.business_name,
          vendor_tags: data.userData.vendor_tags || [],
          delivery_address: data.userData.delivery_address,
          google_maps_url: data.userData.google_maps_url,
          application_status: 'pending',  // Set pending for all users
          application_submitted_at: new Date().toISOString()  // Set for all users
        }], {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (profileError) throw profileError;
    }

    if (!authData.session) {
      return { error: null, needsConfirmation: true };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected signup error:', error);
    return { error: error as Error };
  }
};

export const authSignIn = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return {
      data: data ? { user: data.user, session: data.session } : null,
      error
    };
  } catch (error) {
    return {
      data: null,
      error: error as Error
    };
  }
};

export const signOut = async (toast: any) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
        variant: "success"
      });
    }
  } catch (error) {
    console.error('Unexpected signout error:', error);
    toast({
      title: "Unexpected error",
      description: "An unexpected error occurred while signing out.",
      variant: "destructive"
    });
  }
};

// Remove this problematic function definition
// function toast(arg0: { title: string; description: string; }) {
//   throw new Error('Function not implemented.');
// }