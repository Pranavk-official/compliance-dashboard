import { useStore } from '../lib/store';
import { getStatusBadge, formatPercent, formatValue, cn } from '../lib/utils';
import { useState } from 'react';
import { Download, Search, Filter, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { VillageDetailModal } from './VillageDetailModal';
import type { Village } from '../lib/types';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export const VillageTable = () => {
    const {
        districts,
        selectedDistrict,
        setSelectedDistrict,
        complianceType,
        statusFilter,
        setStatusFilter,
        searchQuery,
        setSearchQuery
    } = useStore();

    // State for Modal
    const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (village: Village) => {
        setSelectedVillage(village);
        setIsModalOpen(true);
    };

    // Flatten villages
    let activeDistricts = selectedDistrict
        ? districts.filter(d => d.name === selectedDistrict)
        : districts;

    let villages = activeDistricts.flatMap(d => d.villages.map(v => ({ ...v, districtName: d.name })));

    // Apply filters
    if (statusFilter !== 'All') {
        villages = villages.filter(v => {
            const status = complianceType === '9(2)' ? v.sec92_status : v.sec13_status;
            return status === statusFilter;
        });
    }

    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        villages = villages.filter(v =>
            v.name.toLowerCase().includes(q) ||
            v.districtName.toLowerCase().includes(q)
        );
    }

    // Pagination (Simple)
    const [page, setPage] = useState(1);
    const pageSize = 50;
    const totalPages = Math.ceil(villages.length / pageSize);
    const paginatedVillages = villages.slice((page - 1) * pageSize, page * pageSize);

    // Dynamic Columns
    const sampleVillage = villages[0];
    const itemColumns = sampleVillage
        ? (complianceType === '9(2)' ? sampleVillage.sec92_items : sampleVillage.sec13_items).map(i => i.name)
        : [];

    const handleExportCSV = () => {
        const exportData = villages.map(v => {
            const items = complianceType === '9(2)' ? v.sec92_items : v.sec13_items;
            const itemObj: any = {};
            items.forEach((item, idx) => {
                itemObj[`Item ${idx + 1}: ${item.name} `] = formatValue(item.value, item.raw);
            });

            return {
                District: v.districtName,
                Village: v.name,
                Status: complianceType === '9(2)' ? v.sec92_status : v.sec13_status,
                'Completion %': formatPercent(complianceType === '9(2)' ? v.sec92_percent : v.sec13_percent),
                ...itemObj
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `compliance_${complianceType.replace(/[()]/g, '')}_${new Date().toISOString().split('T')[0]}.csv`);
    };

    return (
        <Card id="village-table" className="flex flex-col h-[700px] shadow-lg border-2 border-blue-100/50">
            <VillageDetailModal
                village={selectedVillage}
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                complianceType={complianceType}
            />

            {/* Toolbar */}
            <div className="p-4 border-b-2 border-blue-100/30 flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-white via-blue-50/20 to-white">
                <div className="flex flex-col md:flex-row items-center gap-4 flex-1 w-full">
                    {/* Search */}
                    <div className="relative flex-1 max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search villages..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter className="w-4 h-4 text-muted-foreground hidden md:block" />

                        {/* District Filter */}
                        <Select
                            value={selectedDistrict || "all"}
                            onValueChange={(val) => setSelectedDistrict(val === "all" ? null : val)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Districts" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Districts</SelectItem>
                                {districts.map(d => (
                                    <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Status Filter */}
                        <Select
                            value={statusFilter}
                            onValueChange={(val) => setStatusFilter(val as any)}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Status</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button
                    variant="outline"
                    onClick={handleExportCSV}
                    className="w-full md:w-auto gap-2"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </Button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                <Table>
                    <TableHeader className="bg-gradient-to-r from-blue-50 via-indigo-50/40 to-blue-50 sticky top-0 z-10 shadow-sm border-b-2">
                        <TableRow className="hover:bg-gray-50/50">
                            <TableHead className="w-[50px] font-semibold text-gray-700">Actions</TableHead>
                            <TableHead className="w-[200px] font-semibold text-gray-700">Village</TableHead>
                            <TableHead className="w-[120px] font-semibold text-gray-700">Status</TableHead>
                            <TableHead className="w-[100px] font-semibold text-gray-700">%</TableHead>
                            {/* Dynamic Columns */}
                            {itemColumns.map((col, idx) => (
                                <TableHead key={idx} className="min-w-[200px] font-semibold text-gray-700">
                                    <div className="truncate max-w-[180px]" title={col}>
                                        {col}
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedVillages.map((v, i) => {
                            const percent = complianceType === '9(2)' ? v.sec92_percent : v.sec13_percent;
                            const status = complianceType === '9(2)' ? v.sec92_status : v.sec13_status;
                            const items = complianceType === '9(2)' ? v.sec92_items : v.sec13_items;

                            return (
                                <TableRow key={v.id + i} className="hover:bg-muted/30 transition-colors">
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openModal(v)}
                                            title="View Details"
                                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div>
                                            {v.name}
                                            <div className="text-xs text-muted-foreground font-normal">{v.districtName}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={cn("font-medium", getStatusBadge(percent))}
                                        >
                                            {status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium font-mono">
                                        {formatPercent(percent)}
                                    </TableCell>
                                    {items.map((item, idx) => (
                                        <TableCell key={idx}>
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full shrink-0",
                                                    item.status === 'Completed' ? "bg-green-500" : "bg-red-400"
                                                )} />
                                                <span className="text-xs text-muted-foreground truncate max-w-[150px]" title={String(item.raw)}>
                                                    {formatValue(item.value, item.raw)}
                                                </span>
                                            </div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            )
                        })}
                        {paginatedVillages.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4 + itemColumns.length} className="h-24 text-center text-muted-foreground">
                                    No villages found matching your filters.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Showing {Math.min(villages.length, (page - 1) * pageSize + 1)} to {Math.min(villages.length, page * pageSize)} of {villages.length} villages
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </div>
        </Card>
    );
};
