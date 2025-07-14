import React, { useState } from 'react';
import { VendorPart } from '@/types/vendor';
import { QuoteCondition, QuoteWarranty } from '@/types/orders';
import { MyQuote } from '@/types/vendor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { convert } from 'heic-convert'; // You'll need to install this package
import imageCompression from 'browser-image-compression';

interface CreateQuoteModalProps {
  part: VendorPart;
  orderId: string;
  onClose: () => void;
  onAddQuote: (orderId: string, partId: string, quote: MyQuote) => void;
  onQuoteSubmitted?: () => void;
}

export const CreateQuoteModal: React.FC<CreateQuoteModalProps> = ({
  part,
  orderId,
  onClose,
  onAddQuote,
  onQuoteSubmitted
}) => {
  if (!part) return null;

  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<QuoteCondition>('Used - Good');
  const [warranty, setWarranty] = useState<QuoteWarranty>('7 Days');
  const [notes, setNotes] = useState('');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Update the VALID_FILE_TYPES constant
  const VALID_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ] as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get current user (vendor)
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Vendor authentication required');
      }

      const imageUrls: string[] = [];

      // Handle image uploads if present
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          // Validate file
          const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
          if (!validTypes.includes(file.type)) {
            throw new Error('Only JPG, PNG, and WEBP images are allowed');
          }

          // Size limit (5MB)
          if (file.size > 5 * 1024 * 1024) {
            throw new Error(`File ${file.name} exceeds 5MB limit`);
          }

          // Generate unique filename
          const fileExt = file.name.split('.').pop();
          const timestamp = Date.now();
          const fileName = `${user.id}_${part.id}_${timestamp}.${fileExt}`;
          const filePath = `quotes/${fileName}`;

          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('mybucket')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('mybucket')
            .getPublicUrl(uploadData.path);

          imageUrls.push(urlData.publicUrl);
        }
      }

      // Create bid record
      const { data: bid, error: bidError } = await supabase
        .from('bids')
        .insert({
          part_id: part.id,
          vendor_id: user.id,
          price: parseFloat(price) || 0,
          condition,
          warranty,
          notes,
          image_urls: imageUrls.length > 0 ? imageUrls : null,
          status: 'pending'
        })
        .select()
        .single();

      if (bidError) throw bidError;

      // Format response
      const newQuote: MyQuote = {
        id: bid.id,
        price: bid.price,
        condition: bid.condition,
        warranty: bid.warranty,
        notes: bid.notes || '',
        imageUrls: bid.image_urls || [],
        isAccepted: false
      };

      onAddQuote(orderId, part.id, newQuote);
      onQuoteSubmitted?.();  // This will trigger parent modal close
      onClose();  // Close this modal

      toast({
        title: "Quote submitted successfully",
        description: "Your quote has been sent to the buyer.",
        variant: "success"
      });
    } catch (error: any) {
      console.error('Error submitting quote:', error);
      toast({
        title: "Submission Failed",
        description: error.message || 'Could not submit quote',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update the handleImageUpload function
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const files = Array.from(event.target.files);
    const invalidReasons: string[] = [];

    try {
      const processedFiles = await Promise.all(
        files.map(async (file) => {
          // Check file size first
          if (file.size > 5 * 1024 * 1024) {
            invalidReasons.push(`${file.name}: File exceeds 5MB limit`);
            return null;
          }

          try {
            // Compression options
            const options = {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              useWebWorker: true
            };

            // For HEIC/HEIF files, convert to JPEG first using the Canvas API
            if (file.type === 'image/heic' || file.type === 'image/heif') {
              // Create a temporary URL for the file
              const blobUrl = URL.createObjectURL(file);

              // Load the image into an Image element
              const img = new Image();
              await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = blobUrl;
              });

              // Create canvas and convert to JPEG
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              if (!ctx) throw new Error('Could not get canvas context');

              ctx.drawImage(img, 0, 0);

              // Convert to blob
              const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
              });

              // Clean up
              URL.revokeObjectURL(blobUrl);

              // Create a new file from the blob
              const convertedFile = new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
                type: 'image/jpeg'
              });

              // Compress the converted file
              return await imageCompression(convertedFile, options);
            }

            // For other image types, just compress
            if (VALID_FILE_TYPES.includes(file.type as any)) {
              return await imageCompression(file, options);
            }

            invalidReasons.push(`${file.name}: Invalid file type`);
            return null;
          } catch (error) {
            console.error('Error processing file:', file.name, error);
            invalidReasons.push(`${file.name}: Failed to process image`);
            return null;
          }
        })
      );

      // Filter out null results and add valid files
      const validFiles = processedFiles.filter((f): f is File => f !== null);

      if (validFiles.length > 0) {
        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        setImageFiles(prev => [...prev, ...validFiles]);
        setImagePreviews(prev => [...prev, ...newPreviews]);
      }

      // Show errors if any files were invalid
      if (invalidReasons.length > 0) {
        toast({
          title: "Some files were invalid",
          description: invalidReasons.join('\n'),
          variant: "destructive",
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error handling files:', error);
      toast({
        title: "Error Processing Images",
        description: "Failed to process some images",
        variant: "destructive"
      });
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/70" />
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md m-4 p-6 overflow-visible"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Create Quote for: <span className="text-blue-600">{part.partName}</span></h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          {part.quoteRange && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <span className="text-sm text-blue-800">Quote Range: </span>
              <span className="font-bold text-blue-800">
                AED {part.quoteRange.min} - {part.quoteRange.max}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Price (AED) *</label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              className="focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2 relative">
            <label className="text-sm font-medium">Condition</label>
            <Select
              value={condition}
              onValueChange={(value: QuoteCondition) => setCondition(value)}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[300]">
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Used - Excellent">Used - Excellent</SelectItem>
                <SelectItem value="Used - Good">Used - Good</SelectItem>
                <SelectItem value="Used - Fair">Used - Fair</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 relative">
            <label className="text-sm font-medium">Warranty</label>
            <Select
              value={warranty}
              onValueChange={(value: QuoteWarranty) => setWarranty(value)}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select warranty" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[300]">
                <SelectItem value="No Warranty">No Warranty</SelectItem>
                <SelectItem value="3 Days">3 Days</SelectItem>
                <SelectItem value="7 Days">7 Days</SelectItem>
                <SelectItem value="14 Days">14 Days</SelectItem>
                <SelectItem value="30 Days">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (Optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              className="focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Images (Optional)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {imagePreviews.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="h-24 w-full rounded-md object-cover"
                        />
                        <button
                          type="button"
                          className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-sm"
                          onClick={() => removeImage(index)}
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600 justify-center">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Upload files</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                      onChange={handleImageUpload}
                      disabled={isSubmitting}
                      multiple
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  JPG, PNG, WEBP, HEIC (Max 5MB each)
                </p>
                {imagePreviews.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {imagePreviews.length} file{imagePreviews.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting || !price}
          >
            {isSubmitting ? "Submitting..." : "Submit Quote"}
          </Button>
        </div>
      </div>
    </div>
  );
};