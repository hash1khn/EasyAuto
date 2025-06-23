import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const SourcerLayout: React.FC = () => {
  const location = useLocation();
  const sourcerName = "John Smith";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigationItems = [
    { name: "Dashboard", route: "/sourcer/dashboard", icon: "📊" },
    { name: "Quote History", route: "/sourcer/history", icon: "📁" },
    { name: "Settings", route: "/sourcer/settings", icon: "⚙️" }
  ];

  const isActiveRoute = (route: string) => {
    return location.pathname === route || (route === "/sourcer/dashboard" && location.pathname === "/sourcer");
  };

  const pageTitles: { [key: string]: string } = {
    "/sourcer": "Dashboard",
    "/sourcer/dashboard": "Dashboard",
    "/sourcer/history": "Quote History",
    "/sourcer/settings": "Settings",
  };
  
  const currentPageTitle = pageTitles[location.pathname] || "Sourcer Portal";

  return (
    <div className="relative min-h-screen bg-gray-50 md:flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-800">Sourcer Portal</h2>
              <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="space-y-2">
              {navigationItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.route}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActiveRoute(item.route)
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg mr-3">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-6">
            <button className="w-full flex items-center px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
              <span className="text-lg mr-3">🚪</span>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      {/* Main content */}
      <main className="flex-1">
        <header className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button className="md:hidden mr-4" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="h-6 w-6" />
              </button>
               <h1 className="text-2xl font-bold text-gray-900">{currentPageTitle}</h1>
            </div>
             <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-3 hidden sm:block">Welcome, {sourcerName}</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Sourcer
              </span>
            </div>
          </div>
        </header>
        
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SourcerLayout;