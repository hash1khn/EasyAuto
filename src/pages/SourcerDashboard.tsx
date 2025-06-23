import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface VendorQuote {
  id: string;
  vendorName: string;
  vendorAddress: string;
  vendorPhone: string;
  vendorEmail: string;
  price: number;
  condition: 'New' | 'Used - Excellent' | 'Used - Good' | 'Used - Fair';
  warranty: string;
  imageUrl?: string;
  vendorNotes?: string;
  submittedAt: string;
  isAccepted?: boolean;
  sourcerReview?: {
    inspectionImages: string[];
    reviewNotes: string;
    acceptedAt: string;
  };
}

interface Part {
  id: string;
  partName: string;
  quantity: number;
  buyerNotes: string;
  requestedCondition: string;
  requestedWarranty?: string;
  maxBudget?: number;
  partNumber?: string;
  vendorQuotes: VendorQuote[];
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  parts: Part[];
}

interface Buyer {
  name: string;
  email: string;
  phone: string;
  address: string;
  maxBudget?: number;
}

interface Order {
  id: string;
  vehicles: Vehicle[];
  buyer: Buyer;
  createdAt: string;
}

const SourcerDashboard: React.FC = () => {
  const [selectedQuote, setSelectedQuote] = useState<VendorQuote | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isViewAllQuotesModalOpen, setIsViewAllQuotesModalOpen] = useState(false);
  const [isAddQuoteModalOpen, setIsAddQuoteModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'no-quotes' | 'with-quotes'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [reviewForm, setReviewForm] = useState({
    inspectionImages: [] as string[],
    reviewNotes: ''
  });
  const [addQuoteForm, setAddQuoteForm] = useState({
    vendorName: '',
    vendorAddress: '',
    vendorPhone: '',
    vendorEmail: '',
    price: '',
    condition: '',
    warranty: '',
    imageFiles: null as FileList | null,
    vendorNotes: ''
  });

  // Comprehensive mock data with 3 orders, multiple vehicles per order
  const orders: Order[] = [
    {
      id: "ORD-009",
      vehicles: [
        {
          id: "V1",
          make: "Toyota",
          model: "Camry",
          year: 2020,
          vin: "1HGBH41JXMN109186",
          parts: [
            {
              id: "P1",
              partName: "Front Bumper",
              quantity: 1,
              buyerNotes: "Needs to match factory color - Pearl White",
              requestedCondition: "New or Used - Excellent",
              requestedWarranty: "1 year minimum",
              maxBudget: 800,
              partNumber: 'TY-CM-FB-01',
              vendorQuotes: [
                {
                  id: "VQ1",
                  vendorName: "Al Ain Auto Parts",
                  vendorAddress: "Shop 15, Al Ain Mall, Sheikh Khalifa Street, Al Ain",
                  vendorPhone: "+971 3 123 4567",
                  vendorEmail: "info@alainautoparts.ae",
                  price: 650,
                  condition: "New",
                  warranty: "2 years",
                  imageUrl: "/assets/parts/download (1).jpeg",
                  vendorNotes: "Genuine Toyota OEM part, perfect color match",
                  submittedAt: "2024-01-15T10:30:00Z"
                },
                {
                  id: "VQ2",
                  vendorName: "Dubai Spare Parts Center",
                  vendorAddress: "Unit 8, Industrial Area 3, Dubai Investment Park",
                  vendorPhone: "+971 4 987 6543",
                  vendorEmail: "sales@dubaispares.ae",
                  price: 450,
                  condition: "Used - Excellent",
                  warranty: "6 months",
                  imageUrl: "/assets/parts/download (2).jpeg",
                  vendorNotes: "Excellent condition, minor scratch on underside",
                  submittedAt: "2024-01-16T14:20:00Z"
                }
              ]
            },
            {
              id: "P2",
              partName: "Headlight Assembly",
              quantity: 1,
              buyerNotes: "Driver side, LED preferred",
              requestedCondition: "New",
              requestedWarranty: "1 year",
              maxBudget: 1200,
              partNumber: 'TY-CM-HL-01',
              vendorQuotes: [
                {
                  id: "VQ3",
                  vendorName: "Abu Dhabi Auto Solutions",
                  vendorAddress: "Building 12, Mussafah Industrial Area, Abu Dhabi",
                  vendorPhone: "+971 2 456 7890",
                  vendorEmail: "contact@adautosolutions.ae",
                  price: 950,
                  condition: "New",
                  warranty: "1 year",
                  imageUrl: "/assets/parts/images (1).jpeg",
                  vendorNotes: "Genuine Toyota LED headlight assembly",
                  submittedAt: "2024-01-17T09:15:00Z",
                  isAccepted: true,
                  sourcerReview: {
                    inspectionImages: ["/assets/parts/images.jpeg", "/assets/parts/download.jpeg"],
                    reviewNotes: "Visited vendor location. Part is genuine OEM, perfect condition. Vendor facility is clean and professional.",
                    acceptedAt: "2024-01-18T11:00:00Z"
                  }
                }
              ]
            }
          ]
        },
        {
          id: "V2",
          make: "Honda",
          model: "Civic",
          year: 2019,
          vin: "2T1BURHE0JC123456",
          parts: [
            {
              id: "P3",
              partName: "Rear Bumper",
              quantity: 1,
              buyerNotes: "Any color, will be painted",
              requestedCondition: "Used - Good or better",
              maxBudget: 400,
              partNumber: 'HO-CV-RB-01',
              vendorQuotes: []
            },
            {
              id: "P4",
              partName: "Grille",
              quantity: 1,
              buyerNotes: "Sport grille with chrome finish",
              requestedCondition: "New",
              maxBudget: 300,
              partNumber: 'HO-CV-GR-01',
              vendorQuotes: [
                {
                  id: "VQ4",
                  vendorName: "Sharjah Auto Parts",
                  vendorAddress: "Industrial Area 6, Sharjah",
                  vendorPhone: "+971 6 789 0123",
                  vendorEmail: "info@sharjahautoparts.ae",
                  price: 280,
                  condition: "New",
                  warranty: "1 year",
                  imageUrl: "/assets/parts/download.jpeg",
                  vendorNotes: "Genuine Honda sport grille",
                  submittedAt: "2024-01-19T16:45:00Z"
                }
              ]
            }
          ]
        }
      ],
      buyer: {
        name: "Ahmed Al Mansouri",
        email: "ahmed@example.com",
        phone: "+971 50 123 4567",
        address: "Al Quoz, Dubai, UAE",
        maxBudget: 2000
      },
      createdAt: "2024-01-10T08:00:00Z"
    },
    {
      id: "ORD-010",
      vehicles: [
        {
          id: "V3",
          make: "BMW",
          model: "X5",
          year: 2021,
          vin: "5UXCR6C54KL123789",
          parts: [
            {
              id: "P5",
              partName: "Side Mirror",
              quantity: 1,
              buyerNotes: "Driver side, heated and power folding",
              requestedCondition: "New",
              requestedWarranty: "2 years",
              maxBudget: 1800,
              vendorQuotes: [
                {
                  id: "VQ5",
                  vendorName: "Ras Al Khaimah Motors",
                  vendorAddress: "Al Hamra Industrial Zone, Ras Al Khaimah",
                  vendorPhone: "+971 7 234 5678",
                  vendorEmail: "sales@rakmotors.ae",
                  price: 1400,
                  condition: "Used - Excellent",
                  warranty: "1 year",
                  imageUrl: "/assets/parts/download (1).jpeg",
                  vendorNotes: "Slightly used, excellent condition",
                  submittedAt: "2024-01-20T11:00:00Z"
                },
                {
                  id: "VQ6",
                  vendorName: "Dubai Luxury Auto Parts",
                  vendorAddress: "Sheikh Zayed Road, Dubai",
                  vendorPhone: "+971 4 567 8901",
                  vendorEmail: "info@dubailuxuryparts.ae",
                  price: 1650,
                  condition: "New",
                  warranty: "2 years",
                  imageUrl: "/assets/parts/download (2).jpeg",
                  vendorNotes: "Brand new OEM part, in original packaging.",
                  submittedAt: "2024-01-21T12:30:00Z",
                  isAccepted: true,
                  sourcerReview: {
                    inspectionImages: ["/assets/parts/images (1).jpeg"],
                    reviewNotes: "Confirmed part is new and OEM. Vendor is very reliable.",
                    acceptedAt: "2024-01-22T10:00:00Z"
                  }
                }
              ]
            },
            {
              id: "P6",
              partName: "Wheel Cap",
              quantity: 4,
              buyerNotes: "Center caps for 20-inch wheels",
              requestedCondition: "New",
              maxBudget: 200,
              vendorQuotes: []
            }
          ]
        }
      ],
      buyer: {
        name: "Sarah Johnson",
        email: "sarah@example.com",
        phone: "+971 55 987 6543",
        address: "Jumeirah Beach Road, Dubai, UAE"
      },
      createdAt: "2024-01-12T10:30:00Z"
    },
    {
      id: "ORD-011",
      vehicles: [
        {
          id: "V4",
          make: "Mercedes",
          model: "C-Class",
          year: 2022,
          vin: "WDDWF4JB0FR123456",
          parts: [
            {
              id: "P7",
              partName: "Fog Light",
              quantity: 1,
              buyerNotes: "Passenger side, LED",
              requestedCondition: "New",
              requestedWarranty: "1 year",
              maxBudget: 350,
              vendorQuotes: [
                {
                  id: "VQ7",
                  vendorName: "Fujairah Auto Parts",
                  vendorAddress: "Industrial Area 2, Fujairah",
                  vendorPhone: "+971 9 876 5432",
                  vendorEmail: "contact@fujairahautoparts.ae",
                  price: 320,
                  condition: "New",
                  warranty: "1 year",
                  imageUrl: "/assets/parts/download.jpeg",
                  vendorNotes: "Genuine Mercedes LED fog light",
                  submittedAt: "2024-01-22T11:20:00Z"
                }
              ]
            },
            {
              id: "P8",
              partName: "Door Handle",
              quantity: 1,
              buyerNotes: "Driver side, chrome finish",
              requestedCondition: "New",
              maxBudget: 250,
              vendorQuotes: []
            }
          ]
        },
        {
          id: "V5",
          make: "Lexus",
          model: "RX",
          year: 2020,
          vin: "2T2ZZMCA0LC123789",
          parts: [
            {
              id: "P9",
              partName: "Tail Light",
              quantity: 1,
              buyerNotes: "Driver side, LED",
              requestedCondition: "New",
              requestedWarranty: "1 year",
              maxBudget: 450,
              vendorQuotes: [
                {
                  id: "VQ8",
                  vendorName: "Umm Al Quwain Auto",
                  vendorAddress: "Industrial Area 1, Umm Al Quwain",
                  vendorPhone: "+971 6 123 4567",
                  vendorEmail: "info@uaqauto.ae",
                  price: 420,
                  condition: "New",
                  warranty: "1 year",
                  imageUrl: "/assets/parts/images.jpeg",
                  vendorNotes: "Genuine Lexus LED tail light",
                  submittedAt: "2024-01-23T14:30:00Z"
                },
                {
                  id: "VQ9",
                  vendorName: "Ajman Auto Parts",
                  vendorAddress: "Industrial Area 3, Ajman",
                  vendorPhone: "+971 6 987 6543",
                  vendorEmail: "sales@ajmanautoparts.ae",
                  price: 380,
                  condition: "Used - Excellent",
                  warranty: "6 months",
                  imageUrl: "/assets/parts/download (1).jpeg",
                  vendorNotes: "Excellent condition, minor wear",
                  submittedAt: "2024-01-24T10:45:00Z"
                }
              ]
            }
          ]
        }
      ],
      buyer: {
        name: "Mohammed Al Rashid",
        email: "mohammed@example.com",
        phone: "+971 52 456 7890",
        address: "Sheikh Zayed Road, Dubai, UAE"
      },
      createdAt: "2024-01-14T14:20:00Z"
    }
  ];

  // Calculate metrics for parts that do not have an accepted quote
  const partsForDashboard = orders
    .flatMap(order => order.vehicles.flatMap(v => v.parts))
    .filter(part => !part.vendorQuotes.some(q => q.isAccepted));

  const metrics = {
    pendingQuotes: partsForDashboard.reduce((total, part) => total + part.vendorQuotes.length, 0),
    noQuotes: partsForDashboard.filter(part => part.vendorQuotes.length === 0).length
  };

  // Flatten all parts from all orders for easier processing
  const getAllParts = () => {
    const allParts: Array<{ order: Order; vehicle: Vehicle; part: Part }> = [];
    orders.forEach(order => {
      order.vehicles.forEach(vehicle => {
        vehicle.parts.forEach(part => {
          allParts.push({ order, vehicle, part });
        });
      });
    });
    return allParts;
  };

  // Filter parts based on search and filters
  const getFilteredParts = () => {
    const allParts = getAllParts();
    // Exclude parts that have an accepted quote
    const partsToDisplay = allParts.filter(
      ({ part }) => !part.vendorQuotes.some(q => q.isAccepted)
    );

    return partsToDisplay.filter(({ order, vehicle, part }) => {
      const matchesSearch =
        part.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.vendorQuotes.some(quote =>
          quote.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesVehicle = vehicleFilter === 'all' || vehicle.make === vehicleFilter;

      // Status filter now only applies to non-accepted parts
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'no-quotes' && part.vendorQuotes.length === 0) ||
        (statusFilter === 'with-quotes' && part.vendorQuotes.length > 0);

      return matchesSearch && matchesVehicle && matchesStatus;
    });
  };

  const openViewAllQuotesModal = (part: Part, vehicle: Vehicle) => {
    setSelectedPart(part);
    setSelectedVehicle(vehicle);
    setIsViewAllQuotesModalOpen(true);
  };

  const closeViewAllQuotesModal = () => {
    setIsViewAllQuotesModalOpen(false);
    setSelectedPart(null);
    setSelectedVehicle(null);
  };

  const openReviewModal = (quote: VendorQuote) => {
    setSelectedQuote(quote);
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedQuote(null);
    setSelectedPart(null);
    setSelectedVehicle(null);
    setReviewForm({
      inspectionImages: [],
      reviewNotes: ''
    });
  };

  const openAddQuoteModal = (part: Part, vehicle: Vehicle) => {
    setSelectedPart(part);
    setSelectedVehicle(vehicle);
    setIsAddQuoteModalOpen(true);
  };

  const closeAddQuoteModal = () => {
    setIsAddQuoteModalOpen(false);
    setSelectedPart(null);
    setSelectedVehicle(null);
    setAddQuoteForm({
      vendorName: '',
      vendorAddress: '',
      vendorPhone: '',
      vendorEmail: '',
      price: '',
      condition: '',
      warranty: '',
      imageFiles: null,
      vendorNotes: ''
    });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting review:', { quote: selectedQuote, review: reviewForm });
    closeReviewModal();
  };

  const handleAddQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding quote:', { part: selectedPart, quote: addQuoteForm });
    closeAddQuoteModal();
  };

  const getQuoteStatus = (part: Part) => {
    if (part.vendorQuotes.length === 0) {
      return { text: 'No Quotes', color: 'bg-gray-100 text-gray-800' };
    }
    const acceptedCount = part.vendorQuotes.filter(q => q.isAccepted).length;
    if (acceptedCount > 0) {
      return { text: `${acceptedCount} Accepted`, color: 'bg-green-100 text-green-800' };
    }
    return { text: `${part.vendorQuotes.length} Quotes`, color: 'bg-blue-100 text-blue-800' };
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'New': return 'bg-green-100 text-green-800';
      case 'Used - Excellent': return 'bg-blue-100 text-blue-800';
      case 'Used - Good': return 'bg-yellow-100 text-yellow-800';
      case 'Used - Fair': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredParts = getFilteredParts();

  // Group filtered parts by order
  const groupedByOrder = filteredParts.reduce((acc, { order, vehicle, part }) => {
    if (!acc[order.id]) {
      acc[order.id] = {
        order,
        parts: []
      };
    }
    acc[order.id].parts.push({ vehicle, part });
    return acc;
  }, {} as Record<string, { order: Order; parts: Array<{ vehicle: Vehicle; part: Part }> }>);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Pending Vendor Quotes</h3>
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
            <h3 className="text-lg font-semibold text-gray-800">No Vendor Quotes</h3>
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Vehicles</option>
                <option value="Toyota">Toyota</option>
                <option value="Honda">Honda</option>
                <option value="BMW">BMW</option>
                <option value="Mercedes">Mercedes</option>
                <option value="Lexus">Lexus</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="no-quotes">No Quotes</option>
                <option value="with-quotes">With Quotes</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📊 Table
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'card'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🃏 Cards
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Flattened Part Requests */}
      <div className="space-y-6">
        {Object.entries(groupedByOrder).map(([orderId, { order, parts }]) => {
          const totalParts = parts.length;
          const acceptedCount = parts.reduce((total, { part }) => 
            total + part.vendorQuotes.filter(q => q.isAccepted).length, 0
          );
          
          return (
            <div key={orderId} className="bg-white rounded-lg shadow-md border border-gray-200">
              {/* Order Summary Bar */}
              <div className="sticky top-0 bg-gray-50 px-6 py-4 border-b border-gray-200 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Order #{order.id}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {order.vehicles.length} Vehicles | {totalParts} Parts | {acceptedCount} Accepted | Location: {order.buyer.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Buyer: {order.buyer.name}</p>
                    <p className="text-sm text-gray-600">{order.buyer.phone}</p>
                  </div>
                </div>
              </div>

              {/* Parts List */}
              <div className="p-6">
                {viewMode === 'table' ? (
                  /* Table View */
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Name</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Number</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Budget</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quote Status</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {parts.map(({ vehicle, part }) => {
                          const quoteStatus = getQuoteStatus(part);
                          return (
                            <tr key={part.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-4 px-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{part.partName}</div>
                              </td>
                              <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{part.partNumber || 'N/A'}</td>
                              <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{vehicle.year} {vehicle.make} {vehicle.model}</td>
                              <td className="py-4 px-4">
                                <span className="text-sm text-gray-800">{part.quantity}</span>
                              </td>
                              <td className="py-4 px-4">
                                {part.maxBudget ? (
                                  <span className="text-sm font-medium text-gray-800">AED {part.maxBudget}</span>
                                ) : (
                                  <span className="text-sm text-gray-500">-</span>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-sm text-gray-800">{part.requestedCondition}</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${quoteStatus.color}`}>
                                  {quoteStatus.text}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                {part.vendorQuotes.length > 0 ? (
                                  <div className="flex items-center space-x-4">
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => openViewAllQuotesModal(part, vehicle)}
                                    >
                                      View Quotes
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => openAddQuoteModal(part, vehicle)}
                                  >
                                    + Add Quote
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
                    {parts.map(({ vehicle, part }) => {
                      const quoteStatus = getQuoteStatus(part);
                      return (
                        <div key={part.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="p-4 flex-grow">
                            <div>
                              <h4 className="font-bold text-gray-800">{part.partName}</h4>
                              <p className="text-sm text-gray-600">{`${vehicle.year} ${vehicle.make} ${vehicle.model}`}</p>
                            </div>
                            <div className="mt-4 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Qty:</span>
                                <p className="font-medium">{part.quantity}</p>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Budget:</span>
                                <p className="font-medium">
                                  {part.maxBudget ? `AED ${part.maxBudget}` : '-'}
                                </p>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Condition:</span>
                                <p className="font-medium">{part.requestedCondition}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${quoteStatus.color}`}>
                              {quoteStatus.text}
                            </span>
                            
                            {part.vendorQuotes.length > 0 ? (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => openViewAllQuotesModal(part, vehicle)}
                              >
                                View Quotes
                              </Button>
                            ) : (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => openAddQuoteModal(part, vehicle)}
                              >
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
        })}

        {Object.keys(groupedByOrder).length === 0 && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
            <p className="text-lg text-gray-500">No parts found matching your criteria</p>
            <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* View All Quotes Modal */}
      {isViewAllQuotesModalOpen && selectedPart && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeViewAllQuotesModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start p-6 border-b">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Vendor Quotes for {selectedPart.partName}
                </h3>
                <p className="text-gray-600 mt-1">
                  {`${selectedVehicle.make} ${selectedVehicle.model} ${selectedVehicle.year} - ${selectedVehicle.vin}`}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={closeViewAllQuotesModal} className="rounded-full -mt-2 -mr-2">
                <span className="text-2xl">&times;</span>
              </Button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <div className="space-y-4">
                {/* Part Information section */}
                <div className="mb-8">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Part Information</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                      <div>
                        <p className="text-gray-500">Quantity</p>
                        <p className="font-medium text-gray-800">{selectedPart.quantity}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Condition</p>
                        <p className="font-medium text-gray-800">{selectedPart.requestedCondition}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Warranty</p>
                        <p className="font-medium text-gray-800">{selectedPart.requestedWarranty || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Part Number</p>
                        <p className="font-medium text-gray-800">{selectedPart.partNumber || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Customer Budget</p>
                        <p className="text-lg font-bold text-red-600">
                          {selectedPart.maxBudget ? `AED ${selectedPart.maxBudget}` : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 border-t border-gray-200 pt-4">
                      <p className="text-gray-500 text-sm">Buyer Notes</p>
                      <p className="font-medium text-gray-800 text-sm">{selectedPart.buyerNotes}</p>
                    </div>
                  </div>
                </div>

                {/* Vendor Quotes section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    Vendor Quotes ({selectedPart.vendorQuotes.length})
                  </h4>
                  <div className="space-y-4">
                    {selectedPart.vendorQuotes.map(quote => (
                      <div key={quote.id} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4 w-full md:w-auto flex-1">
                          <div className="flex-1 space-y-2">
                            <h4 className="font-semibold text-gray-800">{quote.vendorName}</h4>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              {quote.vendorAddress}
                              <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(quote.vendorAddress)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700 ml-1"
                                title="View on Google Maps"
                              >
                                <MapPin className="h-5 w-5" />
                              </a>
                            </div>
                            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm">
                              <span className="font-bold text-blue-600">AED {quote.price}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(quote.condition)}`}>
                                {quote.condition}
                              </span>
                              <span>Warranty: <span className="font-medium">{quote.warranty}</span></span>
                            </div>
                          </div>
                          {quote.imageUrl && (
                            <img 
                              src={quote.imageUrl} 
                              alt={`Part from ${quote.vendorName}`}
                              className="w-32 h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                            />
                          )}
                        </div>
                        <div className="flex-shrink-0 mt-4 md:mt-0">
                          <button
                            onClick={() => {
                              setIsViewAllQuotesModalOpen(false);
                              openReviewModal(quote);
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Review & Accept
                          </button>
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
      {isReviewModalOpen && selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeReviewModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start p-6 border-b">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Review & Accept Quote</h3>
                <p className="text-gray-600 mt-1">From: {selectedQuote.vendorName}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={closeReviewModal} className="rounded-full -mt-2 -mr-2">
                <span className="text-2xl">&times;</span>
              </Button>
            </div>
            <form onSubmit={handleReviewSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Quote Details */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Quote Details</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-semibold text-lg text-blue-600">AED {selectedQuote.price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Condition:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(selectedQuote.condition)}`}>
                          {selectedQuote.condition}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Warranty:</span>
                        <span className="font-medium">{selectedQuote.warranty}</span>
                      </div>
                      {selectedQuote.vendorNotes && (
                        <div className="pt-2">
                          <span className="text-gray-600">Notes:</span>
                          <p className="text-sm mt-1 bg-white p-2 border rounded">{selectedQuote.vendorNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
 
                  {selectedQuote.imageUrl && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">Part Image</h4>
                      <img 
                        src={selectedQuote.imageUrl} 
                        alt="Part" 
                        className="w-full h-auto object-contain rounded-lg border border-gray-200"
                        style={{ maxHeight: '200px' }}
                      />
                    </div>
                  )}
                </div>
 
                {/* Right Column - Vendor Info & Review Form */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Vendor Information</h4>
                    <div className="bg-blue-50 rounded-lg p-4 space-y-3 text-sm">
                      <div>
                        <span className="text-gray-600 font-medium">Address:</span>
                        <p className="mt-1">{selectedQuote.vendorAddress}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600 font-medium">Phone:</span>
                        <a href={`tel:${selectedQuote.vendorPhone}`} className="text-blue-600 hover:underline">
                          {selectedQuote.vendorPhone}
                        </a>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600 font-medium">Email:</span>
                        <a href={`mailto:${selectedQuote.vendorEmail}`} className="text-blue-600 hover:underline">
                          {selectedQuote.vendorEmail}
                        </a>
                      </div>
                    </div>
                  </div>
 
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Your Review</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Inspection Images
                        </label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => setReviewForm({
                            ...reviewForm,
                            inspectionImages: Array.from(e.target.files || []).map(f => f.name)
                          })}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Upload photos from your vendor inspection visit.
                        </p>
                      </div>
 
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Review Notes
                        </label>
                        <textarea
                          value={reviewForm.reviewNotes}
                          onChange={(e) => setReviewForm({...reviewForm, reviewNotes: e.target.value})}
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
              <div className="flex space-x-3 p-6 bg-gray-50 border-t">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Accept This Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Quote Modal */}
      {isAddQuoteModalOpen && selectedPart && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeAddQuoteModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Add Manual Quote</h3>
                <p className="text-sm text-gray-600">{selectedPart.partName} for {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={closeAddQuoteModal} className="rounded-full -mt-2 -mr-2">
                <span className="text-2xl">&times;</span>
              </Button>
            </div>

            <form onSubmit={handleAddQuoteSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Part & Vehicle Info */}
                <div className="p-4 bg-gray-50 border rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Part Information</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Part Name</p>
                            <p className="font-medium text-gray-800">{selectedPart.partName}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Vehicle</p>
                            <p className="font-medium text-gray-800">{`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">VIN</p>
                            <p className="font-medium text-gray-800">{selectedVehicle.vin}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Part Number</p>
                            <p className="font-medium text-gray-800">{selectedPart.partNumber || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Quantity</p>
                            <p className="font-medium text-gray-800">{selectedPart.quantity}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Requested Condition</p>
                            <p className="font-medium text-gray-800">{selectedPart.requestedCondition}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Requested Warranty</p>
                            <p className="font-medium text-gray-800">{selectedPart.requestedWarranty || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Customer Budget</p>
                            <p className="font-bold text-red-600">{selectedPart.maxBudget ? `AED ${selectedPart.maxBudget}` : 'N/A'}</p>
                        </div>
                        <div className="col-span-full">
                            <p className="text-gray-500">Buyer Notes</p>
                            <p className="font-medium text-gray-800 bg-white p-2 rounded border">{selectedPart.buyerNotes}</p>
                        </div>
                    </div>
                </div>
                
                  {/* Vendor Info */}
                  <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border p-4 rounded-lg">
                    <legend className="text-lg font-semibold text-gray-800 px-2">Vendor Details</legend>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                      <input
                        type="text"
                        value={addQuoteForm.vendorName}
                        onChange={(e) => setAddQuoteForm({ ...addQuoteForm, vendorName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                        placeholder="e.g., John Doe's Auto Parts"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Phone</label>
                      <input
                        type="tel"
                        value={addQuoteForm.vendorPhone}
                        onChange={(e) => setAddQuoteForm({ ...addQuoteForm, vendorPhone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                        placeholder="+971 50 123 4567"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Email</label>
                      <input
                        type="email"
                        value={addQuoteForm.vendorEmail}
                        onChange={(e) => setAddQuoteForm({ ...addQuoteForm, vendorEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                        placeholder="vendor@example.com"
                      />
                    </div>
                  </fieldset>
                  
                  {/* Quote Details */}
                  <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border p-4 rounded-lg">
                    <legend className="text-lg font-semibold text-gray-800 px-2">Quote Details</legend>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (AED)</label>
                      <input
                        type="number"
                        value={addQuoteForm.price}
                        onChange={(e) => setAddQuoteForm({...addQuoteForm, price: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                      <select
                        value={addQuoteForm.condition}
                        onChange={(e) => setAddQuoteForm({...addQuoteForm, condition: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select condition</option>
                        <option value="New">New</option>
                        <option value="Used - Excellent">Used - Excellent</option>
                        <option value="Used - Good">Used - Good</option>
                        <option value="Used - Fair">Used - Fair</option>
                      </select>
                    </div>
    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Warranty</label>
                      <input
                        type="text"
                        value={addQuoteForm.warranty}
                        onChange={(e) => setAddQuoteForm({...addQuoteForm, warranty: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 1 year, 6 months"
                      />
                    </div>
    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Part Image</label>
                      <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => setAddQuoteForm({ ...addQuoteForm, imageFiles: e.target.files })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                      />
                    </div>
    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Notes</label>
                      <textarea
                        value={addQuoteForm.vendorNotes}
                        onChange={(e) => setAddQuoteForm({...addQuoteForm, vendorNotes: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Any additional notes about the part or vendor..."
                      />
                    </div>
                  </fieldset>
                </div>
              <div className="flex space-x-4 p-6 bg-gray-50 border-t">
                <button
                  type="button"
                  onClick={closeAddQuoteModal}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Quote
                </button>
              </div>
              </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SourcerDashboard; 