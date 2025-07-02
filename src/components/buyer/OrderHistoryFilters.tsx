import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Filter } from "lucide-react";

interface OrderHistoryFiltersProps {
    onClearFilters: () => void;
    onSearchChange: (value: string) => void;
    onDateRangeChange: (from: string, to: string) => void;
    searchTerm: string;
    fromDate: string;
    toDate: string;
}

export const OrderHistoryFilters = ({ 
    onClearFilters,
    onSearchChange,
    onDateRangeChange,
    searchTerm,
    fromDate,
    toDate
}: OrderHistoryFiltersProps) => {
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearchChange(e.target.value);
    };

    const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDateRangeChange(e.target.value, toDate);
    };

    const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDateRangeChange(fromDate, e.target.value);
    };

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5"/>
                    Filters & Search
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="lg:col-span-2">
                        <label className="text-sm font-medium mb-1 block">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
                            <Input 
                                placeholder="Invoice ID, part name" 
                                className="pl-9"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">From Date</label>
                        <Input 
                            type="date" 
                            value={fromDate}
                            onChange={handleFromDateChange}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">To Date</label>
                        <Input 
                            type="date" 
                            value={toDate}
                            onChange={handleToDateChange}
                        />
                    </div>
                    <div>
                        <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={onClearFilters}
                        >
                            Clear Filters
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};