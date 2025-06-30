import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

interface VendorQuote {
  id: string;
  vendorName: string;
  vendorAddress: string;
  vendorPhone: string;
  vendorEmail: string;
  price: number;
  condition: "New" | "Used - Excellent" | "Used - Good" | "Used - Fair";
  warranty: string;
  imageUrl?: string;
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
    // Add any other fields that might be in vendor_info
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
  // Add inspection image fields
  inspectionImages?: string[];
  inspectedBy?: string;
  inspectedAt?: string;
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
  });
  // Add to the existing state declarations
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [addQuoteForm, setAddQuoteForm] = useState({
    vendorName: "",
    vendorAddress: "",
    vendorPhone: "",
    vendorEmail: "",
    price: "",
    condition: "",
    warranty: "",
    imageFiles: [] as File[],
    vendorNotes: "",
  });

  const handleAddQuoteImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newFiles = Array.from(e.target.files || []);
    setAddQuoteForm((prev) => ({
      ...prev,
      imageFiles: [...prev.imageFiles, ...newFiles],
    }));
    // Reset input value to allow selecting the same file again
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
    // Reset the input value to allow selecting the same file again
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
        .select(`
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
            notes,
            status,
            image_url,
            created_at,
            warranty,
            condition,
            vendor_info,
            is_sourcer_provided,
            sourcer_notes
        )
    `)
        .in("shipping_status", ["pending"])
        .not("is_accepted", "eq", true)
        .order("created_at", { ascending: false });

      if (partsError) throw partsError;

      const ordersMap = new Map<string, Order>();

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
              whatsappNumber: part.orders.user_profiles.whatsapp_number,
              location: part.orders.user_profiles.location,
              deliveryAddress: part.orders.user_profiles.delivery_address,
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
                : bid.vendor?.whatsapp_number || "No phone provided",
              vendorEmail: isSourcerProvided
                ? vendorInfo?.email
                : bid.vendor?.user?.email || "No email provided",
              price: bid.price,
              condition: bid.condition,
              warranty: bid.warranty,
              imageUrl: bid.image_url,
              vendorNotes: bid.notes,
              submittedAt: bid.created_at,
              isAccepted: bid.status === "accepted",
              isSourcerProvided,
              status: bid.status,
              vendor_info: vendorInfo,
              sourcerNotes: bid.sourcer_notes || (isSourcerProvided ? vendorInfo?.sourcerNotes : undefined)
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
      // Upload inspection images if any
      const imageUrls: string[] = [];
      for (const file of reviewForm.inspectionImages) {
        const url = await uploadImage(file);
        if (url) imageUrls.push(url);
      }

      // Update the bid status to accepted
      const { error: updateError } = await supabase
        .from("bids")
        .update({
          status: "accepted",
          updated_at: new Date().toISOString(),
          sourcer_notes: reviewForm.reviewNotes,
        })
        .eq("id", quote.id);

      if (updateError) throw updateError;

      // Update the part with inspection images and acceptance
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

      // Refresh data
      await handleLoadData();
      closeReviewModal();

      alert("Quote accepted successfully!");
    } catch (error) {
      console.error("Error accepting quote:", error);
      alert("Error accepting quote. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddQuote = async () => {
    if (!user || !selectedPart || !selectedVehicle) return;

    setSubmitting(true);
    try {
      // Upload part images if any
      const imageUrls: string[] = [];
      for (const file of addQuoteForm.imageFiles) {
        const url = await uploadImage(file);
        if (url) imageUrls.push(url);
      }

      // Create vendor info object
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

      // Insert new bid with auto-accepted status for sourcer quotes
      const { error: insertError } = await supabase.from("bids").insert({
        part_id: selectedPart.id,
        vendor_id: user.id, // Sourcer's user ID
        price: Number.parseFloat(addQuoteForm.price),
        notes: addQuoteForm.vendorNotes,
        status: "accepted", // Auto-accept sourcer quotes
        image_url: imageUrls[0] || null, // Primary image (sourcer's image of the part)
        warranty: addQuoteForm.warranty,
        condition: addQuoteForm.condition,
        vendor_info: vendorInfo,
        is_sourcer_provided: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      // Update the part with inspection images and acceptance
      const { error: partUpdateError } = await supabase
        .from("parts")
        .update({
          is_accepted: true,
          shipping_status: "confirmed",
          inspection_images: imageUrls, // All images go to parts table as inspection images
          inspected_by: user.id,
          inspected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedPart.id);

      if (partUpdateError) throw partUpdateError;

      // Refresh data
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

  // Calculate metrics for parts that need sourcer review
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

  // Filter parts based on search and filters
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
    setSelectedPart(part);
    setSelectedVehicle(part.vehicle);
    setIsViewAllQuotesModalOpen(true);
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
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedQuote(null);
    setSelectedPart(null);
    setSelectedVehicle(null);
    setReviewForm({
      inspectionImages: [],
      reviewNotes: "",
    });
  };

  const openAddQuoteModal = (part: Part & { vehicle: Vehicle }) => {
    setSelectedPart(part);
    setSelectedVehicle(part.vehicle);
    setIsAddQuoteModalOpen(true);
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
      price: "",
      condition: "",
      warranty: "",
      imageFiles: null,
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

  // Group filtered parts by order
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
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === "table"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}>
                📊 Table
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === "card"
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
                  {`${selectedVehicle.make} ${selectedVehicle.model
                    } ${selectedVehicle.year} - ${selectedVehicle.vin || "No VIN"
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

                {/* Vendor Quotes section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    Vendor Quotes ({selectedPart.vendorQuotes.length})
                  </h4>
                  <div className="space-y-4">
                    {selectedPart.vendorQuotes.map((quote) => (
                      <div
                        key={quote.id}
                        className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4 w-full md:w-auto flex-1">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-800">
                                {quote.vendorName}
                              </h4>
                              {quote.isSourcerProvided && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                  Sourcer Added
                                </span>
                              )}
                            </div>

                            {/* Vendor Contact Information */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Address:</span>
                                <span>{quote.vendorAddress}</span>
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    quote.vendorAddress
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-blue-700 ml-1"
                                  title="View on Google Maps"
                                >
                                  <MapPin className="h-4 w-4" />
                                </a>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Phone:</span>
                                <a
                                  href={`tel:${quote.vendorPhone}`}
                                  className="text-blue-500 hover:underline"
                                >
                                  {quote.vendorPhone}
                                </a>
                              </div>
                              {quote.vendorEmail && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Email:</span>
                                  <a
                                    href={`mailto:${quote.vendorEmail}`}
                                    className="text-blue-500 hover:underline"
                                  >
                                    {quote.vendorEmail}
                                  </a>
                                </div>
                              )}
                            </div>

                            {/* Sourcer Notes (if available) */}
                            {quote.isSourcerProvided && quote.sourcerNotes && (
                              <div className="bg-blue-50 p-2 rounded text-sm">
                                <p className="font-medium text-blue-800">Sourcer Notes:</p>
                                <p className="text-gray-700">{quote.sourcerNotes}</p>
                              </div>
                            )}

                            {/* Quote Details */}
                            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm">
                              <span className="font-bold text-blue-600">
                                AED {quote.price}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(
                                  quote.condition
                                )}`}
                              >
                                {quote.condition}
                              </span>
                              <span>
                                Warranty:{" "}
                                <span className="font-medium">
                                  {quote.warranty}
                                </span>
                              </span>
                            </div>
                          </div>

                          {quote.imageUrl && (
                            <img
                              src={quote.imageUrl || "/placeholder.svg"}
                              alt={`Part from ${quote.vendorName}`}
                              className="w-32 h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0 cursor-pointer hover:opacity-75 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewImage(quote.imageUrl);
                              }}
                            />
                          )}
                        </div>

                        <div className="flex-shrink-0 mt-4 md:mt-0">
                          {quote.status === "pending" ? (
                            <button
                              onClick={() => {
                                setIsViewAllQuotesModalOpen(false);
                                openReviewModal(
                                  quote,
                                  selectedPart as Part & { vehicle: Vehicle }
                                );
                              }}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Review & Accept
                            </button>
                          ) : (
                            <span
                              className={`px-3 py-2 rounded-lg text-sm font-medium ${quote.status === "accepted"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                                }`}
                            >
                              {quote.status === "accepted" ? "Accepted" : "Rejected"}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
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
                {/* Left Column - Quote Details */}
                <div className="space-y-6">
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

                  {selectedQuote.imageUrl && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">
                        Part Image
                      </h4>
                      <img
                        src={
                          selectedQuote.imageUrl ||
                          "/placeholder.svg"
                        }
                        alt="Part"
                        className="w-full h-auto object-contain rounded-lg border border-gray-200"
                        style={{ maxHeight: "200px" }}
                      />
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
                                      src={URL.createObjectURL(
                                        file
                                      )}
                                      alt={`Upload preview ${index +
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
              src={previewImage}
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
                          // Remove any non-numeric characters and the +971 prefix if entered
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (AED)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={addQuoteForm.price}
                      onChange={(e) =>
                        setAddQuoteForm({
                          ...addQuoteForm,
                          price: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

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
                    {addQuoteForm.imageFiles.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {addQuoteForm.imageFiles.map(
                          (file, index) => (
                            <div
                              key={`${file.name}-${index}`}
                              className="relative group">
                              <img
                                src={URL.createObjectURL(
                                  file
                                )}
                                alt={`Upload preview ${index + 1
                                  }`}
                                className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  removeQuoteImage(
                                    index
                                  )
                                }
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 
                                 opacity-0 group-hover:opacity-100 transition-opacity">
                                <X className="h-4 w-4" />
                              </button>
                              <p className="text-xs text-gray-500 mt-1 truncate max-w-[96px]">
                                {file.name}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    )}
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
                  !addQuoteForm.price ||
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
