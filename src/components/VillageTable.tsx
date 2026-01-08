import { useStore } from '../lib/store';
import { getStatusBadge, formatPercent, formatValue, cn } from '../lib/utils';
import { useState, useMemo } from 'react';
import { Download, Search, Filter, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { VillageDetailModal } from './VillageDetailModal';
import type { Village } from '../lib/types';
import { PAGINATION, EXCEL_EXPORT } from '../lib/constants';

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
        stageFilter,
        setStageFilter,
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

    // Memoize filtered villages for performance
    const { filteredVillages, uniqueStages } = useMemo(() => {
        // Flatten villages
        const activeDistricts = selectedDistrict
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

        if (stageFilter) {
            villages = villages.filter(v => v.stage === stageFilter);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            villages = villages.filter(v =>
                v.name.toLowerCase().includes(q) ||
                v.districtName.toLowerCase().includes(q)
            );
        }

        // Get unique stages for filter
        const uniqueStages = Array.from(new Set(activeDistricts.flatMap(d => d.villages.map(v => v.stage))));
        uniqueStages.sort();

        return { filteredVillages: villages, uniqueStages };
    }, [districts, selectedDistrict, complianceType, statusFilter, stageFilter, searchQuery]);

    // Pagination
    const [page, setPage] = useState(1);
    const pageSize = PAGINATION.DEFAULT_PAGE_SIZE;
    const totalPages = Math.ceil(filteredVillages.length / pageSize);
    const paginatedVillages = filteredVillages.slice((page - 1) * pageSize, page * pageSize);

    // Dynamic Columns - memoized
    const itemColumns = useMemo(() => {
        const sampleVillage = filteredVillages[0];
        return sampleVillage
            ? (complianceType === '9(2)' ? sampleVillage.sec92_items : sampleVillage.sec13_items).map(i => i.name)
            : [];
    }, [filteredVillages, complianceType]);

    const handleExportCSV = () => {
        const exportData = filteredVillages.map(v => {
            const items = complianceType === '9(2)' ? v.sec92_items : v.sec13_items;
            const itemObj: Record<string, string> = {};
            items.forEach((item, idx) => {
                itemObj[`Item ${idx + 1}: ${item.name} `] = formatValue(item.value, item.raw);
            });

            return {
                District: v.districtName,
                Village: v.name,
                Stage: v.stage,
                'Head Surveyor': v.headSurveyor,
                'Government Surveyor': v.governmentSurveyor,
                'Assistant Director': v.assistantDirector,
                'Superintendent': v.superintendent,
                Status: complianceType === '9(2)' ? v.sec92_status : v.sec13_status,
                'Completion %': formatPercent(complianceType === '9(2)' ? v.sec92_percent : v.sec13_percent),
                'Overall %': formatPercent(v.overall_percent),
                ...itemObj
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: EXCEL_EXPORT.MIME_TYPE });
        saveAs(blob, `${EXCEL_EXPORT.DEFAULT_FILENAME_PREFIX}_${complianceType.replace(/[()]/g, '')}_${new Date().toISOString().split('T')[0]}.csv`);
    };

    return (
        <Card id="village-table" className="flex flex-col min-h-[500px] h-[700px] sm:h-[750px] md:h-[700px] max-h-[80vh] shadow-lg border-2 border-blue-100/50">
            <VillageDetailModal
                village={selectedVillage}
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                complianceType={complianceType}
            />

            {/* Toolbar */}
            <div className="p-3 sm:p-4 border-b-2 border-blue-100/30 flex flex-col gap-3 sm:gap-4 bg-gradient-to-r from-white via-blue-50/20 to-white">
                {/* Search - Full Width */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search villages..."
                        className="pl-10 h-9 sm:h-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3 w-full">
                    <Filter className="w-4 h-4 text-muted-foreground hidden md:block self-center" />

                    {/* District Filter */}
                    <Select
                        value={selectedDistrict || "all"}
                        onValueChange={(value: string) => setSelectedDistrict(value === "all" ? null : value)}
                    >
                        <SelectTrigger className="w-full sm:flex-1 md:w-[180px] h-9">
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
                        onValueChange={(value: string) => setStatusFilter(value as 'All' | 'Completed' | 'Pending')}
                    >
                        <SelectTrigger className="w-full sm:flex-1 md:w-[150px] h-9">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Status</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Stage Filter */}
                    <Select
                        value={stageFilter || "all"}
                        onValueChange={(val) => setStageFilter(val === "all" ? null : val)}
                    >
                        <SelectTrigger className="w-full sm:flex-1 md:w-[180px] h-9">
                            <SelectValue placeholder="All Stages" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Stages</SelectItem>
                            {uniqueStages.map(stage => (
                                <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Export Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportCSV}
                    className="w-full sm:w-auto gap-2 h-9"
                >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export CSV</span>
                    <span className="sm:hidden">Export</span>
                </Button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                <div className="min-w-[1200px]">
                    <Table>
                        <TableHeader className="bg-gradient-to-r from-blue-50 via-indigo-50/40 to-blue-50 sticky top-0 z-10 shadow-sm border-b-2">
                            <TableRow className="hover:bg-gray-50/50">
                                <TableHead className="w-[50px] font-semibold text-gray-700">Actions</TableHead>
                                <TableHead className="w-[200px] font-semibold text-gray-700">Village</TableHead>
                                <TableHead className="w-[120px] font-semibold text-gray-700">Stage</TableHead>
                                <TableHead className="w-[150px] font-semibold text-gray-700">Head Surveyor</TableHead>
                                <TableHead className="w-[120px] font-semibold text-gray-700">Status</TableHead>
                                <TableHead className="w-[100px] font-semibold text-gray-700">%</TableHead>
                                <TableHead className="w-[120px] font-semibold text-gray-700">Overall %</TableHead>
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
                                                className={cn(
                                                    "font-medium",
                                                    v.stage.toLowerCase().includes('13 published')
                                                        ? 'bg-green-100 text-green-700 border-green-300'
                                                        : v.stage.toLowerCase().includes('9(2)')
                                                            ? 'bg-blue-100 text-blue-700 border-blue-300'
                                                            : v.stage.toLowerCase().includes('above 90%')
                                                                ? 'bg-amber-100 text-amber-700 border-amber-300'
                                                                : 'bg-gray-100 text-gray-700 border-gray-300'
                                                )}
                                            >
                                                {v.stage}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-gray-700">
                                                {v.headSurveyor}
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
                                        <TableCell className="font-medium font-mono">
                                            <Badge
                                                variant="outline"
                                                className={cn("font-semibold", getStatusBadge(v.overall_percent))}
                                            >
                                                {formatPercent(v.overall_percent)}
                                            </Badge>
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
                                    <TableCell colSpan={7 + itemColumns.length} className="h-24 text-center text-muted-foreground">
                                        No villages found matching your filters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}
            <div className="p-3 sm:p-4 border-t flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
                <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                    <span className="hidden sm:inline">
                        Showing {Math.min(filteredVillages.length, (page - 1) * pageSize + 1)} to {Math.min(filteredVillages.length, page * pageSize)} of {filteredVillages.length} villages
                    </span>
                    <span className="sm:hidden">
                        {Math.min(filteredVillages.length, (page - 1) * pageSize + 1)}-{Math.min(filteredVillages.length, page * pageSize)} of {filteredVillages.length}
                    </span>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="h-9 min-w-[80px] sm:min-w-[100px]"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">Prev</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="h-9 min-w-[80px] sm:min-w-[100px]"
                    >
                        <span className="hidden sm:inline">Next</span>
                        <span className="sm:hidden">Next</span>
                        <ChevronRight className="h-4 w-4 ml-1 sm:ml-2" />
                    </Button>
                </div>
            </div>
        </Card>
    );
};
