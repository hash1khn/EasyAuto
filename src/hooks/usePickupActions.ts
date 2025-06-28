import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { handlePickupConfirmation } from "@/lib/delivery-service";
import { toast } from "@/components/ui/use-toast";
import {PickupPart} from '@/components/delivery/PickupModal';

export const usePickupActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmPickup = async (
    parts: PickupPart[],
    pickupNotes: string,
    pickupPhotos: File[],
    vendorName: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const result = await handlePickupConfirmation({
        parts,
        pickupNotes,
        pickupPhotos,
        vendorName
      });

      toast({
        title: "Pickup confirmed",
        description: result.message
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to confirm pickup";
      setError(errorMessage);
      console.error("Error confirming pickup:", err);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      });

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    confirmPickup,
    loading,
    error
  };
};
