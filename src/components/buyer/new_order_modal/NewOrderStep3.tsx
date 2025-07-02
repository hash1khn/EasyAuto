import { Vehicle, PartRequest } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Car, Wrench } from 'lucide-react';

interface Props {
    vehicle: Vehicle;
    parts: PartRequest[];
}

export function NewOrderStep3({ vehicle, parts }: Props) {
    return (
        <div className="space-y-6">
            <Card className="bg-green-50 border-green-200">
                <CardHeader>
                    <CardTitle className="text-green-800 flex items-center gap-2">
                        <CheckCircle />
                        Review Your Order
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="grid grid-cols-3 gap-4 font-semibold text-gray-600 mb-2">
                        <div>Vehicle</div>
                        <div>Part Type</div>
                        <div className="text-right">Total Quantity</div>
                    </div>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Car className="h-6 w-6 text-gray-500" />
                                    <div>
                                        <p className="font-bold">{vehicle.make} {vehicle.model} {vehicle.year}</p>
                                        <p className="text-sm text-gray-500">VIN: {vehicle.vin}</p>
                                    </div>
                                </div>
                                <div className="text-green-600 font-bold bg-green-100 px-3 py-1 rounded-full">
                                    {parts.length} part{parts.length > 1 ? 's' : ''}
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t">
                                {parts.map((part, index) => (
                                    <div key={index} className="flex justify-between items-center py-2">
                                        <div className="flex items-center gap-3">
                                            <Wrench className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="font-semibold">{part.part_name}</p>
                                                <p className="text-sm text-gray-500">Part #: {part.part_number || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="font-bold">Qty: {part.quantity}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>What happens next?</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-600">
                    <p className="mb-4">Once you submit this order, verified vendors will start bidding on your parts. You'll receive notifications and can compare prices before making your final decision.</p>
                    <div className="flex justify-around items-center">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="text-green-500" />
                            <span>Vendor bidding starts</span>
                        </div>
                         <div className="flex items-center gap-2">
                            <CheckCircle className="text-green-500" />
                            <span>Compare prices</span>
                        </div>
                         <div className="flex items-center gap-2">
                            <CheckCircle className="text-green-500" />
                            <span>Choose best offer</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 