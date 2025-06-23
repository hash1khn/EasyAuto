import type React from "react"
import { useState, useEffect } from "react"
import { User, Bell, Shield, MapPin, CreditCard, Save, Loader2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { ChangePasswordModal } from "./ChangePasswordModal"

interface UserProfile {
  id: string
  full_name: string
  whatsapp_number: string
  business_name: string | null
  location: string
  delivery_address: string | null
  delivery_phone: string | null
  delivery_instructions: string | null
  email_notifications: boolean
  sms_notifications: boolean
  whatsapp_notifications: boolean
  default_payment_method: string
  created_at: string
  updated_at: string
}

export const SettingsTab: React.FC = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    business_name: "",
    whatsapp_number: "",
    location: "",
    delivery_address: "",
    delivery_phone: "",
    delivery_instructions: "",
    email_notifications: true,
    sms_notifications: true,
    whatsapp_notifications: true,
    default_payment_method: "cod",
  })

  useEffect(() => {
    if (user) {
      fetchUserProfile()
    }
  }, [user])

  const fetchUserProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (data) {
        setUserProfile(data)
        setFormData({
          full_name: data.full_name || "",
          business_name: data.business_name || "",
          whatsapp_number: (data.whatsapp_number || "").replace(/^971/, ""),
          location: data.location || "",
          delivery_address: data.delivery_address || "",
          delivery_phone: (data.delivery_phone || "").replace(/^971/, ""),
          delivery_instructions: data.delivery_instructions || "",
          email_notifications: data.email_notifications ?? true,
          sms_notifications: data.sms_notifications ?? true,
          whatsapp_notifications: data.whatsapp_notifications ?? true,
          default_payment_method: data.default_payment_method || "cod",
        })
      } else {
        // Initialize with user metadata if available
        if (user.user_metadata) {
          setFormData((prev) => ({
            ...prev,
            full_name: user.user_metadata.full_name || user.user_metadata.name || "",
            whatsapp_number: (user.user_metadata.phone || "").replace(/^971/, ""),
          }))
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      toast({
        title: "Error loading profile",
        description: "Unable to load your profile information.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)

    try {
      // Format phone numbers with country code
      const dataToSave = {
        ...formData,
        whatsapp_number: formData.whatsapp_number.startsWith("971")
          ? formData.whatsapp_number
          : `971${formData.whatsapp_number}`,
        delivery_phone: formData.delivery_phone
          ? formData.delivery_phone.startsWith("971")
            ? formData.delivery_phone
            : `971${formData.delivery_phone}`
          : null,
        updated_at: new Date().toISOString(),
      }

      if (userProfile) {
        // Update existing profile
        const { error } = await supabase.from("user_profiles").update(dataToSave).eq("user_id", user.id)

        if (error) throw error
      } else {
        // Create new profile
        const { error } = await supabase.from("user_profiles").insert({
          user_id: user.id,
          ...dataToSave,
        })

        if (error) throw error
      }

      toast({
        title: "Settings saved successfully!",
        description: "Your preferences have been updated.",
      })

      // Refresh profile data
      await fetchUserProfile()
    } catch (error: any) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error saving settings",
        description: error.message || "Unable to save your settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePasswordChange = () => {
    setShowPasswordModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          {/* Profile Settings */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Profile Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                  value={user?.email || ""}
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">+971</span>
                  <input
                    type="tel"
                    className="w-full p-2 pl-14 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.whatsapp_number}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, "").replace(/^971/, "")
                      handleInputChange("whatsapp_number", cleaned)
                    }}
                    placeholder="50 123 4567"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name (Optional)</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.business_name}
                  onChange={(e) => handleInputChange("business_name", e.target.value)}
                  placeholder="Your business name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="City, Country"
                  required
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Notification Preferences</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive order updates and receipts via email</p>
                </div>
                <Switch
                  checked={formData.email_notifications}
                  onCheckedChange={(checked) => handleInputChange("email_notifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-gray-600">Receive delivery updates via SMS</p>
                </div>
                <Switch
                  checked={formData.sms_notifications}
                  onCheckedChange={(checked) => handleInputChange("sms_notifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">WhatsApp Notifications</p>
                  <p className="text-sm text-gray-600">Receive order updates via WhatsApp</p>
                </div>
                <Switch
                  checked={formData.whatsapp_notifications}
                  onCheckedChange={(checked) => handleInputChange("whatsapp_notifications", checked)}
                />
              </div>
            </div>
          </div>

          {/* Address Settings */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Delivery Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={formData.delivery_address}
                  onChange={(e) => handleInputChange("delivery_address", e.target.value)}
                  placeholder="Enter your delivery address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Phone (Optional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">+971</span>
                  <input
                    type="tel"
                    className="w-full p-2 pl-14 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.delivery_phone}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, "").replace(/^971/, "")
                      handleInputChange("delivery_phone", cleaned)
                    }}
                    placeholder="50 123 4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Instructions</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  value={formData.delivery_instructions}
                  onChange={(e) => handleInputChange("delivery_instructions", e.target.value)}
                  placeholder="Any special delivery instructions"
                />
              </div>
            </div>
          </div>

          {/* Payment Settings */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Payment Methods</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Payment Method</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="cod"
                      name="payment-method"
                      type="radio"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      value="cod"
                      checked={formData.default_payment_method === "cod"}
                      onChange={() => handleInputChange("default_payment_method", "cod")}
                    />
                    <label htmlFor="cod" className="ml-2 block text-sm text-gray-700">
                      Cash on Delivery
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="card"
                      name="payment-method"
                      type="radio"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      value="card"
                      checked={formData.default_payment_method === "card"}
                      onChange={() => handleInputChange("default_payment_method", "card")}
                    />
                    <label htmlFor="card" className="ml-2 block text-sm text-gray-700">
                      Credit/Debit Card
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="bank_transfer"
                      name="payment-method"
                      type="radio"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      value="bank_transfer"
                      checked={formData.default_payment_method === "bank_transfer"}
                      onChange={() => handleInputChange("default_payment_method", "bank_transfer")}
                    />
                    <label htmlFor="bank_transfer" className="ml-2 block text-sm text-gray-700">
                      Bank Transfer
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  To add or manage payment methods, please contact your account manager.
                </p>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Security</h2>
            </div>

            <div className="space-y-4">
              <Button type="button" variant="outline" onClick={handlePasswordChange}>
                Change Password
              </Button>

              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Last login: {userProfile?.updated_at ? new Date(userProfile.updated_at).toLocaleString() : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
        <ChangePasswordModal isOpen={showPasswordModal} onOpenChange={setShowPasswordModal} />
      </form>
    </div>
  )
}
