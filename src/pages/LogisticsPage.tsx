import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronRight, MessageSquare } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { ReceiptModal as BuyerReceiptModal } from "@/components/buyer/ReceiptModal"

interface Part {
  id: string
  part_name: string
  part_number: string | null
  quantity: number
  shipping_status: string
  shipped_at: string | null
  collected_at: string | null
  delivered_at: string | null
  pickup_notes: string | null
  delivery_note: string | null
  created_at: string
  vehicle: {
    make: string
    model: string
    year: number
    user_profile: {
      full_name: string
      whatsapp_number: string
      location: string
    }
  }
  bids: Array<{
    id: string
    status: string
    vendor: {
      full_name: string
      business_name: string | null
      whatsapp_number: string
      location: string
    }
  }>
}

interface Invoice {
  id: string
  total_amount: number
  status: string
  payment_status: string
  created_at: string
  paid_at: string | null
  driver_name: string | null
  delivery_note: string | null
  user_profile: {
    full_name: string
    whatsapp_number: string
  }
  invoice_parts: Array<{
    part: {
      id: string
      part_name: string
      part_number: string | null
      quantity: number
    }
  }>
}

interface Driver {
  id: string
  name: string
  contact: string
}

const LogisticsPage = () => {
  const [activeTab, setActiveTab] = useState<"collection" | "active" | "receipts">("collection")
  const [readyParts, setReadyParts] = useState<Part[]>([])
  const [activeParts, setActiveParts] = useState<Part[]>([])
  const [completedInvoices, setCompletedInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [expandedDelivery, setExpandedDelivery] = useState<string | null>(null)

  // Mock drivers data (you can replace with real data from Supabase)
  const mockDrivers: Driver[] = [
    { id: "d1", name: "Driver A", contact: "+971 50 111 1111" },
    { id: "d2", name: "Driver B", contact: "+971 50 222 2222" },
  ]

  // Fetch ready for collection parts
  const fetchReadyParts = async () => {
    try {
      const { data, error } = await supabase
        .from("parts")
        .select(`
          id,
          part_name,
          part_number,
          quantity,
          shipping_status,
          shipped_at,
          collected_at,
          delivered_at,
          pickup_notes,
          delivery_note,
          created_at,
          vehicle:vehicles (
            make,
            model,
            year,
            user_profile:user_profiles (
              full_name,
              whatsapp_number,
              location
            )
          ),
          bids!inner (
            id,
            status,
            vendor:user_profiles (
              full_name,
              business_name,
              whatsapp_number,
              location
            )
          )
        `)
        .eq("shipping_status", "confirmed")
        .eq("bids.status", "accepted")
        .is("collected_at", null)

      if (error) throw error
      setReadyParts(data?.map(item => ({
        ...item,
        vehicle: Array.isArray(item.vehicle) ? {
          ...item.vehicle[0],
          user_profile: Array.isArray(item.vehicle[0]?.user_profile) ? item.vehicle[0].user_profile[0] : item.vehicle[0]?.user_profile
        } : item.vehicle,
        bids: item.bids?.map(bid => ({
          ...bid,
          vendor: Array.isArray(bid.vendor) ? bid.vendor[0] : bid.vendor
        })) || []
      })) || [])
    } catch (error) {
      console.error("Error fetching ready parts:", error)
    }
  }

  // Fetch active deliveries
  const fetchActiveParts = async () => {
    try {
      const { data, error } = await supabase
        .from("parts")
        .select(`
          id,
          part_name,
          part_number,
          quantity,
          shipping_status,
          shipped_at,
          collected_at,
          delivered_at,
          pickup_notes,
          delivery_note,
          created_at,
          vehicle:vehicles (
            make,
            model,
            year,
            user_profile:user_profiles (
              full_name,
              whatsapp_number,
              location
            )
          ),
          bids!inner (
            id,
            status,
            vendor:user_profiles (
              full_name,
              business_name,
              whatsapp_number,
              location
            )
          )
        `)
        .in("shipping_status", ["out_for_delivery"])
        .eq("bids.status", "accepted")

      if (error) throw error
      setActiveParts(data?.map(item => ({
        ...item,
        vehicle: Array.isArray(item.vehicle) ? {
          ...item.vehicle[0],
          user_profile: Array.isArray(item.vehicle[0]?.user_profile) ? item.vehicle[0].user_profile[0] : item.vehicle[0]?.user_profile
        } : item.vehicle,
        bids: item.bids?.map(bid => ({
          ...bid,
          vendor: Array.isArray(bid.vendor) ? bid.vendor[0] : bid.vendor
        })) || []
      })) || [])
    } catch (error) {
      console.error("Error fetching active parts:", error)
    }
  }

  // Fetch completed invoices/receipts
  const fetchCompletedInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          id,
          total_amount,
          status,
          payment_status,
          created_at,
          paid_at,
          driver_name,
          delivery_note,
          user_profile:user_profiles!invoices_user_id_fkey (
            full_name,
            whatsapp_number
          ),
          invoice_parts (
            part:parts (
              id,
              part_name,
              part_number,
              quantity
            )
          )
        `)
        .eq("payment_status", "paid")
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error
      setCompletedInvoices(data?.map(item => ({
        ...item,
        user_profile: Array.isArray(item.user_profile) ? item.user_profile[0] : item.user_profile,
        invoice_parts: item.invoice_parts?.map(invoicePart => ({
          ...invoicePart,
          part: Array.isArray(invoicePart.part) ? invoicePart.part[0] : invoicePart.part
        })) || []
      })) || [])
    } catch (error) {
      console.error("Error fetching completed invoices:", error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await Promise.all([fetchReadyParts(), fetchActiveParts(), fetchCompletedInvoices()])
      setLoading(false)
    }

    fetchData()
  }, [])

  // Group ready parts by vendor location
  const readyPartsByLocation = readyParts.reduce(
    (acc, part) => {
      const vendor = part.bids[0]?.vendor
      if (!vendor) return acc

      const locationKey = `${vendor.business_name || vendor.full_name} - ${vendor.location}`
      if (!acc[locationKey]) {
        acc[locationKey] = {
          vendor,
          parts: [],
        }
      }
      acc[locationKey].parts.push(part)
      return acc
    },
    {} as Record<string, { vendor: any; parts: Part[] }>,
  )

  // Group active deliveries by buyer (simulate the original design)
  const activeDeliveriesByBuyer = activeParts.reduce(
    (acc, part) => {
      const buyer = part.vehicle.user_profile
      if (!acc[buyer.full_name]) {
        acc[buyer.full_name] = {
          buyer,
          parts: [],
        }
      }
      acc[buyer.full_name].parts.push(part)
      return acc
    },
    {} as Record<string, { buyer: any; parts: Part[] }>,
  )

  const getDriver = (id: string) => mockDrivers.find((d) => d.id === id)

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Logistics Management</h1>
          <p className="text-gray-500">Loading logistics data...</p>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Tabs for sections */}
      <div className="flex gap-2 mb-4">
        <Button variant={activeTab === "collection" ? "default" : "outline"} onClick={() => setActiveTab("collection")}>
          Collection
        </Button>
        <Button variant={activeTab === "active" ? "default" : "outline"} onClick={() => setActiveTab("active")}>
          Active
        </Button>
        <Button variant={activeTab === "receipts" ? "default" : "outline"} onClick={() => setActiveTab("receipts")}>
          Receipts
        </Button>
      </div>

      {/* Ready for Collection Section */}
      {activeTab === "collection" && (
        <div>
          <div className="font-semibold mb-2">Ready for Collection ({readyParts.length} parts)</div>
          {readyParts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No parts ready for collection
            </div>
          ) : (
            Object.entries(readyPartsByLocation).map(([location, { vendor, parts }]) => (
              <div key={location} className="mb-6">
                <div className="bg-gray-100 px-4 py-2 font-semibold text-gray-700 rounded-t">
                  Vendor: {vendor.business_name || vendor.full_name} ({vendor.location})
                </div>
                <div className="bg-white rounded-b shadow overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Part Name</TableHead>
                        <TableHead>Part Number</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Buyer</TableHead>
                        <TableHead>Ready Since</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parts.map((part) => (
                        <TableRow key={part.id}>
                          <TableCell>{part.part_name}</TableCell>
                          <TableCell>{part.part_number || "-"}</TableCell>
                          <TableCell>{part.quantity}</TableCell>
                          <TableCell>{part.vehicle.user_profile.full_name}</TableCell>
                          <TableCell>{new Date(part.created_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Active Deliveries Table, single table with Buyer column */}
      {activeTab === "active" && (
        <div>
          <div className="font-semibold mb-2">Active Deliveries</div>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            {activeParts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No active deliveries</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Driver Contact</TableHead>
                    <TableHead>Buyer Contact</TableHead>
                    <TableHead>Dropoff</TableHead>
                    <TableHead>Picked Up At</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Parts</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(activeDeliveriesByBuyer).map(([buyerName, { buyer, parts }]) => {
                    const driver = mockDrivers[0] // Mock driver assignment
                    const isExpanded = expandedDelivery === buyerName
                    const whatsappLink = `https://wa.me/${buyer.whatsapp_number}`
                    const totalAmount = parts.length * 500 // Mock calculation

                    return [
                      <TableRow key={buyerName}>
                        <TableCell>{buyer.full_name}</TableCell>
                        <TableCell>{driver.name}</TableCell>
                        <TableCell>{driver.contact}</TableCell>
                        <TableCell>
                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-green-600 hover:underline"
                          >
                            <MessageSquare className="w-4 h-4" />
                            {buyer.whatsapp_number}
                          </a>
                        </TableCell>
                        <TableCell>{buyer.location}</TableCell>
                        <TableCell>
                          {parts[0]?.collected_at ? new Date(parts[0].collected_at).toLocaleString() : "Not picked up"}
                        </TableCell>
                        <TableCell>AED {totalAmount}</TableCell>
                        <TableCell>
                          <button
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                            onClick={() => setExpandedDelivery(isExpanded ? null : buyerName)}
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            {parts.length} Parts
                          </button>
                        </TableCell>
                      </TableRow>,
                      isExpanded && (
                        <TableRow key={buyerName + "-parts"}>
                          <TableCell colSpan={9} className="bg-gray-50 p-0">
                            <div className="p-3">
                              <div className="font-semibold mb-1">Parts Being Delivered:</div>
                              <ul className="list-disc ml-6">
                                {parts.map((part) => {
                                  const vendor = part.bids[0]?.vendor
                                  return (
                                    <li key={part.id}>
                                      {part.part_name}{" "}
                                      <span className="text-xs text-gray-500">({part.part_number || "N/A"})</span> x
                                      {part.quantity}
                                      {vendor && (
                                        <span className="ml-2 text-xs text-blue-700 font-semibold">
                                          Vendor: {vendor.business_name || vendor.full_name}
                                        </span>
                                      )}
                                    </li>
                                  )
                                })}
                              </ul>
                            </div>
                          </TableCell>
                        </TableRow>
                      ),
                    ]
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      )}

      {/* Receipts Table */}
      {activeTab === "receipts" && (
        <div>
          <div className="font-semibold mb-2">Receipts</div>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            {completedInvoices.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No receipts found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt ID</TableHead>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Delivered At</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>REC-{invoice.id.slice(-3)}</TableCell>
                      <TableCell>{invoice.id}</TableCell>
                      <TableCell>{invoice.driver_name || "Driver A"}</TableCell>
                      <TableCell>
                        {invoice.paid_at
                          ? new Date(invoice.paid_at).toLocaleString()
                          : new Date(invoice.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>AED {invoice.total_amount}</TableCell>
                      <TableCell>Card</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => setSelectedInvoice(invoice)}>
                          View Receipt
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      )}

      {/* Go to Delivery Portal */}
      <div className="flex justify-end">
        <a href="/delivery" target="_blank" rel="noopener noreferrer">
          <Button variant="default">Go to Delivery Portal</Button>
        </a>
      </div>

      {/* Receipt Details Modal */}
      {selectedInvoice && (
        <BuyerReceiptModal
          isOpen={!!selectedInvoice}
          onOpenChange={(open) => {
            if (!open) setSelectedInvoice(null)
          }}
          invoiceId={selectedInvoice.id}
        />
      )}
    </div>
  )
}

export default LogisticsPage
