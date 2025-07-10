import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { VehicleGroup } from "./VehicleGroup";
import { TopCards } from "./TopCards";
import { useDashboardData } from "@/hooks/useDashboardData";

type DashboardTabProps = {
  setRefetchOrders?: (fn: () => void) => void;
};

export const DashboardTab = ({ setRefetchOrders }: DashboardTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { vehiclesWithParts, dashboardStats, loading, refetchOrders } = useDashboardData();
  const allParts = vehiclesWithParts.flatMap(vehicle => vehicle.parts)

  // Register the refetchOrders function with the parent
  useEffect(() => {
    if (setRefetchOrders) {
      setRefetchOrders(refetchOrders);
    }
  }, [setRefetchOrders, refetchOrders]);

  const filteredVehicles = vehiclesWithParts
    .filter((vehicle) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          vehicle.make.toLowerCase().includes(searchLower) ||
          vehicle.model.toLowerCase().includes(searchLower) ||
          vehicle.parts.some(
            (part) =>
              part.part_name.toLowerCase().includes(searchLower) ||
              part.order_id.toLowerCase().includes(searchLower)
          )
        );
      }
      return true;
    })
    .sort((a, b) => a.make.localeCompare(b.make));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search orders..." className="pl-8 w-full md:w-64" disabled />
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-8 w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

     <TopCards parts={allParts} />
      <div className="space-y-4">
        {filteredVehicles.length > 0 ? (
          filteredVehicles.map((vehicle) => (
            <VehicleGroup key={vehicle.id} vehicle={vehicle} parts={vehicle.parts} />
          ))
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground">No ongoing orders found</p>
            {searchTerm && (
              <button
                className="text-primary text-sm mt-2 hover:underline"
                onClick={() => setSearchTerm("")}
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
