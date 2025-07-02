import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { carManufacturers } from '@/utils/carManufacturers';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { SignupConfirmationModal } from '@/components/SignupConfirmationModal';

const UAE_EMIRATES = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah'
] as const;

const ECP_AGENTS = [
  'Direct Sign Up',
  'Ahmed Hassan',
  'Mohammed Ali',
  'Sarah Khan',
  'Fatima Rahman',
  'Omar Sheikh',
  'Zainab Hussein'
] as const;

interface SignupFormData {
  role: 'buyer' | 'vendor';
  fullName: string;
  businessName: string;
  email: string;
  vehicleMakes: string[];
  whatsappNumber: string;
  location: string;
  address: string;
  googleMapsUrl: string;
  password: string;
  referredBy: string;
}

export const SignupPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<SignupFormData>({
    role: '' as 'buyer' | 'vendor', // Default role
    fullName: '',
    businessName: '',
    email: '',
    vehicleMakes: [],
    whatsappNumber: '',
    location: '',
    address: '',
    googleMapsUrl: '',
    password: '',
    referredBy: 'Direct Sign Up'
  });
  const [customMake, setCustomMake] = useState('');
  const [isAddingCustomMake, setIsAddingCustomMake] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleVehicleMakeSelect = (value: string) => {
    if (value === 'custom') {
      setIsAddingCustomMake(true);
      return;
    }
    
    if (!formData.vehicleMakes.includes(value)) {
      setFormData(prev => ({
        ...prev,
        vehicleMakes: [...prev.vehicleMakes, value]
      }));
    }
  };

  const handleAddCustomMake = () => {
    if (customMake.trim() && !formData.vehicleMakes.includes(customMake.trim())) {
      setFormData(prev => ({
        ...prev,
        vehicleMakes: [...prev.vehicleMakes, customMake.trim()]
      }));
      setCustomMake('');
      setIsAddingCustomMake(false);
    }
  };

  const removeVehicleMake = (make: string) => {
    setFormData(prev => ({
      ...prev,
      vehicleMakes: prev.vehicleMakes.filter(m => m !== make)
    }));
  };

  // Add validation functions after the state declarations
  const validateStep1 = () => {
    if (!formData.fullName.trim()) {
      toast({
        title: "Required Field",
        description: "Please enter your full name",
        variant: "destructive"
      });
      return false;
    }

    if (formData.role === 'vendor' && !formData.businessName.trim()) {
      toast({
        title: "Required Field",
        description: "Please enter your business name",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Required Field",
        description: "Please enter your email",
        variant: "destructive"
      });
      return false;
    }

    if (formData.vehicleMakes.length === 0) {
      toast({
        title: "Required Field",
        description: "Please select at least one vehicle make",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!formData.whatsappNumber.trim()) {
      toast({
        title: "Required Field",
        description: "Please enter your WhatsApp number",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.location) {
      toast({
        title: "Required Field",
        description: "Please select your emirate",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.address.trim()) {
      toast({
        title: "Required Field",
        description: "Please enter your full address",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  // Update the handleNext function
  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) {
      return;
    }

    if (currentStep === 2 && !validateStep2()) {
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit(new Event('submit') as any);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Password validation logic for step 3
  const passwordsMatch = formData.password && confirmPassword && formData.password === confirmPassword;
  const canFinish = formData.password.length > 0 && confirmPassword.length > 0 && passwordsMatch;

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>I am a:</Label>
        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant={formData.role === 'buyer' ? 'default' : 'outline'}
            className="w-full"
            onClick={() => setFormData(prev => ({ ...prev, role: 'buyer' }))}
          >
            Buyer
          </Button>
          <Button
            type="button"
            variant={formData.role === 'vendor' ? 'default' : 'outline'}
            className="w-full"
            onClick={() => setFormData(prev => ({ ...prev, role: 'vendor' }))}
          >
            Vendor
          </Button>
        </div>
      </div>

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
        <Label htmlFor="businessName">
          Business Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="businessName"
          value={formData.businessName}
          onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>
          Vehicle Makes {formData.role === 'vendor' ? '(you work with)' : '(you own)'} <span className="text-red-500">*</span>
        </Label>
        <div className="space-y-2">
          <Select onValueChange={handleVehicleMakeSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select vehicle makes" />
            </SelectTrigger>
            <SelectContent>
              {carManufacturers.map((make) => (
                <SelectItem key={make} value={make}>
                  {make}
                </SelectItem>
              ))}
              <SelectItem value="custom">Add Custom Make</SelectItem>
            </SelectContent>
          </Select>

          {isAddingCustomMake && (
            <div className="flex gap-2">
              <Input
                value={customMake}
                onChange={(e) => setCustomMake(e.target.value)}
                placeholder="Enter custom vehicle make"
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomMake();
                  }
                }}
              />
              <Button 
                onClick={handleAddCustomMake}
                type="button"
                variant="secondary"
              >
                Add
              </Button>
              <Button 
                onClick={() => {
                  setIsAddingCustomMake(false);
                  setCustomMake('');
                }}
                type="button"
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {formData.vehicleMakes.map((make) => (
            <Badge key={make} variant="secondary" className="pl-2">
              {make}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 ml-1"
                onClick={() => removeVehicleMake(make)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
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
              const cleaned = e.target.value.replace(/\D/g, '').replace(/^971/, '');
              setFormData(prev => ({ ...prev, whatsappNumber: cleaned }));
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

      <div className="space-y-2">
        <Label htmlFor="address">
          Full Address <span className="text-red-500">*</span>
        </Label>
        <textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Enter your full address including building name, street, area..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="googleMapsUrl">Google Maps URL</Label>
        <Input
          id="googleMapsUrl"
          type="url"
          placeholder="https://maps.google.com/..."
          value={formData.googleMapsUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, googleMapsUrl: e.target.value }))}
        />
        <p className="text-xs text-gray-500">Add your location on Google Maps (optional)</p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="referredBy">
          Referred By
        </Label>
        <Select 
          value={formData.referredBy}
          onValueChange={(value) => setFormData(prev => ({ ...prev, referredBy: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select who referred you" />
          </SelectTrigger>
          <SelectContent>
            {ECP_AGENTS.map((agent) => (
              <SelectItem key={agent} value={agent}>
                {agent}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">Select 'Direct Sign Up' if you found us on your own</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          Password <span className="text-red-500">*</span>
        </Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, password: e.target.value }));
            setPasswordError('');
          }}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
          Confirm Password <span className="text-red-500">*</span>
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setPasswordError('');
          }}
          required
        />
      </div>

      {!passwordsMatch && confirmPassword.length > 0 && (
        <p className="text-xs text-red-500">Passwords do not match.</p>
      )}
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate role selection
    if (!formData.role) {
      toast({
        title: "Required Selection",
        description: "Please select whether you are a buyer or vendor",
        variant: "destructive"
      });
      return;
    }

    if (!formData.password) {
      toast({
        title: "Required Field",
        description: "Please enter a password",
        variant: "destructive"
      });
      return;
    }

    if (!passwordsMatch) {
      toast({
        title: "Password Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const userData = {
        full_name: formData.fullName,
        whatsapp_number: `971${formData.whatsappNumber}`,
        location: formData.location,
        delivery_address: formData.address,
        business_name: formData.businessName || null,
        google_maps_url: formData.googleMapsUrl || null,
        role: formData.role,
        application_status: 'pending', // Set for both roles
        application_submitted_at: new Date().toISOString(), // Set for both roles
        vehicle_makes: formData.vehicleMakes, // Store for both roles
      };

      const { error, needsConfirmation } = await signUp({
        email: formData.email,
        password: formData.password,
        userData: userData
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
      } else {
        navigate('/', { replace: true });
        toast({
          title: "Application Submitted",
          description: "Your application has been submitted and is pending review. We'll notify you once it's approved.",
          duration: 6000,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Step {currentStep} of 3
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}

              <div className="flex justify-between space-x-4">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                )}
                <Button
                  type="button"
                  className={currentStep === 1 ? 'w-full' : 'flex-1'}
                  onClick={handleNext}
                  disabled={loading || (currentStep === 3 && !canFinish)}
                >
                  {loading ? 'Loading...' : (currentStep === 3 ? 'Finish' : 'Next')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      <SignupConfirmationModal
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          navigate('/', { replace: true });
        }}
        email={signupEmail}
      />
    </>
  );
};