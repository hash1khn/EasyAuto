import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Tag, ChevronDown, ChevronUp, FileText, RefreshCw } from "lucide-react";
import { OrderDetailsTable } from './OrderDetailsTable';

const getStatusStyle = (status: string) => {
    switch (status) {
        case 'Open':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'Completed':
        case 'Delivered':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'Cancelled':
            return 'bg-red-100 text-red-800 border-red-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

interface OrderHistoryCardProps {
    order: {
        id: string;
        status: string;
        date: string;
        partCount: number;
        amount: string;
        hasRefunds: boolean;
        invoiceId: string;
    };
    onViewDetails: (partId: string) => void;
    onShowReceipt: (invoiceId: string) => void;
    onShowRefundReceipt: (invoiceId: string) => void;
}

export const OrderHistoryCard = ({ order, onViewDetails, onShowReceipt, onShowRefundReceipt }: OrderHistoryCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex justify-between items-center">
                    <div className="flex-1 space-y-2">
                       <div className="flex items-center gap-3">
                         <h3 className="font-bold text-lg">Invoice #{order.invoiceId}</h3>
                         <Badge className={getStatusStyle(order.status)}>{order.status}</Badge>
                       </div>
                       <div className="flex items-center gap-4 text-sm text-gray-500">
                           <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4"/><span>{order.date}</span></div>
                           <div className="flex items-center gap-1.5"><Tag className="h-4 w-4"/><span>{order.partCount} part{order.partCount !== 1 ? 's' : ''}</span></div>
                           <span className="font-bold text-green-600">{order.amount}</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" onClick={() => setIsExpanded(!isExpanded)}>
                            {isExpanded ? <ChevronUp className="mr-2 h-4 w-4"/> : <ChevronDown className="mr-2 h-4 w-4"/>}
                            More Details
                        </Button>
                        {order.status === 'Delivered' && (
                           <>
                             <Button variant="outline" onClick={() => onShowReceipt(order.invoiceId)}>
                               <FileText className="mr-2 h-4 w-4"/>Receipt
                             </Button>
                             {order.hasRefunds && (
                                <Button variant="destructive" onClick={() => onShowRefundReceipt(order.invoiceId)}>
                                    <RefreshCw className="mr-2 h-4 w-4"/>Refund Receipt
                                </Button>
                             )}
                           </>
                        )}
                    </div>
                </div>
                {isExpanded && <OrderDetailsTable invoiceId={order.invoiceId} onViewDetails={onViewDetails} />}
            </CardContent>
        </Card>
    );
};