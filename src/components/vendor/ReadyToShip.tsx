import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Package, DollarSign, Clock } from "lucide-react"

interface Vehicle {
  make: string
  model: string
  year: number
}

interface Order {
  id: string
  is_paid: boolean
}

interface Part {
  id: string
  part_name: string
  part_number: string | null
  quantity: number
  shipping_status: string
  order_id: string
  vehicles: Vehicle[] // Supabase returns this as an array
  orders: Order[] // Supabase returns this as an array
}

interface BidWithParts {
  id: string
  price: number
  part_id: string
  parts: Part[] // Supabase returns this as an array even with !inner
}

interface ReadyToShipItem {
  id: string
  part_name: string
  part_number: string
  quantity: number
  price: number
  order_id: string
  part_id: string
  bid_id: string
  vehicle: Vehicle
  shipping_status: string
}

export const ReadyToShip: React.FC = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [items, setItems] = useState<ReadyToShipItem[]>([])
  const [stats, setStats] = useState({
    itemsToShip: 0,
    totalValue: 0,
    ordersWaiting: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchReadyToShipItems()
    }
  }, [user])

  const fetchReadyToShipItems = async () => {
    if (!user) return

    try {
      const { data: bidsData, error: bidsError } = await supabase
        .from("bids")
        .select(`
        id,
        price,
        part_id,
        parts!inner (
          id,
          part_name,
          part_number,
          quantity,
          shipping_status,
          order_id,
          vehicles (
            make,
            model,
            year
          ),
          orders!inner (
            id,
            is_paid
          )
        )
      `)
        .eq("vendor_id", user.id)
        .eq("status", "accepted")
        .eq("parts.orders.is_paid", true)
        .eq("parts.shipping_status", "pending_pickup")

      if (bidsError) throw bidsError

      const readyItems: ReadyToShipItem[] = []

      if (bidsData) {
        for (const bid of bidsData as any[]) {
          // Revert back to original working logic
          if (bid.parts && bid.parts.orders?.is_paid && bid.parts.shipping_status === "pending_pickup") {
            readyItems.push({
              id: `${bid.id}-${bid.parts.id}`,
              part_name: bid.parts.part_name,
              part_number: bid.parts.part_number || "N/A",
              quantity: bid.parts.quantity,
              price: bid.price,
              order_id: bid.parts.order_id,
              part_id: bid.parts.id,
              bid_id: bid.id,
              vehicle: bid.parts.vehicles,
              shipping_status: bid.parts.shipping_status,
            })
          }
        }
      }

      setItems(readyItems)

      const uniqueOrders = new Set(readyItems.map((item) => item.order_id))
      setStats({
        itemsToShip: readyItems.length,
        totalValue: readyItems.reduce((sum, item) => sum + Number(item.price), 0),
        ordersWaiting: uniqueOrders.size,
      })
    } catch (error) {
      console.error("Error fetching ready to ship items:", error)
      toast({
        title: "Error loading items",
        description: "Unable to fetch ready to ship items. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Items to Ship",
      value: stats.itemsToShip,
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Total Value (AED)",
      value: stats.totalValue.toLocaleString(),
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Orders Waiting",
      value: stats.ordersWaiting,
      icon: Clock,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ready to Ship</h1>
        <p className="text-gray-600">Items that have been paid for and are ready for pickup by our delivery agent.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items Ready for Pickup</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No items ready to ship at the moment.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part Details</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead className="text-right">Price (AED)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.part_name}</div>
                        <div className="text-sm text-gray-600">
                          Part #: {item.part_number} • Qty: {item.quantity}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {item.vehicle.make} {item.vehicle.model}
                      </div>
                      <div className="text-xs text-gray-600">{item.vehicle.year}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-gray-500 font-mono">#{item.order_id.slice(0, 8)}</div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{item.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Ready for Pickup
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
