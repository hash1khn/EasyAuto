import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { PartRequest, Vehicle } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench } from 'lucide-react';

interface Props {
  parts: PartRequest[];
  vehicle: Vehicle;
  updatePart: (index: number, field: keyof PartRequest, value: any) => void;
  addPart: () => void;
  removePart: (index: number) => void;
}

export function NewOrderStep2({ parts, vehicle, updatePart, addPart }: Props) {
    const activePart = parts[0]; // For now, we work on one part at a time as per design
    
    return (
    <Card className="border-dashed shadow-none">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Wrench className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold">Add Parts for Your Vehicle</span>
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <Label htmlFor="vehicle" className="font-semibold">Select Vehicle *</Label>
                <Input id="vehicle" value={`${vehicle.make} ${vehicle.model} ${vehicle.year}`} disabled />
            </div>

            <div className="space-y-4 border-t pt-6">
                <div>
                    <Label htmlFor="part_name" className="font-semibold">Part Name *</Label>
                    <Input 
                        id="part_name"
                        value={activePart.part_name}
                        onChange={(e) => updatePart(0, 'part_name', e.target.value)}
                        placeholder="e.g., Brake pads, Oil filter, Headlight assembly"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="part_number" className="font-semibold">Part Number (Optional)</Label>
                        <Input
                            id="part_number"
                            value={activePart.part_number}
                            onChange={(e) => updatePart(0, 'part_number', e.target.value)}
                            placeholder="OEM or aftermarket part number"
                        />
                    </div>
                    <div>
                        <Label htmlFor="quantity" className="font-semibold">Quantity</Label>
                        <Input
                            id="quantity"
                            type="number"
                            value={activePart.quantity}
                            onChange={(e) => updatePart(0, 'quantity', parseInt(e.target.value, 10) || 1)}
                            min="1"
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="estimated_budget" className="font-semibold">Max Budget (Optional)</Label>
                    <Input
                        id="estimated_budget"
                        value={activePart.estimated_budget}
                        onChange={(e) => updatePart(0, 'estimated_budget', e.target.value)}
                        placeholder="e.g. 150 AED"
                    />
                </div>

                <div>
                    <Label htmlFor="notes" className="font-semibold">Additional Details (Optional)</Label>
                    <Textarea
                        id="notes"
                        value={activePart.notes}
                        onChange={(e) => updatePart(0, 'notes', e.target.value)}
                        placeholder="Any specific requirements, brand preferences, or additional information..."
                    />
                </div>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={addPart}>
                <Plus className="mr-2 h-4 w-4" /> Add Part to Order
            </Button>
        </CardContent>
    </Card>
  );
} 