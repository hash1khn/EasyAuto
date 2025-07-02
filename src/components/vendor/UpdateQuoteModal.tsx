import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { X } from "lucide-react";
import { VendorOrder, MyQuote } from "@/types/vendor";
import { QuotedPartForm } from "./QuotedPartForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const UpdateQuoteModal = ({
    order,
    onClose,
    mode,
    onUpdate,
}: {
    order: VendorOrder | null;
    onClose: () => void;
    mode: "update" | "view";
    onUpdate?: () => void;
}) => {
    const { toast } = useToast();

    if (!order) return null;

    const handleUpdateQuote = async (partId: string, updatedQuote: MyQuote) => {
        try {
            const { error } = await supabase
                .from("bids")
                .update({
                    price: updatedQuote.price,
                    condition: updatedQuote.condition,
                    warranty: updatedQuote.warranty,
                    notes: updatedQuote.notes,
                    image_urls: updatedQuote.imageUrls,
                })
                .eq("id", updatedQuote.id);

            if (error) throw error;

            onUpdate?.();
            onClose();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update quote",
                variant: "destructive",
            });
        }
    };

    const handleRemoveQuote = async (partId: string) => {
        try {
            const { error } = await supabase
                .from("bids")
                .delete()
                .eq("part_id", partId);

            if (error) throw error;

            onUpdate?.();
            onClose();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to remove quote",
                variant: "destructive",
            });
        }
    };

    const myQuotedParts = order.vehicles.flatMap((vehicle) =>
        vehicle.parts
            .filter((part) =>
                mode === "view" ? part.myQuote?.isAccepted : part.myQuote
            )
            .map((part) => ({ ...part, vehicleId: vehicle.id }))
    );

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4">
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-slate-800">
                            Your Quote for Order:{" "}
                            <span className="text-blue-600">
                                {order.orderId}
                            </span>
                        </h2>
                        <Button onClick={onClose} variant="ghost" size="icon">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    {order.vehicles.map((vehicle) => {
                        const vehicleParts = myQuotedParts.filter(
                            (p) => p.vehicleId === vehicle.id
                        );
                        if (vehicleParts.length === 0) return null;

                        return (
                            <div
                                key={vehicle.id}
                                className="bg-slate-50 rounded-lg overflow-hidden border">
                                <div className="p-4 bg-slate-100">
                                    <h3 className="font-bold text-lg text-slate-800">
                                        {vehicle.vehicleName}
                                    </h3>
                                    <p className="text-sm text-slate-500 font-mono">
                                        VIN: {vehicle.vinNumber}
                                    </p>
                                </div>
                                <Accordion
                                    type="single"
                                    collapsible
                                    className="w-full space-y-2 p-4">
                                    {vehicleParts.map((part) => (
                                        <AccordionItem
                                            value={part.id}
                                            key={part.id}
                                            className="border rounded-lg shadow-sm bg-white">
                                            <AccordionTrigger className="px-4 py-3 hover:no-underline rounded-lg">
                                                <div className="flex justify-between items-center w-full">
                                                    <div className="text-left">
                                                        <p className="font-semibold">
                                                            {part.partName}
                                                        </p>
                                                        <p className="text-sm font-mono text-gray-500">
                                                            Part #:{" "}
                                                            {part.partNumber}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-x-3">
                                                        {part.myQuote?.imageUrls && part.myQuote.imageUrls.length > 0 && (
                                                            <div className="flex gap-1">
                                                                {part.myQuote.imageUrls.slice(0, 2).map((imageUrl, index) => (
                                                                    <img
                                                                        key={index}
                                                                        src={imageUrl}
                                                                        className="h-8 w-8 rounded-sm object-cover border"
                                                                        alt={`Part image ${index + 1}`}
                                                                    />
                                                                ))}
                                                                {part.myQuote.imageUrls.length > 2 && (
                                                                    <div className="h-8 w-8 rounded-sm bg-gray-100 border flex items-center justify-center text-xs text-gray-600">
                                                                        +{part.myQuote.imageUrls.length - 2}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {part.myQuote
                                                            ?.isAccepted ? (
                                                            <Badge
                                                                className={
                                                                    "bg-green-100 text-green-800"
                                                                }>
                                                                Accepted
                                                            </Badge>
                                                        ) : (
                                                            <div className="text-right">
                                                                <span className="text-blue-600 font-semibold">
                                                                    AED{" "}
                                                                    {
                                                                        part
                                                                            .myQuote
                                                                            ?.price
                                                                    }
                                                                </span>
                                                                {part.quoteRange && (
                                                                    <p className="text-xs text-gray-500">
                                                                        Market:{" "}
                                                                        {
                                                                            part
                                                                                .quoteRange
                                                                                .min
                                                                        }
                                                                        -
                                                                        {
                                                                            part
                                                                                .quoteRange
                                                                                .max
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-1 pb-1">
                                                <QuotedPartForm
                                                    key={part.id}
                                                    part={part}
                                                    onUpdate={handleUpdateQuote}
                                                    onRemove={handleRemoveQuote}
                                                    mode={mode}
                                                />
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};