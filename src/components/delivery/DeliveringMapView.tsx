import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { LatLngExpression, Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin as MapPinIcon } from 'lucide-react';
import { EnrichedDeliveryPart } from '@/pages/delivery/Delivering';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Checkbox } from '@/components/ui/checkbox';
import DeliveringModal from '@/components/delivery/DeliveringModal';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

type GroupedByAddress = {
  address: string;
  buyerName: string;
  phone: string;
  lat: number;
  lng: number;
  parts: EnrichedDeliveryPart[];
};

const selectedIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'leaflet-marker-selected',
});

const defaultIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const AddressList: React.FC<{
  addresses: GroupedByAddress[],
  onAddressSelect: (address: GroupedByAddress) => void,
  selectedAddress?: string,
  refs: React.RefObject<HTMLDivElement>[],
  selectedParts: Record<string, Set<string>>,
  onSelectPart: (address: string, partId: string) => void,
  onOpenDeliveringModal: (address: string) => void
}> = ({ addresses, onAddressSelect, selectedAddress, refs, selectedParts, onSelectPart, onOpenDeliveringModal }) => {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {addresses.map((a, index) => {
          const isSelected = a.address === selectedAddress;
          const totalQty = a.parts.reduce((sum, part) => sum + part.quantity, 0);
          const selectedCount = selectedParts[a.address]?.size || 0;
          return (
            <div key={a.address} ref={refs[index]}>
              <div
                className={`bg-white rounded-xl border shadow-sm px-6 py-4 mb-2 transition-all ${isSelected ? 'border-primary ring-2 ring-primary/10' : 'hover:shadow-md'}`}
                style={{ minWidth: 0 }}
                onClick={() => onAddressSelect(a)}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="font-bold text-lg">{a.buyerName}</div>
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">{totalQty} part(s)</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm mb-1">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  {a.address}
                </div>
                <div className="flex items-center text-gray-600 text-sm mb-3">
                  <Phone className="h-4 w-4 mr-2" />
                  {a.phone}
                </div>
                {isSelected && (
                  <div className="border-t pt-3 mt-2">
                    <div className="font-semibold mb-2">Parts to Deliver</div>
                    <ul className="space-y-2 mb-4">
                      {a.parts.map(part => (
                        <li key={part.id} className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedParts[a.address]?.has(part.id) || false}
                            onClick={e => e.stopPropagation()}
                            onCheckedChange={() => onSelectPart(a.address, part.id)}
                          />
                          <span className="font-medium">{part.partName}</span>
                          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">#{part.orderId}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onOpenDeliveringModal(a.address);
                        }}
                        disabled={selectedCount === 0}
                        variant={selectedCount === 0 ? 'secondary' : 'default'}
                        className="w-full md:w-auto"
                      >
                        Mark as Delivered ({selectedCount})
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

const DeliveringMapView: React.FC<{ data: GroupedByAddress[] }> = ({ data }) => {
    const [center, setCenter] = useState<LatLngExpression>([25.2048, 55.2708]);
    const [zoom, setZoom] = useState(11);
    const [selectedAddress, setSelectedAddress] = useState<GroupedByAddress | undefined>(data[0]);
    const [selectedParts, setSelectedParts] = useState<Record<string, Set<string>>>({});
    const [deliveringModalState, setDeliveringModalState] = useState<{ isOpen: boolean; address: string | null }>({ isOpen: false, address: null });
    const addressRefs = React.useMemo(() => Array(data.length).fill(0).map(() => React.createRef<HTMLDivElement>()), [data]);
    const markerRefs = useRef<(L.Marker | null)[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (selectedAddress) {
            setCenter([selectedAddress.lat, selectedAddress.lng]);
            setZoom(14);
            const idx = data.findIndex(a => a.address === selectedAddress.address);
            if (markerRefs.current[idx]) {
                markerRefs.current[idx]?.openPopup();
            }
        }
    }, [selectedAddress, data]);

    const handleSelectPart = (address: string, partId: string) => {
        setSelectedParts(prev => {
            const newSelection = { ...prev };
            if (!newSelection[address]) {
                newSelection[address] = new Set();
            }
            const addressSelection = new Set(newSelection[address]);
            if (addressSelection.has(partId)) {
                addressSelection.delete(partId);
            } else {
                addressSelection.add(partId);
            }
            newSelection[address] = addressSelection;
            return newSelection;
        });
    };

    const handleOpenDeliveringModal = (address: string) => {
        if (!selectedParts[address] || selectedParts[address].size === 0) {
            alert('Please select parts to mark as delivered.');
            return;
        }
        navigate('/delivery/delivering', {
            state: {
                address,
                partIds: Array.from(selectedParts[address])
            }
        });
    };

    const handleCloseDeliveringModal = () => {
        setDeliveringModalState({ isOpen: false, address: null });
    };

    const handleConfirmDelivered = (deliveryNotes: string, photo?: File) => {
        const { address } = deliveringModalState;
        if (!address) return;
        setSelectedParts(prev => {
            const newSelection = { ...prev };
            delete newSelection[address];
            return newSelection;
        });
        handleCloseDeliveringModal();
        alert('Parts marked as delivered!');
    };

    const deliveringModalParts = data
        .find(group => group.address === deliveringModalState.address)?.parts.filter(p => selectedParts[deliveringModalState.address!]?.has(p.id)) || [];

    return (
        <div className="h-full w-full flex flex-col-reverse md:flex-row">
            <div className="w-full md:w-1/3 lg:w-1/4 h-1/2 md:h-full border-r bg-gray-50">
                <AddressList
                    addresses={data}
                    onAddressSelect={setSelectedAddress}
                    selectedAddress={selectedAddress?.address}
                    refs={addressRefs}
                    selectedParts={selectedParts}
                    onSelectPart={handleSelectPart}
                    onOpenDeliveringModal={handleOpenDeliveringModal}
                />
                <DeliveringModal
                    isOpen={deliveringModalState.isOpen}
                    onClose={handleCloseDeliveringModal}
                    parts={deliveringModalParts}
                    address={
                        data.find(a => a.address === deliveringModalState.address)?.address || ''
                    }
                    onConfirm={handleConfirmDelivered}
                />
            </div>
            <div className="w-full md:w-2/3 lg:w-3/4 h-1/2 md:h-full">
                <div style={{ height: '100%', width: '100%' }}>
                    <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }} attributionControl={true}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {data.map((a, idx) => (
                            <Marker
                                key={a.address}
                                position={[a.lat, a.lng]}
                                icon={selectedAddress?.address === a.address ? selectedIcon : defaultIcon}
                                eventHandlers={{ click: () => setSelectedAddress(a) }}
                                ref={el => markerRefs.current[idx] = el}
                            >
                                <Popup>
                                    <strong>{a.buyerName}</strong><br />
                                    {a.address}<br />
                                    <em>Parts: {a.parts.map(p => p.partName).join(', ')}</em>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default DeliveringMapView; 