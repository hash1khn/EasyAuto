import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { EnrichedPart } from '@/components/driver/DriverDashboard';

interface PickupModalProps {
  isOpen: boolean;
  onClose: () => void;
  parts: EnrichedPart[];
  vendorName: string;
  onConfirm: (pickupNotes: string, photo?: File) => void;
}

const PickupModal: React.FC<PickupModalProps> = ({ isOpen, onClose, parts, vendorName, onConfirm }) => {
  const [pickupNotes, setPickupNotes] = useState('');
  const [photo, setPhoto] = useState<File>();

  const handleConfirm = () => {
    onConfirm(pickupNotes, photo);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Confirm Pickup from {vendorName}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p>You are about to mark the following parts as "Picked Up":</p>
          <ScrollArea className="h-40 w-full rounded-md border p-4">
            <ul>
              {parts.map(part => (
                <li key={part.id} className="mb-2 flex justify-between items-center">
                    <div>
                        <span className="font-semibold">{part.partName}</span> (x{part.quantity})
                    </div>
                    <Badge variant="outline">#{part.orderId}</Badge>
                </li>
              ))}
            </ul>
          </ScrollArea>
          
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="picture">Pickup Photo (Optional)</Label>
            <Input 
              id="picture" 
              type="file" 
              onChange={(e) => setPhoto(e.target.files?.[0])}
            />
          </div>
          <div className="grid w-full gap-1.5">
            <Label htmlFor="notes">Pickup Notes (Optional)</Label>
            <Textarea 
              placeholder="e.g., box was slightly damaged, but parts look OK." 
              id="notes" 
              value={pickupNotes}
              onChange={(e) => setPickupNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm}>Confirm Pickup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PickupModal; 