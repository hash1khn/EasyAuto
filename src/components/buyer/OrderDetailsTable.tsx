import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface OrderDetailsTableProps {
  order: any
  onViewDetails: (partId: string) => void
}

const groupPartsByVehicle = (parts: any[]) => {
  return parts.reduce(
    (acc, part) => {
      const key = part.vehicle?.id || "no-vehicle"
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(part)
      return acc
    },
    {} as Record<string, any[]>,
  )
}

export const OrderDetailsTable = ({ order, onViewDetails }: OrderDetailsTableProps) => {
  const deliveredParts = order.parts.filter(
    (p: any) => p.shipping_status === "delivered" || order.refund_requests.some((r: any) => r.status === "approved"),
  )

  if (deliveredParts.length === 0) {
    return <div className="p-4 bg-gray-50 text-center text-sm">No delivered parts found for this order.</div>
  }

  const groupedParts = groupPartsByVehicle(deliveredParts)
  const vehicleIds = Object.keys(groupedParts)

  const subtotal = deliveredParts
    .filter((p: any) => !order.refund_requests.some((r: any) => r.status === "approved"))
    .reduce((sum: number, part: any) => sum + (part.winning_bid?.price || 0) * part.quantity, 0)

  const deliveryFee = order.delivery_fee || 50
  const grandTotal = subtotal + deliveryFee

  const formatCurrency = (amount: number) => `AED ${amount.toFixed(2)}`

  return (
    <div className="bg-gray-50/50 p-4 md:p-6 border-t">
      {vehicleIds.map((vehicleId) => {
        const vehicleParts = groupedParts[vehicleId]
        const vehicle = vehicleParts[0]?.vehicle

        return (
          <div key={vehicleId} className="mb-6 last:mb-0">
            {vehicle && (
              <h4 className="text-md font-semibold mb-2 text-gray-800">
                {vehicle.make} {vehicle.model} ({vehicle.year}) -
                <span className="font-normal text-gray-600"> {vehicle.vin || "No VIN"}</span>
              </h4>
            )}
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-100">
                  <TableRow>
                    <TableHead className="w-2/5">Part Name</TableHead>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicleParts.map((part) => {
                    const isRefunded = order.refund_requests.some((r: any) => r.status === "approved")
                    const price = part.winning_bid?.price || 0

                    return (
                      <TableRow key={part.id} className={isRefunded ? "bg-gray-100" : ""}>
                        <TableCell className="font-medium">{part.part_name}</TableCell>
                        <TableCell>{part.part_number || "N/A"}</TableCell>
                        <TableCell>{part.quantity}</TableCell>
                        <TableCell>
                          {isRefunded ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="line-through text-muted-foreground cursor-help">
                                    {formatCurrency(price)}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Refunded – Not charged</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            formatCurrency(price)
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isRefunded ? (
                            <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600">
                              💸 Refunded
                            </Badge>
                          ) : (
                            <Button variant="link" className="h-auto p-0" onClick={() => onViewDetails(part.id)}>
                              View Details
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )
      })}

      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery</span>
            <span className="font-medium">{formatCurrency(deliveryFee)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="text-lg font-bold">Grand Total</span>
            <span className="text-lg font-bold">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
