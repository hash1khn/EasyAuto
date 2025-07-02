import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Vehicle } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car } from 'lucide-react';

interface Props {
    vehicle: Vehicle;
    setVehicle: (vehicle: Vehicle) => void;
}

export function NewOrderStep1({ vehicle, setVehicle }: Props) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVehicle({ ...vehicle, [e.target.name]: e.target.value });
    };

    return (
        <Card className="border-dashed shadow-none">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                   <Car className="h-6 w-6 text-blue-600" />
                   <span className="text-xl font-bold">Add Vehicle Information</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <Label htmlFor="make" className="font-semibold">Make *</Label>
                        <Input id="make" name="make" value={vehicle.make} onChange={handleChange} placeholder="Select or type car make" />
                    </div>
                    <div>
                        <Label htmlFor="model" className="font-semibold">Model *</Label>
                        <Input id="model" name="model" value={vehicle.model} onChange={handleChange} placeholder="e.g., Camry, X5, Mustang" />
                    </div>
                    <div>
                        <Label htmlFor="year" className="font-semibold">Year</Label>
                        <Input id="year" name="year" value={vehicle.year} onChange={handleChange} placeholder="e.g. 2025" />
                    </div>
                    <div>
                        <Label htmlFor="vin" className="font-semibold">VIN (Optional)</Label>
                        <Input id="vin" name="vin" value={vehicle.vin} onChange={handleChange} placeholder="17-character VIN" />
                    </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Add Vehicle to Order
                </Button>
            </CardContent>
        </Card>
    );
} 