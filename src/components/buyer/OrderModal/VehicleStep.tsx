import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Car } from 'lucide-react';
import { Vehicle } from './types';

interface VehicleStepProps {
  vehicles: Vehicle[];
  currentVehicle: Vehicle;
  setCurrentVehicle: (vehicle: Vehicle) => void;
  onAddVehicle: () => void;
  onRemoveVehicle: (index: number) => void;
  onNext: () => void;
}

export const VehicleStep: React.FC<VehicleStepProps> = ({
  vehicles, currentVehicle, setCurrentVehicle, onAddVehicle, onRemoveVehicle, onNext
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Car size={20} />Add Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="make">Make *</Label>
              <Input id="make" placeholder="e.g., Toyota" value={currentVehicle.make} onChange={(e) => setCurrentVehicle({ ...currentVehicle, make: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="model">Model *</Label>
              <Input id="model" placeholder="e.g., Camry" value={currentVehicle.model} onChange={(e) => setCurrentVehicle({ ...currentVehicle, model: e.target.value })}/>
            </div>
            <div>
              <Label htmlFor="year">Year *</Label>
              <Input id="year" type="number" placeholder="e.g., 2023" value={currentVehicle.year} onChange={(e) => setCurrentVehicle({ ...currentVehicle, year: parseInt(e.target.value) || new Date().getFullYear() })} />
            </div>
            <div>
              <Label htmlFor="vin">VIN (Optional)</Label>
              <Input id="vin" placeholder="17-character VIN" value={currentVehicle.vin} onChange={(e) => setCurrentVehicle({ ...currentVehicle, vin: e.target.value })}/>
            </div>
          </div>
          <Button onClick={onAddVehicle} className="w-full"><Plus className="mr-2 h-4 w-4" />Add Vehicle to Order</Button>
        </CardContent>
      </Card>

      {vehicles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Added Vehicles</h3>
          {vehicles.map((vehicle, index) => (
            <Card key={index} className="bg-gray-50">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold">{vehicle.make} {vehicle.model}</p>
                  <p className="text-sm text-gray-500">Year: {vehicle.year} | VIN: {vehicle.vin || 'N/A'}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onRemoveVehicle(index)}><Trash2 className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} disabled={vehicles.length === 0}>Next: Add Parts &rarr;</Button>
      </div>
    </div>
  );
}; 