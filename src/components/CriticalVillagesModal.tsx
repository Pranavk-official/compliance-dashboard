import { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import { VillageDetailModal } from './VillageDetailModal';
import type { Village } from '../lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { AlertTriangle, MapPin, Calendar, Clock, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CriticalVillage {
    name: string;
    district: string;
    headSurveyor: string;
    daysPassedAfter92: number;
    month: string;
    timeDisplay: string; // New field for formatted display (e.g., "13.5 M" or "1.2 Y")
    publishedDate: string | null;
    originalVillage: Village;
}

interface CriticalVillagesModalProps {
    open: boolean;
    onClose: () => void;
}

type SortKey = 'name' | 'district' | 'daysPassedAfter92' | 'month';
type SortDirection = 'asc' | 'desc';

/**
 * Format time period to display years when months > 12, otherwise months
 * @param days - Number of days passed
 * @returns Formatted string like "1.2 Y" or "13.5 M"
 */
const formatTimePeriod = (days: number): string => {
    const months = days / 30;

    if (months > 12) {
        const years = months / 12;
        return `${years.toFixed(1)} Y`;
    }

    return `${months.toFixed(1)} M`;
};

export const CriticalVillagesModal = ({ open, onClose }: CriticalVillagesModalProps) => {
    const { districts } = useStore();
    const [filterText, setFilterText] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
        key: 'daysPassedAfter92',
        direction: 'desc'
    });

    const { complianceType } = useStore();

    // 1. Get Base Data
    const rawCriticalVillages = useMemo(() => {
        const list: CriticalVillage[] = [];
        districts.forEach(d => {
            d.villages.forEach(v => {
                if (v.isCritical) {
                    list.push({
                        name: v.name,
                        district: d.name,
                        headSurveyor: v.headSurveyor,
                        daysPassedAfter92: v.daysPassedAfter92!,
                        month: (v.daysPassedAfter92! / 30).toFixed(1),
                        timeDisplay: formatTimePeriod(v.daysPassedAfter92!),
                        publishedDate: v.publishedDate,
                        originalVillage: v
                    });
                }
            });
        });
        return list;
    }, [districts]);

    // 2. Filter & Sort
    const processedVillages = useMemo(() => {
        let result = [...rawCriticalVillages];

        // Filter
        if (filterText) {
            const searchLower = filterText.toLowerCase();
            result = result.filter(v =>
                v.name.toLowerCase().includes(searchLower) ||
                v.district.toLowerCase().includes(searchLower) ||
                v.headSurveyor.toLowerCase().includes(searchLower)
            );
        }

        // Sort
        result.sort((a, b) => {
            let valA: string | number = a[sortConfig.key];
            let valB: string | number = b[sortConfig.key];

            // Handle numeric sort for month string
            if (sortConfig.key === 'month') {
                valA = parseFloat(a.month);
                valB = parseFloat(b.month);
            }

            // Handle string vs number comparison
            if (typeof valA === 'string' && typeof valB === 'string') {
                return sortConfig.direction === 'asc'
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            } else {
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            }
        });

        return result;
    }, [rawCriticalVillages, filterText, sortConfig]);

    // 3. Pagination
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);

    const totalPages = Math.ceil(processedVillages.length / ITEMS_PER_PAGE);

    // Reset page on filter change
    useMemo(() => {
        setCurrentPage(1);
    }, [filterText]);

    const paginatedVillages = processedVillages.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleSort = (key: SortKey) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400 opacity-0 group-hover/head:opacity-100 transition-opacity" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp className="h-4 w-4 ml-1 text-blue-600" />
            : <ArrowDown className="h-4 w-4 ml-1 text-blue-600" />;
    };

    return (
        <>
            <VillageDetailModal
                village={selectedVillage}
                open={!!selectedVillage}
                onClose={() => setSelectedVillage(null)}
                complianceType={complianceType}
            />
            <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
                <DialogContent className="max-w-4xl sm:max-w-5xl lg:max-w-6xl max-h-[80vh] flex flex-col">
                    {/* Header */}
                    <DialogHeader className="shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-bold text-gray-900">
                                    Critical Villages
                                </DialogTitle>
                                <DialogDescription className="text-base mt-1">
                                    Villages with 9(2) published for 90+ days
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Actions - Integrated into summary area for cleaner old-style look */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-lg shrink-0">
                        <div className="flex-1 flex items-center gap-4 w-full">
                            <div>
                                <div className="text-3xl font-bold text-red-700">{rawCriticalVillages.length}</div>
                                <div className="text-sm text-red-600">Total Critical</div>
                            </div>
                            <div className="h-8 w-px bg-red-200"></div>
                            <div className="hidden sm:block text-sm text-red-700">
                                Showing {processedVillages.length} result(s)
                            </div>
                        </div>

                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-red-400" />
                            <Input
                                placeholder="Search..."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                className="pl-9 bg-white border-red-200 focus-visible:ring-red-500"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto border rounded-lg">
                        <Table>
                            <TableHeader className="bg-gray-50 sticky top-0 z-10">
                                <TableRow>
                                    <TableHead className="w-[50px]">#</TableHead>

                                    <TableHead
                                        className="min-w-[180px] cursor-pointer hover:bg-gray-100 group/head"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Village <SortIcon columnKey="name" />
                                        </div>
                                    </TableHead>

                                    <TableHead
                                        className="min-w-[140px] cursor-pointer hover:bg-gray-100 group/head"
                                        onClick={() => handleSort('district')}
                                    >
                                        <div className="flex items-center gap-2">
                                            District <SortIcon columnKey="district" />
                                        </div>
                                    </TableHead>

                                    <TableHead className="min-w-[160px]">Head Surveyor</TableHead>
                                    <TableHead className="min-w-[120px]">Published</TableHead>

                                    <TableHead
                                        className="min-w-[120px] cursor-pointer hover:bg-gray-100 group/head"
                                        onClick={() => handleSort('daysPassedAfter92')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Days <SortIcon columnKey="daysPassedAfter92" />
                                        </div>
                                    </TableHead>

                                    <TableHead
                                        className="min-w-[100px] cursor-pointer hover:bg-gray-100 group/head"
                                        onClick={() => handleSort('month')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Period <SortIcon columnKey="month" />
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {processedVillages.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <AlertTriangle className="h-8 w-8 text-green-500" />
                                                <div>No critical villages found</div>
                                                <div className="text-xs">All villages are within acceptable timeline</div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedVillages.map((village, index) => (
                                        <TableRow key={`${village.district}-${village.name}`} className="hover:bg-gray-50">
                                            <TableCell className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="link"
                                                    className="p-0 h-auto font-medium text-blue-600 hover:text-blue-800"
                                                    onClick={() => setSelectedVillage(village.originalVillage)}
                                                >
                                                    {village.name}
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{village.district}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-gray-700">
                                                    {village.headSurveyor}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {village.publishedDate ? (
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Calendar className="h-4 w-4" />
                                                        <span className="font-mono text-sm">{village.publishedDate}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`font-semibold ${village.daysPassedAfter92 >= 180
                                                        ? 'bg-red-100 text-red-700 border-red-300'
                                                        : village.daysPassedAfter92 >= 120
                                                            ? 'bg-orange-100 text-orange-700 border-orange-300'
                                                            : 'bg-amber-100 text-amber-700 border-amber-300'
                                                        }`}
                                                >
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {village.daysPassedAfter92} days
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-mono font-medium text-gray-700">
                                                    {village.timeDisplay}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t shrink-0">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <div className="text-sm text-gray-600">
                                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, processedVillages.length)} of {processedVillages.length}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog >
        </>
    );
};
