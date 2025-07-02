import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import { Vehicle, Part } from './types';

interface ReviewStepProps {
  vehicles: Vehicle[];
  parts: Part[];
  onBack: () => void;
  onSubmit: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ vehicles, parts, onBack, onSubmit }) => {
  return (
    <div className="space-y-6">
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Review Your Order</AlertTitle>
        <AlertDescription>
          Please check the vehicle and part details below before submitting.
        </AlertDescription>
      </Alert>

      {vehicles.map((vehicle, vIndex) => {
        const vehicleParts = parts.filter(p => p.vehicleIndex === vIndex);
        if (vehicleParts.length === 0) return null;

        return (
          <Card key={vIndex}>
            <CardHeader>
              <CardTitle>{vehicle.make} {vehicle.model} ({vehicle.year})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {vehicleParts.map((part, pIndex) => (
                <div key={pIndex} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-bold text-md">{part.partName}</p>
                  <div className="text-sm text-gray-600 mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                    <p><span className="font-semibold">Part #:</span> {part.partNumber || 'N/A'}</p>
                    <p><span className="font-semibold">Quantity:</span> {part.quantity}</p>
                    {part.estimated_budget && (
                      <p className="col-span-2"><span className="font-semibold">Max Budget:</span> AED {part.estimated_budget}</p>
                    )}
                  </div>
                  {part.description && (
                    <p className="text-sm text-gray-500 mt-2 pt-2 border-t">{part.description}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 mt-6" role="alert">
        <p className="font-bold">What happens next?</p>
        <p>Once you submit, verified vendors will start bidding. You'll get notifications and can compare prices before choosing.</p>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>&larr; Back to Parts</Button>
        <Button onClick={onSubmit} className="bg-green-600 hover:bg-green-700">Submit Order to Vendors</Button>
      </div>
    </div>
  );
}; 