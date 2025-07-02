import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { LatLngExpression, Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin as MapPinIcon } from 'lucide-react';
import { EnrichedPart } from '@/pages/delivery/Pickup';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Checkbox } from '@/components/ui/checkbox';
import PickupModal from '@/components/delivery/PickupModal';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

type GroupedByVendor = {
    vendor: { id: string; name: string; address: string; phone: string; lat: number; lng: number; };
    parts: EnrichedPart[];
};

// Custom blue icon for selected marker
const selectedIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', // fallback to default blue
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'leaflet-marker-selected',
});

// Default icon
const defaultIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const VendorList: React.FC<{
  vendors: GroupedByVendor[],
  onVendorSelect: (vendor: GroupedByVendor) => void,
  selectedVendorId?: string,
  refs: React.RefObject<HTMLDivElement>[],
  selectedParts: Record<string, Set<string>>,
  onSelectPart: (vendorId: string, partId: string) => void,
  onOpenPickupModal: (vendorId: string) => void
}> = ({ vendors, onVendorSelect, selectedVendorId, refs, selectedParts, onSelectPart, onOpenPickupModal }) => {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {vendors.map((v, index) => {
          const isSelected = v.vendor.id === selectedVendorId;
          const totalQty = v.parts.reduce((sum, part) => sum + part.quantity, 0);
          const selectedCount = selectedParts[v.vendor.id]?.size || 0;
          return (
            <div key={v.vendor.id} ref={refs[index]}>
              <Card
                className={`cursor-pointer transition-all ${isSelected ? 'border-primary shadow-lg' : 'hover:shadow-md'}`}
                onClick={() => onVendorSelect(v)}
              >
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{v.vendor.name}</CardTitle>
                    <Badge>{totalQty} part(s)</Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex items-start text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-2 mt-1 shrink-0" />
                    <span>{v.vendor.address}</span>
                  </div>
                  <a
                    href={`tel:${v.vendor.phone}`}
                    onClick={e => e.stopPropagation()}
                    className="flex items-center text-gray-600 hover:text-primary"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {v.vendor.phone}
                  </a>
                  {/* Collapsible part list for selected vendor */}
                  {isSelected && (
                    <div className="mt-4 border-t pt-3">
                      <div className="font-semibold mb-2">Parts to Pick Up</div>
                      <ul className="space-y-2">
                        {v.parts.map(part => (
                          <li key={part.id} className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedParts[v.vendor.id]?.has(part.id) || false}
                              onClick={e => e.stopPropagation()}
                              onCheckedChange={() => onSelectPart(v.vendor.id, part.id)}
                            />
                            <span className="font-medium">{part.partName}</span>
                            <Badge variant="outline">#{part.orderId}</Badge>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 flex justify-end">
                        <Button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            onOpenPickupModal(v.vendor.id);
                          }}
                          disabled={selectedCount === 0}
                          variant={selectedCount === 0 ? 'secondary' : 'default'}
                        >
                          Mark as Picked Up ({selectedCount})
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

const PickupMapView: React.FC<{ data: GroupedByVendor[] }> = ({ data }) => {
    const [center, setCenter] = useState<LatLngExpression>([25.2048, 55.2708]);
    const [zoom, setZoom] = useState(11);
    const [selectedVendor, setSelectedVendor] = useState<GroupedByVendor | undefined>(data[0]);
    const [selectedParts, setSelectedParts] = useState<Record<string, Set<string>>>({});
    const [pickupModalState, setPickupModalState] = useState<{ isOpen: boolean; vendorId: string | null }>({ isOpen: false, vendorId: null });
    const vendorRefs = React.useMemo(() => Array(data.length).fill(0).map(() => React.createRef<HTMLDivElement>()), [data]);
    const markerRefs = useRef<(L.Marker | null)[]>([]);
    const navigate = useNavigate();

    // Pan/zoom and open popup when vendor is selected from the list
    useEffect(() => {
        if (selectedVendor) {
            setCenter([selectedVendor.vendor.lat, selectedVendor.vendor.lng]);
            setZoom(14);
            const idx = data.findIndex(v => v.vendor.id === selectedVendor.vendor.id);
            if (markerRefs.current[idx]) {
                markerRefs.current[idx]?.openPopup();
            }
        }
    }, [selectedVendor, data]);

    const handleSelectPart = (vendorId: string, partId: string) => {
        setSelectedParts(prev => {
            const newSelection = { ...prev };
            if (!newSelection[vendorId]) {
                newSelection[vendorId] = new Set();
            }
            const vendorSelection = new Set(newSelection[vendorId]);
            if (vendorSelection.has(partId)) {
                vendorSelection.delete(partId);
            } else {
                vendorSelection.add(partId);
            }
            newSelection[vendorId] = vendorSelection;
            return newSelection;
        });
    };

    const handleOpenPickupModal = (vendorId: string) => {
        if (!selectedParts[vendorId] || selectedParts[vendorId].size === 0) {
            alert('Please select parts to pick up.');
            return;
        }
        navigate('/delivery/pickup', {
            state: {
                vendorId,
                partIds: Array.from(selectedParts[vendorId])
            }
        });
    };

    const handleClosePickupModal = () => {
        setPickupModalState({ isOpen: false, vendorId: null });
    };

    const handleConfirmPickup = (pickupNotes: string, photo?: File) => {
        const { vendorId } = pickupModalState;
        if (!vendorId) return;
        // Here you would update the backend or parent state
        // For demo, just clear selection
        setSelectedParts(prev => {
            const newSelection = { ...prev };
            delete newSelection[vendorId];
            return newSelection;
        });
        handleClosePickupModal();
        alert('Parts marked as picked up!');
    };

    const pickupModalParts = data
        .find(group => group.vendor.id === pickupModalState.vendorId)?.parts.filter(p => selectedParts[pickupModalState.vendorId!]?.has(p.id)) || [];

    return (
        <div className="h-full w-full flex flex-col-reverse md:flex-row">
            <div className="w-full md:w-1/3 lg:w-1/4 h-1/2 md:h-full border-r bg-gray-50">
                <VendorList
                    vendors={data}
                    onVendorSelect={setSelectedVendor}
                    selectedVendorId={selectedVendor?.vendor.id}
                    refs={vendorRefs}
                    selectedParts={selectedParts}
                    onSelectPart={handleSelectPart}
                    onOpenPickupModal={handleOpenPickupModal}
                />
                <PickupModal
                    isOpen={pickupModalState.isOpen}
                    onClose={handleClosePickupModal}
                    parts={pickupModalParts}
                    vendorName={
                        data.find(v => v.vendor.id === pickupModalState.vendorId)?.vendor.name || ''
                    }
                    onConfirm={handleConfirmPickup}
                />
            </div>
            <div className="w-full md:w-2/3 lg:w-3/4 h-1/2 md:h-full">
                <div style={{ height: '100%', width: '100%' }}>
                    <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }} attributionControl={true}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {data.map((v, idx) => (
                            <Marker
                                key={v.vendor.id}
                                position={[v.vendor.lat, v.vendor.lng]}
                                icon={selectedVendor?.vendor.id === v.vendor.id ? selectedIcon : defaultIcon}
                                eventHandlers={{ click: () => setSelectedVendor(v) }}
                                ref={el => markerRefs.current[idx] = el}
                            >
                                <Popup>
                                    <strong>{v.vendor.name}</strong><br />
                                    {v.vendor.address}<br />
                                    <em>Parts: {v.parts.map(p => p.partName).join(', ')}</em>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default PickupMapView; 