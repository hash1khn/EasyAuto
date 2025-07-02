import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, X, ArrowLeft, ArrowRight, Settings, Package, Car, DollarSign } from 'lucide-react';

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

interface PartsStepProps {
  vehicles: Vehicle[];
  parts: Part[];
  currentPart: Part;
  setCurrentPart: React.Dispatch<React.SetStateAction<Part>>;
  onAddPart: () => void;
  onRemovePart: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export const PartsStep: React.FC<PartsStepProps> = ({
  vehicles,
  parts,
  currentPart,
  setCurrentPart,
  onAddPart,
  onRemovePart,
  onBack,
  onNext
}) => {
  const canProceed = parts.length > 0;

  const handleAddPart = () => {
    const selectedVehicleIndex = currentPart.vehicleIndex;
    onAddPart();
    // Preserve the selected vehicle after adding a part
    setCurrentPart(prev => ({ 
      ...prev, 
      vehicleIndex: selectedVehicleIndex,
      partName: '',
      partNumber: '',
      description: '',
      quantity: 1,
      estimatedBudget: ''
    }));
  };

  return (
    <div className="space-y-6">
      {/* Add Parts Form - Compact */}
      <Card className="border-2 border-dashed border-gray-200 hover:border-primary/30 transition-colors">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg text-primary">
            <Settings className="w-5 h-5 mr-2" />
            Add Parts for Your Vehicles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="vehicleSelect">Select Vehicle *</Label>
            <select
              id="vehicleSelect"
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={currentPart.vehicleIndex}
              onChange={(e) => setCurrentPart(prev => ({ ...prev, vehicleIndex: parseInt(e.target.value) }))}
            >
              {vehicles.map((vehicle, index) => (
                <option key={index} value={index}>
                  {vehicle.make} {vehicle.model} {vehicle.year}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="partName">Part Name *</Label>
              <Input
                id="partName"
                placeholder="e.g., Brake pads, Oil filter, Headlight assembly"
                value={currentPart.partName}
                onChange={(e) => setCurrentPart(prev => ({ ...prev, partName: e.target.value }))}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="partNumber">Part Number (Optional)</Label>
              <Input
                id="partNumber"
                placeholder="OEM or aftermarket part number"
                value={currentPart.partNumber}
                onChange={(e) => setCurrentPart(prev => ({ ...prev, partNumber: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={currentPart.quantity}
                onChange={(e) => setCurrentPart(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="estimatedBudget">Max Budget (Optional)</Label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="estimatedBudget"
                  type="number"
                  placeholder="e.g., 150"
                  value={currentPart.estimatedBudget || ''}
                  onChange={(e) => setCurrentPart(prev => ({ ...prev, estimatedBudget: e.target.value }))}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="description">Additional Details (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Any specific requirements, brand preferences, or additional information..."
                value={currentPart.description}
                onChange={(e) => setCurrentPart(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="mt-1"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleAddPart} 
            className="w-full bg-primary hover:bg-primary/90 text-white py-2"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Part to Order
          </Button>
        </CardContent>
      </Card>

      {/* Added Parts List */}
      {parts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-lg text-primary">
              Added Parts ({parts.length})
            </h4>
          </div>
          
          <Card className="border border-gray-200">
            <ScrollArea className="h-60 w-full">
              <div className="p-3 space-y-1">
                {parts.map((part, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Package className="w-2.5 h-2.5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-gray-900 truncate text-sm">{part.partName}</p>
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 text-xs px-1.5 py-0.5">
                            {part.quantity}x
                          </Badge>
                          {part.estimatedBudget && (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-xs px-1.5 py-0.5 flex items-center">
                              <DollarSign className="w-3 h-3 mr-1" />
                              {part.estimatedBudget}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-gray-600 space-x-1">
                          <Car className="w-3 h-3" />
                          <span className="truncate">
                            {vehicles[part.vehicleIndex].make} {vehicles[part.vehicleIndex].model} {vehicles[part.vehicleIndex].year}
                          </span>
                        </div>
                        {part.partNumber && (
                          <p className="text-xs text-gray-500 mt-0.5">Part #: {part.partNumber}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemovePart(index)}
                      className="text-red-600 hover:text-red-700 hover:border-red-300 flex-shrink-0 ml-2 h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      )}

      {/* Fixed Navigation */}
      <div className="flex justify-between pt-4 border-t bg-white">
        <Button variant="outline" onClick={onBack} size="lg" className="px-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!canProceed}
          className="bg-primary hover:bg-primary/90 text-white px-8"
          size="lg"
        >
          Next: Review Order <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};