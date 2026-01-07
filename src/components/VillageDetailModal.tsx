import { useState } from 'react';
import { CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { formatPercent, formatValue, cn } from '../lib/utils';
import type { Village } from '../lib/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface VillageDetailModalProps {
    village: Village | null;
    open: boolean;
    onClose: () => void;
    complianceType: '9(2)' | '13';
}

export const VillageDetailModal = ({ village, open, onClose, complianceType }: VillageDetailModalProps) => {
    const [searchQuery, setSearchQuery] = useState('');

    if (!village) return null;

    const items = complianceType === '9(2)' ? village.sec92_items : village.sec13_items;
    const percent = complianceType === '9(2)' ? village.sec92_percent : village.sec13_percent;
    const status = complianceType === '9(2)' ? village.sec92_status : village.sec13_status;

    // Filter items based on search
    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="p-6 border-b shrink-0 bg-white z-10">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex flex-col gap-1">
                            <span className="text-2xl font-bold tracking-tight">{village.name}</span>
                            <span className="text-muted-foreground font-normal flex items-center gap-2">
                                Section {complianceType} Compliance Report
                                <Badge variant="outline" className="ml-2">
                                    {items.length} Items
                                </Badge>
                            </span>
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="flex-1 flex flex-col min-h-0 bg-gray-50/50">
                    {/* Stats & Controls */}
                    <div className="p-6 grid gap-6 shrink-0">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-white shadow-sm border-blue-100 overflow-hidden relative">
                                <div className="absolute right-0 top-0 h-full w-1 bg-blue-500" />
                                <CardContent className="p-5">
                                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Score</div>
                                    <div className="text-3xl font-bold text-blue-600 mt-1">{formatPercent(percent)}</div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white shadow-sm border-gray-100 overflow-hidden relative">
                                <div className={cn("absolute right-0 top-0 h-full w-1", status === 'Completed' ? "bg-green-500" : "bg-red-500")} />
                                <CardContent className="p-5">
                                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Status</div>
                                    <div className={cn("text-3xl font-bold mt-1", status === 'Completed' ? "text-green-600" : "text-red-600")}>
                                        {status}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white shadow-sm border-gray-100 overflow-hidden relative">
                                <div className="absolute right-0 top-0 h-full w-1 bg-orange-500" />
                                <CardContent className="p-5">
                                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending Action</div>
                                    <div className="text-3xl font-bold text-gray-900 mt-1">
                                        {items.filter(i => i.status === 'Pending').length}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search compliance items..."
                                className="pl-9 bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Scrollable Table */}
                    <div className="flex-1 overflow-hidden px-6 pb-6 w-full">
                        <div className="h-full border rounded-lg bg-white overflow-hidden flex flex-col shadow-sm">
                            <TableHeader className="bg-gray-50/50 sticky top-0 z-10 border-b">
                                <TableRow>
                                    <TableHead className="w-[80px]">Status</TableHead>
                                    <TableHead>Compliance Item</TableHead>
                                    <TableHead className="w-[150px] text-right">Value</TableHead>
                                    <TableHead className="w-[120px] text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <ScrollArea className="flex-1">
                                <Table>
                                    <TableBody>
                                        {filteredItems.length > 0 ? (
                                            filteredItems.map((item, idx) => (
                                                <TableRow key={idx} className="hover:bg-gray-50/50">
                                                    <TableCell className="font-medium">
                                                        {item.status === 'Completed' ? (
                                                            <div className="bg-green-100/50 rounded-full w-8 h-8 flex items-center justify-center">
                                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                            </div>
                                                        ) : (
                                                            <div className="bg-red-100/50 rounded-full w-8 h-8 flex items-center justify-center">
                                                                <AlertCircle className="w-5 h-5 text-red-600" />
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-gray-700">
                                                        {item.name}
                                                        {item.status === 'Pending' && (
                                                            <span className="block text-xs text-red-500 mt-1 font-normal">
                                                                * Compliance Required
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className="font-mono font-medium text-gray-900">
                                                            {formatValue(item.value, item.raw)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge
                                                            variant={item.status === 'Completed' ? "default" : "destructive"}
                                                            className={cn(
                                                                "capitalize shadow-none",
                                                                item.status === 'Completed' ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"
                                                            )}
                                                        >
                                                            {item.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                                    No items found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
