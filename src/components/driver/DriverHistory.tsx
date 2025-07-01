import type React from "react"
import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, FileText, ImageIcon, Phone, MapPin } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { ReceiptModal as BuyerReceiptModal } from "@/components/buyer/ReceiptModal"

interface Invoice {
  id: string
  created_at: string
  user_id: string
  total_amount: number
  status: string
  delivery_address: string
  delivery_fee: number
  payment_status: string
  driver_name: string
  delivery_note: string
  image_urls: string[]
  user_profile: {
    full_name: string
    whatsapp_number: string
  }
  invoice_parts: Array<{
    part_id: string
    quantity: number
    unit_price: number
    part: {
      part_name: string
      bids: Array<{
        vendor_id: string
        is_sourcer_provided: boolean
        vendor_info?: {
          name: string
          business_name?: string
          address: string
          phone: string
        }
        vendor: {
          full_name: string
          business_name: string
          location: string
          whatsapp_number: string
        }
      }>
    }
  }>
}

const DriverHistory: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)
  const [notesModal, setNotesModal] = useState<Invoice | null>(null)
  const [vendorModal, setVendorModal] = useState<{
    name: string;
    business_name?: string;
    location: string;
    whatsapp_number: string;
    is_sourcer_provided: boolean;
  } | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const { data, error } = await supabase
          .from("invoices")
          .select(`
            id,
            created_at,
            user_id,
            total_amount,
            status,
            delivery_address,
            delivery_fee,
            payment_status,
            driver_name,
            delivery_note,
            image_urls,
            user_profile:user_id(full_name, whatsapp_number),
            invoice_parts(
              part_id,
              quantity,
              unit_price,
              part:part_id(
                part_name,
                bids(
                  vendor_id,
                  is_sourcer_provided,
                  vendor_info,
                  vendor:vendor_id(
                    full_name, 
                    business_name, 
                    location, 
                    whatsapp_number
                  )
                )
              )
            )
          `)
          .order("created_at", { ascending: false })

        if (error) throw error

        setInvoices(data as Invoice[])
      } catch (error) {
        console.error("Error fetching invoices:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [])

  if (loading) {
    return <div className="p-8 max-w-5xl mx-auto">Loading delivery history...</div>
  }

  if (invoices.length === 0) {
    return <div className="p-8 max-w-5xl mx-auto">No delivery history found.</div>
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Delivery History</h1>
      <div className="space-y-6">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
              <div>
                <span className="font-bold text-lg">{invoice.user_profile.full_name}</span>
                <span className="ml-3 text-gray-600">{invoice.user_profile.whatsapp_number}</span>
                <div className="text-gray-700 flex items-center mt-1">
                  <span className="mr-2">{invoice.delivery_address}</span>
                  {invoice.driver_name && <Badge variant="outline">{invoice.driver_name}</Badge>}
                </div>
              </div>
              <div className="flex flex-col md:items-end">
                <span className="text-gray-500 text-sm">{new Date(invoice.created_at).toLocaleString()}</span>
                <span className="font-bold text-blue-600 text-lg">{formatCurrency(invoice.total_amount)}</span>
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
                  {invoice.invoice_parts.map((invoicePart, idx) => {
                    const bid = invoicePart.part.bids[0];
                    const vendorDetails = bid?.is_sourcer_provided && bid.vendor_info
                      ? {
                          name: bid.vendor_info.name,
                          business_name: bid.vendor_info.business_name,
                          location: bid.vendor_info.address,
                          whatsapp_number: bid.vendor_info.phone,
                          is_sourcer_provided: true
                        }
                      : bid?.vendor
                        ? {
                            name: bid.vendor.full_name,
                            business_name: bid.vendor.business_name,
                            location: bid.vendor.location,
                            whatsapp_number: bid.vendor.whatsapp_number,
                            is_sourcer_provided: false
                          }
                        : null;

                    return (
                      <tr key={idx}>
                        <td className="px-3 py-2">{invoicePart.part.part_name}</td>
                        <td className="px-3 py-2 text-center">{invoicePart.quantity}</td>
                        <td className="px-3 py-2 text-right">
                          {formatCurrency(invoicePart.unit_price)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {formatCurrency(invoicePart.unit_price * invoicePart.quantity)}
                        </td>
                        <td className="px-3 py-2 text-left">
                          {vendorDetails ? (
                            <Button
                              variant="link"
                              className="p-0 h-auto text-blue-600"
                              onClick={() => setVendorModal(vendorDetails)}
                            >
                              <div className="text-left">
                                {vendorDetails.business_name || vendorDetails.name}
                                {vendorDetails.is_sourcer_provided && (
                                  <Badge variant="secondary" className="ml-2 text-xs">
                                    Sourcer Added
                                  </Badge>
                                )}
                              </div>
                            </Button>
                          ) : (
                            "Unknown vendor"
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpanded(expanded === invoice.id ? null : invoice.id)}
              >
                {expanded === invoice.id ? (
                  <ChevronUp className="w-4 h-4 mr-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 mr-1" />
                )}{" "}
                More Info
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedInvoiceId(invoice.id)}>
                <FileText className="w-4 h-4 mr-1" /> View Invoice
              </Button>
              {invoice.image_urls && invoice.image_urls.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setNotesModal(invoice)}>
                  <ImageIcon className="w-4 h-4 mr-1" /> Delivery Notes
                </Button>
              )}
            </div>
            {expanded === invoice.id && (
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <div className="mb-2">
                  <span className="font-semibold">Payment Method:</span> {invoice.payment_status}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Delivery Fee:</span> {formatCurrency(invoice.delivery_fee)}
                </div>
                {invoice.delivery_note && (
                  <div className="mb-2">
                    <span className="font-semibold">Notes:</span> {invoice.delivery_note}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Receipt Modal - Using the same BuyerReceiptModal as LogisticsPage */}
      {selectedInvoiceId && (
        <BuyerReceiptModal
          isOpen={!!selectedInvoiceId}
          onOpenChange={(open) => {
            if (!open) setSelectedInvoiceId(null)
          }}
          invoiceId={selectedInvoiceId}
        />
      )}

      {/* Delivery Notes Modal */}
      <Dialog open={!!notesModal} onOpenChange={() => setNotesModal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Delivery Notes & Photos</DialogTitle>
          </DialogHeader>
          {notesModal && (
            <div>
              {notesModal.delivery_note && <div className="mb-2 text-gray-700">{notesModal.delivery_note}</div>}
              {notesModal.image_urls && notesModal.image_urls.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {notesModal.image_urls.map((url: string, idx: number) => (
                    <img
                      key={idx}
                      src={url || "/placeholder.svg"}
                      alt="Delivery"
                      className="w-24 h-24 object-cover rounded border"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Vendor Modal */}
      <Dialog open={!!vendorModal} onOpenChange={() => setVendorModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Vendor Details
              {vendorModal?.is_sourcer_provided && (
                <Badge variant="secondary">Sourcer Added</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {vendorModal && (
            <div className="space-y-2">
              <div className="font-semibold">
                {vendorModal.business_name || vendorModal.name}
              </div>
              <div className="text-gray-700 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {vendorModal.location}
              </div>
              <div className="text-gray-700 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {vendorModal.whatsapp_number}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DriverHistory
