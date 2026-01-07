import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { Village } from '../lib/types';
import { getStatusBadge, formatPercent, cn } from '../lib/utils';
import { CheckCircle2, XCircle, TrendingUp, MapPin } from 'lucide-react';

interface VillageDetailModalProps {
    village: Village | null;
    open: boolean;
    onClose: () => void;
    complianceType: '9(2)' | '13';
}

export const VillageDetailModal = ({
    village,
    open,
    onClose,
    complianceType,
}: VillageDetailModalProps) => {
    if (!village) return null;

    // Cast to include districtName which is added by VillageTable
    const villageWithDistrict = village as Village & { districtName?: string };
    const districtName = villageWithDistrict.districtName || village.district;

    const items = complianceType === '9(2)' ? village.sec92_items : village.sec13_items;
    const percent = complianceType === '9(2)' ? village.sec92_percent : village.sec13_percent;
    const status = complianceType === '9(2)' ? village.sec92_status : village.sec13_status;
    const completedCount = complianceType === '9(2)' ? village.sec92_completed_count : village.sec13_completed_count;
    const totalCount = complianceType === '9(2)' ? village.sec92_total_count : village.sec13_total_count;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] p-0 gap-0 flex flex-col">
                {/* Header Section */}
                <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-blue-50 via-indigo-50/40 to-blue-50 border-b-2 rounded-t-lg border-blue-100 shrink-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                                {village.name}
                            </DialogTitle>
                            <DialogDescription className="flex items-center gap-2 text-base">
                                <MapPin className="w-4 h-4" />
                                <span className="font-medium text-gray-700">{districtName}</span>
                            </DialogDescription>
                        </div>
                        <Badge
                            variant="outline"
                            className={cn(
                                "px-4 py-2 text-sm font-semibold shrink-0",
                                getStatusBadge(percent)
                            )}
                        >
                            {status}
                        </Badge>
                    </div>
                </DialogHeader>

                {/* Stats Overview */}
                <div className="px-6 py-4 bg-white border-b shrink-0">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                            <TrendingUp className="w-5 h-5 text-blue-600 mb-2" />
                            <div className="text-2xl font-bold text-gray-900">
                                {formatPercent(percent)}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">Overall Completion</div>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mb-2" />
                            <div className="text-2xl font-bold text-gray-900">
                                {completedCount}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">Completed</div>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg border border-gray-200">
                            <XCircle className="w-5 h-5 text-gray-600 mb-2" />
                            <div className="text-2xl font-bold text-gray-900">
                                {totalCount - completedCount}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">Pending</div>
                        </div>
                    </div>
                </div>

                {/* Items List - Scrollable Area */}
                <div className="flex-1 p-2">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase text-center">
                        Section {complianceType} Compliance Items
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="space-y-3">
                        {items.map((item, index) => {
                            const isCompleted = item.status === 'Completed';
                            const percentValue = Math.round(item.value * 100);

                            return (
                                <div
                                    key={item.id || index}
                                    className={cn(
                                        "p-4 rounded-lg border-2 transition-all hover:shadow-md",
                                        isCompleted
                                            ? "bg-green-50/50 border-green-200 hover:bg-green-50"
                                            : "bg-red-50/50 border-red-200 hover:bg-red-50"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={cn(
                                                "shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5",
                                                isCompleted ? "bg-green-500" : "bg-red-400"
                                            )}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle2 className="w-4 h-4 text-white" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-white" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h4 className="font-medium text-gray-900 text-sm leading-tight">
                                                    {item.name}
                                                </h4>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "shrink-0 font-semibold",
                                                        isCompleted
                                                            ? "bg-green-100 text-green-700 border-green-300"
                                                            : "bg-red-100 text-red-700 border-red-300"
                                                    )}
                                                >
                                                    {item.status}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs text-gray-600">Progress</span>
                                                        <span className="text-xs font-semibold text-gray-700">
                                                            {percentValue}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className={cn(
                                                                "h-full rounded-full transition-all",
                                                                isCompleted
                                                                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                                                    : "bg-gradient-to-r from-red-400 to-orange-400"
                                                            )}
                                                            style={{ width: `${percentValue}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {item.raw !== undefined && (
                                                    <div className="text-xs text-gray-600 bg-white px-3 py-1 rounded border border-gray-200">
                                                        <span className="font-medium">Value:</span>{' '}
                                                        <span className="font-mono">{item.raw}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                {/* <Separator />
                <div className="px-6 py-4 bg-gray-50 flex items-center justify-between shrink-0">
                    <div className="text-sm text-gray-600">
                        <span className="font-medium">{completedCount}</span> of{' '}
                        <span className="font-medium">{totalCount}</span> items completed
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-500">Overall Progress:</div>
                        <div className="font-bold text-lg text-gray-900">
                            {formatPercent(percent)}
                        </div>
                    </div>
                </div> */}
            </DialogContent>
        </Dialog>
    );
};
