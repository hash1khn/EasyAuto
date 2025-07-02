import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import PickupMapView from '@/components/delivery/PickupMapView';
import { Link } from 'react-router-dom';
import { List, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GroupedByVendor } from './Pickup';

const PickupMapPage: React.FC = () => {
  const { state } = useLocation();
  const [partsByVendor, setPartsByVendor] = useState<GroupedByVendor[]>(state?.data || []);
  const [loading, setLoading] = useState(!state?.data);
  const [error, setError] = useState<string | null>(null);

  const fetchPartsForPickup = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('parts')
        .select(`
          id,
          part_name,
          part_number,
          quantity,
          photos,
          bids!inner(
            vendor:user_profiles!inner(
              id,
              full_name,
              whatsapp_number,
              location,
              google_maps_url,
              delivery_instructions
            )
          ),
          vehicle:vehicles!inner(make, model, year)
        `)
        .eq('shipping_status', 'confirmed')
        .eq('bids.status', 'accepted');

      if (fetchError) throw fetchError;

      const groupedData = data.reduce((acc: Record<string, GroupedByVendor>, part: any) => {
        const vendor = part.bids[0]?.vendor;
        if (!vendor) return acc;

        const coords = extractCoordsFromUrl(vendor.google_maps_url);

        if (!acc[vendor.id]) {
          acc[vendor.id] = {
            vendor: {
              id: vendor.id,
              name: vendor.full_name,
              address: vendor.location,
              phone: vendor.whatsapp_number,
              lat: coords.lat,
              lng: coords.lng,
              google_maps_url: vendor.google_maps_url,
              delivery_instructions: vendor.delivery_instructions
            },
            parts: []
          };
        }

        acc[vendor.id].parts.push({
          id: part.id,
          partName: part.part_name,
          partNumber: part.part_number || '',
          quantity: part.quantity,
          imageUrls: part.photos || [],
          vehicleName: `${part.vehicle.year} ${part.vehicle.make} ${part.vehicle.model}`,
          vendorId: vendor.id,
          vendorName: vendor.full_name,
          vendorAddress: vendor.location,
          vendorPhone: vendor.whatsapp_number,
          vendorLat: coords.lat,
          vendorLng: coords.lng,
          vehicle: {
            make: part.vehicle.make,
            model: part.vehicle.model,
            year: part.vehicle.year
          }
        });

        return acc;
      }, {});

      setPartsByVendor(Object.values(groupedData));
    } catch (err) {
      console.error('Error fetching parts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch parts');
    } finally {
      setLoading(false);
    }
  };

  const extractCoordsFromUrl = (url?: string | null) => {
    const defaultCoords = { lat: 25.2048, lng: 55.2708 }; // Default Dubai coordinates
    if (!url) return defaultCoords;
    
    try {
      // Handle different Google Maps URL formats:
      // 1. https://www.google.com/maps/@25.2048,55.2708,15z
      // 2. https://www.google.com/maps/place/.../@25.2048,55.2708,15z
      const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match && match.length >= 3) {
        return {
          lat: Number.parseFloat(match[1]),
          lng: Number.parseFloat(match[2])
        };
      }
      return defaultCoords;
    } catch (err) {
      console.error('Error parsing coordinates from URL:', err);
      return defaultCoords;
    }
  };

  useEffect(() => {
    if (!state?.data) {
      fetchPartsForPickup();
    }
  }, [state]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading pickup locations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-600 mb-2">Error: {error}</div>
        <Button onClick={fetchPartsForPickup} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="p-4 border-b flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pickup Locations Map</h1>
        <Button asChild variant="outline">
          <Link to="/delivery/pickup">
            <List className="mr-2 h-4 w-4" />
            List View
          </Link>
        </Button>
      </header>
      <main className="flex-grow">
        {partsByVendor.length > 0 ? (
          <PickupMapView data={partsByVendor} />
        ) : (
          <div className="p-4 text-center">
            <p>No parts ready for pickup.</p>
            <Button onClick={fetchPartsForPickup} variant="outline" className="mt-2">
              Refresh
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default PickupMapPage;