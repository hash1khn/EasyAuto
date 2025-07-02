import { Package, CheckCircle, Truck } from "lucide-react"

interface Part {
  shipping_status: 'pending' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded'
}

interface TopCardsProps {
  parts: Part[]
}

export const TopCards = ({ parts }: TopCardsProps) => {
  // Filter out unwanted statuses
  const filteredParts = parts.filter(part => 
    !['cancelled', 'refunded', 'delivered'].includes(part.shipping_status)
  )

  // Calculate counts for display statuses
  const pendingParts = filteredParts.filter(
    part => part.shipping_status === 'pending'
  ).length

  const confirmedParts = filteredParts.filter(
    part => part.shipping_status === 'confirmed'
  ).length

  const outForDeliveryParts = filteredParts.filter(
    part => part.shipping_status === 'out_for_delivery'
  ).length

  const cardData = [
    {
      title: "Pending Shipment",
      description: "Awaiting processing",
      count: pendingParts,
      icon: <Package className="h-5 w-5 text-yellow-500" />,
      bgColor: "bg-yellow-50"
    },
    {
      title: "Confirmed Orders",
      description: "Ready for pickup",
      count: confirmedParts,
      icon: <CheckCircle className="h-5 w-5 text-blue-500" />,
      bgColor: "bg-blue-50"
    },
    {
      title: "Out for Delivery",
      description: "On the way to customer",
      count: outForDeliveryParts,
      icon: <Truck className="h-5 w-5 text-green-500" />,
      bgColor: "bg-green-50"
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {cardData.map((card, index) => (
        <div key={index} className={`bg-card p-4 rounded-lg border flex items-center justify-between ${card.bgColor}`}>
          <div>
            <p className="text-sm text-muted-foreground">{card.title}</p>
            <p className="text-2xl font-bold">{card.count}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </div>
          <div className="bg-white/80 p-3 rounded-full">
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  )
}