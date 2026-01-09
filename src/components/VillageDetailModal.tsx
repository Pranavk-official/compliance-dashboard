import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import type { Village, ComplianceItem } from '../lib/types';
import { getStatusBadge, formatPercent, cn } from '../lib/utils';
import { CheckCircle2, XCircle, TrendingUp, MapPin, Calendar, Clock } from 'lucide-react';

// --- Sub-components ---

const VillageHeader = ({ village, districtName, status, percent }: { village: Village, districtName: string, status: string, percent: number }) => {
    const isCritical = village.isCritical;
    const is92Published = village.stage === '9(2) Published';

    return (
        <DrawerHeader className={cn(
            "px-4 sm:px-6 pt-6 pb-2 border-b text-left shrink-0",
        )}>
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <DrawerTitle className="text-xl sm:text-2xl font-bold text-gray-900">
                                {village.name}
                            </DrawerTitle>
                            {isCritical && (
                                <Badge variant="destructive" className="animate-pulse shrink-0">
                                    CRITICAL
                                </Badge>
                            )}
                        </div>
                        <Badge
                            variant="outline"
                            className={cn(
                                "px-3 py-1 text-sm font-semibold shrink-0",
                                getStatusBadge(percent)
                            )}
                        >
                            {status}
                        </Badge>
                    </div>


                </div>

                <DrawerDescription className="space-y-4">
                    {/* Location & Stage */}
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm sm:text-base">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-700">{districtName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-gray-500">Stage:</span>
                            <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                {village.stage}
                            </span>
                        </div>
                        {is92Published && village.publishedDate && (
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700">Published: <span className="font-medium">{village.publishedDate}</span></span>
                            </div>
                        )}
                        {is92Published && village.daysPassedAfter92 !== null && (
                            <div className={cn(
                                "flex items-center gap-1.5 px-2 py-0.5 rounded border",
                                isCritical
                                    ? "bg-red-100 text-red-700 border-red-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                            )}>
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">{village.daysPassedAfter92} Days Passed</span>
                            </div>
                        )}
                    </div>

                    {/* Officials Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm bg-white/50 p-3 rounded-lg border border-black/5">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Head Surveyor</span>
                            <span className="font-medium text-gray-900 truncate">{village.headSurveyor}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Gov. Surveyor</span>
                            <span className="font-medium text-gray-900 truncate">{village.governmentSurveyor}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Assistant Director</span>
                            <span className="font-medium text-gray-900 truncate">{village.assistantDirector}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Superintendent</span>
                            <span className="font-medium text-gray-900 truncate">{village.superintendent}</span>
                        </div>
                    </div>
                </DrawerDescription>
            </div>
        </DrawerHeader>
    );
};

const VillageStats = ({ village, percent, completedCount, totalCount, complianceType }: { village: Village, percent: number, completedCount: number, totalCount: number, complianceType: string }) => {
    return (
        <div className="px-4 sm:px-6 py-4 bg-white border-b shrink-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="flex flex-col items-center p-3 sm:p-4 bg-linear-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100 shadow-sm">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mb-1 sm:mb-2" />
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">
                        {formatPercent(village.overall_percent)}
                    </div>
                    <div className="text-[10px] sm:text-xs font-medium text-gray-600 mt-1 uppercase tracking-wide">Overall</div>
                </div>
                <div className="flex flex-col items-center p-3 sm:p-4 bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mb-1 sm:mb-2" />
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">
                        {formatPercent(percent)}
                    </div>
                    <div className="text-[10px] sm:text-xs font-medium text-gray-600 mt-1 uppercase tracking-wide">Section {complianceType}</div>
                </div>
                <div className="flex flex-col items-center p-3 sm:p-4 bg-linear-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mb-1 sm:mb-2" />
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">
                        {completedCount}
                    </div>
                    <div className="text-[10px] sm:text-xs font-medium text-gray-600 mt-1 uppercase tracking-wide">Completed</div>
                </div>
                <div className="flex flex-col items-center p-3 sm:p-4 bg-linear-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200 shadow-sm">
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mb-1 sm:mb-2" />
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">
                        {totalCount - completedCount}
                    </div>
                    <div className="text-[10px] sm:text-xs font-medium text-gray-600 mt-1 uppercase tracking-wide">Pending</div>
                </div>
            </div>
        </div>
    );
};

const ComplianceItemList = ({ items, complianceType }: { items: ComplianceItem[], complianceType: string }) => {
    return (
        <div className="flex flex-col bg-gray-50/50">
            <div className="px-4 sm:px-6 py-3 bg-gray-100/50 border-b flex items-center justify-between shrink-0">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Section {complianceType} Compliance Items
                </h3>
                <span className="text-[10px] sm:text-xs text-muted-foreground">{items.length} Items</span>
            </div>
            <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {items.map((item, index) => {
                        const isCompleted = item.status === 'Completed';
                        const percentValue = Math.round(item.value * 100);

                        return (
                            <div
                                key={item.id || index}
                                className={cn(
                                    "p-3 sm:p-4 rounded-xl border transition-all hover:shadow-md bg-white",
                                    isCompleted
                                        ? "border-green-100 hover:border-green-300"
                                        : "border-red-100 hover:border-red-300"
                                )}
                            >
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div
                                        className={cn(
                                            "shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm",
                                            isCompleted ? "bg-green-100" : "bg-red-100"
                                        )}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                                        ) : (
                                            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h4 className="font-medium text-gray-900 text-sm leading-snug">
                                                {item.name}
                                            </h4>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "shrink-0 font-semibold text-[10px] uppercase tracking-wide",
                                                    isCompleted
                                                        ? "bg-green-50 text-green-700 border-green-200"
                                                        : "bg-red-50 text-red-700 border-red-200"
                                                )}
                                            >
                                                {item.status}
                                            </Badge>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-[10px] sm:text-xs text-gray-500">Progress</span>
                                                    <span className="text-[10px] sm:text-xs font-semibold text-gray-700">
                                                        {percentValue}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-1.5 sm:h-2 overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-500",
                                                            isCompleted
                                                                ? "bg-linear-to-r from-green-500 to-emerald-500"
                                                                : "bg-linear-to-r from-red-400 to-orange-400"
                                                        )}
                                                        style={{ width: `${percentValue}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {item.raw !== undefined && (
                                                <div className="flex items-center gap-2 text-[10px] sm:text-xs bg-gray-50 p-1.5 sm:p-2 rounded border border-gray-100 w-fit">
                                                    <span className="text-gray-500 font-medium">Recorded Value:</span>
                                                    <span className="font-mono font-medium text-gray-900">{item.raw}</span>
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
        </div>
    );
}

// --- Main Component ---

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
        <Drawer open={open} onOpenChange={onClose}>
            <DrawerContent className={cn(
                "flex max-h-[90vh] flex-col", // Use max-height but allow flex to work naturally
                village.isCritical ? "border-t-4 border-red-500" : ""
            )}>
                <div className="overflow-y-auto w-full"> {/* Wrap content in scrollable div if needed, or let vaul handle it */}
                    <VillageHeader
                        village={village}
                        districtName={districtName}
                        status={status}
                        percent={percent}
                    />

                    <VillageStats
                        village={village}
                        percent={percent}
                        completedCount={completedCount}
                        totalCount={totalCount}
                        complianceType={complianceType}
                    />

                    <ComplianceItemList
                        items={items}
                        complianceType={complianceType}
                    />
                </div>
            </DrawerContent>
        </Drawer>
    );
};
