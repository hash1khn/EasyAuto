import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  MessageSquare,
  Phone,
  Mail,
  Wrench,
  Truck,
  RefreshCw,
  Info,
  AlertTriangle,
  RotateCcw,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useOrderHistory } from "@/hooks/useOrderHistory"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

const faqCategories = [
  {
    icon: Wrench,
    category: "Ordering & Payments",
    faqs: [
      {
        question: "How does EasyAuto work?",
        answer:
          "EasyAuto is an online platform that connects you with multiple auto parts vendors. You request parts, receive quotes from vendors, and place orders directly through our platform.",
      },
      {
        question: "Who do I pay when I place an order?",
        answer:
          "All payments are securely processed through EasyAuto. We handle the full payment process and pay the vendors directly once your order is completed.",
      },
      {
        question: "Are prices fixed or do I receive quotes?",
        answer:
          "You will receive multiple quotes from vendors based on your part request. You can then select your preferred offer.",
      },
      {
        question: "What payment methods are accepted?",
        answer:
          "Payments are processed securely via Stripe. We accept credit cards, debit cards, and other payment methods available at checkout.",
      },
      {
        question: "Is my order confirmed immediately after payment?",
        answer:
          "Yes — once payment is successfully processed, your order is confirmed and moved into the delivery preparation stage.",
      },
    ],
  },
  {
    icon: Truck,
    category: "Shipping & Delivery",
    faqs: [
      {
        question: "Who handles the delivery?",
        answer:
          "EasyAuto manages delivery through approved logistics partners. Your parts will be collected directly from vendors and delivered to your provided address.",
      },
      {
        question: "How long does delivery take?",
        answer:
          "Delivery times may vary depending on vendor preparation and courier schedules. You will be notified once your order is dispatched.",
      },
      {
        question: "Can I track my order?",
        answer: "Yes — you can track your order status through your Buyer Dashboard once your order is dispatched.",
      },
    ],
  },
  {
    icon: RefreshCw,
    category: "Refunds, Returns & Cancellations",
    faqs: [
      {
        question: "Can I cancel an order after payment?",
        answer:
          "Once payment is processed, cancellations may only be possible if the vendor agrees and if the order hasn't been dispatched. Please contact our support team immediately.",
      },
      {
        question: "What is the refund policy?",
        answer: (
          <>
            Each vendor sets their own refund and return policy. Refund windows may be:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>No Refund</li>
              <li>3 Days</li>
              <li>7 Days</li>
              <li>14 Days (rare)</li>
              <li>30 Days (very rare)</li>
            </ul>
            <p className="mt-2">You will see the refund policy for each part before confirming your order.</p>
          </>
        ),
      },
      {
        question: "How do I request a refund?",
        answer:
          "Refund requests must be submitted directly through your Buyer Dashboard within the applicable refund period.",
      },
      {
        question: "How will refunds be processed?",
        answer: "Once approved, refunds will be processed back to your original payment method.",
      },
    ],
  },
  {
    icon: Info,
    category: "Parts Information",
    faqs: [
      {
        question: "Does EasyAuto verify the parts before shipping?",
        answer:
          "No. EasyAuto is a platform and does not physically inspect or verify parts. Vendors are fully responsible for the accuracy, condition, and authenticity of their products.",
      },
      {
        question: "What if I receive the wrong part?",
        answer:
          "If the delivered part does not match your order, please contact our support team immediately to initiate a resolution.",
      },
      {
        question: "Are parts new or used?",
        answer:
          "Vendors may offer both new and used parts. You will see part condition clearly listed before placing your order.",
      },
    ],
  },
  {
    icon: AlertTriangle,
    category: "Other Questions",
    faqs: [
      {
        question: "Can I contact vendors directly?",
        answer:
          "No. All communication must go through the EasyAuto platform to ensure your order is properly protected and recorded.",
      },
      {
        question: "What happens if a vendor delays my order?",
        answer:
          "EasyAuto will coordinate with the vendor and logistics team. If delays occur, you will be updated directly via your Buyer Dashboard.",
      },
      {
        question: "Is my information safe?",
        answer: "Yes — all customer data is handled securely in accordance with UAE data privacy regulations.",
      },
      {
        question: "What laws govern EasyAuto?",
        answer:
          "All purchases are governed by the laws of the United Arab Emirates, under the jurisdiction of Sharjah Courts.",
      },
    ],
  },
]

