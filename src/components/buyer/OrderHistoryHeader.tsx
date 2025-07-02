import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export const OrderHistoryHeader = () => {
    return (
        <div className="flex justify-between items-start mb-6">
            <div>
                <h1 className="text-3xl font-bold">Order History</h1>
                <p className="text-gray-500 mt-1">
                    View and manage your orders, track deliveries, and request refunds
                </p>
            </div>
            <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Export
            </Button>
        </div>
    );
}; 