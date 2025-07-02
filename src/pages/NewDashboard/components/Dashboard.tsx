import React, { useState } from "react";
import { Search } from "lucide-react";
import OrderCard from "./OrderCard";
import { orders, parts, vehicles, getVehicleById, getPartsByOrderId } from "../data/mockData";

const Dashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter orders based on search query
  const filteredOrders = orders.filter(order => {
    const vehicle = getVehicleById(order.vehicleId);
    const orderParts = getPartsByOrderId(order.id);
    
    if (!vehicle) return false;

    const searchLower = searchQuery.toLowerCase();
    
    // Search by vehicle info
    if (
      vehicle.make.toLowerCase().includes(searchLower) ||
      vehicle.model.toLowerCase().includes(searchLower) ||
      vehicle.year.toString().includes(searchLower)
    ) {
      return true;
    }
    
    // Search by order ID
    if (order.id.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search by part name
    if (orderParts.some(part => part.name.toLowerCase().includes(searchLower))) {
      return true;
    }
    
    return false;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by vehicle, part name, or order ID..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Orders List */}
      <div>
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => {
            const vehicle = getVehicleById(order.vehicleId);
            const orderParts = getPartsByOrderId(order.id);
            
            if (!vehicle) return null;
            
            return (
              <OrderCard 
                key={order.id} 
                order={order} 
                parts={orderParts} 
                vehicle={vehicle} 
              />
            );
          })
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 