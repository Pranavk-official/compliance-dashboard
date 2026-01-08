import { useState } from 'react';
import { useStore } from '../lib/store';
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
import { AlertTriangle, MapPin, Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CriticalVillage {
    name: string;
    district: string;
    headSurveyor: string;
    daysPassedAfter92: number;
    publishedDate: string | null;
    originalVillage: Village;
}

interface CriticalVillagesModalProps {
    open: boolean;
    onClose: () => void;
}

export const CriticalVillagesModal = ({ open, onClose }: CriticalVillagesModalProps) => {
    const { districts } = useStore();

    // Get all critical villages
    const criticalVillages: CriticalVillage[] = [];
    districts.forEach(d => {
        d.villages.forEach(v => {
            if (v.isCritical) {
                criticalVillages.push({
                    name: v.name,
                    district: d.name,
                    headSurveyor: v.headSurveyor,
                    daysPassedAfter92: v.daysPassedAfter92!,
                    publishedDate: v.publishedDate,
                    originalVillage: v
                });
            }
        });
    });

    // Sort by days passed (descending - most critical first)
    criticalVillages.sort((a, b) => b.daysPassedAfter92 - a.daysPassedAfter92);

    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
    const { complianceType } = useStore();

    const totalPages = Math.ceil(criticalVillages.length / ITEMS_PER_PAGE);
    const paginatedVillages = criticalVillages.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePrevious = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNext = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
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

                    {/* Summary */}
                    <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-lg shrink-0">

                        <div className="flex-1">
                            <div className="text-3xl font-bold text-red-700">{criticalVillages.length}</div>
                            <div className="text-sm text-red-600">Total Critical Villages</div>
                        </div>
                        <div className="text-sm text-red-600">
                            Page {currentPage} of {Math.max(totalPages, 1)}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto border rounded-lg">
                        <Table>
                            <TableHeader className="bg-gray-50 sticky top-0 z-10">
                                <TableRow>
                                    <TableHead className="w-[50px]">#</TableHead>
                                    <TableHead className="min-w-[200px]">Village</TableHead>
                                    <TableHead className="min-w-[150px]">District</TableHead>
                                    <TableHead className="min-w-[180px]">Head Surveyor</TableHead>
                                    <TableHead className="min-w-[120px]">Published Date</TableHead>
                                    <TableHead className="min-w-[120px]">Days Passed</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {criticalVillages.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
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
                                onClick={handlePrevious}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <div className="text-sm text-gray-600">
                                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, criticalVillages.length)} of {criticalVillages.length}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNext}
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
