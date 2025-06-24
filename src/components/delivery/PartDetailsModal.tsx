import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, User, Warehouse } from 'lucide-react';
import { EnrichedPart } from '@/components/driver/DriverDashboard';

interface PartDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  part: EnrichedPart | null;
}

const ImageCarousel: React.FC<{ images: string[] }> = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    };
    
    if (!images || images.length === 0) {
        return <div className="aspect-square w-full bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500">No Image</div>;
    }

    return (
        <div className="relative w-full">
            <div className="rounded-lg overflow-hidden aspect-video relative">
                <img src={images[currentIndex]} alt="Part Image" className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
                <>
                    <Button onClick={goToPrevious} variant="outline" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button onClick={goToNext} variant="outline" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </>
            )}
        </div>
    );
};


const PartDetailsModal: React.FC<PartDetailsModalProps> = ({ isOpen, onClose, part }) => {
  if (!isOpen || !part) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{part.partName} <span className="text-gray-500 font-normal">({part.partNumber})</span></DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
                <ImageCarousel images={part.imageUrls} />
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-sm text-gray-500">Quantity</p>
                        <p className="font-bold text-lg">{part.quantity}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Condition</p>
                        <Badge variant="outline">{part.condition}</Badge>
                    </div>
                     <div>
                        <p className="text-sm text-gray-500">Order ID</p>
                        <p className="font-semibold text-md">#{part.orderId}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg"><Warehouse className="mr-3 h-5 w-5" /> Vendor Details</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p><strong>Name:</strong> {part.vendorName}</p>
                        <p><strong>Address:</strong> {part.vendorAddress}</p>
                        <p><strong>Phone:</strong> {part.vendorPhone}</p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg"><User className="mr-3 h-5 w-5" /> Sourcer Details</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p><strong>Name:</strong> {part.sourcerName}</p>
                        <p><strong>ID:</strong> {part.sourcerId}</p>
                        <p><strong>Phone:</strong> {part.sourcerPhone}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartDetailsModal; 