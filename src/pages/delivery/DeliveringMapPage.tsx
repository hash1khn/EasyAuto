import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DeliveringMapView from '@/components/delivery/DeliveringMapView';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type { GroupedByAddress, EnrichedDeliveryPart } from './Delivering';

const DeliveringMapPage: React.FC = () => {
  const { state } = useLocation();
  const [partsByAddress, setPartsByAddress] = useState<GroupedByAddress[]>(state?.data || []);
  const [loading, setLoading] = useState(!state?.data);
  const [error, setError] = useState<string | null>(null);

  const fetchDeliveryData = async () => {
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
          shipping_status,
          delivery_photo_url,
          vehicle:vehicles!inner(
            make,
            model,
            year,
            user:user_profiles!inner(
              full_name,
              delivery_addresses:user_delivery_addresses(
                address,
                google_maps_url,
                is_default
              )
            )
          ),
          order:orders!inner(
            user_profile:user_profiles!inner(
              id,
              full_name,
              delivery_address,
              delivery_phone,
              delivery_instructions,
              google_maps_url
            )
          ),
          bids!inner(
            vendor:user_profiles!inner(
              full_name,
              business_name
            ),
            price,
            warranty,
            notes
          )
        `)
        .eq('shipping_status', 'out_for_delivery');

      if (fetchError) throw fetchError;

      const groupedData = data.reduce((acc: Record<string, GroupedByAddress>, part: any) => {
        const deliveryAddress = part.order.user_profile.delivery_address;
        if (!deliveryAddress) return acc;

        // Directly use google_maps_url from user_profile
        const googleMapsUrl = part.order.user_profile.google_maps_url;
        const coords = extractCoordsFromUrl(googleMapsUrl);

        if (!acc[deliveryAddress]) {
          acc[deliveryAddress] = {
            address: deliveryAddress,
            buyerName: part.order.user_profile.full_name,
            phone: part.order.user_profile.delivery_phone,
            googleMapsUrl: googleMapsUrl || null,
            lat: coords.lat,
            lng: coords.lng,
            parts: []
          };
        }

        const enrichedPart: EnrichedDeliveryPart = {
          id: part.id,
          partName: part.part_name,
          partNumber: part.part_number || '',
          quantity: part.quantity,
          imageUrls: part.photos || [],
          vehicleName: `${part.vehicle.year} ${part.vehicle.make} ${part.vehicle.model}`,
          shipping_status: part.shipping_status,
          delivery_photo_url: part.delivery_photo_url,
          vehicle: {
            make: part.vehicle.make,
            model: part.vehicle.model,
            year: part.vehicle.year
          },
          winning_bid: {
            price: part.bids[0]?.price || 0,
            warranty: part.bids[0]?.warranty || 'No Warranty',
            notes: part.bids[0]?.notes || null,
            vendor: {
              business_name: part.bids[0]?.vendor?.business_name || null
            }
          },
          order: {
            user_profile: {
              full_name: part.order.user_profile.full_name,
              delivery_address: deliveryAddress,
              delivery_phone: part.order.user_profile.delivery_phone,
              delivery_instructions: part.order.user_profile.delivery_instructions,
              google_maps_url: googleMapsUrl || null
            }
          }
        };

        acc[deliveryAddress].parts.push(enrichedPart);
        return acc;
      }, {});

      setPartsByAddress(Object.values(groupedData));
    } catch (err) {
      console.error('Error fetching delivery data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch delivery data');
    } finally {
      setLoading(false);
    }
  };

  const extractCoordsFromUrl = (url?: string | null) => {
    const defaultCoords = { lat: 25.2048, lng: 55.2708 }; // Default to Dubai coordinates
    if (!url) return defaultCoords;
    
    try {
      // Try to extract coordinates from Google Maps URL format
      const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        return {
          lat: Number.parseFloat(match[1]),
          lng: Number.parseFloat(match[2])
        };
      }
      
      // If no match, try to extract from query parameters
      const urlObj = new URL(url);
      const query = urlObj.searchParams.get('query');
      if (query) {
        const coords = query.split(',');
        if (coords.length === 2) {
          const lat = Number.parseFloat(coords[0]);
          const lng = Number.parseFloat(coords[1]);
          if (!isNaN(lat) && !isNaN(lng)) {
            return { lat, lng };
          }
        }
      }
      
      return defaultCoords;
    } catch {
      return defaultCoords;
    }
  };

  useEffect(() => {
    if (!state?.data) {
      fetchDeliveryData();
    }
  }, [state]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading delivery locations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-600 mb-2">Error: {error}</div>
        <Button onClick={fetchDeliveryData} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <div className="flex justify-between items-center p-6 pb-0">
        <h1 className="text-2xl font-bold">Delivering Locations Map</h1>
        <Button asChild variant="outline">
          <Link to="/delivery/delivering">
            List View
          </Link>
        </Button>
      </div>
      <DeliveringMapView data={partsByAddress} />
    </div>
  );
};

export default DeliveringMapPage;