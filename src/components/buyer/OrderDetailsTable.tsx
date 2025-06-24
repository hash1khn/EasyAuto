interface OrderDetailsTableProps {
  order: any // Keep the original prop name
  onViewDetails: (partId: string) => void
}

export const OrderDetailsTable = ({ order, onViewDetails }: OrderDetailsTableProps) => {
  const deliveredParts = order.parts.filter(
    (p: any) => p.shipping_status === "delivered" || order.refund_requests.some((r: any) => r.status === "approved"),
  )

  const subtotal = deliveredParts
    .filter((p: any) => !order.refund_requests.some((r: any) => r.status === "approved"))
    .reduce((sum: number, part: any) => sum + (part.winning_bid?.price || 0) * part.quantity, 0)

  const deliveryFee = order.delivery_fee || 0
  const grandTotal = order.total_amount

  return (
    <div>
      <h3>Order Details</h3>
      <table>
        <thead>
          <tr>
            <th>Part ID</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {deliveredParts.map((part: any) => (
            <tr key={part.id}>
              <td>{part.id}</td>
              <td>{part.quantity}</td>
              <td>{part.winning_bid?.price || 0}</td>
              <td>{part.shipping_status}</td>
              <td>
                <button onClick={() => onViewDetails(part.id)}>View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <p>Subtotal: {subtotal}</p>
        <p>Delivery Fee: {deliveryFee}</p>
        <p>Grand Total: {grandTotal}</p>
      </div>
    </div>
  )
}
