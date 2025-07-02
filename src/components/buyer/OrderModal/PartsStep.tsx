import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Wrench } from 'lucide-react';
import { Vehicle, Part } from './types';

interface PartsStepProps {
  vehicles: Vehicle[];
  parts: Part[];
  currentPart: Part;
  setCurrentPart: (part: Part) => void;
  onAddPart: () => void;
  onRemovePart: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export const PartsStep: React.FC<PartsStepProps> = ({
  vehicles, parts, currentPart, setCurrentPart, onAddPart, onRemovePart, onBack, onNext
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wrench size={20} />Add Parts Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="vehicle-select">For Vehicle *</Label>
            <Select value={currentPart.vehicleIndex.toString()} onValueChange={(val) => setCurrentPart({ ...currentPart, vehicleIndex: parseInt(val) })}>
              <SelectTrigger id="vehicle-select">
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((v, i) => (
                  <SelectItem key={i} value={i.toString()}>{v.make} {v.model} ({v.year})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="part-name">Part Name *</Label>
                <Input id="part-name" placeholder="e.g., Brake Pads" value={currentPart.partName} onChange={(e) => setCurrentPart({ ...currentPart, partName: e.target.value })}/>
            </div>
            <div>
                <Label htmlFor="part-number">Part Number (Optional)</Label>
                <Input id="part-number" placeholder="OEM or aftermarket" value={currentPart.partNumber} onChange={(e) => setCurrentPart({ ...currentPart, partNumber: e.target.value })}/>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Additional Details (Optional)</Label>
            <Textarea id="description" placeholder="Brand preferences, specific requirements, etc." value={currentPart.description} onChange={(e) => setCurrentPart({ ...currentPart, description: e.target.value })}/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input id="quantity" type="number" min="1" placeholder="1" value={currentPart.quantity} onChange={(e) => setCurrentPart({ ...currentPart, quantity: parseInt(e.target.value) || 1 })}/>
            </div>
            <div>
                <Label htmlFor="estimated_budget">Max Budget (Optional)</Label>
                <Input id="estimated_budget" type="number" placeholder="e.g., 150" value={currentPart.estimated_budget} onChange={(e) => setCurrentPart({ ...currentPart, estimated_budget: e.target.value })}/>
            </div>
          </div>
          <Button onClick={onAddPart} className="w-full"><Plus className="mr-2 h-4 w-4" />Add Part</Button>
        </CardContent>
      </Card>

      {parts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Added Parts</h3>
          {parts.map((part, index) => (
            <Card key={index} className="bg-gray-50">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold">{part.partName}</p>
                  <p className="text-sm text-gray-500">For: {vehicles[part.vehicleIndex].make} {vehicles[part.vehicleIndex].model} | Qty: {part.quantity}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onRemovePart(index)}><Trash2 className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>&larr; Back to Vehicles</Button>
        <Button onClick={onNext} disabled={parts.length === 0}>Next: Review Order &rarr;</Button>
      </div>
    </div>
  );
}; 