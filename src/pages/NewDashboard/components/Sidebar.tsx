import React from "react";
import {
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  Settings,
  ShieldAlert,
  User,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
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
  ];

  return (
    <div className="w-64 h-full bg-white border-r flex flex-col">
      {/* User Info */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 rounded-full p-2">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium">Buyer:</p>
            <p className="text-sm text-gray-600">hello@sgservices.ae</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Admin Mode */}
      <div className="p-4 border-t">
        <button
          disabled
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-400 opacity-60 cursor-not-allowed"
        >
          <ShieldAlert className="h-5 w-5" />
          Admin Mode
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 