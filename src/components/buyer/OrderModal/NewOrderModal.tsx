import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { VehicleStep } from "@/components/dashboard/OrderModal/VehicleStep";
import { PartsStep } from "@/components/dashboard/OrderModal/PartsStep";
import { ReviewStep } from "./ReviewStep";
import { OrderModalHeader } from "./OrderModalHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Vehicle, Part } from "./types";
import imageCompression from "browser-image-compression";

interface OrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOrderCreated?: () => void;
}

const VALID_FILE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
] as const;

export const NewOrderModal: React.FC<OrderModalProps> = ({
    isOpen,
    onClose,
    onOrderCreated,
}) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [parts, setParts] = useState<Part[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [currentVehicle, setCurrentVehicle] = useState<Vehicle>({
        make: "",
        model: "",
        year: new Date().getFullYear(),
        vin: "",
    });

    const [currentPart, setCurrentPart] = useState<Part>({
        vehicleIndex: 0,
        partName: "",
        partNumber: "",
        description: "",
        quantity: 1,
        estimatedBudget: "",
        conditions: [],
    });

    const handleClose = () => {
        setStep(1);
        setVehicles([]);
        setParts([]);
        setCurrentVehicle({
            make: "",
            model: "",
            year: new Date().getFullYear(),
            vin: "",
        });
        setCurrentPart({
            vehicleIndex: 0,
            partName: "",
            partNumber: "",
            description: "",
            quantity: 1,
            estimatedBudget: "", // Added this line for consistency
        });
        onClose();
    };

    const uploadImages = async (files: File[], orderId: string, partName: string) => {
      const imageUrls: string[] = [];
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${partName.replace(/\s+/g, '_')}.${fileExt}`;
        const filePath = `photos/${orderId}/${fileName}`;
  
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('mybucket')
          .upload(filePath, file);
  
        if (uploadError) throw uploadError;
  
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('mybucket')
          .getPublicUrl(filePath);
  
        imageUrls.push(urlData.publicUrl);
      }
      
      return imageUrls;
    };
  

    const addVehicle = () => {
        if (!currentVehicle.make || !currentVehicle.model) {
            toast({
                title: "Missing vehicle information",
                description: "Please fill in make and model.",
                variant: "destructive",
            });
            return;
        }
        setVehicles([...vehicles, currentVehicle]);
        setCurrentVehicle({
            make: "",
            model: "",
            year: new Date().getFullYear(),
            vin: "",
        });
    };

    const removeVehicle = (index: number) => {
        const newVehicles = vehicles.filter((_, i) => i !== index);
        setVehicles(newVehicles);
        const newParts = parts
            .filter((part) => part.vehicleIndex !== index)
            .map((part) => ({
                ...part,
                vehicleIndex:
                    part.vehicleIndex > index
                        ? part.vehicleIndex - 1
                        : part.vehicleIndex,
            }));
        setParts(newParts);
    };

    const handleImageUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (!event.target.files || event.target.files.length === 0) return;

        const files = Array.from(event.target.files);
        const invalidReasons: string[] = [];

        try {
            const processedFiles = await Promise.all(
                files.map(async (file) => {
                    if (file.size > 5 * 1024 * 1024) {
                        invalidReasons.push(
                            `${file.name}: File exceeds 5MB limit`
                        );
                        return null;
                    }

                    try {
                        const options = {
                            maxSizeMB: 1,
                            maxWidthOrHeight: 1920,
                            useWebWorker: true,
                        };

                        if (
                            file.type === "image/heic" ||
                            file.type === "image/heif"
                        ) {
                            const blobUrl = URL.createObjectURL(file);
                            const img = new Image();
                            await new Promise((resolve, reject) => {
                                img.onload = resolve;
                                img.onerror = reject;
                                img.src = blobUrl;
                            });

                            const canvas = document.createElement("canvas");
                            canvas.width = img.width;
                            canvas.height = img.height;
                            const ctx = canvas.getContext("2d");
                            if (!ctx)
                                throw new Error("Could not get canvas context");

                            ctx.drawImage(img, 0, 0);
                            const blob = await new Promise<Blob>((resolve) => {
                                canvas.toBlob(
                                    (blob) => resolve(blob!),
                                    "image/jpeg",
                                    0.8
                                );
                            });

                            URL.revokeObjectURL(blobUrl);

                            const convertedFile = new File(
                                [blob],
                                file.name.replace(/\.(heic|heif)$/i, ".jpg"),
                                {
                                    type: "image/jpeg",
                                }
                            );

                            return await imageCompression(
                                convertedFile,
                                options
                            );
                        }

                        if (VALID_FILE_TYPES.includes(file.type as any)) {
                            return await imageCompression(file, options);
                        }

                        invalidReasons.push(`${file.name}: Invalid file type`);
                        return null;
                    } catch (error) {
                        console.error(
                            "Error processing file:",
                            file.name,
                            error
                        );
                        invalidReasons.push(
                            `${file.name}: Failed to process image`
                        );
                        return null;
                    }
                })
            );

            const validFiles = processedFiles.filter(
                (f): f is File => f !== null
            );

            if (validFiles.length > 0) {
                setCurrentPart((prev) => ({
                    ...prev,
                    imageFiles: [...(prev.imageFiles || []), ...validFiles],
                }));
            }

            if (invalidReasons.length > 0) {
                toast({
                    title: "Some files were invalid",
                    description: invalidReasons.join("\n"),
                    variant: "destructive",
                    duration: 5000,
                });
            }
        } catch (error) {
            console.error("Error handling files:", error);
            toast({
                title: "Error Processing Images",
                description: "Failed to process some images",
                variant: "destructive",
            });
        }
    };

    const addPart = () => {
        if (!currentPart.partName) {
            toast({
                title: "Missing part information",
                description: "Please enter the part name.",
                variant: "destructive",
            });
            return;
        }
        setParts([...parts, currentPart]);
        setCurrentPart({
            ...currentPart,
            partName: "",
            partNumber: "",
            description: "",
            quantity: 1,
            estimatedBudget: "",
        });
    };

    const removePart = (index: number) => {
        setParts(parts.filter((_, i) => i !== index));
    };

    const handleSubmitOrder = async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        setLoading(true);

        if (!user || vehicles.length === 0 || parts.length === 0) {
            toast({
                title: "Cannot submit order",
                description: "Please add at least one vehicle and one part.",
                variant: "destructive",
            });
            setIsSubmitting(false);
            setLoading(false);
            return;
        }

        try {
            // Group parts by vehicle index
            const partsByVehicle: Record<number, Part[]> = {};
            parts.forEach((part) => {
                if (!partsByVehicle[part.vehicleIndex]) {
                    partsByVehicle[part.vehicleIndex] = [];
                }
                partsByVehicle[part.vehicleIndex].push(part);
            });

            // This will store data needed for notifications
            const notificationPayloads: Array<{
                vehicle: Vehicle;
                parts: Part[];
                orderId: string;
            }> = [];

            // Process each vehicle and its parts
            const orderPromises = Object.entries(partsByVehicle).map(
                async ([vehicleIndexStr, vehicleParts]) => {
                    const vehicleIndex = parseInt(vehicleIndexStr);
                    const vehicle = vehicles[vehicleIndex];

                    // Create order
                    const { data: orderData, error: orderError } =
                        await supabase
                            .from("orders")
                            .insert({
                                user_id: user.id,
                                status: "open",
                            })
                            .select()
                            .single();

                    if (orderError) throw orderError;

                    // Create vehicle record
                    const { data: vehicleData, error: vehicleError } =
                        await supabase
                            .from("vehicles")
                            .insert({
                                user_id: user.id,
                                make: vehicle.make,
                                model: vehicle.model,
                                year: vehicle.year,
                                vin: vehicle.vin || null,
                            })
                            .select()
                            .single();

                    if (vehicleError) throw vehicleError;

                    // Create parts with estimated_budget and conditions
                    const partPromises = vehicleParts.map(async (part) => {
                        try {
                            let photos: string[] = [];
                            
                            if (part.imageFiles?.length) {
                                photos = await uploadImages(
                                    part.imageFiles,
                                    orderData.id,
                                    part.partName
                                );
                            }

                            const { data: partData, error: partError } = await supabase
                                .from("parts")
                                .insert({
                                    order_id: orderData.id,
                                    vehicle_id: vehicleData.id,
                                    part_name: part.partName,
                                    part_number: part.partNumber || null,
                                    description: part.description || null,
                                    quantity: part.quantity,
                                    estimated_budget: part.estimatedBudget
                                        ? parseFloat(part.estimatedBudget)
                                        : null,
                                    photos: photos.length > 0 ? photos : null  // Make sure to include photos
                                })
                                .select()
                                .single();

                            if (partError) throw partError;

                            // Insert condition preferences if they exist
                            if (
                                part.conditions &&
                                part.conditions.length > 0
                            ) {
                                const conditionInserts =
                                    part.conditions.map(
                                        (condition) => ({
                                            part_id: partData.id,
                                            condition,
                                        })
                                    );

                                const { error: conditionError } =
                                    await supabase
                                        .from(
                                            "part_condition_preferences"
                                        )
                                        .insert(conditionInserts);

                                if (conditionError)
                                    throw conditionError;
                            }

                            return partData;
                        } catch (error) {
                            console.error('Error creating part:', error);
                            throw error;
                        }
                    });

                    await Promise.all(partPromises);

                    // Store data for notifications
                    notificationPayloads.push({
                        vehicle,
                        parts: vehicleParts,
                        orderId: orderData.id,
                    });

                    return orderData.id;
                }
            );

            await Promise.all(orderPromises);

            // Show success message immediately
            toast({
                title: "Order submitted successfully!",
                description: "Vendors will be notified shortly.",
            });

            handleClose();

            if (onOrderCreated) {
                onOrderCreated();
            }

            // Process notifications in the background without awaiting
            if (notificationPayloads.length > 0) {
                processWhatsAppNotifications(notificationPayloads).catch(
                    (error) => {
                        console.error(
                            "Failed to process WhatsApp notifications:",
                            error
                        );
                        // You could add error logging here if needed
                    }
                );
            }
        } catch (error: any) {
            console.error("Error submitting order:", error);
            toast({
                title: "Error submitting order",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setTimeout(() => {
                setIsSubmitting(false);
                setLoading(false);
            }, 500);
        }
    };

    // Separate function to handle WhatsApp notifications
    const processWhatsAppNotifications = async (
        payloads: Array<{
            vehicle: Vehicle;
            parts: Part[];
            orderId: string;
        }>
    ) => {
        try {
            // Process notifications sequentially to avoid rate limiting
            for (const payload of payloads) {
                try {
                    await supabase.functions.invoke("whatsapp-notify", {
                        body: {
                            vehicle: {
                                make: payload.vehicle.make,
                                model: payload.vehicle.model,
                                year: payload.vehicle.year,
                                vin: payload.vehicle.vin || null,
                            },
                            parts: payload.parts.map((p) => ({
                                partName: p.partName,
                                partNumber: p.partNumber || null,
                                estimatedBudget: p.estimatedBudget || null,
                                quantity: p.quantity,
                                conditions: p.conditions || [], // Include conditions in notification
                            })),
                            orderId: payload.orderId,
                        },
                    });
                } catch (error) {
                    console.error(
                        `Failed to send notification for order ${payload.orderId}:`,
                        error
                    );
                    // Continue with next notification even if one fails
                }
            }
        } catch (error) {
            console.error("WhatsApp notification processing failed:", error);
            // You might want to log this to an error tracking service
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <VehicleStep
                        vehicles={vehicles}
                        currentVehicle={currentVehicle}
                        setCurrentVehicle={setCurrentVehicle}
                        onAddVehicle={addVehicle}
                        onRemoveVehicle={removeVehicle}
                        onNext={() => setStep(2)}
                    />
                );
            case 2:
                return (
                    <PartsStep
                        vehicles={vehicles}
                        parts={parts}
                        currentPart={currentPart}
                        setCurrentPart={setCurrentPart}
                        onAddPart={addPart}
                        onRemovePart={removePart}
                        onBack={() => setStep(1)}
                        onNext={() => setStep(3)}
                    />
                );
            case 3:
                return (
                    <ReviewStep
                        vehicles={vehicles}
                        parts={parts}
                        onBack={() => setStep(2)}
                        onSubmit={handleSubmitOrder}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent
                className="max-w-5xl h-[90vh] p-0 overflow-hidden flex flex-col"
                onOpenAutoFocus={(e) => {
                    e.preventDefault(); // Prevent auto-focus on open
                }}>
                <OrderModalHeader currentStep={step} />
                <div className="flex-1 overflow-y-auto p-6">
                    {renderStepContent()}
                </div>
            </DialogContent>
        </Dialog>
    );
};
