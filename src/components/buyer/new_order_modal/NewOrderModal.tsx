import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { NewOrderStep1 } from './NewOrderStep1';
import { NewOrderStep2 } from './NewOrderStep2';
import { NewOrderStep3 } from './NewOrderStep3';
import { Vehicle, PartRequest } from './types';
import { Stepper } from './Stepper';

interface NewOrderModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const mockOrder = {
  vehicle: {
    make: "",
    model: "",
    year: "2025",
    vin: "",
  },
  parts: [
    {
      part_name: "",
      part_number: "",
      condition: "New",
      warranty: "",
      quantity: 1,
      notes: "",
      estimated_budget: ""
    },
  ]
};

export function NewOrderModal({ isOpen, onOpenChange }: NewOrderModalProps) {
  const [step, setStep] = useState(1);
  const [vehicle, setVehicle] = useState<Vehicle>(mockOrder.vehicle);
  const [parts, setParts] = useState<PartRequest[]>(mockOrder.parts);

  const handleNext = () => setStep(prev => Math.min(prev + 1, 3));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));
  
  const updatePart = (index: number, field: keyof PartRequest, value: any) => {
    const newParts = [...parts];
    newParts[index] = { ...newParts[index], [field]: value };
    setParts(newParts);
  };

  const addPart = () => {
    setParts([...parts, { part_name: '', part_number: '', condition: 'New', warranty: '', quantity: 1, notes: '', estimated_budget: '' }]);
  };

  const removePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };


  const renderStep = () => {
    switch (step) {
      case 1:
        return <NewOrderStep1 vehicle={vehicle} setVehicle={setVehicle} />;
      case 2:
        return <NewOrderStep2 parts={parts} updatePart={updatePart} addPart={addPart} removePart={removePart} vehicle={vehicle} />;
      case 3:
        return <NewOrderStep3 vehicle={vehicle} parts={parts} />;
      default:
        return null;
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6">
          <DialogTitle className="text-2xl font-bold">Order Car Parts</DialogTitle>
        </DialogHeader>
        
        <div className="px-6">
            <Stepper currentStep={step} />
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
            {renderStep()}
        </div>

        <DialogFooter className="bg-gray-50 p-4 mt-auto border-t">
            <div className="w-full flex justify-between">
                <div>
                    {step > 1 && <Button variant="outline" onClick={handleBack}>Back</Button>}
                </div>
                <div>
                    {step < 3 ? (
                        <Button onClick={handleNext}>Next: {step === 1 ? 'Add Parts' : 'Review Order'} &rarr;</Button>
                    ) : (
                        <Button onClick={() => alert("Order Submitted! (Frontend only)")} className="bg-green-600 hover:bg-green-700">Submit Order to Vendors</Button>
                    )}
                </div>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 