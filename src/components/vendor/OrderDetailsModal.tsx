import React, { useState } from "react";
import { VendorOrder, VendorPart, MyQuote } from "@/types/vendor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { X } from "lucide-react";
import { CreateQuoteModal } from "./CreateQuoteModal";

interface OrderDetailsModalProps {
    order: VendorOrder | null;
    onClose: () => void;
    onAddQuote: (orderId: string, partId: string, newQuote: MyQuote) => void;
    onRefreshData?: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
    order,
    onClose,
    onAddQuote,
    onRefreshData,
}) => {
    const [quotePart, setQuotePart] = useState<VendorPart | null>(null);
    const [expandedImage, setExpandedImage] = useState<string | null>(null);

    const formatCondition = (condition: string) => {
        return condition
            .replace("_", " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const handleQuoteSubmitted = () => {
        setQuotePart(null);
        onRefreshData?.();
        onClose();
    };

    if (!order) return null;

    return (
        <>
            {/* Main Order Details Modal */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                    <div className="p-6 border-b">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-800">
                                Quote Request:{" "}
                                <span className="text-blue-600">
                                    {order.orderId}
                                </span>
                            </h2>
                            <Button onClick={onClose} variant="ghost" size="icon">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto">
                        {order.vehicles.map((vehicle) => (
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
                                <div className="p-4 space-y-3">
                                    {vehicle.parts.map((part) => (
                                        <div
                                            key={part.id}
                                            className="p-3 bg-white rounded-lg border flex justify-between items-center">
                                            <div className="flex-grow">
                                                <p className="font-semibold">
                                                    {part.partName}
                                                </p>
                                                <div className="flex items-center gap-x-4 text-sm text-gray-600 mt-1">
                                                    <span className="font-mono">
                                                        Part #: {part.partNumber}
                                                    </span>
                                                    <Badge variant="secondary">
                                                        Qty: {part.quantity}
                                                    </Badge>
                                                </div>
                                                {part.conditions &&
                                                    part.conditions.length > 0 && (
                                                        <div className="mt-2">
                                                            <p className="text-xs text-gray-500">
                                                                Acceptable
                                                                Conditions:
                                                            </p>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {part.conditions.map(
                                                                    (
                                                                        condition,
                                                                        index
                                                                    ) => (
                                                                        <Badge
                                                                            key={
                                                                                index
                                                                            }
                                                                            variant="outline"
                                                                            className="text-xs capitalize">
                                                                            {formatCondition(
                                                                                condition
                                                                            )}
                                                                        </Badge>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                {part.photos &&
                                                    part.photos.length > 0 && (
                                                        <div className="mt-3">
                                                            <p className="text-xs text-gray-500 mb-1">
                                                                Reference Photos:
                                                            </p>
                                                            <div className="flex space-x-2 overflow-x-auto py-2">
                                                                {part.photos.map(
                                                                    (
                                                                        photo,
                                                                        index
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="relative group cursor-pointer"
                                                                            onClick={(
                                                                                e
                                                                            ) => {
                                                                                e.stopPropagation();
                                                                                setExpandedImage(
                                                                                    photo
                                                                                );
                                                                            }}>
                                                                            <img
                                                                                src={
                                                                                    photo
                                                                                }
                                                                                alt={`Part reference ${
                                                                                    index +
                                                                                    1
                                                                                }`}
                                                                                className="h-24 w-24 object-cover rounded border group-hover:opacity-80 transition-opacity"
                                                                                onError={(
                                                                                    e
                                                                                ) => {
                                                                                    (
                                                                                        e.target as HTMLImageElement
                                                                                    ).src =
                                                                                        "/placeholder-image.png";
                                                                                }}
                                                                            />
                                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <div className="bg-black/50 rounded-full p-1">
                                                                                    <svg
                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                        className="h-5 w-5 text-white"
                                                                                        fill="none"
                                                                                        viewBox="0 0 24 24"
                                                                                        stroke="currentColor">
                                                                                        <path
                                                                                            strokeLinecap="round"
                                                                                            strokeLinejoin="round"
                                                                                            strokeWidth={
                                                                                                2
                                                                                            }
                                                                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                                                        />
                                                                                    </svg>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                {part.quoteRange && (
                                                    <div className="text-xs text-gray-500 mt-2 p-2 bg-blue-50 border-l-4 border-blue-300">
                                                        <span>
                                                            Quote Range from
                                                            other vendors:{" "}
                                                        </span>
                                                        <span className="font-semibold text-gray-800">
                                                            AED{" "}
                                                            {part.quoteRange.min}{" "}
                                                            -{" "}
                                                            {part.quoteRange.max}
                                                        </span>
                                                    </div>
                                                )}
                                                {part.additionalInfo && (
                                                    <Accordion
                                                        type="single"
                                                        collapsible
                                                        className="w-full mt-2">
                                                        <AccordionItem
                                                            value="item-1"
                                                            className="border-none">
                                                            <AccordionTrigger className="text-xs py-1 text-blue-600 hover:no-underline">
                                                                View Additional
                                                                Information
                                                            </AccordionTrigger>
                                                            <AccordionContent className="text-sm p-2 bg-white rounded">
                                                                {
                                                                    part.additionalInfo
                                                                }
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
                                                )}
                                            </div>
                                            <Button
                                                onClick={() =>
                                                    setQuotePart(part)
                                                }
                                                className="bg-blue-600 hover:bg-blue-700">
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
                            onQuoteSubmitted={handleQuoteSubmitted}
                        />
                    )}
                </div>
            </div>

            {/* Expanded Image Modal */}
            {expandedImage && (
                <div
                    className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4"
                    onClick={() => setExpandedImage(null)}>
                    <div className="relative max-w-[90vw] max-h-[90vh]">
                        <button
                            className="absolute -top-10 right-0 text-white hover:text-gray-300"
                            onClick={() => setExpandedImage(null)}>
                            <X className="h-8 w-8" />
                        </button>
                        <img
                            src={expandedImage}
                            alt="Expanded view"
                            className="max-w-full max-h-[80vh] object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                    "/placeholder-image.png";
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
};