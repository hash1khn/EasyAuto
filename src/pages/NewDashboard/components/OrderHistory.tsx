import React, { useState } from "react";
import { Search, Filter, Calendar } from "lucide-react";
import ReceiptCard from "./ReceiptCard";
import { getCompletedPartsByDate, getVehicleById } from "../data/mockData";

const OrderHistory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("30days");

  // Get completed parts grouped by date
  const completedPartsByDate = getCompletedPartsByDate();

  // Filter by search query, status, and date range
  const filteredGroups = completedPartsByDate.filter(group => {
    const { date, parts } = group;
    
    // Apply status filter
    if (statusFilter !== "all") {
      const isRefunded = statusFilter === "refunded";
      if (isRefunded && !parts.some(part => part.status === "REFUNDED")) {
        return false;
      }
      if (!isRefunded && !parts.some(part => part.status === "DELIVERED")) {
        return false;
      }
    }
    
    // Apply date range filter
    const groupDate = new Date(date);
    const now = new Date();
    let cutoffDate = new Date();
    
    if (dateRange === "30days") {
      cutoffDate.setDate(now.getDate() - 30);
    } else if (dateRange === "90days") {
      cutoffDate.setDate(now.getDate() - 90);
    } else if (dateRange === "year") {
      cutoffDate.setFullYear(now.getFullYear() - 1);
    }
    
    if (groupDate < cutoffDate) {
      return false;
    }
    
    // Apply search filter
    if (searchQuery.trim() !== "") {
      const searchLower = searchQuery.toLowerCase();
      
      // Check if any part matches the search
      const anyPartMatches = parts.some(part => {
        const vehicle = getVehicleById(part.vehicleId);
        
        if (!vehicle) return false;
        
        // Search by vehicle info
        if (
          vehicle.make.toLowerCase().includes(searchLower) ||
          vehicle.model.toLowerCase().includes(searchLower) ||
          vehicle.year.toString().includes(searchLower)
        ) {
          return true;
        }
        
        // Search by order ID
        if (part.orderId.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // Search by part name
        if (part.name.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        return false;
      });
      
      if (!anyPartMatches) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order History</h1>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
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

        {/* Filter Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Filter className="h-4 w-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Status</label>
            </div>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="delivered">Delivered</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Date Range</label>
            </div>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Receipts List */}
      <div>
        {filteredGroups.length > 0 ? (
          filteredGroups.map(({ date, parts }) => {
            // Group parts by vehicle and order
            const orderGroups = parts.reduce((acc, part) => {
              const key = `${part.vehicleId}-${part.orderId}`;
              if (!acc[key]) {
                acc[key] = {
                  vehicleId: part.vehicleId,
                  orderId: part.orderId,
                  parts: [],
                };
              }
              acc[key].parts.push(part);
              return acc;
            }, {} as Record<string, { vehicleId: string; orderId: string; parts: typeof parts }>);

            return Object.values(orderGroups).map((group) => {
              const vehicle = getVehicleById(group.vehicleId);
              if (!vehicle) return null;

              return (
                <ReceiptCard
                  key={`${group.vehicleId}-${group.orderId}`}
                  parts={group.parts}
                  vehicle={vehicle}
                  deliveryDate={date}
                />
              );
            });
          })
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No receipts found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory; 