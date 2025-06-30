import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { VehicleStep } from './OrderModal/VehicleStep';
import { PartsStep } from './OrderModal/PartsStep';
import { ReviewStep } from './OrderModal/ReviewStep';
import { OrderModalHeader } from './OrderModal/OrderModalHeader';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated?: () => void;
  selectedBuyerId?: string | null;
}

interface Vehicle {
  make: string;
  model: string;
  year: number;
  vin: string;
}

interface Part {
  vehicleIndex: number;
  partName: string;
  partNumber: string;
  description: string;
  quantity: number;
  estimatedBudget?: string;

}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
  selectedBuyerId
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [parts, setParts] = useState<Part[]>([]);

  const [currentVehicle, setCurrentVehicle] = useState<Vehicle>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: ''
  });

  const [currentPart, setCurrentPart] = useState<Part>({
    vehicleIndex: 0,
    partName: '',
    partNumber: '',
    description: '',
    quantity: 1
  });

  const handleClose = () => {
    setStep(1);
    setVehicles([]);
    setParts([]);
    setCurrentVehicle({ make: '', model: '', year: new Date().getFullYear(), vin: '' });
    setCurrentPart({ vehicleIndex: 0, partName: '', partNumber: '', description: '', quantity: 1 });
    onClose();
  };

  const addVehicle = () => {
    if (!currentVehicle.make || !currentVehicle.model) {
      toast({
        title: "Missing vehicle information",
        description: "Please fill in make and model.",
        variant: "destructive"
      });
      return;
    }

    setVehicles([...vehicles, currentVehicle]);
    setCurrentVehicle({ make: '', model: '', year: new Date().getFullYear(), vin: '' });
  };

  const removeVehicle = (index: number) => {
    const newVehicles = vehicles.filter((_, i) => i !== index);
    setVehicles(newVehicles);
    // Remove parts for this vehicle
    const newParts = parts.filter(part => part.vehicleIndex !== index)
      .map(part => ({
        ...part,
        vehicleIndex: part.vehicleIndex > index ? part.vehicleIndex - 1 : part.vehicleIndex
      }));
    setParts(newParts);
  };

  const addPart = () => {
    if (!currentPart.partName) {
      toast({
        title: "Missing part information",
        description: "Please enter the part name.",
        variant: "destructive"
      });
      return;
    }

    setParts([...parts, currentPart]);
    // Reset part fields but preserve vehicle selection
    setCurrentPart({
      ...currentPart,
      partName: '',
      partNumber: '',
      description: '',
      quantity: 1
    });
  };

  const removePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const handleSubmitOrder = async () => {
    // Use selectedBuyerId if provided (admin case), otherwise use current user's id
    const orderUserId = selectedBuyerId || user?.id;

    if (!orderUserId || vehicles.length === 0 || parts.length === 0) {
      toast({
        title: "Cannot submit order",
        description: "Please complete all required information.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    

    try {
      // Group parts by vehicle index
      const partsByVehicle: Record<number, Part[]> = {};
      parts.forEach(part => {
        if (!partsByVehicle[part.vehicleIndex]) {
          partsByVehicle[part.vehicleIndex] = [];
        }
        partsByVehicle[part.vehicleIndex].push(part);
      });

      // Process each vehicle and its parts
      const orderPromises = Object.entries(partsByVehicle).map(async ([vehicleIndexStr, vehicleParts]) => {
        const vehicleIndex = parseInt(vehicleIndexStr);
        const vehicle = vehicles[vehicleIndex];

        // Create order
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: orderUserId,
            status: 'open'
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Create vehicle record
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('vehicles')
          .insert({
            user_id: orderUserId,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            vin: vehicle.vin || null
          })
          .select()
          .single();

        if (vehicleError) throw vehicleError;

        // Create parts
        const partPromises = vehicleParts.map(part =>
          supabase
            .from('parts')
            .insert({
              order_id: orderData.id,
              vehicle_id: vehicleData.id,
              part_name: part.partName,
              part_number: part.partNumber || null,
              description: part.description || null,
              quantity: part.quantity,
              estimated_budget: part.estimatedBudget ? parseFloat(part.estimatedBudget) : null

            })
        );
        console.log('Inserting part with estimated budget:', vehicleParts);


        await Promise.all(partPromises);

        // Trigger WhatsApp notifications - Updated for local development
        const { error: notificationError } = await supabase.functions.invoke('whatsapp-notify', {
          body: {
            vehicle: {
              make: vehicle.make,
              model: vehicle.model,
              year: vehicle.year,
              vin: vehicle.vin || null,
            },
            parts: vehicleParts.map(p => ({
              partName: p.partName,
              partNumber: p.partNumber || null,
            })),
            orderId: orderData.id,
          }
        });

        if (notificationError) {
          console.error("WhatsApp notification failed:", notificationError);
          // Handle silently or show non-blocking toast to admin
        }

        return orderData.id;

      });

      await Promise.all(orderPromises);

      toast({
        title: "Order submitted successfully!",
        description: "Vendors are being notified via WhatsApp."
      });

      handleClose();

      if (onOrderCreated) {
        onOrderCreated();
      }
    } catch (error: any) {
      console.error('Error submitting order:', error);
      toast({
        title: "Error submitting order",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <VehicleStep
            vehicles={vehicles}
            currentVehicle={currentVehicle}
            setCurrentVehicle={setCurrentVehicle}
            onAddVehicle={addVehicle}
            onRemoveVehicle={removeVehicle}
            onNext={() => setStep(2)}
          />
        );
      case 2:
        return (
          <PartsStep
            vehicles={vehicles}
            parts={parts}
            currentPart={currentPart}
            setCurrentPart={setCurrentPart}
            onAddPart={addPart}
            onRemovePart={removePart}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        );
      case 3:
        return (
          <ReviewStep
            vehicles={vehicles}
            parts={parts}
            loading={loading}
            onBack={() => setStep(2)}
            onSubmit={handleSubmitOrder}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden flex flex-col" onOpenAutoFocus={(e) => {
        e.preventDefault(); // Prevent auto-focus on open
      }}>
        {/* Fixed Header */}
        <div className="flex-shrink-0 px-8 py-6 border-b bg-gradient-to-r from-primary/5 to-green-500/5">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-primary">
              Order Car Parts
            </DialogTitle>
            <OrderModalHeader currentStep={step} />
          </DialogHeader>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="px-8 py-6">
              {renderStepContent()}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};