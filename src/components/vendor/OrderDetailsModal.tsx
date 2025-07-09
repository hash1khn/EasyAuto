import React, { useState } from 'react';
import { VendorOrder, VendorPart, MyQuote } from '@/types/vendor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { X } from 'lucide-react';
import { CreateQuoteModal } from './CreateQuoteModal';

interface OrderDetailsModalProps {
  order: VendorOrder | null;
  onClose: () => void;
  onAddQuote: (orderId: string, partId: string, newQuote: MyQuote) => void;
  onRefreshData?: () => void; // Add optional onRefreshData prop
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
  onAddQuote,
  onRefreshData
}) => {
  const [quotePart, setQuotePart] = useState<VendorPart | null>(null);

  const formatCondition = (condition: string) => {
    return condition
      .replace('_', ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  };
  const handleQuoteSubmitted = () => {
    setQuotePart(null);  // Close the quote modal
    onRefreshData?.();   // Refresh the data
    onClose();          // Close the order details modal
  };

  if (!order) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Quote Request: <span className="text-blue-600">{order.orderId}</span></h2>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          {order.vehicles.map(vehicle => (
            <div key={vehicle.id} className="bg-slate-50 rounded-lg overflow-hidden border">
              <div className="p-4 bg-slate-100">
                <h3 className="font-bold text-lg text-slate-800">{vehicle.vehicleName}</h3>
                <p className="text-sm text-slate-500 font-mono">VIN: {vehicle.vinNumber}</p>
              </div>
              <div className="p-4 space-y-3">
                {vehicle.parts.map(part => (
                  <div key={part.id} className="p-3 bg-white rounded-lg border flex justify-between items-center">
                    <div className="flex-grow">
                      <p className="font-semibold">{part.partName}</p>
                      <div className="flex items-center gap-x-4 text-sm text-gray-600 mt-1">
                        <span className="font-mono">Part #: {part.partNumber}</span>
                        <Badge variant="secondary">Qty: {part.quantity}</Badge>
                      </div>
                      {/* Add conditions display here */}
                      {part.conditions && part.conditions.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">Acceptable Conditions:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {part.conditions.map((condition, index) => (
                              <Badge 
                                key={index} 
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {formatCondition(condition)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {part.quoteRange && (
                        <div className="text-xs text-gray-500 mt-2 p-2 bg-blue-50 border-l-4 border-blue-300">
                          <span>Quote Range from other vendors: </span>
                          <span className="font-semibold text-gray-800">AED {part.quoteRange.min} - {part.quoteRange.max}</span>
                        </div>
                      )}
                      {part.additionalInfo && (
                        <Accordion type="single" collapsible className="w-full mt-2">
                          <AccordionItem value="item-1" className="border-none">
                            <AccordionTrigger className="text-xs py-1 text-blue-600 hover:no-underline">
                              View Additional Information
                            </AccordionTrigger>
                            <AccordionContent className="text-sm p-2 bg-white rounded">
                              {part.additionalInfo}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}
                    </div>
                    <Button onClick={() => setQuotePart(part)} className="bg-blue-600 hover:bg-blue-700">
                      Quote
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {quotePart && (
          <CreateQuoteModal
            part={quotePart}
            orderId={order.id}
            onClose={() => setQuotePart(null)}
            onAddQuote={onAddQuote}
            onQuoteSubmitted={handleQuoteSubmitted}  // Pass down the handler
          />
        )}
      </div>
    </div>
  );
};