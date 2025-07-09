import { useState, useEffect } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react"
import { StatusBadge } from "./StatusBadge"
import { PartModal } from "./PartModal"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Part, Vehicle } from "@/lib/order"

interface VehicleGroupProps {
  vehicle: Vehicle & { parts: Part[] }
  parts: Part[]
  onPartDeleted?: (partId: string) => void
}

export const VehicleGroup = ({ vehicle, parts, onPartDeleted }: VehicleGroupProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)
  const [priceModifiers, setPriceModifiers] = useState({
    vendor_percentage: 10
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const [partToDelete, setPartToDelete] = useState<string | null>(null)
  const [localParts, setLocalParts] = useState<Part[]>(parts)

  // Update local parts when props change
  useEffect(() => {
    setLocalParts(parts)
  }, [parts])

  const fetchModifiers = async () => {
    const { data } = await supabase
      .from('price_modifiers')
      .select('*')
      .single()
    if (data) setPriceModifiers(data)
  }

  useEffect(() => {
    fetchModifiers()
  }, [])

  const getGroupStatus = () => {
    const statuses = localParts.map((part) => part.shipping_status)
    if (statuses.every((status) => status === "delivered")) return "COMPLETE"
    if (statuses.some((status) =>
      status === "out_for_delivery" ||
      status === "confirmed" ||
      status === "cancelled" ||
      status === "refunded"
    )) return "IN_PROGRESS"
    return "NEW"
  }

  const handleDeletePart = async () => {
  if (!partToDelete || isDeleting) return;
  
  setIsDeleting(true);
  try {
    // Get the part details first
    const { data: partData, error: partError } = await supabase
      .from('parts')
      .select('id, order_id')
      .eq('id', partToDelete)
      .single();

    if (partError || !partData) throw partError || new Error("Part not found");

    const orderId = partData.order_id;

    // Check if there are any accepted bids for this part
    const { data: bids, error: bidsError } = await supabase
      .from('bids')
      .select('id, status')
      .eq('part_id', partToDelete);
    
    if (bidsError) throw bidsError;
    
    const hasAcceptedBid = bids?.some(bid => bid.status === "accepted");
    if (hasAcceptedBid) {
      toast.error("Cannot delete part with accepted bids");
      return;
    }

    // Show loading state immediately
    setLocalParts(prev => prev.filter(p => p.id !== partToDelete));

    // First delete related condition preferences
    const { error: deleteConditionsError } = await supabase
      .from('part_condition_preferences')
      .delete()
      .eq('part_id', partToDelete);
    
    if (deleteConditionsError) throw deleteConditionsError;

    // Then delete related bids
    const { error: deleteBidsError } = await supabase
      .from('bids')
      .delete()
      .eq('part_id', partToDelete);
    
    if (deleteBidsError) throw deleteBidsError;

    // Finally delete the part itself
    const { error: deletePartError } = await supabase
      .from('parts')
      .delete()
      .eq('id', partToDelete);
    
    if (deletePartError) throw deletePartError;

    // Check if this was the last part in the order
    const { data: remainingParts, error: partsError } = await supabase
      .from('parts')
      .select('id')
      .eq('order_id', orderId);

    if (partsError) throw partsError;

    // If no parts left, delete the order
    if (remainingParts && remainingParts.length === 0) {
      const { error: deleteOrderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (deleteOrderError) throw deleteOrderError;
    }

    toast.success("Part deleted successfully");
    if (onPartDeleted) onPartDeleted(partToDelete);
  } catch (error) {
    console.error("Error deleting part:", error);
    // Revert UI if deletion failed
    setLocalParts(parts);
    toast.error("Failed to delete part. Please try again.");
  } finally {
    setIsDeleting(false);
    setPartToDelete(null);
  }
};

  const groupStatus = getGroupStatus()
  const orderDate = localParts[0]?.created_at ? new Date(localParts[0].created_at).toLocaleDateString() : "N/A"

  const getGroupStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">New</span>
      case "IN_PROGRESS":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">In Progress</span>
      case "COMPLETE":
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Complete</span>
      case "CANCELLED":
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Cancelled</span>
      default:
        return null
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">
                  {vehicle.make} {vehicle.model} {vehicle.year}
                </h3>
                {getGroupStatusBadge(groupStatus)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {orderDate} • {localParts.length} part{localParts.length !== 1 ? "s" : ""}
              </div>
            </div>
            <Button variant="ghost" size="sm">
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 pt-0 border-t">
            {localParts.map((part) => {
              const hasAcceptedBid = part.bids?.some(bid => bid.status === "accepted")

              return (
                <div
                  key={part.id}
                  className="group flex items-center justify-between py-3 px-2 border-b last:border-b-0 hover:bg-muted/50"
                >
                  <div
                    className="flex items-center gap-2 flex-1 cursor-pointer"
                    onClick={() => setSelectedPart(part)}
                  >
                    <span className="text-sm font-medium">{part.part_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={part.shipping_status} />
                    {!hasAcceptedBid && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation()
                          setPartToDelete(part.id)
                        }}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              )
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!partToDelete} onOpenChange={(open) => !open && setPartToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the part and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePart}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedPart && (
        <PartModal
          part={selectedPart}
          vehicle={vehicle}
          onOpenChange={setSelectedPart}
          priceModifiers={priceModifiers}
        />
      )}
    </div>
  )
}