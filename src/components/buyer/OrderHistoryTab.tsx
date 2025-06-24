// Updated OrderHistoryTab.tsx
import { useState } from "react"
import { OrderHistoryHeader } from "./OrderHistoryHeader"
import { OrderHistorySummary } from "./OrderHistorySummary"
import { OrderHistoryFilters } from "./OrderHistoryFilters"
import { OrderHistoryCard } from "./OrderHistoryCard"
import { PartModal } from "./PartModal"
import { ReceiptModal } from "./ReceiptModal"
import { RefundReceiptModal } from "./RefundReceiptModal"
import { useOrderHistory } from "@/hooks/useOrderHistory"

export const OrderHistoryTab = () => {
  const {
    orders,
    stats,
    loading,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    dateRange,
    setDateRange,
    statusFilter,
    setStatusFilter,
    clearFilters,
  } = useOrderHistory()

  const [selectedPart, setSelectedPart] = useState<any>(null)
  const [receiptInvoiceId, setReceiptInvoiceId] = useState<string | null>(null)
  const [refundReceiptId, setRefundReceiptId] = useState<string | null>(null)

  const handleViewPartDetails = (partId: string) => {
    for (const order of orders) {
      const part = order.parts.find((p: any) => p.id === partId)
      if (part) {
        setSelectedPart(part)
        break
      }
    }
  }

  const handleShowReceipt = (invoiceId: string) => {
    setReceiptInvoiceId(invoiceId)
  }

  const handleShowRefundReceipt = (refundId: string) => {
    setRefundReceiptId(refundId)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <OrderHistoryHeader />
      <OrderHistorySummary stats={stats} />
      <OrderHistoryFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        dateRange={dateRange}
        setDateRange={setDateRange}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onClearFilters={clearFilters}
      />

      <div className="space-y-4">
        <p className="text-sm text-gray-600">Showing {orders.length} completed orders</p>
        {orders.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground">No completed orders found</p>
            {(searchTerm || statusFilter !== "all" || dateRange !== "all") && (
              <button className="text-primary text-sm mt-2 hover:underline" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          orders.map((order) => (
            <OrderHistoryCard
              key={order.id}
              order={order}
              onViewDetails={handleViewPartDetails}
              onShowReceipt={handleShowReceipt}
              onShowRefundReceipt={handleShowRefundReceipt}
            />
          ))
        )}
      </div>

      <PartModal part={selectedPart} vehicle={selectedPart?.vehicle} onOpenChange={() => setSelectedPart(null)} />
      <ReceiptModal isOpen={!!receiptInvoiceId} onOpenChange={() => setReceiptInvoiceId(null)} invoiceId={receiptInvoiceId} />
      <RefundReceiptModal
        isOpen={!!refundReceiptId}
        onOpenChange={() => setRefundReceiptId(null)}
        refundId={refundReceiptId}
      />
    </div>
  )
}