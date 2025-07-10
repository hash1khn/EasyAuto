import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Edit2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { useToast } from "@/hooks/use-toast";
import { PartCondition } from "../buyer/OrderModal/types";

const ImageCarousel = ({ images }: { images: string[] }) => {
    console.log("ImageCarousel received images:", images);
    const [imageError, setImageError] = useState<Record<string, boolean>>({});

    if (!images || images.length === 0) {
        console.log("ImageCarousel: No images provided or empty array");
        return (
            <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                No images available
            </div>
        );
    }

    return (
        <div className="relative w-full">
            <Carousel className="w-full">
                <CarouselContent>
                    {images.map((image, index) => {
                        console.log(`Rendering image ${index}:`, image);
                        return (
                            <CarouselItem key={index}>
                                <div className="p-1">
                                    {!imageError[image] ? (
                                        <img
                                            src={image}
                                            alt={`Part image ${index + 1}`}
                                            className="w-full h-48 md:h-64 object-contain rounded-lg"
                                            onError={() => {
                                                console.error(
                                                    `Failed to load image: ${image}`
                                                );
                                                setImageError((prev) => ({
                                                    ...prev,
                                                    [image]: true,
                                                }));
                                            }}
                                            onLoad={() =>
                                                console.log(
                                                    `Image loaded: ${image}`
                                                )
                                            }
                                        />
                                    ) : (
                                        <div className="w-full h-48 md:h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                                            <p className="text-gray-400">
                                                Image failed to load
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>
                {images.length > 1 && (
                    <>
                        <CarouselPrevious />
                        <CarouselNext />
                    </>
                )}
            </Carousel>
        </div>
    );
};

interface PartConditionPreference {
    condition: PartCondition; // Use the type here
}

interface VendorQuote {
    id: string;
    vendorName: string;
    vendorAddress: string;
    vendorPhone: string;
    vendorEmail: string;
    price: number;
    condition: "New" | "Used - Excellent" | "Used - Good" | "Used - Fair";
    warranty: string;
    imageUrls?: string[];
    vendorNotes?: string;
    submittedAt: string;
    isAccepted?: boolean;
    isSourcerProvided?: boolean;
    sourcerNotes?: string;
    status: "pending" | "accepted" | "rejected";
    sourcerReview?: {
        inspectionImages: string[];
        reviewNotes: string;
        acceptedAt: string;
    };
    vendor_info?: {
        name?: string;
        address?: string;
        phone?: string;
        email?: string;
        sourcerNotes?: string;
    };
}

interface Part {
    id: string;
    partName: string;
    partNumber?: string;
    quantity: number;
    description?: string;
    estimatedBudget?: number;
    vendorQuotes: VendorQuote[];
    inspectionImages?: string[];
    inspectedBy?: string;
    inspectedAt?: string;
    part_condition_preferences?: PartConditionPreference[];
    conditions?: PartCondition[];
    photos?: string[];
    imageFiles?: File[];
}

interface Vehicle {
    id: string;
    make: string;
    model: string;
    year: number;
    vin?: string;
}

interface UserProfile {
    id: string;
    fullName: string;
    whatsappNumber: string;
    location: string;
    deliveryAddress?: string;
}

interface Order {
    id: string;
    userId: string;
    status: string;
    createdAt: string;
    userProfile: UserProfile;
    parts: (Part & { vehicle: Vehicle })[];
}

const SourcerDashboard: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuote, setSelectedQuote] = useState<VendorQuote | null>(
        null
    );
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isViewAllQuotesModalOpen, setIsViewAllQuotesModalOpen] =
        useState(false);
    const [isAddQuoteModalOpen, setIsAddQuoteModalOpen] = useState(false);
    const [selectedPart, setSelectedPart] = useState<Part | null>(null);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(
        null
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [vehicleFilter, setVehicleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState<
        "all" | "no-quotes" | "with-quotes"
    >("all");
    const [viewMode, setViewMode] = useState<"table" | "card">("table");
    const [submitting, setSubmitting] = useState(false);

    const [reviewForm, setReviewForm] = useState({
        inspectionImages: [] as File[],
        reviewNotes: "",
        customerPaid: "",
        vendorPrice: selectedQuote?.price.toString() || "", // Add this
    });

    const [vendorPercentage, setVendorPercentage] = useState<number | null>(
        null
    );
    const [maxAllowedSpend, setMaxAllowedSpend] = useState<number | null>(null);

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const { toast } = useToast();
    const [addQuoteForm, setAddQuoteForm] = useState({
        vendorName: "",
        vendorAddress: "",
        vendorPhone: "",
        vendorEmail: "",
        vendorPrice: "", // Changed from 'price'
        customerPaid: "", // New field
        condition: "",
        warranty: "",
        imageFiles: [] as File[],
        vendorNotes: "",
    });

    useEffect(() => {
        if (selectedPart && vendorPercentage !== null) {
            if (selectedPart.estimatedBudget) {
                const calculatedValue =
                    selectedPart.estimatedBudget / (1 + vendorPercentage / 100);
                const roundedValue = Math.floor(calculatedValue / 5) * 5;
                setMaxAllowedSpend(roundedValue);
            } else {
                setMaxAllowedSpend(null);
            }
        }
    }, [selectedPart, vendorPercentage]);

    const fetchVendorPercentageAndCalculateSpend = async (estimatedBudget: number | undefined) => {
        try {
            const { data, error } = await supabase
                .from("price_modifiers")
                .select("vendor_percentage")
                .single();
    
            if (error) throw error;
            
            setVendorPercentage(data.vendor_percentage);
            
            if (estimatedBudget && data.vendor_percentage !== null) {
                const calculatedValue = estimatedBudget / (1 + data.vendor_percentage / 100);
                const roundedValue = Math.floor(calculatedValue / 5) * 5;
                setMaxAllowedSpend(roundedValue);
            }
        } catch (error) {
            console.error("Error fetching vendor percentage:", error);
            toast({
                title: "Error",
                description: "Could not fetch vendor percentage. Using default 15%.",
                variant: "destructive",
            });
            setVendorPercentage(15); // fallback to 15%
            
            if (estimatedBudget) {
                const calculatedValue = estimatedBudget / 1.15; // Using default 15%
                const roundedValue = Math.floor(calculatedValue / 5) * 5;
                setMaxAllowedSpend(roundedValue);
            }
        }
    };

    const handleAddQuoteImageUpload = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            const validFiles: File[] = [];
            const invalidReasons: string[] = [];

            newFiles.forEach((file) => {
                const validTypes = ["image/jpeg", "image/png", "image/webp"];
                if (!validTypes.includes(file.type)) {
                    invalidReasons.push(`${file.name}: Invalid file type`);
                    return;
                }
                if (file.size > 5 * 1024 * 1024) {
                    invalidReasons.push(`${file.name}: File exceeds 5MB limit`);
                    return;
                }
                validFiles.push(file);
            });

            if (invalidReasons.length > 0) {
                toast({
                    title: "Some files were invalid",
                    description: invalidReasons.join("\n"),
                    variant: "destructive",
                    duration: 5000,
                });
            }

            if (validFiles.length > 0) {
                setAddQuoteForm((prev) => ({
                    ...prev,
                    imageFiles: [...prev.imageFiles, ...validFiles],
                }));
            }
        }
        e.target.value = "";
    };

    const removeQuoteImage = (indexToRemove: number) => {
        setAddQuoteForm((prev) => ({
            ...prev,
            imageFiles: prev.imageFiles.filter(
                (_, index) => index !== indexToRemove
            ),
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(e.target.files || []);
        setReviewForm((prev) => ({
            ...prev,
            inspectionImages: [...prev.inspectionImages, ...newFiles],
        }));
        e.target.value = "";
    };

    const removeImage = (indexToRemove: number) => {
        setReviewForm((prev) => ({
            ...prev,
            inspectionImages: prev.inspectionImages.filter(
                (_, index) => index !== indexToRemove
            ),
        }));
    };

    useEffect(() => {
        if (user) {
            handleLoadData();
        }
    }, [user]);

    const handleLoadData = async () => {
        setLoading(true);
        await fetchLiveOrders();
        setLoading(false);
    };

    const fetchLiveOrders = async () => {
        try {
            const { data: partsData, error: partsError } = await supabase
                .from("parts")
                .select(
                    `
        *,
        inspection_images,
        inspected_by,
        inspected_at,
        vehicles(
            id,
            make,
            model,
            year,
            vin
        ),
        orders!inner(
            id,
            user_id,
            status,
            created_at,
            user_profiles!inner(
                id,
                full_name,
                whatsapp_number,
                location,
                delivery_address,
                user:user_id(
                    email
                )
            )
        ),
        bids(
            id,
            vendor_id,
            vendor:vendor_id(
                id,
                full_name,
                whatsapp_number,
                location,
                user:user_id(
                    email
                )
            ),
            price,
            customer_paid,
            notes,
            status,
            image_urls,
            created_at,
            warranty,
            condition,
            vendor_info,
            is_sourcer_provided,
            sourcer_notes
        ),
        part_condition_preferences(
            condition
        )
      `
                )
                .in("shipping_status", ["pending"])
                .not("is_accepted", "eq", true)
                .order("created_at", { ascending: false });

            if (partsError) throw partsError;

            const ordersMap = new Map<string, Order>();
            console.log("Fetched parts data:", partsData);

            partsData?.forEach((part) => {
                const orderId = part.orders.id;
                if (!ordersMap.has(orderId)) {
                    ordersMap.set(orderId, {
                        id: part.orders.id,
                        userId: part.orders.user_id,
                        status: part.orders.status,
                        createdAt: part.orders.created_at,
                        userProfile: {
                            id: part.orders.user_profiles.id,
                            fullName: part.orders.user_profiles.full_name,
                            whatsappNumber:
                                part.orders.user_profiles.whatsapp_number,
                            location: part.orders.user_profiles.location,
                            deliveryAddress:
                                part.orders.user_profiles.delivery_address,
                        },
                        parts: [],
                    });
                }

                const order = ordersMap.get(orderId)!;
                order.parts.push({
                    id: part.id,
                    partName: part.part_name,
                    partNumber: part.part_number,
                    quantity: part.quantity,
                    description: part.description,
                    estimatedBudget: part.estimated_budget,
                    inspectionImages: part.inspection_images || [],
                    inspectedBy: part.inspected_by,
                    inspectedAt: part.inspected_at,
                    vehicle: part.vehicles,
                    part_condition_preferences:
                        part.part_condition_preferences || [],
                    // Add this line to map the photos field
                    photos: part.photos || [],
                    vendorQuotes: part.bids.map((bid) => {
                        const isSourcerProvided = bid.is_sourcer_provided;
                        const vendorInfo = bid.vendor_info;

                        return {
                            id: bid.id,
                            vendorName: isSourcerProvided
                                ? vendorInfo?.name
                                : bid.vendor?.full_name || "Unknown Vendor",
                            vendorAddress: isSourcerProvided
                                ? vendorInfo?.address
                                : bid.vendor?.location || "No address provided",
                            vendorPhone: isSourcerProvided
                                ? vendorInfo?.phone
                                : bid.vendor?.whatsapp_number ||
                                  "No phone provided",
                            vendorEmail: isSourcerProvided
                                ? vendorInfo?.email
                                : bid.vendor?.user?.email ||
                                  "No email provided",
                            price: bid.price,
                            condition: bid.condition,
                            warranty: bid.warranty,
                            imageUrls: bid.image_urls,
                            vendorNotes: bid.notes,
                            submittedAt: bid.created_at,
                            isAccepted: bid.status === "accepted",
                            isSourcerProvided,
                            status: bid.status,
                            vendor_info: vendorInfo,
                            sourcerNotes:
                                bid.sourcer_notes ||
                                (isSourcerProvided
                                    ? vendorInfo?.sourcerNotes
                                    : undefined),
                        };
                    }),
                });
            });

            const processedOrders = Array.from(ordersMap.values());
            setOrders(processedOrders);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${Date.now()}-${Math.random()
                .toString(36)
                .substring(2)}.${fileExt}`;
            const filePath = `sourcer-images/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("mybucket")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from("mybucket")
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error("Error uploading image:", error);
            return null;
        }
    };

    const handleAcceptQuote = async (quote: VendorQuote) => {
        if (!user || !selectedPart) return;

        setSubmitting(true);
        try {
            const imageUrls: string[] = [];
            for (const file of reviewForm.inspectionImages) {
                const url = await uploadImage(file);
                if (url) imageUrls.push(url);
            }

            const { error: updateError } = await supabase
                .from("bids")
                .update({
                    status: "accepted",
                    price: parseFloat(reviewForm.vendorPrice), // Updated price
                    updated_at: new Date().toISOString(),
                    sourcer_notes: reviewForm.reviewNotes,
                    customer_paid: parseFloat(reviewForm.customerPaid) || null,
                })
                .eq("id", quote.id);

            if (updateError) throw updateError;

            const { error: partUpdateError } = await supabase
                .from("parts")
                .update({
                    is_accepted: true,
                    shipping_status: "confirmed",
                    inspection_images: imageUrls,
                    inspected_by: user.id,
                    inspected_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq("id", selectedPart.id);

            if (partUpdateError) throw partUpdateError;

            await handleLoadData();
            closeReviewModal();
            toast({
                title: "Success",
                description: "Quote accepted successfully!",
                variant: "default",
            });
        } catch (error) {
            console.error("Error accepting quote:", error);
            toast({
                title: "Error",
                description: "Error accepting quote. Please try again.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddQuote = async () => {
        if (!user || !selectedPart || !selectedVehicle) return;

        setSubmitting(true);
        try {
            const imageUrls: string[] = [];
            for (const file of addQuoteForm.imageFiles) {
                const url = await uploadImage(file);
                if (url) imageUrls.push(url);
            }

            const vendorInfo = {
                name: addQuoteForm.vendorName,
                address: addQuoteForm.vendorAddress,
                phone: addQuoteForm.vendorPhone,
                email: addQuoteForm.vendorEmail,
                addedBy: user.id,
                addedAt: new Date().toISOString(),
                sourcerNotes:
                    `Sourcer-verified quote. ${addQuoteForm.vendorNotes}`.trim(),
            };

            const { error: insertError } = await supabase.from("bids").insert({
                part_id: selectedPart.id,
                vendor_id: user.id,
                price: Number.parseFloat(addQuoteForm.vendorPrice),
                customer_paid:
                    Number.parseFloat(addQuoteForm.customerPaid) || null,
                notes: addQuoteForm.vendorNotes,
                status: "accepted",
                image_urls: imageUrls.length > 0 ? imageUrls : null,
                warranty: addQuoteForm.warranty,
                condition: addQuoteForm.condition,
                vendor_info: vendorInfo,
                is_sourcer_provided: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

            if (insertError) throw insertError;

            const { error: partUpdateError } = await supabase
                .from("parts")
                .update({
                    is_accepted: true,
                    shipping_status: "confirmed",
                    inspection_images: imageUrls,
                    inspected_by: user.id,
                    inspected_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq("id", selectedPart.id);

            if (partUpdateError) throw partUpdateError;

            await handleLoadData();
            closeAddQuoteModal();
            alert("Quote added and automatically accepted!");
        } catch (error) {
            console.error("Error adding quote:", error);
            alert("Error adding quote. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const allParts = orders.flatMap((order) => order.parts);
    const metrics = {
        pendingQuotes: allParts.reduce(
            (total, part) =>
                total +
                part.vendorQuotes.filter((q) => q.status === "pending").length,
            0
        ),
        noQuotes: allParts.filter((part) => part.vendorQuotes.length === 0)
            .length,
    };

    const getFilteredParts = () => {
        const allPartsWithOrder: Array<{
            order: Order;
            part: Part & { vehicle: Vehicle };
        }> = [];

        orders.forEach((order) => {
            order.parts.forEach((part) => {
                allPartsWithOrder.push({ order, part });
            });
        });

        return allPartsWithOrder.filter(({ order, part }) => {
            const matchesSearch =
                part.partName
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                part.vendorQuotes.some((quote) =>
                    quote.vendorName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                );

            const matchesVehicle =
                vehicleFilter === "all" || part.vehicle.make === vehicleFilter;

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "no-quotes" &&
                    part.vendorQuotes.length === 0) ||
                (statusFilter === "with-quotes" &&
                    part.vendorQuotes.length > 0);

            return matchesSearch && matchesVehicle && matchesStatus;
        });
    };

    const openViewAllQuotesModal = (part: Part & { vehicle: Vehicle }) => {
        console.log("Opening view all quotes for part:", part);
        console.log("Part photos:", part.photos); // Add this
        setSelectedPart(part);
        setSelectedVehicle(part.vehicle);
        setIsViewAllQuotesModalOpen(true);
        fetchVendorPercentageAndCalculateSpend(part.estimatedBudget);
    };

    const closeViewAllQuotesModal = () => {
        setIsViewAllQuotesModalOpen(false);
        setSelectedPart(null);
        setSelectedVehicle(null);
    };

    const openReviewModal = (
        quote: VendorQuote,
        part: Part & { vehicle: Vehicle }
    ) => {
        setSelectedQuote(quote);
        setSelectedPart(part);
        setSelectedVehicle(part.vehicle);
        setIsReviewModalOpen(true);

        // Calculate max allowed spend immediately
        const maxSpend = calculateMaxAllowedSpend(part.estimatedBudget);
        setMaxAllowedSpend(maxSpend);

        setReviewForm({
            inspectionImages: [],
            reviewNotes: "",
            customerPaid: part.estimatedBudget?.toString() || "",
            vendorPrice: quote.price.toString(),
        });
    };

    // Add this helper function at the top of the component
    // Update the calculateProfitMargin function
    const calculateProfitMargin = (
        customerPaid: string,
        vendorPrice: string
    ) => {
        const customer = parseFloat(customerPaid);
        const vendor = parseFloat(vendorPrice);

        if (!customer || !vendor || customer <= 0 || vendor <= 0) return null;

        const profit = customer - vendor;
        // New formula: ((customer - vendor) / vendor) x 100
        const margin = (profit / vendor) * 100;

        return {
            profit,
            margin,
            status: margin < 15 ? "red" : margin === 15 ? "orange" : "green",
        };
    };

    const closeReviewModal = () => {
        setIsReviewModalOpen(false);
        setSelectedQuote(null);
        setSelectedPart(null);
        setSelectedVehicle(null);
        setReviewForm({
            inspectionImages: [],
            reviewNotes: "",
            customerPaid: "",
            vendorPrice: "", // Initialize with quote price
        });
    };

    const openAddQuoteModal = (part: Part & { vehicle: Vehicle }) => {
        setSelectedPart(part);
        setSelectedVehicle(part.vehicle);
        setIsAddQuoteModalOpen(true);

        setAddQuoteForm({
            vendorName: "",
            vendorAddress: "",
            vendorPhone: "",
            vendorEmail: "",
            vendorPrice: "",
            customerPaid: part.estimatedBudget?.toString() || "", // Prefill here
            condition: "",
            warranty: "",
            imageFiles: [],
            vendorNotes: "",
        });

        // Fetch vendor percentage
        const fetchVendorPercentage = async () => {
            try {
                const { data, error } = await supabase
                    .from("price_modifiers")
                    .select("vendor_percentage")
                    .single();

                if (error) throw error;
                setVendorPercentage(data.vendor_percentage);
            } catch (error) {
                console.error("Error fetching vendor percentage:", error);
                toast({
                    title: "Error",
                    description:
                        "Could not fetch vendor percentage. Using default 15%.",
                    variant: "destructive",
                });
                setVendorPercentage(15); // fallback to 15%
            }
        };

        fetchVendorPercentage();
    };

    // Inside SourcerDashboard component
    const calculateMaxAllowedSpend = (
        budget: number | undefined
    ): number | null => {
        if (!budget || vendorPercentage === null) return null;
        const calculatedValue = budget / (1 + vendorPercentage / 100);
        return Math.floor(calculatedValue / 5) * 5; // Round down to nearest 5
    };



    const closeAddQuoteModal = () => {
        setIsAddQuoteModalOpen(false);
        setSelectedPart(null);
        setSelectedVehicle(null);
        setAddQuoteForm({
            vendorName: "",
            vendorAddress: "",
            vendorPhone: "",
            vendorEmail: "",
            vendorPrice: "", // Changed from 'price'
            customerPaid: "", // New field
            condition: "",
            warranty: "",
            imageFiles: [] as File[],
            vendorNotes: "",
        });
    };

    const getQuoteStatus = (part: Part) => {
        if (part.vendorQuotes.length === 0) {
            return { text: "No Quotes", color: "bg-gray-100 text-gray-800" };
        }

        const acceptedCount = part.vendorQuotes.filter(
            (q) => q.status === "accepted"
        ).length;
        if (acceptedCount > 0) {
            return {
                text: `${acceptedCount} Accepted`,
                color: "bg-green-100 text-green-800",
            };
        }

        return {
            text: `${part.vendorQuotes.length} Quotes`,
            color: "bg-blue-100 text-blue-800",
        };
    };

    const getConditionColor = (condition: string) => {
        switch (condition) {
            case "New":
                return "bg-green-100 text-green-800";
            case "Used - Excellent":
                return "bg-blue-100 text-blue-800";
            case "Used - Good":
                return "bg-yellow-100 text-yellow-800";
            case "Used - Fair":
                return "bg-orange-100 text-orange-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const filteredParts = getFilteredParts();

    const groupedByOrder = filteredParts.reduce((acc, { order, part }) => {
        if (!acc[order.id]) {
            acc[order.id] = {
                order,
                parts: [],
            };
        }
        acc[order.id].parts.push(part);
        return acc;
    }, {} as Record<string, { order: Order; parts: Array<Part & { vehicle: Vehicle }> }>);

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Please sign in
                    </h2>
                    <p className="text-gray-600">
                        You need to be signed in to access the sourcer
                        dashboard.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Pending Vendor Quotes
                        </h3>
                        <span className="text-2xl">⏳</span>
                    </div>
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                        {metrics.pendingQuotes}
                    </div>
                    <p className="text-sm text-gray-600">
                        Vendor quotes awaiting your review
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            No Vendor Quotes
                        </h3>
                        <span className="text-2xl">📋</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                        {metrics.noQuotes}
                    </div>
                    <p className="text-sm text-gray-600">
                        Parts without any vendor quotes
                    </p>
                </div>
            </div>

            {/* Filters + Search Bar */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-col md:flex-row gap-4 flex-1">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Search by part name..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <select
                                value={vehicleFilter}
                                onChange={(e) =>
                                    setVehicleFilter(e.target.value)
                                }
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="all">All Vehicles</option>
                                <option value="Toyota">Toyota</option>
                                <option value="Honda">Honda</option>
                                <option value="BMW">BMW</option>
                                <option value="Mercedes">Mercedes</option>
                                <option value="Lexus">Lexus</option>
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value as any)
                                }
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="all">All Status</option>
                                <option value="no-quotes">No Quotes</option>
                                <option value="with-quotes">With Quotes</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setViewMode("table")}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    viewMode === "table"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}>
                                📊 Table
                            </button>
                            <button
                                onClick={() => setViewMode("card")}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    viewMode === "card"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}>
                                🃏 Cards
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders and Parts */}
            <div className="space-y-6">
                {Object.entries(groupedByOrder).map(
                    ([orderId, { order, parts }]) => {
                        const totalParts = parts.length;
                        const acceptedCount = parts.reduce(
                            (total, part) =>
                                total +
                                part.vendorQuotes.filter(
                                    (q) => q.status === "accepted"
                                ).length,
                            0
                        );

                        return (
                            <div
                                key={orderId}
                                className="bg-white rounded-lg shadow-md border border-gray-200">
                                {/* Order Summary Bar */}
                                <div className="sticky top-0 bg-gray-50 px-6 py-4 border-b border-gray-200 z-10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                Order #{order.id.slice(-8)}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {totalParts} Parts |{" "}
                                                {acceptedCount} Accepted |
                                                Location:{" "}
                                                {order.userProfile.location}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">
                                                Buyer:{" "}
                                                {order.userProfile.fullName}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {
                                                    order.userProfile
                                                        .whatsappNumber
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Parts List */}
                                <div className="p-6">
                                    {viewMode === "table" ? (
                                        /* Table View */
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full bg-white">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Part Name
                                                        </th>
                                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Part Number
                                                        </th>
                                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Vehicle
                                                        </th>
                                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Qty
                                                        </th>
                                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Budget
                                                        </th>
                                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Conditions
                                                        </th>
                                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Quote Status
                                                        </th>
                                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {parts.map((part) => {
                                                        const quoteStatus =
                                                            getQuoteStatus(
                                                                part
                                                            );
                                                        return (
                                                            <tr
                                                                key={part.id}
                                                                className="border-b border-gray-100 hover:bg-gray-50">
                                                                <td className="py-4 px-4 whitespace-nowrap">
                                                                    <div className="font-medium text-gray-900">
                                                                        {
                                                                            part.partName
                                                                        }
                                                                    </div>
                                                                </td>
                                                                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {part.partNumber ||
                                                                        "N/A"}
                                                                </td>
                                                                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {
                                                                        part
                                                                            .vehicle
                                                                            .year
                                                                    }{" "}
                                                                    {
                                                                        part
                                                                            .vehicle
                                                                            .make
                                                                    }{" "}
                                                                    {
                                                                        part
                                                                            .vehicle
                                                                            .model
                                                                    }
                                                                </td>
                                                                <td className="py-4 px-4">
                                                                    <span className="text-sm text-gray-800">
                                                                        {
                                                                            part.quantity
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td className="py-4 px-4">
                                                                    {part.estimatedBudget ? (
                                                                        <span className="text-sm font-medium text-gray-800">
                                                                            AED{" "}
                                                                            {
                                                                                part.estimatedBudget
                                                                            }
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-sm text-gray-500">
                                                                            -
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="py-4 px-4 whitespace-nowrap">
                                                                    {part
                                                                        .part_condition_preferences
                                                                        ?.length ? (
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {part.part_condition_preferences.map(
                                                                                (
                                                                                    pref,
                                                                                    i
                                                                                ) => (
                                                                                    <span
                                                                                        key={
                                                                                            i
                                                                                        }
                                                                                        className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs capitalize">
                                                                                        {pref.condition.replace(
                                                                                            "_",
                                                                                            " "
                                                                                        )}
                                                                                    </span>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-400 text-sm">
                                                                            Any
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="py-4 px-4">
                                                                    <span
                                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${quoteStatus.color}`}>
                                                                        {
                                                                            quoteStatus.text
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td className="py-4 px-4">
                                                                    {part
                                                                        .vendorQuotes
                                                                        .length >
                                                                    0 ? (
                                                                        <div className="flex items-center space-x-2">
                                                                            <Button
                                                                                variant="default"
                                                                                size="sm"
                                                                                onClick={() =>
                                                                                    openViewAllQuotesModal(
                                                                                        part
                                                                                    )
                                                                                }>
                                                                                View
                                                                                Quotes
                                                                            </Button>
                                                                        </div>
                                                                    ) : (
                                                                        <Button
                                                                            variant="secondary"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                openAddQuoteModal(
                                                                                    part
                                                                                )
                                                                            }>
                                                                            +
                                                                            Add
                                                                            Quote
                                                                        </Button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        /* Card View */
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {parts.map((part) => {
                                                const quoteStatus =
                                                    getQuoteStatus(part);
                                                return (
                                                    <div
                                                        key={part.id}
                                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                        <div className="p-4 flex-grow">
                                                            <div>
                                                                <h4 className="font-bold text-gray-800">
                                                                    {
                                                                        part.partName
                                                                    }
                                                                </h4>
                                                                <p className="text-sm text-gray-600">{`${part.vehicle.year} ${part.vehicle.make} ${part.vehicle.model}`}</p>
                                                            </div>
                                                            <div className="mt-4 space-y-2 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">
                                                                        Qty:
                                                                    </span>
                                                                    <p className="font-medium">
                                                                        {
                                                                            part.quantity
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">
                                                                        Budget:
                                                                    </span>
                                                                    <p className="font-medium">
                                                                        {part.estimatedBudget
                                                                            ? `AED ${part.estimatedBudget}`
                                                                            : "-"}
                                                                    </p>
                                                                </div>
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {part
                                                                        .part_condition_preferences
                                                                        ?.length ? (
                                                                        part.part_condition_preferences.map(
                                                                            (
                                                                                pref,
                                                                                i
                                                                            ) => (
                                                                                <span
                                                                                    key={
                                                                                        i
                                                                                    }
                                                                                    className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs capitalize">
                                                                                    {pref.condition.replace(
                                                                                        "_",
                                                                                        " "
                                                                                    )}
                                                                                </span>
                                                                            )
                                                                        )
                                                                    ) : (
                                                                        <span className="text-gray-400 text-xs">
                                                                            Any
                                                                            condition
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span
                                                                className={`px-2 py-1 rounded-full text-xs font-medium ${quoteStatus.color}`}>
                                                                {
                                                                    quoteStatus.text
                                                                }
                                                            </span>
                                                            {part.vendorQuotes
                                                                .length > 0 ? (
                                                                <Button
                                                                    variant="default"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        openViewAllQuotesModal(
                                                                            part
                                                                        )
                                                                    }>
                                                                    View Quotes
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        openAddQuoteModal(
                                                                            part
                                                                        )
                                                                    }>
                                                                    + Add Quote
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }
                )}

                {Object.keys(groupedByOrder).length === 0 && (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
                        <p className="text-lg text-gray-500">
                            No parts found matching your criteria
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                            Try adjusting your search or filters
                        </p>
                    </div>
                )}
            </div>

            {/* View All Quotes Modal */}
            {isViewAllQuotesModalOpen && selectedPart && selectedVehicle && (
               
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={closeViewAllQuotesModal}>
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start p-6 border-b">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">
                                    Vendor Quotes for {selectedPart.partName}
                                </h3>
                                <p className="text-gray-600 mt-1">
                                    {`${selectedVehicle.make} ${
                                        selectedVehicle.model
                                    } ${selectedVehicle.year} - ${
                                        selectedVehicle.vin || "No VIN"
                                    }`}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={closeViewAllQuotesModal}
                                className="rounded-full -mt-2 -mr-2">
                                <span className="text-2xl">&times;</span>
                            </Button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto">
                            <div className="space-y-4">
                                {/* Part Information section */}
                                <div className="mb-8">
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                                            Part Information
                                        </h4>
                                        {selectedPart.photos &&
                                            selectedPart.photos.length > 0 && (
                                                <div className="mb-6">
                                                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                                                        Reference Photos
                                                    </h5>

                                                    <ImageCarousel
                                                        images={
                                                            selectedPart.photos
                                                        }
                                                    />
                                                </div>
                                            )}
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                                            <div>
                                                <p className="text-gray-500">
                                                    Quantity
                                                </p>
                                                <p className="font-medium text-gray-800">
                                                    {selectedPart.quantity}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">
                                                    Part Number
                                                </p>
                                                <p className="font-medium text-gray-800">
                                                    {selectedPart.partNumber ||
                                                        "-"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">
                                                    Customer Budget
                                                </p>
                                                <p className="text-lg font-bold text-red-600">
                                                    {selectedPart.estimatedBudget
                                                        ? `AED ${selectedPart.estimatedBudget}`
                                                        : "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                        {selectedPart.description && (
                                            <div className="mt-6 border-t border-gray-200 pt-4">
                                                <p className="text-gray-500 text-sm">
                                                    Description
                                                </p>
                                                <p className="font-medium text-gray-800 text-sm">
                                                    {selectedPart.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Vendor % Note */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <span className="text-yellow-600 text-lg">
                                                💡
                                            </span>
                                        </div>
                                        <div className="ml-3">
                                            <h4 className="text-sm font-medium text-yellow-800">
                                                Pricing Reminder
                                            </h4>
                                            <p className="text-sm text-yellow-700 mt-1">
                                                Remember to keep the vendor
                                                percentage in mind when
                                                reviewing or updating bid
                                                prices. Ensure pricing remains
                                                competitive while maintaining
                                                fair vendor margins.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Vendor Quotes section */}
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3">
                                        Vendor Quotes (
                                        {selectedPart.vendorQuotes.length})
                                    </h4>
                                    <div className="space-y-4">
                                        {selectedPart.vendorQuotes.map(
                                            (quote) => (
                                                <div
                                                    key={quote.id}
                                                    className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-4 w-full md:w-auto flex-1">
                                                        <div className="flex-1 space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-semibold text-gray-800">
                                                                    {
                                                                        quote.vendorName
                                                                    }
                                                                </h4>
                                                                {quote.isSourcerProvided && (
                                                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                                                        Sourcer
                                                                        Added
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Vendor Contact Information */}
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600">
                                                                <div className="flex items-center gap-1">
                                                                    <span className="font-medium">
                                                                        Address:
                                                                    </span>
                                                                    <span>
                                                                        {
                                                                            quote.vendorAddress
                                                                        }
                                                                    </span>
                                                                    <a
                                                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                                                            quote.vendorAddress
                                                                        )}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-blue-500 hover:text-blue-700 ml-1"
                                                                        title="View on Google Maps">
                                                                        <MapPin className="h-4 w-4" />
                                                                    </a>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <span className="font-medium">
                                                                        Phone:
                                                                    </span>
                                                                    <a
                                                                        href={`tel:${quote.vendorPhone}`}
                                                                        className="text-blue-500 hover:underline">
                                                                        {
                                                                            quote.vendorPhone
                                                                        }
                                                                    </a>
                                                                </div>
                                                                {quote.vendorEmail && (
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="font-medium">
                                                                            Email:
                                                                        </span>
                                                                        <a
                                                                            href={`mailto:${quote.vendorEmail}`}
                                                                            className="text-blue-500 hover:underline">
                                                                            {
                                                                                quote.vendorEmail
                                                                            }
                                                                        </a>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Sourcer Notes (if available) */}
                                                            {quote.isSourcerProvided &&
                                                                quote.sourcerNotes && (
                                                                    <div className="bg-blue-50 p-2 rounded text-sm">
                                                                        <p className="font-medium text-blue-800">
                                                                            Sourcer
                                                                            Notes:
                                                                        </p>
                                                                        <p className="text-gray-700">
                                                                            {
                                                                                quote.sourcerNotes
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                )}

                                                            {/* Quote Details */}
                                                            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm">
                                                                <span className="font-bold text-blue-600">
                                                                    AED{" "}
                                                                    {
                                                                        quote.price
                                                                    }
                                                                </span>
                                                                <span
                                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(
                                                                        quote.condition
                                                                    )}`}>
                                                                    {
                                                                        quote.condition
                                                                    }
                                                                </span>
                                                                <span>
                                                                    Warranty:{" "}
                                                                    <span className="font-medium">
                                                                        {
                                                                            quote.warranty
                                                                        }
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {quote.imageUrls
                                                            ?.length ? (
                                                            <div className="w-full">
                                                                <ImageCarousel
                                                                    images={
                                                                        quote.imageUrls
                                                                    }
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                                                No images
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-shrink-0 mt-4 md:mt-0 flex flex-col gap-2">
                                                        {quote.status ===
                                                        "pending" ? (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setIsViewAllQuotesModalOpen(
                                                                            false
                                                                        );
                                                                        openReviewModal(
                                                                            quote,
                                                                            selectedPart as Part & {
                                                                                vehicle: Vehicle;
                                                                            }
                                                                        );
                                                                    }}
                                                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                                                                    Review &
                                                                    Accept
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span
                                                                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                                                                        quote.status ===
                                                                        "accepted"
                                                                            ? "bg-green-100 text-green-800"
                                                                            : "bg-red-100 text-red-800"
                                                                    }`}>
                                                                    {quote.status ===
                                                                    "accepted"
                                                                        ? "Accepted"
                                                                        : "Rejected"}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isReviewModalOpen && selectedQuote && selectedPart && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={closeReviewModal}>
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start p-6 border-b">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">
                                    Review & Accept Quote
                                </h3>
                                <p className="text-gray-600 mt-1">
                                    From: {selectedQuote.vendorName}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={closeReviewModal}
                                className="rounded-full -mt-2 -mr-2">
                                <span className="text-2xl">&times;</span>
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Customer Paid (AED)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={reviewForm.customerPaid}
                                            onChange={(e) =>
                                                setReviewForm({
                                                    ...reviewForm,
                                                    customerPaid:
                                                        e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Prefilled with customer budget. Can
                                            be adjusted as needed.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            We Pay Vendor (AED)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={reviewForm.vendorPrice}
                                            onChange={(e) =>
                                                setReviewForm({
                                                    ...reviewForm,
                                                    vendorPrice: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Vendor's quoted price. Can be
                                            adjusted if needed.
                                        </p>
                                        {maxAllowedSpend !== null && (
                                            <p className="text-md text-red-500 mt-1">
                                                Max allowed spend: AED{" "}
                                                {maxAllowedSpend.toFixed(2)}
                                            </p>
                                        )}
                                    </div>

                                    {/* Profit Margin Calculator - Fixed */}
                                    <div className="bg-gray-50 p-4 rounded-lg border">
                                        <h4 className="font-medium text-gray-800 mb-3">
                                            Profit Calculation
                                        </h4>
                                        {reviewForm.customerPaid &&
                                        reviewForm.vendorPrice ? (
                                            (() => {
                                                const profitInfo =
                                                    calculateProfitMargin(
                                                        reviewForm.customerPaid,
                                                        reviewForm.vendorPrice
                                                    );

                                                if (!profitInfo) {
                                                    return (
                                                        <div className="text-gray-500">
                                                            Invalid input values
                                                        </div>
                                                    );
                                                }

                                                const {
                                                    profit,
                                                    margin,
                                                    status,
                                                } = profitInfo;
                                                const profitColor = {
                                                    red: "text-red-600",
                                                    orange: "text-orange-600",
                                                    green: "text-green-600",
                                                }[status];
                                                const marginColor = {
                                                    red: "text-red-600",
                                                    orange: "text-orange-600",
                                                    green: "text-green-600",
                                                }[status];

                                                return (
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">
                                                                Customer Pays:
                                                            </span>
                                                            <span className="font-medium">
                                                                AED{" "}
                                                                {parseFloat(
                                                                    reviewForm.customerPaid
                                                                ).toFixed(2)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">
                                                                We Pay Vendor:
                                                            </span>
                                                            <span className="font-medium">
                                                                AED{" "}
                                                                {parseFloat(
                                                                    reviewForm.vendorPrice
                                                                ).toFixed(2)}
                                                            </span>
                                                        </div>
                                                        <div className="border-t border-gray-200 my-2"></div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">
                                                                Profit Amount:
                                                            </span>
                                                            <span
                                                                className={`font-bold ${profitColor}`}>
                                                                AED{" "}
                                                                {profit.toFixed(
                                                                    2
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">
                                                                Profit Margin:
                                                            </span>
                                                            <span
                                                                className={`font-bold ${marginColor}`}>
                                                                {margin.toFixed(
                                                                    1
                                                                )}
                                                                %
                                                            </span>
                                                        </div>

                                                        {/* Inside Review Modal */}
                                                        {maxAllowedSpend !==
                                                            null &&
                                                            parseFloat(
                                                                reviewForm.vendorPrice
                                                            ) >
                                                                maxAllowedSpend && (
                                                                <div className="mt-2 bg-red-50 border-l-4 border-red-500 p-2">
                                                                    <p className="text-red-700 text-sm">
                                                                        <span className="font-bold">
                                                                            Warning:
                                                                        </span>{" "}
                                                                        This
                                                                        quote
                                                                        exceeds
                                                                        maximum
                                                                        allowed
                                                                        spend by
                                                                        AED{" "}
                                                                        {(
                                                                            parseFloat(
                                                                                reviewForm.vendorPrice
                                                                            ) -
                                                                            maxAllowedSpend
                                                                        ).toFixed(
                                                                            2
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            )}
                                                    </div>
                                                );
                                            })()
                                        ) : (
                                            <div className="text-gray-500">
                                                Enter both amounts to see profit
                                                calculation.
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-gray-800 mb-3">
                                            Quote Details
                                        </h4>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">
                                                    Price:
                                                </span>
                                                <span className="font-semibold text-lg text-blue-600">
                                                    AED {selectedQuote.price}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">
                                                    Condition:
                                                </span>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(
                                                        selectedQuote.condition
                                                    )}`}>
                                                    {selectedQuote.condition}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">
                                                    Warranty:
                                                </span>
                                                <span className="font-medium">
                                                    {selectedQuote.warranty}
                                                </span>
                                            </div>
                                            {selectedQuote.vendorNotes && (
                                                <div className="pt-2">
                                                    <span className="text-gray-600">
                                                        Notes:
                                                    </span>
                                                    <p className="text-sm mt-1 bg-white p-2 border rounded">
                                                        {
                                                            selectedQuote.vendorNotes
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {selectedQuote.imageUrls?.length ? (
                                        <div>
                                            <h4 className="font-medium text-gray-800 mb-3">
                                                Part Images
                                            </h4>
                                            <div className="w-full">
                                                <ImageCarousel
                                                    images={
                                                        selectedQuote.imageUrls
                                                    }
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                            No part images available
                                        </div>
                                    )}
                                </div>

                                {/* Right Column - Vendor Info & Review Form */}
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-medium text-gray-800 mb-3">
                                            Vendor Information
                                        </h4>
                                        <div className="bg-blue-50 rounded-lg p-4 space-y-3 text-sm">
                                            <div>
                                                <span className="text-gray-600 font-medium">
                                                    Address:
                                                </span>
                                                <p className="mt-1">
                                                    {
                                                        selectedQuote.vendorAddress
                                                    }
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-gray-600 font-medium">
                                                    Phone:
                                                </span>
                                                <a
                                                    href={`tel:${selectedQuote.vendorPhone}`}
                                                    className="text-blue-600 hover:underline">
                                                    {selectedQuote.vendorPhone}
                                                </a>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-gray-600 font-medium">
                                                    Email:
                                                </span>
                                                <a
                                                    href={`mailto:${selectedQuote.vendorEmail}`}
                                                    className="text-blue-600 hover:underline">
                                                    {selectedQuote.vendorEmail}
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-gray-800 mb-3">
                                            Your Review
                                        </h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Upload Inspection Images (
                                                    {
                                                        reviewForm
                                                            .inspectionImages
                                                            .length
                                                    }{" "}
                                                    selected)
                                                </label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Upload photos from your
                                                    vendor inspection visit.
                                                </p>

                                                {/* Preview selected images */}
                                                {reviewForm.inspectionImages
                                                    .length > 0 && (
                                                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                        {reviewForm.inspectionImages.map(
                                                            (file, index) => (
                                                                <div
                                                                    key={`${file.name}-${index}`}
                                                                    className="relative group">
                                                                    <img
                                                                        src={
                                                                            URL.createObjectURL(
                                                                                file
                                                                            ) ||
                                                                            "/placeholder.svg"
                                                                        }
                                                                        alt={`Upload preview ${
                                                                            index +
                                                                            1
                                                                        }`}
                                                                        className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            removeImage(
                                                                                index
                                                                            )
                                                                        }
                                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <X className="h-4 w-4" />
                                                                    </button>
                                                                    <p className="text-xs text-gray-500 mt-1 truncate max-w-[96px]">
                                                                        {
                                                                            file.name
                                                                        }
                                                                    </p>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Review Notes
                                                </label>
                                                <textarea
                                                    value={
                                                        reviewForm.reviewNotes
                                                    }
                                                    onChange={(e) =>
                                                        setReviewForm({
                                                            ...reviewForm,
                                                            reviewNotes:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    rows={4}
                                                    placeholder="Describe your inspection findings, part condition, vendor facility, etc..."
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-3 p-6 bg-gray-50 border-t">
                            <button
                                type="button"
                                onClick={closeReviewModal}
                                disabled={submitting}
                                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50">
                                Cancel
                            </button>
                            <button
                                onClick={() => handleAcceptQuote(selectedQuote)}
                                disabled={
                                    submitting || !reviewForm.reviewNotes.trim()
                                }
                                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center">
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Accepting...
                                    </>
                                ) : (
                                    "Accept This Quote"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={() => setPreviewImage(null)}>
                    <div className="relative max-w-4xl w-full">
                        <img
                            src={previewImage || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                        />
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            )}

            {/* Add Quote Modal */}
            {isAddQuoteModalOpen && selectedPart && selectedVehicle && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={closeAddQuoteModal}>
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    Add Manual Quote
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {selectedPart.partName} for{" "}
                                    {selectedVehicle.year}{" "}
                                    {selectedVehicle.make}{" "}
                                    {selectedVehicle.model}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={closeAddQuoteModal}
                                className="rounded-full -mt-2 -mr-2">
                                <span className="text-2xl">&times;</span>
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <div className="p-6 space-y-6">
                                {/* Part & Vehicle Info */}
                                <div className="p-4 bg-gray-50 border rounded-lg">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                                        Part Information
                                    </h4>
                                    {selectedPart.photos &&
                                        selectedPart.photos.length > 0 && (
                                            <div className="mb-6">
                                                <h5 className="text-sm font-medium text-gray-700 mb-2">
                                                    Reference Photos
                                                </h5>
                                                <div className="bg-white rounded-lg p-2">
                                                    <ImageCarousel
                                                        images={
                                                            selectedPart.photos
                                                        }
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Customer provided reference
                                                    images
                                                </p>
                                            </div>
                                        )}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">
                                                Part Name
                                            </p>
                                            <p className="font-medium text-gray-800">
                                                {selectedPart.partName}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">
                                                Vehicle
                                            </p>
                                            <p className="font-medium text-gray-800">{`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">VIN</p>
                                            <p className="font-medium text-gray-800">
                                                {selectedVehicle.vin || "N/A"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">
                                                Part Number
                                            </p>
                                            <p className="font-medium text-gray-800">
                                                {selectedPart.partNumber ||
                                                    "N/A"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">
                                                Quantity
                                            </p>
                                            <p className="font-medium text-gray-800">
                                                {selectedPart.quantity}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">
                                                Customer Budget
                                            </p>
                                            <p className="font-bold text-red-600">
                                                {selectedPart.estimatedBudget
                                                    ? `AED ${selectedPart.estimatedBudget}`
                                                    : "N/A"}
                                            </p>
                                        </div>
                                        {vendorPercentage !== null && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-gray-500">
                                                        Vendor Percentage
                                                    </p>
                                                    <p className="font-medium text-gray-800">
                                                        {vendorPercentage}%
                                                    </p>
                                                </div>
                                                {maxAllowedSpend !== null && (
                                                    <div>
                                                        <p className="text-gray-500">
                                                            Max Allowed Spend
                                                        </p>
                                                        <p className="font-bold text-green-600">
                                                            AED{" "}
                                                            {maxAllowedSpend.toFixed(
                                                                2
                                                            )}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-2">
                                            <p className="text-sm text-gray-600">
                                                Acceptable Conditions:
                                            </p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {selectedPart
                                                    .part_condition_preferences
                                                    ?.length ? (
                                                    selectedPart.part_condition_preferences.map(
                                                        (pref, i) => (
                                                            <span
                                                                key={i}
                                                                className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs capitalize">
                                                                {pref.condition.replace(
                                                                    "_",
                                                                    " "
                                                                )}
                                                            </span>
                                                        )
                                                    )
                                                ) : (
                                                    <span className="text-gray-400 text-xs">
                                                        Any condition accepted
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {selectedPart.description && (
                                            <div className="col-span-full">
                                                <p className="text-gray-500">
                                                    Description
                                                </p>
                                                <p className="font-medium text-gray-800 bg-white p-2 rounded border">
                                                    {selectedPart.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Vendor % Note */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <span className="text-yellow-600 text-lg">
                                                💡
                                            </span>
                                        </div>
                                        <div className="ml-3">
                                            <h4 className="text-sm font-medium text-yellow-800">
                                                Pricing Reminder
                                            </h4>
                                            <p className="text-sm text-yellow-700 mt-1">
                                                Keep the vendor percentage in
                                                mind when setting the quote
                                                price. Ensure fair vendor
                                                margins while remaining
                                                competitive.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Vendor Info */}
                                <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border p-4 rounded-lg">
                                    <legend className="text-lg font-semibold text-gray-800 px-2">
                                        Vendor Details
                                    </legend>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Vendor Name
                                        </label>
                                        <input
                                            type="text"
                                            value={addQuoteForm.vendorName}
                                            onChange={(e) =>
                                                setAddQuoteForm({
                                                    ...addQuoteForm,
                                                    vendorName: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                                            placeholder="e.g., John Doe's Auto Parts"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Vendor Phone
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                                +971
                                            </span>
                                            <input
                                                type="tel"
                                                value={addQuoteForm.vendorPhone}
                                                onChange={(e) => {
                                                    const cleaned =
                                                        e.target.value
                                                            .replace(/\D/g, "")
                                                            .replace(
                                                                /^971/,
                                                                ""
                                                            );
                                                    setAddQuoteForm({
                                                        ...addQuoteForm,
                                                        vendorPhone: cleaned,
                                                    });
                                                }}
                                                className="w-full pl-14 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                                                placeholder="50 123 4567"
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Enter number without country code
                                        </p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Vendor Address
                                        </label>
                                        <input
                                            type="text"
                                            value={addQuoteForm.vendorAddress}
                                            onChange={(e) =>
                                                setAddQuoteForm({
                                                    ...addQuoteForm,
                                                    vendorAddress:
                                                        e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                                            placeholder="Full vendor address"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Vendor Email
                                        </label>
                                        <input
                                            type="email"
                                            value={addQuoteForm.vendorEmail}
                                            onChange={(e) =>
                                                setAddQuoteForm({
                                                    ...addQuoteForm,
                                                    vendorEmail: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                                            placeholder="vendor@example.com"
                                        />
                                    </div>
                                </fieldset>

                                {/* Quote Details */}
                                <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border p-4 rounded-lg">
                                    <legend className="text-lg font-semibold text-gray-800 px-2">
                                        Quote Details
                                    </legend>

                                    {/* Customer Pays Us */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            The customer pays us (AED)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={addQuoteForm.customerPaid}
                                            onChange={(e) =>
                                                setAddQuoteForm({
                                                    ...addQuoteForm,
                                                    customerPaid:
                                                        e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    {/* We Pay Vendor */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            We pay the vendor (AED)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={addQuoteForm.vendorPrice}
                                            onChange={(e) =>
                                                setAddQuoteForm({
                                                    ...addQuoteForm,
                                                    vendorPrice: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    {/* Profit Margin Indicator */}
                                    {addQuoteForm.customerPaid &&
                                        addQuoteForm.vendorPrice && (
                                            <div className="md:col-span-2 p-4 rounded-lg border">
                                                {(() => {
                                                    const profitInfo =
                                                        calculateProfitMargin(
                                                            addQuoteForm.customerPaid,
                                                            addQuoteForm.vendorPrice
                                                        );

                                                    if (!profitInfo)
                                                        return null;

                                                    const {
                                                        profit,
                                                        margin,
                                                        status,
                                                    } = profitInfo;
                                                    const bgColor = {
                                                        red: "bg-red-50 border-red-200",
                                                        orange: "bg-orange-50 border-orange-200",
                                                        green: "bg-green-50 border-green-200",
                                                    }[status];

                                                    const textColor = {
                                                        red: "text-red-800",
                                                        orange: "text-orange-800",
                                                        green: "text-green-800",
                                                    }[status];

                                                    return (
                                                        <div
                                                            className={`${bgColor} p-4 rounded-lg space-y-2`}>
                                                            <div className="flex justify-between items-center">
                                                                <span className="font-medium">
                                                                    Profit
                                                                    Margin:
                                                                </span>
                                                                <span
                                                                    className={`font-bold ${textColor}`}>
                                                                    {margin.toFixed(
                                                                        1
                                                                    )}
                                                                    %
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="font-medium">
                                                                    Profit
                                                                    Amount:
                                                                </span>
                                                                <span
                                                                    className={`font-bold ${textColor}`}>
                                                                    AED{" "}
                                                                    {profit.toFixed(
                                                                        2
                                                                    )}
                                                                </span>
                                                            </div>
                                                            {margin < 15 && (
                                                                <p className="text-red-600 text-sm mt-2">
                                                                    Warning:
                                                                    Profit
                                                                    margin is
                                                                    below the
                                                                    recommended
                                                                    15%
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        )}

                                    {maxAllowedSpend !== null &&
                                        parseFloat(addQuoteForm.vendorPrice) >
                                            maxAllowedSpend && (
                                            <div className="bg-red-50 border-l-4 border-red-500 p-4">
                                                <p className="text-red-700">
                                                    <span className="font-bold">
                                                        Warning:
                                                    </span>{" "}
                                                    Your quote exceeds the
                                                    maximum allowed spend by AED{" "}
                                                    {(
                                                        parseFloat(
                                                            addQuoteForm.vendorPrice
                                                        ) - maxAllowedSpend
                                                    ).toFixed(2)}
                                                </p>
                                            </div>
                                        )}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Condition
                                        </label>
                                        <select
                                            value={addQuoteForm.condition}
                                            onChange={(e) =>
                                                setAddQuoteForm({
                                                    ...addQuoteForm,
                                                    condition: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required>
                                            <option value="">
                                                Select condition
                                            </option>
                                            <option value="New">New</option>
                                            <option value="Used - Excellent">
                                                Used - Excellent
                                            </option>
                                            <option value="Used - Good">
                                                Used - Good
                                            </option>
                                            <option value="Used - Fair">
                                                Used - Fair
                                            </option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Warranty
                                        </label>
                                        <select
                                            value={addQuoteForm.warranty}
                                            onChange={(e) =>
                                                setAddQuoteForm({
                                                    ...addQuoteForm,
                                                    warranty: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required>
                                            <option value="">
                                                Select warranty
                                            </option>
                                            <option value="No Warranty">
                                                No Warranty
                                            </option>
                                            <option value="3 Days">
                                                3 Days
                                            </option>
                                            <option value="7 Days">
                                                7 Days
                                            </option>
                                            <option value="14 Days">
                                                14 Days
                                            </option>
                                            <option value="30 Days">
                                                30 Days
                                            </option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Part Images (
                                            {addQuoteForm.imageFiles.length}{" "}
                                            selected)
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAddQuoteImageUpload}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                 file:rounded-full file:border-0 file:text-sm file:font-semibold 
                 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        {/* Image Preview Grid */}
                                        {addQuoteForm.imageFiles.length > 0 ? (
                                            <div className="mt-4">
                                                <Carousel className="w-full">
                                                    <CarouselContent>
                                                        {addQuoteForm.imageFiles.map(
                                                            (file, index) => (
                                                                <CarouselItem
                                                                    key={`${file.name}-${index}`}
                                                                    className="basis-1/2 sm:basis-1/3 md:basis-1/4">
                                                                    <div className="relative group p-1">
                                                                        <img
                                                                            src={
                                                                                URL.createObjectURL(
                                                                                    file
                                                                                ) ||
                                                                                "/placeholder.svg"
                                                                            }
                                                                            alt={`Upload preview ${
                                                                                index +
                                                                                1
                                                                            }`}
                                                                            className="h-24 w-full object-cover rounded-lg border border-gray-200"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                removeQuoteImage(
                                                                                    index
                                                                                )
                                                                            }
                                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <X className="h-4 w-4" />
                                                                        </button>
                                                                        <p className="text-xs text-gray-500 mt-1 truncate">
                                                                            {
                                                                                file.name
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </CarouselItem>
                                                            )
                                                        )}
                                                    </CarouselContent>
                                                    {addQuoteForm.imageFiles
                                                        .length > 4 && (
                                                        <>
                                                            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                                                            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                                                        </>
                                                    )}
                                                </Carousel>
                                            </div>
                                        ) : null}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Upload multiple part images. Click
                                            to add more.
                                        </p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Vendor Notes
                                        </label>
                                        <textarea
                                            value={addQuoteForm.vendorNotes}
                                            onChange={(e) =>
                                                setAddQuoteForm({
                                                    ...addQuoteForm,
                                                    vendorNotes: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            rows={3}
                                            placeholder="Any additional notes about the part or vendor..."
                                        />
                                    </div>
                                </fieldset>
                            </div>
                        </div>

                        <div className="flex space-x-4 p-6 bg-gray-50 border-t">
                            <button
                                type="button"
                                onClick={closeAddQuoteModal}
                                disabled={submitting}
                                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50">
                                Cancel
                            </button>
                            <button
                                onClick={handleAddQuote}
                                disabled={
                                    submitting ||
                                    !addQuoteForm.vendorName ||
                                    !addQuoteForm.vendorPrice ||
                                    !addQuoteForm.condition ||
                                    !addQuoteForm.warranty
                                }
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center">
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Adding Quote...
                                    </>
                                ) : (
                                    "Add Quote"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SourcerDashboard;
