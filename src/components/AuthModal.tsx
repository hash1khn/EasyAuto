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
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleRoleBasedNavigation = (role: string, isApproved: boolean) => {
    switch (role) {
      case 'buyer':
        navigate(isApproved ? '/dashboard' : '/buyer/status');
        break;
      case 'vendor':
        navigate(isApproved ? '/vendor' : '/vendor/status');
        break;
      case 'admin':
        navigate('/admin');
        break;
      case 'sourcer':
        navigate('/sourcer');
        break;
      case 'driver':
        navigate('/driver/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response: SignInResponse = await signIn(formData.email, formData.password);
      
      if (response.error) {
        toast({
          title: "Error signing in",
          description: response.error.message,
          variant: "destructive"
        });
      } else {
        onClose();
        // Check if role exists and approval status
        const userRole = response.role || 'buyer';
        const isApproved = response.isApproved || false;
        handleRoleBasedNavigation(userRole, isApproved);
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
      password: ''
    });
  };

  const handleSignupClick = () => {
    onClose(); // Close the modal
    navigate('/signup'); // Navigate to signup page
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
        </DialogHeader>
        
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center mt-6">
          <Button variant="link" onClick={handleSignupClick}>
            Don't have an account? Sign up
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