export const SupportTab = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const { orders, loading } = useOrderHistory()
  const [selectedInvoice, setSelectedInvoice] = useState<string>("")
  const [selectedPart, setSelectedPart] = useState<string>("")
  const [refundNotes, setRefundNotes] = useState("")
  const [submittingRefund, setSubmittingRefund] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  // Get user profile for contact info
  useState(() => {
    const fetchUserProfile = async () => {
      if (!user) return

      try {
        const { data } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

        setUserProfile(data)
      } catch (error) {
        console.error("Error fetching user profile:", error)
      }
    }

    fetchUserProfile()
  }, [user])

  // Filter completed orders for refund requests
  const completedOrders = useMemo(() => {
    return orders
      .filter(
        (order) => order.status === "completed" && order.parts.some((part) => part.shipping_status === "delivered"),
      )
      .map((order) => ({
        id: order.id,
        date: new Date(order.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        partCount: order.parts_count,
        amount: `AED ${order.total_amount.toFixed(2)}`,
        totalAmount: order.total_amount,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [orders])

  // Get available parts for selected invoice
  const availableParts = useMemo(() => {
    if (!selectedInvoice) return []

    const selectedOrder = orders.find((order) => order.id === selectedInvoice)
    if (!selectedOrder) return []

    return selectedOrder.parts
      .filter((part) => part.shipping_status === "delivered")
      .map((part) => {
        const vehicle = part.vehicle
        const vehicleString = vehicle ? `${vehicle.make} ${vehicle.model} ${vehicle.year}` : "Unknown Vehicle"

        return {
          id: part.id,
          name: part.part_name,
          vehicle: vehicleString,
          partNumber: part.part_number || "N/A",
          displayName: `${part.part_name} – ${vehicleString} – PN# ${part.part_number || "N/A"}`,
        }
      })
  }, [selectedInvoice, orders])

  const handleSubmitRefundRequest = async () => {
    if (!selectedInvoice || !selectedPart || !refundNotes.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setSubmittingRefund(true)

    try {
      // Create refund request in database
      const { error } = await supabase.from("refund_requests").insert({
        order_id: selectedInvoice,
        part_id: selectedPart,
        user_id: user?.id,
        reason: refundNotes,
        status: "pending",
        created_at: new Date().toISOString(),
      })

      if (error) throw error

      const selectedPartData = availableParts.find((p) => p.id === selectedPart)
      const orderData = completedOrders.find((o) => o.id === selectedInvoice)

      if (!selectedPartData || !orderData) return

      // Create WhatsApp message
      const customerName = userProfile?.full_name || user?.email || "Customer"
      const message = `Refund Request from Buyer: ${customerName}

Invoice ID: ${selectedInvoice}
Part: ${selectedPartData.name} – ${selectedPartData.vehicle} – PN# ${selectedPartData.partNumber}
Reason: "${refundNotes}"

Please review and follow up.`

      // Encode message for WhatsApp
      const encodedMessage = encodeURIComponent(message)
      const whatsappUrl = `https://wa.me/971501234567?text=${encodedMessage}`

      // Open WhatsApp
      window.open(whatsappUrl, "_blank")

      toast({
        title: "Refund request submitted",
        description: "Your refund request has been submitted and our team will review it shortly.",
      })

      // Reset form
      setSelectedInvoice("")
      setSelectedPart("")
      setRefundNotes("")
    } catch (error: any) {
      console.error("Error submitting refund request:", error)
      toast({
        title: "Error submitting request",
        description: error.message || "Unable to submit refund request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmittingRefund(false)
    }
  }

  const handleContactClick = (method: string) => {
    switch (method) {
      case "whatsapp":
        const customerName = userProfile?.full_name || user?.email || "Customer"
        const message = `Hello, I need support with my EasyAuto account.

Customer: ${customerName}
Email: ${user?.email}

Please assist me with my inquiry.`
        const encodedMessage = encodeURIComponent(message)
        window.open(`https://wa.me/971501234567?text=${encodedMessage}`, "_blank")
        break
      case "phone":
        window.open("tel:+971501234567", "_self")
        break
      case "email":
        window.open("mailto:support@sgsservices.ae", "_self")
        break
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading support options...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
          <CardDescription>Have a question or need help with an order? Reach out to us.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="w-full justify-start p-6 text-left"
            onClick={() => handleContactClick("whatsapp")}
          >
            <MessageSquare className="h-6 w-6 mr-4 text-green-500" />
            <div>
              <p className="font-semibold">WhatsApp</p>
              <p className="text-sm text-muted-foreground">Chat with an agent</p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start p-6 text-left"
            onClick={() => handleContactClick("phone")}
          >
            <Phone className="h-6 w-6 mr-4 text-blue-500" />
            <div>
              <p className="font-semibold">Phone Call</p>
              <p className="text-sm text-muted-foreground">+971 50 123 4567</p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start p-6 text-left"
            onClick={() => handleContactClick("email")}
          >
            <Mail className="h-6 w-6 mr-4 text-gray-500" />
            <div>
              <p className="font-semibold">Email</p>
              <p className="text-sm text-muted-foreground">support@sgsservices.ae</p>
            </div>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RotateCcw className="h-6 w-6 mr-3 text-orange-500" />
            Request Refund
          </CardTitle>
          <CardDescription>
            Request a refund for any part from a delivered order. We'll review your request and get back to you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {completedOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <RotateCcw className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No completed orders available for refund requests.</p>
              <p className="text-sm">Complete an order first to request refunds.</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="invoice-select">Step 1: Select Invoice</Label>
                <Select
                  value={selectedInvoice}
                  onValueChange={(value) => {
                    setSelectedInvoice(value)
                    setSelectedPart("") // Reset part selection when invoice changes
                  }}
                >
                  <SelectTrigger id="invoice-select">
                    <SelectValue placeholder="Choose an invoice..." />
                  </SelectTrigger>
                  <SelectContent>
                    {completedOrders.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.id.slice(0, 8)} - Delivered on {order.date} - {order.amount}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedInvoice && (
                <div className="space-y-2">
                  <Label htmlFor="part-select">Step 2: Select Part</Label>
                  <Select value={selectedPart} onValueChange={setSelectedPart}>
                    <SelectTrigger id="part-select">
                      <SelectValue placeholder="Choose a part..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableParts.map((part) => (
                        <SelectItem key={part.id} value={part.id}>
                          {part.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedPart && (
                <div className="space-y-2">
                  <Label htmlFor="refund-notes">Step 3: Add Notes</Label>
                  <Textarea
                    id="refund-notes"
                    placeholder="Please describe the issue (e.g. wrong fit, damaged, not needed anymore)"
                    value={refundNotes}
                    onChange={(e) => setRefundNotes(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              )}

              {selectedInvoice && selectedPart && refundNotes.trim() && (
                <div className="space-y-2">
                  <Label>Step 4: Submit Request</Label>
                  <Button onClick={handleSubmitRefundRequest} className="w-full" disabled={submittingRefund}>
                    {submittingRefund ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting Request...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Submit Refund Request via WhatsApp
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div>
        <CardHeader className="px-0">
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Find quick answers to common questions.</CardDescription>
        </CardHeader>
        <div className="space-y-6">
          {faqCategories.map((category, catIndex) => {
            const CategoryIcon = category.icon
            return (
              <Card key={catIndex}>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <CategoryIcon className="h-6 w-6 mr-3 text-primary" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, faqIndex) => (
                      <AccordionItem value={`item-${catIndex}-${faqIndex}`} key={faqIndex}>
                        <AccordionTrigger className="text-left font-semibold">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
