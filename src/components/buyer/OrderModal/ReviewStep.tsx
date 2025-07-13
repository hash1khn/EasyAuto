import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, ArrowRight, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Vehicle, Part } from './types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ReviewStepProps {
  vehicles: Vehicle[];
  parts: Part[];
  onBack: () => void;
  onSubmit: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ vehicles, parts, onBack, onSubmit }) => {
  const formatCondition = (condition: string) => {
    return condition
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Review Your Order</AlertTitle>
        <AlertDescription>
          Please verify all details including part conditions and images before submitting to vendors.
        </AlertDescription>
      </Alert>

      {vehicles.map((vehicle, vIndex) => {
        const vehicleParts = parts.filter(p => p.vehicleIndex === vIndex);
        if (vehicleParts.length === 0) return null;

        return (
          <Card key={vIndex} className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <span className="font-medium text-lg">
                  {vehicle.make} {vehicle.model} ({vehicle.year})
                </span>
                <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                  {vehicleParts.length} {vehicleParts.length === 1 ? 'part' : 'parts'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {vehicleParts.map((part, pIndex) => (
                <div key={pIndex} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-md">{part.partName}</p>
                    <Badge variant="outline" className="text-xs">
                      Qty: {part.quantity}
                    </Badge>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    {part.partNumber && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Part #:</span> {part.partNumber}
                      </div>
                    )}
                    
                    {part.estimatedBudget && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Max Budget:</span> AED {part.estimatedBudget}
                      </div>
                    )}
                    
                    {part.conditions && part.conditions.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Conditions:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {part.conditions.map((condition, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary"
                              className="text-xs px-2 py-0.5"
                            >
                              {formatCondition(condition)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Image Preview Section */}
                  {part.imageFiles?.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                        <ImageIcon className="h-4 w-4" />
                        Reference Images ({part.imageFiles.length})
                      </div>
                      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                        <div className="flex w-max space-x-4 p-4">
                          {part.imageFiles.map((file, imgIndex) => (
                            <div key={imgIndex} className="relative">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`${part.partName} reference ${imgIndex + 1}`}
                                className="h-32 w-32 object-cover rounded-md border"
                              />
                              <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                                {file.name.length > 15 
                                  ? `${file.name.substring(0, 12)}...${file.name.split('.').pop()}`
                                  : file.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                  {part.description && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Notes:</span> {part.description}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-md">
        <p className="font-bold">What happens next?</p>
        <p className="mt-1 text-sm">
          Vendors will see your condition preferences and reference images when bidding. 
          You'll receive quotes matching your selected conditions.
        </p>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Parts
        </Button>
        <Button 
          onClick={onSubmit} 
          className="bg-green-600 hover:bg-green-700 gap-1"
        >
          Submit Order to Vendors
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};