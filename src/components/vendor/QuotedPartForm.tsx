import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Upload, Trash2, X, Plus } from "lucide-react";
import {
    VendorPart,
    MyQuote,
    QuoteCondition,
    QuoteWarranty,
} from "@/types/vendor";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

// --- Update/View Quote Modal ---
export const QuotedPartForm = ({
    part,
    onUpdate,
    onRemove,
    mode,
}: {
    part: VendorPart;
    onUpdate: (partId: string, updatedQuote: MyQuote) => Promise<void>;
    onRemove: (partId: string) => Promise<void>;
    mode: "update" | "view";
}) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const quote = part.myQuote;
    if (!quote) return null;

    const [price, setPrice] = useState(quote.price.toString());
    const [condition, setCondition] = useState<QuoteCondition>(quote.condition);
    const [warranty, setWarranty] = useState<QuoteWarranty>(quote.warranty);
    const [notes, setNotes] = useState(quote.notes || "");
    const [existingImages, setExistingImages] = useState<string[]>(quote.imageUrls || []);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            
            // Check total images count (existing + new)
            const totalImages = existingImages.length + imageFiles.length + files.length;
            if (totalImages > 5) {
                toast({
                    title: "Error",
                    description: "Maximum 5 images allowed per quote",
                    variant: "destructive",
                });
                return;
            }

            // Validate file sizes
            for (const file of files) {
                if (file.size > 5 * 1024 * 1024) {
                    toast({
                        title: "Error",
                        description: "Each image must be less than 5MB",
                        variant: "destructive",
                    });
                    return;
                }
            }

            setImageFiles(prev => [...prev, ...files]);
            
            // Create previews for new files
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => {
            // Clean up object URL
            if (prev[index]) {
                URL.revokeObjectURL(prev[index]);
            }
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleUpdate = async () => {
        try {
            setIsSubmitting(true);
            let finalImageUrls = [...existingImages];

            // Upload new images
            if (imageFiles.length > 0) {
                const uploadPromises = imageFiles.map(async (file) => {
                    const fileExt = file.name.split(".").pop();
                    const fileName = `${user?.id}_${part.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                    const filePath = `quotes/${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from("mybucket")
                        .upload(filePath, file);

                    if (uploadError) throw uploadError;

                    const { data } = supabase.storage
                        .from("mybucket")
                        .getPublicUrl(filePath);

                    return data.publicUrl;
                });

                const uploadedUrls = await Promise.all(uploadPromises);
                finalImageUrls = [...finalImageUrls, ...uploadedUrls];
            }

            const updatedQuote: MyQuote = {
                ...quote,
                price: parseFloat(price) || 0,
                condition,
                warranty,
                notes,
                imageUrls: finalImageUrls,
            };

            await onUpdate(part.id, updatedQuote);

            toast({
                title: "Success",
                description: "Quote updated successfully",
            });

            // Clean up object URLs
            imagePreviews.forEach(url => URL.revokeObjectURL(url));
            setImagePreviews([]);
            setImageFiles([]);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update quote",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemove = () => {
        // Clean up object URLs
        imagePreviews.forEach(url => URL.revokeObjectURL(url));
        onRemove(part.id);
    };

    // Read-only view for accepted quotes or when in 'view' mode
    if (quote.isAccepted || mode === "view") {
        return (
            <div
                className={`p-4 rounded-b-lg ${
                    quote.isAccepted ? "bg-green-50" : "bg-gray-50"
                }`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-4">
                        <div>
                            <p className="text-gray-500">Price</p>
                            <p className="font-medium">AED {quote.price}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Condition</p>
                            <p className="font-medium">{quote.condition}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Warranty</p>
                            <p className="font-medium">{quote.warranty}</p>
                        </div>
                    </div>
                    {quote.imageUrls && quote.imageUrls.length > 0 && (
                        <div>
                            <p className="text-gray-500 mb-2">Images</p>
                            <div className="grid grid-cols-2 gap-2">
                                {quote.imageUrls.map((imageUrl, index) => (
                                    <img
                                        key={index}
                                        src={imageUrl}
                                        alt={`Part image ${index + 1}`}
                                        className="rounded-lg w-full h-20 object-cover border"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                {quote.notes && (
                    <div className="mt-3">
                        <p className="text-gray-500 text-sm">Notes</p>
                        <p className="text-sm font-medium">{quote.notes}</p>
                    </div>
                )}
            </div>
        );
    }

    // Editable form for pending quotes
    return (
        <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">
                            Your Price (AED)
                        </label>
                        <Input
                            type="number"
                            placeholder="e.g., 450"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Condition</label>
                        <Select
                            onValueChange={(v: QuoteCondition) => setCondition(v)}
                            defaultValue={condition}>
                            <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent
                                position="popper"
                                className="z-[300]"
                                side="bottom"
                                align="start"
                            >
                                <SelectItem value="Used - Excellent">
                                    Used - Excellent
                                </SelectItem>
                                <SelectItem value="Used - Good">
                                    Used - Good
                                </SelectItem>
                                <SelectItem value="Used - Fair">
                                    Used - Fair
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Warranty</label>
                        <Select
                            onValueChange={(v: QuoteWarranty) => setWarranty(v)}
                            defaultValue={warranty}>
                            <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent
                                position="popper"
                                className="z-[300]"
                                side="bottom"
                                align="start"
                            >
                                <SelectItem value="No Warranty">
                                    No Warranty
                                </SelectItem>
                                <SelectItem value="3 Days">3 Days</SelectItem>
                                <SelectItem value="7 Days">7 Days</SelectItem>
                                <SelectItem value="14 Days">14 Days</SelectItem>
                                <SelectItem value="30 Days">30 Days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium">
                        Images (Optional - Max 5)
                    </label>
                    
                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                        <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-2">Current Images:</p>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                {existingImages.map((imageUrl, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={imageUrl}
                                            alt={`Existing image ${index + 1}`}
                                            className="w-full h-20 object-cover rounded border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(index)}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* New Images Preview */}
                    {imagePreviews.length > 0 && (
                        <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-2">New Images:</p>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={preview}
                                            alt={`New image ${index + 1}`}
                                            className="w-full h-20 object-cover rounded border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(index)}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upload Area */}
                    {(existingImages.length + imageFiles.length) < 5 && (
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <label
                                        htmlFor="file-upload-update"
                                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                        <span>
                                            <Plus className="inline h-4 w-4 mr-1" />
                                            Add images
                                        </span>
                                        <input
                                            id="file-upload-update"
                                            name="file-upload-update"
                                            type="file"
                                            className="sr-only"
                                            onChange={handleImageUpload}
                                            accept="image/*"
                                            multiple
                                        />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500">
                                    {5 - (existingImages.length + imageFiles.length)} remaining
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div>
                <label className="text-sm font-medium">
                    Description / Notes (Optional)
                </label>
                <Textarea
                    placeholder="Add any extra details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="flex gap-2 pt-2">
                <Button
                    onClick={handleRemove}
                    variant="destructive"
                    size="sm"
                    className="flex-1">
                    Remove Quote
                </Button>
                <Button
                    onClick={handleUpdate}
                    variant="default"
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update Quote"}
                </Button>
            </div>
        </div>
    );
};