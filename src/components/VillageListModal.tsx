import { useState, useMemo } from 'react';
import { VillageDetailModal } from './VillageDetailModal';
import type { Village } from '../lib/types';
import { Button } from '@/components/ui/button';
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
import { MapPin, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatPercent } from '../lib/utils';

interface VillageListModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    villages: Village[];
    icon?: React.ReactNode;
    colorScheme?: 'blue' | 'green' | 'red' | 'orange' | 'purple';
    complianceType?: '9(2)' | '13';
}

type SortKey = 'name' | 'district' | 'headSurveyor' | 'completion';
type SortDirection = 'asc' | 'desc';

export const VillageListModal = ({
    open,
    onClose,
    title,
    description,
    villages,
    icon,
    colorScheme = 'blue',
    complianceType = '9(2)'
}: VillageListModalProps) => {
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
        key: 'name',
        direction: 'asc'
    });

    // Filter and Sort
    const filteredVillages = useMemo(() => {
        let result = [...villages];

        // Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(v =>
                v.name.toLowerCase().includes(lowerTerm) ||
                v.district?.toLowerCase().includes(lowerTerm) ||
                v.headSurveyor?.toLowerCase().includes(lowerTerm)
            );
        }

        // Sort by configured key
        result.sort((a, b) => {
            let valA: string | number = '';
            let valB: string | number = '';

            switch (sortConfig.key) {
                case 'name':
                    valA = a.name;
                    valB = b.name;
                    break;
                case 'district':
                    valA = a.district || '';
                    valB = b.district || '';
                    break;
                case 'headSurveyor':
                    valA = a.headSurveyor || '';
                    valB = b.headSurveyor || '';
                    break;
                case 'completion':
                    valA = a.overall_percent;
                    valB = b.overall_percent;
                    break;
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
    }, [villages, searchTerm, sortConfig]);

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

    const totalPages = Math.ceil(filteredVillages.length / ITEMS_PER_PAGE);
    const paginatedVillages = filteredVillages.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePrevious = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const handleNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

    // Color classes map
    const colorClasses = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', iconBg: 'bg-blue-100', iconText: 'text-blue-600' },
        green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', iconBg: 'bg-green-100', iconText: 'text-green-600' },
        red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', iconBg: 'bg-red-100', iconText: 'text-red-600' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', iconBg: 'bg-orange-100', iconText: 'text-orange-600' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', iconBg: 'bg-purple-100', iconText: 'text-purple-600' },
    }[colorScheme];

    return (
        <>
            <VillageDetailModal
                village={selectedVillage}
                open={!!selectedVillage}
                onClose={() => setSelectedVillage(null)}
                // Just pass a default or let it be handled, detail modal needs logic update if type is important
                complianceType={complianceType}
            />
            <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
                <DialogContent className="max-w-4xl sm:max-w-5xl lg:max-w-6xl max-h-[80vh] flex flex-col">
                    {/* Header */}
                    <DialogHeader className="shrink-0">
                        <div className="flex items-center gap-4">
                            {icon && (
                                <div className={`h-12 w-12 rounded-full ${colorClasses.iconBg} flex items-center justify-center shrink-0`}>
                                    {icon}
                                </div>
                            )}
                            <div className="flex-1">
                                <DialogTitle className="text-2xl font-bold text-gray-900">
                                    {title}
                                </DialogTitle>
                                {description && (
                                    <DialogDescription className="text-base mt-1">
                                        {description}
                                    </DialogDescription>
                                )}
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Toolbar */}
                    <div className="p-4 bg-gray-50 border-b flex flex-wrap items-center justify-between gap-4 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-4 px-4 py-2 ${colorClasses.bg} border ${colorClasses.border} rounded-lg`}>
                                <div className="flex flex-col">
                                    <span className={`text-2xl font-bold ${colorClasses.text} leading-none`}>{villages.length}</span>
                                    <span className={`text-xs ${colorClasses.text} font-medium opacity-80`}>Total Villages</span>
                                </div>
                            </div>
                            {searchTerm && (
                                <div className="hidden sm:block text-sm text-gray-700">
                                    Showing <span className="font-medium">{filteredVillages.length}</span> result(s)
                                </div>
                            )}
                        </div>

                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search villages..."
                                className="pl-9 bg-white"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto border rounded-lg">
                        <Table>
                            <TableHeader className="bg-gray-50 sticky top-0 z-10">
                                <TableRow>
                                    <TableHead className="w-[60px] text-center">#</TableHead>

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

                                    <TableHead
                                        className="min-w-[160px] cursor-pointer hover:bg-gray-100 group/head"
                                        onClick={() => handleSort('headSurveyor')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Head Surveyor <SortIcon columnKey="headSurveyor" />
                                        </div>
                                    </TableHead>

                                    <TableHead className="min-w-[120px]">Status</TableHead>

                                    <TableHead
                                        className="min-w-[120px] cursor-pointer hover:bg-gray-100 group/head text-right"
                                        onClick={() => handleSort('completion')}
                                    >
                                        <div className="flex items-center justify-end gap-2">
                                            Completion <SortIcon columnKey="completion" />
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedVillages.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="p-3 bg-gray-100 rounded-full">
                                                    <Search className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <p>No villages found matching your criteria</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedVillages.map((village, index) => (
                                        <TableRow key={`${village.district}-${village.name}`} className="hover:bg-gray-50">
                                            <TableCell className="text-center font-medium text-muted-foreground">
                                                {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="link"
                                                    className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-800 text-base"
                                                    onClick={() => setSelectedVillage(village)}
                                                >
                                                    {village.name}
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-gray-700">
                                                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                                    <span className="font-medium">{village.district}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-gray-600">{village.headSurveyor || '-'}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-white">
                                                    {village.stage}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className={`font-bold ${village.overall_percent >= 0.9 ? 'text-green-600' :
                                                    village.overall_percent >= 0.5 ? 'text-blue-600' :
                                                        'text-orange-600'
                                                    }`}>
                                                    {formatPercent(village.overall_percent)}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t bg-white flex items-center justify-between shrink-0">
                            <span className="text-sm text-gray-500 hidden sm:inline-block">
                                Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredVillages.length)}</span> of <span className="font-medium">{filteredVillages.length}</span> results
                            </span>
                            <div className="flex items-center gap-2 ml-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrevious}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNext}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
