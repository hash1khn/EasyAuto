import type React from "react"
import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Map, Package, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import DeliveringModal from "../delivery/DeliveringModal"
import PartDetailsModal from "@/components/delivery/PartDetailsModal"
import { useDeliveryData } from "@/hooks/useDeliveryData"
import type { GroupedDeliveryData, EnrichedPart } from "@/types/delivery"

const Delivering: React.FC = () => {
  const { deliveryData, loading, error, refetch, updatePartStatus, convertToEnrichedPart } = useDeliveryData()
  const [selectedParts, setSelectedParts] = useState<Record<string, Set<string>>>({})
  const [deliveringModalState, setDeliveringModalState] = useState<{
    isOpen: boolean
    buyerData: GroupedDeliveryData | null
  }>({ isOpen: false, buyerData: null })
  const [detailsModalState, setDetailsModalState] = useState<{
    isOpen: boolean
    part: EnrichedPart | null
  }>({ isOpen: false, part: null })

  const location = useLocation()
  const navigate = useNavigate()

  const handleSelectPart = (buyerId: string, partId: string) => {
    setSelectedParts((prev) => {
      const newSelection = { ...prev }
      if (!newSelection[buyerId]) {
        newSelection[buyerId] = new Set()
      }
      const buyerSelection = new Set(newSelection[buyerId])
      if (buyerSelection.has(partId)) {
        buyerSelection.delete(partId)
      } else {
        buyerSelection.add(partId)
      }
      newSelection[buyerId] = buyerSelection
      return newSelection
    })
  }

  const handleOpenDeliveringModal = (buyerData: GroupedDeliveryData) => {
    if (!selectedParts[buyerData.buyer_id] || selectedParts[buyerData.buyer_id].size === 0) {
      alert("Please select parts to mark as delivered.")
      return
    }
    setDeliveringModalState({ isOpen: true, buyerData })
  }

  const handleCloseDeliveringModal = () => {
    setDeliveringModalState({ isOpen: false, buyerData: null })
  }

  const handleOpenDetailsModal = (part: any) => {
    const enrichedPart = convertToEnrichedPart(part)
    setDetailsModalState({ isOpen: true, part: enrichedPart })
  }

  const handleCloseDetailsModal = () => {
    setDetailsModalState({ isOpen: false, part: null })
  }

  const handleConfirmDelivered = async (invoice: any) => {
    const buyerId = invoice.buyerData.buyer_id
    const partIdsToUpdate = invoice.parts.map((p: any) => p.id)

    try {
      // Update each part status to delivered
      const updatePromises = partIdsToUpdate.map((partId: string) =>
        updatePartStatus(partId, "delivered", {
          delivery_photo_url: invoice.deliveryPhotos?.[0] ? URL.createObjectURL(invoice.deliveryPhotos[0]) : null,
        }),
      )

      await Promise.all(updatePromises)

      // Clear selections
      setSelectedParts((prev) => {
        const newSelection = { ...prev }
        delete newSelection[buyerId]
        return newSelection
      })

      handleCloseDeliveringModal()
      alert(`${partIdsToUpdate.length} part(s) marked as 'Delivered'.`)

      // Refresh data
      refetch()
    } catch (error) {
      console.error("Error updating delivery status:", error)
      alert("Failed to update delivery status. Please try again.")
    }
  }

  const getSelectedPartsForBuyer = (buyerData: GroupedDeliveryData) => {
    if (!selectedParts[buyerData.buyer_id]) return []
    return buyerData.parts.filter((part) => selectedParts[buyerData.buyer_id].has(part.id))
  }

  useEffect(() => {
    if (location.state && location.state.buyerId && location.state.partIds) {
      const { buyerId, partIds } = location.state
      setSelectedParts((prev) => ({
        ...prev,
        [buyerId]: new Set(partIds),
      }))
      const buyerData = deliveryData.find((data) => data.buyer_id === buyerId)
      if (buyerData) {
        setDeliveringModalState({ isOpen: true, buyerData })
      }
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, navigate, location.pathname, deliveryData])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading delivery data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error loading delivery data: {error}
          <Button onClick={refetch} variant="outline" size="sm" className="ml-2">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Delivering</h1>
        <Button asChild variant="outline">
          <Link to="/delivery/map-delivering">
            <Map className="mr-2 h-4 w-4" />
            Map View
          </Link>
        </Button>
      </div>

      {deliveryData.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No deliveries pending</h3>
          <p className="text-gray-500">All parts have been delivered or are not ready for delivery yet.</p>
        </div>
      ) : (
        <Accordion type="multiple" defaultValue={deliveryData.map((d) => d.buyer_id)} className="space-y-4">
          {deliveryData.map((buyerData) => {
            const selectedCount = selectedParts[buyerData.buyer_id]?.size || 0
            return (
              <AccordionItem value={buyerData.buyer_id} key={buyerData.buyer_id} className="bg-white rounded-lg border">
                <AccordionTrigger className="p-4 hover:no-underline">
                  <div className="flex justify-between w-full pr-4 items-center">
                    <div className="flex flex-col text-left">
                      <h3 className="font-bold text-lg">{buyerData.buyer_name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <a
                          href={
                            buyerData.google_maps_url ||
                            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(buyerData.delivery_address)}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 hover:text-blue-600"
                        >
                          <MapPin className="h-4 w-4" /> {buyerData.delivery_address}
                        </a>
                        <a
                          href={`tel:${buyerData.delivery_phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 hover:text-blue-600"
                        >
                          <Phone className="h-4 w-4" /> {buyerData.delivery_phone}
                        </a>
                      </div>
                    </div>
                    <Badge variant={selectedCount > 0 ? "default" : "secondary"} className="text-md">
                      {buyerData.parts.length} Part(s)
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Part Name</TableHead>
                          <TableHead>Vehicle</TableHead>
                          <TableHead>Vendor</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {buyerData.parts.map((part) => (
                          <TableRow key={part.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedParts[buyerData.buyer_id]?.has(part.id)}
                                onCheckedChange={() => handleSelectPart(buyerData.buyer_id, part.id)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              <div
                                className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
                                onClick={() => handleOpenDetailsModal(part)}
                              >
                                {part.photos && part.photos.length > 0 ? (
                                  <img
                                    src={part.photos[0] || "/placeholder.svg"}
                                    alt={part.part_name}
                                    className="w-12 h-12 object-cover rounded-md"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.style.display = "none"
                                    }}
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                                    <Package className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                                <div>
                                  {part.part_name}
                                  <p className="text-xs text-gray-500">{part.part_number || "No part number"}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {part.vehicle?.make} {part.vehicle?.model}
                                <p className="text-xs text-gray-500">{part.vehicle?.year}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {part.winning_bid?.vendor?.full_name || "Unknown"}
                                <p className="text-xs text-gray-500">
                                  {part.winning_bid?.vendor?.business_name || "Individual"}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{part.quantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => handleOpenDeliveringModal(buyerData)} disabled={selectedCount === 0}>
                      Mark as Delivered ({selectedCount})
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      )}

      {deliveringModalState.isOpen && deliveringModalState.buyerData && (
        <DeliveringModal
          isOpen={deliveringModalState.isOpen}
          onClose={handleCloseDeliveringModal}
          parts={getSelectedPartsForBuyer(deliveringModalState.buyerData).map(convertToEnrichedPart)}
          address={deliveringModalState.buyerData.delivery_address}
          onConfirm={handleConfirmDelivered}
          buyerName={deliveringModalState.buyerData.buyer_name}
          phone={deliveringModalState.buyerData.delivery_phone}
          buyerData={deliveringModalState.buyerData}
        />
      )}

      <PartDetailsModal
        isOpen={detailsModalState.isOpen}
        onClose={handleCloseDetailsModal}
        part={detailsModalState.part}
      />
    </div>
  )
}

export default Delivering
