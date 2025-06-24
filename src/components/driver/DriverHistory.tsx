import React, { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, FileText, Info, Image as ImageIcon } from 'lucide-react';

// Mock delivery history data (in-memory for now)
const mockHistory = [
  {
    id: 'INV-001',
    date: '2025-07-01 14:30',
    customer: 'Ahmed Al Mansouri',
    phone: '+971 50 123 4567',
    address: 'Villa 7, Street 12, Al Barsha 2, Dubai',
    driver: 'Ali Driver',
    grandTotal: 575,
    paymentMethod: 'Cash',
    deliveryFee: 75,
    parts: [
      { partName: 'Front Bumper', quantity: 1, unitPrice: 500, vendor: { name: 'Al Quoz Auto Parts', address: 'Warehouse 1, Al Quoz Industrial Area 3, Dubai', phone: '+971 4 333 1234' } },
      { partName: 'Brake Pads', quantity: 2, unitPrice: 200, vendor: { name: 'Deira City Parts', address: '8th St, Deira, Dubai', phone: '+971 4 295 1111' } },
    ],
    notes: 'Delivered to security. Customer not home.',
    photos: ['/assets/parts/download (1).jpeg'],
  },
  {
    id: 'INV-002',
    date: '2025-07-02 10:00',
    customer: 'Sarah Johnson',
    phone: '+971 55 987 6543',
    address: 'Apt 502, Marina Tower, Dubai Marina, Dubai',
    driver: 'Fatima Driver',
    grandTotal: 1200,
    paymentMethod: 'Card',
    deliveryFee: 100,
    parts: [
      { partName: 'Side Mirror', quantity: 1, unitPrice: 700, vendor: { name: 'Dubai Investment Park Spares', address: 'Dubai Investments Park 1, Dubai', phone: '+971 4 888 5678' } },
      { partName: 'Brake Pads', quantity: 2, unitPrice: 200, vendor: { name: 'Al Quoz Auto Parts', address: 'Warehouse 1, Al Quoz Industrial Area 3, Dubai', phone: '+971 4 333 1234' } },
    ],
    notes: 'Delivered to customer directly.',
    photos: ['/assets/parts/download (2).jpeg'],
  },
];

const DriverHistory: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [invoiceModal, setInvoiceModal] = useState<any>(null);
  const [notesModal, setNotesModal] = useState<any>(null);
  const [vendorModal, setVendorModal] = useState<any>(null);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Delivery History</h1>
      <div className="space-y-6">
        {mockHistory.map((delivery) => (
          <div key={delivery.id} className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
              <div>
                <span className="font-bold text-lg">{delivery.customer}</span>
                <span className="ml-3 text-gray-600">{delivery.phone}</span>
                <div className="text-gray-700 flex items-center mt-1">
                  <span className="mr-2">{delivery.address}</span>
                  <Badge variant="outline">{delivery.driver}</Badge>
                </div>
              </div>
              <div className="flex flex-col md:items-end">
                <span className="text-gray-500 text-sm">{delivery.date}</span>
                <span className="font-bold text-blue-600 text-lg">{formatCurrency(delivery.grandTotal)}</span>
              </div>
            </div>
            <div className="overflow-x-auto mt-2">
              <table className="min-w-full text-sm border rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Part Name</th>
                    <th className="px-3 py-2 text-center">Qty</th>
                    <th className="px-3 py-2 text-right">Unit Price</th>
                    <th className="px-3 py-2 text-right">Total</th>
                    <th className="px-3 py-2 text-left">Vendor</th>
                  </tr>
                </thead>
                <tbody>
                  {delivery.parts.map((part, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">{part.partName}</td>
                      <td className="px-3 py-2 text-center">{part.quantity}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(part.unitPrice)}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(part.unitPrice * part.quantity)}</td>
                      <td className="px-3 py-2 text-left">
                        <Button variant="link" className="p-0 h-auto text-blue-600" onClick={() => setVendorModal(part.vendor)}>{part.vendor.name}</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => setExpanded(expanded === delivery.id ? null : delivery.id)}>
                {expanded === delivery.id ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />} More Info
              </Button>
              <Button variant="outline" size="sm" onClick={() => setInvoiceModal(delivery)}><FileText className="w-4 h-4 mr-1" /> View Invoice</Button>
              <Button variant="outline" size="sm" onClick={() => setNotesModal(delivery)}><ImageIcon className="w-4 h-4 mr-1" /> Delivery Notes</Button>
            </div>
            {expanded === delivery.id && (
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <div className="mb-2"><span className="font-semibold">Payment Method:</span> {delivery.paymentMethod}</div>
                <div className="mb-2"><span className="font-semibold">Delivery Fee:</span> {formatCurrency(delivery.deliveryFee)}</div>
                <div className="mb-2"><span className="font-semibold">Notes:</span> {delivery.notes}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Invoice Modal */}
      <Dialog open={!!invoiceModal} onOpenChange={() => setInvoiceModal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice for {invoiceModal?.customer}</DialogTitle>
          </DialogHeader>
          {invoiceModal && (
            <div>
              <div className="mb-2 text-gray-700">{invoiceModal.address}</div>
              <div className="mb-2 text-gray-700">Driver: {invoiceModal.driver}</div>
              <div className="mb-2 text-gray-700">Date: {invoiceModal.date}</div>
              <div className="mb-2 text-gray-700">Payment: {invoiceModal.paymentMethod}</div>
              <div className="mb-2 text-gray-700">Delivery Fee: {formatCurrency(invoiceModal.deliveryFee)}</div>
              <div className="mb-2 text-gray-700 font-bold">Grand Total: {formatCurrency(invoiceModal.grandTotal)}</div>
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full text-sm border rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Part Name</th>
                      <th className="px-3 py-2 text-center">Qty</th>
                      <th className="px-3 py-2 text-right">Unit Price</th>
                      <th className="px-3 py-2 text-right">Total</th>
                      <th className="px-3 py-2 text-left">Vendor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceModal.parts.map((part, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2">{part.partName}</td>
                        <td className="px-3 py-2 text-center">{part.quantity}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(part.unitPrice)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(part.unitPrice * part.quantity)}</td>
                        <td className="px-3 py-2 text-left">{part.vendor.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delivery Notes Modal */}
      <Dialog open={!!notesModal} onOpenChange={() => setNotesModal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Delivery Notes & Photos</DialogTitle>
          </DialogHeader>
          {notesModal && (
            <div>
              <div className="mb-2 text-gray-700">{notesModal.notes}</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {notesModal.photos.map((url: string, idx: number) => (
                  <img key={idx} src={url} alt="Delivery" className="w-24 h-24 object-cover rounded border" />
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Vendor Modal */}
      <Dialog open={!!vendorModal} onOpenChange={() => setVendorModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
          </DialogHeader>
          {vendorModal && (
            <div>
              <div className="mb-2 font-semibold">{vendorModal.name}</div>
              <div className="mb-2 text-gray-700">{vendorModal.address}</div>
              <div className="mb-2 text-gray-700">{vendorModal.phone}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverHistory; 