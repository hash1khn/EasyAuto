import { supabase } from "@/integrations/supabase/client";
import type { EnrichedPart, GroupedDeliveryData } from "@/types/delivery";

export async function handleDeliveryConfirmation(data: {
  parts: EnrichedPart[];
  buyerData: GroupedDeliveryData;
  deliveryFee: number;
  paymentMethod: string;
  paymentReference?: string;
  deliveryPhotos: File[];
  deliveryNotes: string;
  driverName: string;
  subtotal: number;
  vatAmount: number;
  serviceFee: number;
  grandTotal: number;
  priceModifiers: {
    vendor_percentage: number;
    vat_percentage: number;
    service_charge_percentage: number;
  };
  discountAmount: number;
}) {
  const {
    parts,
    buyerData,
    deliveryFee,
    paymentMethod,
    paymentReference,
    deliveryPhotos,
    deliveryNotes,
    driverName,
    subtotal,
    vatAmount,
    serviceFee,
    grandTotal,
    priceModifiers,
    discountAmount,
  } = data;

  try {
    // 1. Upload delivery photos
    const photoUploads = await Promise.all(
      deliveryPhotos.map(async (photo) => {
        const fileExt = photo.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;
        const filePath = `delivery-confirmations/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("mybucket")
          .upload(filePath, photo);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("mybucket").getPublicUrl(filePath);

        return publicUrl;
      })
    );

    // 2. Create invoice with all charges
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        user_id: buyerData.buyer_id,
        total_amount: grandTotal,
        status: "delivered",
        delivery_address: buyerData.delivery_address,
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        vat_amount: vatAmount,
        service_fee: serviceFee,
        payment_method: paymentMethod,
        payment_reference: paymentReference,
        payment_status: paymentMethod === "Not Collected" ? "unpaid" : "paid",
        paid_at:
          paymentMethod !== "Not Collected" ? new Date().toISOString() : null,
        driver_name: driverName,
        delivery_note: deliveryNotes,
        image_urls: photoUploads,
        discount_amount: discountAmount,
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // 3. Create invoice_parts entries with final prices
    const { error: partsError } = await supabase.from("invoice_parts").insert(
      parts.map((part) => {
        return {
          invoice_id: invoice.id,
          part_id: part.id,
          quantity: part.quantity,
          unit_price: part.winning_bid.price, // Store final price with vendor %      // Store original price
        };
      })
    );

    if (partsError) throw partsError;

    // 4. Update parts with final prices
    const { error: updateError } = await supabase
      .from("parts")
      .update({
        shipping_status: "delivered",
        delivered_at: new Date().toISOString(),
        delivery_photo_url: photoUploads[0],
        delivery_note: deliveryNotes,
        updated_at: new Date().toISOString(),
      })
      .in(
        "id",
        parts.map((p) => p.id)
      );

    if (updateError) throw updateError;

    // 5. Create activity logs
    const { error: logsError } = await supabase
      .from("part_activity_logs")
      .insert(
        parts.map((part) => ({
          part_id: part.id,
          status: "delivered",
          note: deliveryNotes,
          updated_by: buyerData.buyer_id,
        }))
      );

    if (logsError) throw logsError;

    return invoice;
  } catch (error) {
    console.error("Error in handleDeliveryConfirmation:", error);
    throw error;
  }
}
