import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { SignupConfirmationModal } from './SignupConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { SignInResponse } from '@/types/auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from '@/types/auth';  // Add this import

const UAE_EMIRATES = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah'
] as const;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  signupType?: 'buyer' | 'vendor';
  showSignup: boolean;

}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose,showSignup, signupType  // Default to false
}) => {
  const [isSignUp, setIsSignUp] = useState(showSignup);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();


   React.useEffect(() => {
    if (!isOpen) {
      setIsSignUp(showSignup);
      resetForm();
    }
  }, [isOpen, showSignup]);

  // Expanded form data for vendor fields
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    whatsappNumber: '',
    location: '',
    // Update vendor specific fields
    business_name: '',
    delivery_address: '', // Add this
    bank_name: '',
    bank_iban: '',
    google_maps_url: '',
    vendor_tags: [] as string[]
  });

  const handleRoleBasedNavigation = (role: string) => {
    switch (role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'vendor':
        navigate('/vendor');
        break;
      case 'sourcer':
        navigate('/sourcer');
        break;
      case 'driver':
        navigate('/driver/dashboard');
        break;
      default:
        navigate('/dashboard');
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Fix the type of role to match UserRole type
        const userData = {
          full_name: formData.fullName,
          whatsapp_number: `971${formData.whatsappNumber}`,
          location: formData.location,
          role: (signupType === 'vendor' ? 'vendor' : 'buyer') as UserRole,
          // Add vendor specific data only if signing up as vendor
          ...(signupType === 'vendor' && {
            business_name: formData.business_name,
            bank_name: formData.bank_name,
            bank_iban: formData.bank_iban,
            delivery_address: formData.delivery_address,
            google_maps_url: formData.google_maps_url,
            vendor_tags: [],
            application_status: 'pending',
            application_submitted_at: new Date().toISOString()
          })
        };

        const { error, needsConfirmation } = await signUp({
          email: formData.email,
          password: formData.password,
          userData
        });

        if (error) {
          toast({
            title: "Error creating account",
            description: error.message,
            variant: "destructive"
          });
        } else if (needsConfirmation) {
          setSignupEmail(formData.email);
          setShowConfirmation(true);
          onClose();
        } else {
          onClose();
          if (signupType === 'vendor') {
            navigate('/vendor/status');
          } else {
            navigate('/dashboard');
          }
        }
      } else {
        const response: SignInResponse = await signIn(formData.email, formData.password);
        
        if (response.error) {
          toast({
            title: "Error signing in",
            description: response.error.message,
            variant: "destructive"
          });
        } else {
          onClose();
          // Check if role exists, default to 'buyer' if not
          const userRole = response.role || 'buyer';
          handleRoleBasedNavigation(userRole);
        }
      }
    } catch (error: any) {
      toast({
        title: "Unexpected error",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      fullName: '',
      whatsappNumber: '',
      location: '',
      business_name: '',
      delivery_address: '',  // Add this
      bank_name: '',
      bank_iban: '',
      google_maps_url: '',
      vendor_tags: [] as string[]
    });
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  // Render different form fields based on signup type
  const renderSignupFields = () => {
    if (!isSignUp) return null;

    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="fullName">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsappNumber">
            WhatsApp Number <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              +971
            </span>
            <Input
              id="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={(e) => {
                // Remove any non-numeric characters and the prefix if entered
                const cleaned = e.target.value.replace(/\D/g, '').replace(/^971/, '');
                setFormData(prev => ({ ...prev, whatsappNumber: cleaned }))
              }}
              className="pl-14"
              placeholder="50 123 4567"
              required
            />
          </div>
          <p className="text-xs text-gray-500">Enter your number without the country code</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">
            Emirate <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={formData.location} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Emirate" />
            </SelectTrigger>
            <SelectContent>
              {UAE_EMIRATES.map((emirate) => (
                <SelectItem key={emirate} value={emirate}>
                  {emirate}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {signupType === 'vendor' && (
          <>
            

            <div className="space-y-2">
              <Label htmlFor="delivery_address">
                Business Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="delivery_address"
                value={formData.delivery_address}
                onChange={(e) => setFormData(prev => ({ ...prev, delivery_address: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_name">
                Business Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="google_maps_url">Google Maps URL to your location</Label>
              <Input
                id="google_maps_url"
                type="url"
                placeholder="https://maps.google.com/..."
                value={formData.google_maps_url}
                onChange={(e) => setFormData(prev => ({ ...prev, google_maps_url: e.target.value }))}
              />
              <p className="text-xs text-gray-500 mt-1">
                Add your business location on Google Maps (optional)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_name">Bank Name</Label>
              <Input
                id="bank_name"
                value={formData.bank_name}
                onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_iban">UAE Bank Account (IBAN)</Label>
              <Input
                id="bank_iban"
                value={formData.bank_iban}
                onChange={(e) => setFormData(prev => ({ ...prev, bank_iban: e.target.value }))}
              />
            </div>

            <p className="text-xs text-gray-500 mt-2">
              <span className="text-red-500">*</span> Required fields
            </p>
          </>
        )}
      </>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader className="px-0 py-4 border-b">
            <DialogTitle>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 px-6 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>

              {renderSignupFields()}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </Button>
            </form>

            <div className="text-center mt-6 pb-2">
              <Button variant="link" onClick={toggleMode}>
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SignupConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        email={signupEmail}
      />
    </>
  );
};
