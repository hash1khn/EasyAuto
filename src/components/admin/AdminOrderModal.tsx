import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BuyerStep } from './BuyerStep';
import { OrderModal } from '../dashboard/OrderModal';

interface AdminOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated?: () => void;
}

export const AdminOrderModal = ({ isOpen, onClose, onOrderCreated }: AdminOrderModalProps) => {
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);
  const [step, setStep] = useState<'buyer' | 'order'>('buyer');

  const handleClose = () => {
    setSelectedBuyerId(null);
    setStep('buyer');
    onClose();
  };

  if (step === 'order') {
    return (
      <OrderModal 
        isOpen={isOpen}
        onClose={handleClose}
        onOrderCreated={onOrderCreated}
        selectedBuyerId={selectedBuyerId}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl h-[90vh] p-0 overflow-hidden flex flex-col">
        <div className="flex-shrink-0 px-8 py-6 border-b bg-gradient-to-r from-primary/5 to-green-500/5">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-primary">
              Create Order for Buyer
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="px-8 py-6">
              <BuyerStep 
                selectedBuyerId={selectedBuyerId}
                onSelectBuyer={setSelectedBuyerId}
                onNext={() => setStep('order')}
              />
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};