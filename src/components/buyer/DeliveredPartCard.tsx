import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Vehicle, Part } from "@/data/buyerDashboardMockData";

interface DeliveredPartCardProps {
  part: Part;
  vehicle?: Vehicle;
}

export const DeliveredPartCard = ({ part, vehicle }: DeliveredPartCardProps) => {
  const finalAmount = part.price + (part.deliveryCharge || 0);
  const deliveryDateTime = new Date(part.expectedDeliveryDate || part.orderDate);
  deliveryDateTime.setHours(15, 17); // Mock time

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column: Order & Part Info */}
        <div className="md:col-span-1 space-y-1">
          <p className="text-sm text-gray-500">Order ID: #{part.orderId}</p>
          <p className="text-xl font-bold">{part.name}</p>
          <p className="text-sm text-gray-500">
            Delivered: {deliveryDateTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} – {deliveryDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </p>
        </div>
        
        {/* Middle Column: Vehicle Info */}
        <div className="md:col-span-1 space-y-1 pt-2 md:pt-0">
          {vehicle ? (
            <>
              <p className="font-semibold">Vehicle: {vehicle.make} {vehicle.model} {vehicle.year}</p>
              <p className="text-sm text-gray-500">VIN: {vehicle.vin}</p>
            </>
          ) : (
            <p className="text-sm text-gray-500">Vehicle not found</p>
          )}
        </div>

        {/* Right Column: Amount & Action */}
        <div className="md:col-span-1 flex flex-col items-start md:items-end justify-between h-full pt-4 md:pt-0">
            <div className="text-left md:text-right">
                <p className="text-sm text-gray-500">1 Part</p>
                <p className="text-2xl font-bold">AED {finalAmount.toFixed(2)}</p>
            </div>
            <Button 
              variant="outline" 
              className="mt-4 md:mt-0 w-full md:w-auto"
              onClick={() => alert(`Viewing receipt for Order #${part.orderId}`)}
            >
                View Receipt
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 