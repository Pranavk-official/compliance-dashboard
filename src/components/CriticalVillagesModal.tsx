import { useStore } from '../lib/store';
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
                    publishedDate: v.publishedDate
                });
            }
        });
    });

    // Sort by days passed (descending - most critical first)
    criticalVillages.sort((a, b) => b.daysPassedAfter92 - a.daysPassedAfter92);

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
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
                        <div className="text-sm text-red-600">Critical Villages</div>
                    </div>
                    <div className="text-sm text-red-600">
                        Immediate action required
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
                                criticalVillages.map((village, index) => (
                                    <TableRow key={`${village.district}-${village.name}`} className="hover:bg-gray-50">
                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="font-medium">{village.name}</div>
                                            </div>
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
            </DialogContent>
        </Dialog>
    );
};
