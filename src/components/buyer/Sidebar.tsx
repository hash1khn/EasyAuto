import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import {
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  Settings,
  ShieldAlert,
  User,
  ChevronsLeftRight,
  LogOut,
} from "lucide-react"

interface SidebarProps {
  className?: string
  activeTab: string
  onTabChange: (tab: string) => void
}

interface UserProfile {
  id: string
  full_name: string
  business_name: string | null
  whatsapp_number: string
}

interface UserRole {
  role: string
  is_approved: boolean
}

export const Sidebar = ({ className, activeTab, onTabChange }: SidebarProps) => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      id: "orderHistory",
      label: "Order History",
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      id: "support",
      label: "Support",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return

      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("id, full_name, business_name, whatsapp_number")
          .eq("user_id", user.id)
          .single()

        if (profileError) {
          console.error("Error fetching user profile:", profileError)
        } else {
          setUserProfile(profileData)
        }

        // Fetch user role
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role, is_approved")
          .eq("user_id", user.id)
          .single()

        if (roleError) {
          console.error("Error fetching user role:", roleError)
        } else {
          setUserRole(roleData)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleAdminMode = () => {
    if (userRole?.role === "admin" && userRole?.is_approved) {
      navigate("/admin")
    }
  }

  const handleSwitchDashboard = () => {
    if (userRole?.role === "vendor" && userRole?.is_approved) {
      navigate("/vendor")
    } else if (userRole?.role === "buyer") {
      // Already on buyer dashboard
      return
    }
  }

  const canAccessAdmin = userRole?.role === "admin" && userRole?.is_approved
  const canSwitchToVendor = userRole?.role === "vendor" && userRole?.is_approved

  return (
    <div className={cn("flex flex-col h-full bg-background border-r p-4", className)}>
      <div className="flex items-center gap-3 p-3 mb-4 bg-muted rounded-lg">
        <div className="p-2 bg-primary/10 rounded-full">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground">
            {userProfile?.business_name ? "Business:" : "Buyer:"}
          </p>
          {loading ? (
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-sm font-semibold truncate">
              {userProfile?.business_name || userProfile?.full_name || user?.email || "Loading..."}
            </p>
          )}
          {userRole && (
            <p className="text-xs text-muted-foreground capitalize">
              {userRole.role} {!userRole.is_approved && "(Pending Approval)"}
            </p>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-md transition-colors",
              activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-1">
        {canAccessAdmin && (
          <button
            onClick={handleAdminMode}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:bg-muted",
            )}
          >
            <ShieldAlert className="h-5 w-5" />
            Admin Mode
          </button>
        )}

        {canSwitchToVendor && (
          <button
            onClick={handleSwitchDashboard}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:bg-muted",
            )}
          >
            <ChevronsLeftRight className="h-5 w-5" />
            Switch to Vendor
          </button>
        )}

        <button
          onClick={handleSignOut}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-md transition-colors text-red-600 hover:bg-red-50",
          )}
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
