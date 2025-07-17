import { AuthResult, SignUpData } from '@/types/auth';  // Import the types from auth.ts
import { supabase } from '@/integrations/supabase/client';
import { ensureUserRecordsExist } from './userRecordService';


const notifyAdminsInBackground = async (userData: {
  email: string;
  full_name: string;
  role: string;
  business_name?: string;
  whatsapp_number: string;
  location: string;
  referred_by: string | null;
}) => {
  try {
    // Using void to explicitly ignore the promise (fire-and-forget)
    void supabase.functions.invoke('send-admin-notification', {
      body: { userData }
    });
  } catch (error) {
    console.error('Background notification error:', error);
    // Errors are logged but not propagated
  }
};

export const signUp = async (data: SignUpData) => {
  try {
    const redirectUrl = `${window.location.origin}/`;
    
    // Validate referral agent if provided
    let referredByAgent = null;
    if (data.userData.referred_by && data.userData.referred_by !== 'direct') {
      const { data: agentData, error: agentError } = await supabase
        .from('referral_agents')
        .select('id')
        .eq('id', data.userData.referred_by)
        .single();

      if (agentError || !agentData) {
        console.error('Invalid referral agent:', agentError);
        return { error: new Error('Invalid referral agent') };
      }
      referredByAgent = agentData.id;
    }

    // 1. First create the auth user
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: data.userData.full_name,
          whatsapp_number: data.userData.whatsapp_number,
          role: data.userData.role
        }
      }
    });

    if (error) {
      console.error('Sign up error:', error);
      return { error };
    }

    if (authData.user) {
      const userId = authData.user.id;

      // 2. Create user record in users table
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

      // Update user_roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert([{
          user_id: userId,
          role: data.userData.role,
          is_approved: false
        }], {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (roleError) throw roleError;

      // Update user_profiles with referral info
      const profileData = {
        id: userId,
        user_id: userId,
        full_name: data.userData.full_name,
        whatsapp_number: data.userData.whatsapp_number,
        location: data.userData.location,
        business_name: data.userData.business_name,
        vendor_tags: data.userData.vendor_tags || [],
        delivery_address: data.userData.delivery_address,
        google_maps_url: data.userData.google_maps_url,
        application_status: 'pending',
        application_submitted_at: new Date().toISOString(),
        referred_by: referredByAgent // Add referral info here
      };

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert([profileData], {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (profileError) throw profileError;
      // 3. Trigger background notification (non-blocking)
      notifyAdminsInBackground({
        email: data.email,
        full_name: data.userData.full_name,
        role: data.userData.role,
        business_name: data.userData.business_name || undefined,
        whatsapp_number: data.userData.whatsapp_number,
        location: data.userData.location,
        referred_by: referredByAgent
      });
    
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