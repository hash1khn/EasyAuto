import { useState } from "react";
import { Sidebar } from "@/components/buyer/Sidebar";
import { DashboardTab } from "@/components/buyer/DashboardTab";
import { OrderHistoryTab } from "@/components/buyer/OrderHistoryTab";
import { SupportTab } from "@/components/buyer/SupportTab";
import { SettingsTab } from "@/components/buyer/SettingsTab";
import { Button } from "@/components/ui/button";
import { Menu, MessageSquare, Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NewOrderModal } from "@/components/buyer/OrderModal/NewOrderModal";

export default function BuyerDesign1() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />;
      case "orderHistory":
        return <OrderHistoryTab />;
      case "support":
        return <SupportTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <DashboardTab />;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Dashboard";
      case "orderHistory":
        return "Order History";
      case "support":
        return "Support";
      case "settings":
        return "Settings";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 border-r">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden absolute top-4 left-4">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="border-b p-4 md:p-6 flex justify-between items-center">
          <div className="flex items-center">
            <div className="md:hidden w-8" /> {/* Spacer for mobile */}
            <h1 className="text-2xl font-bold">{getTabTitle()}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setIsNewOrderModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> New Order
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp Help
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {renderTabContent()}
        </main>
      </div>
      <NewOrderModal isOpen={isNewOrderModalOpen} onOpenChange={setIsNewOrderModalOpen} />
    </div>
  );
} 