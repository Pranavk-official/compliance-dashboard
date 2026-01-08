
import { useState } from 'react';
import { useStore } from '../lib/store';
import { formatPercent } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Activity,
    Building2,
    Home,
    AlertCircle,
    AlertTriangle
} from 'lucide-react';
import { CriticalVillagesModal } from './CriticalVillagesModal';

export const KPIGrid = () => {
    const { districts, selectedDistrict, complianceType } = useStore();
    const [showCriticalModal, setShowCriticalModal] = useState(false);

    // Compute Metrics based on selection
    const activeDistricts = selectedDistrict
        ? districts.filter(d => d.name === selectedDistrict)
        : districts;

    const totalDistricts = activeDistricts.length;
    const totalVillages = activeDistricts.reduce((acc, d) => acc + d.total_villages, 0);

    // Calc Average Compliance
    const totalComplianceSum = activeDistricts.reduce((acc, d) => {
        const villages = d.villages;
        const sumV = villages.reduce((s, v) => s + (complianceType === '9(2)' ? v.sec92_percent : v.sec13_percent), 0);
        return acc + sumV;
    }, 0);

    // Average across ALL villages
    const avgCompliance = totalVillages > 0 ? totalComplianceSum / totalVillages : 0;

    // Status Counts
    let completedVillages = 0;
    let criticalVillages = 0;
    activeDistricts.forEach(d => {
        d.villages.forEach(v => {
            const status = complianceType === '9(2)' ? v.sec92_status : v.sec13_status;
            if (status === 'Completed') completedVillages++;
            if (v.isCritical) criticalVillages++;
        });
    });
    const pendingVillages = totalVillages - completedVillages;

    return (
        <>
            <CriticalVillagesModal
                open={showCriticalModal}
                onClose={() => setShowCriticalModal(false)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
                {/* Total Districts / Scope */}
                <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 border-none shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 duration-300 min-h-[120px] sm:min-h-[140px]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                        <CardTitle className="text-xs sm:text-sm font-medium text-white/90">
                            Scope
                        </CardTitle>
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 pt-0">
                        <div className="text-2xl sm:text-3xl font-bold text-white">{selectedDistrict ? '1 District' : `${totalDistricts} Districts`}</div>
                        <p className="text-xs text-white/80 mt-1">
                            Covering {totalVillages} Villages
                        </p>
                    </CardContent>
                    <div className="absolute bottom-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 sm:-mr-16 -mb-12 sm:-mb-16"></div>
                </Card>

                {/* Average Compliance */}
                <Card className={`relative overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 duration-300 min-h-[120px] sm:min-h-[140px] ${avgCompliance >= 0.75 ? 'bg-gradient-to-br from-green-500 to-emerald-700' : avgCompliance >= 0.50 ? 'bg-gradient-to-br from-amber-500 to-orange-700' : 'bg-gradient-to-br from-red-500 to-rose-700'}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                        <CardTitle className="text-xs sm:text-sm font-medium text-white/90">
                            Avg Compliance
                        </CardTitle>
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 pt-0">
                        <div className="text-2xl sm:text-3xl font-bold text-white">
                            {formatPercent(avgCompliance)}
                        </div>
                        <p className="text-xs text-white/80 mt-1">
                            For Section {complianceType}
                        </p>
                    </CardContent>
                    <div className="absolute bottom-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 sm:-mr-16 -mb-12 sm:-mb-16"></div>
                </Card>

                {/* Completed Villages */}
                <Card className="relative overflow-hidden bg-gradient-to-br from-teal-500 to-cyan-700 border-none shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 duration-300 min-h-[120px] sm:min-h-[140px]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                        <CardTitle className="text-xs sm:text-sm font-medium text-white/90">
                            Completed Villages
                        </CardTitle>
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Home className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 pt-0">
                        <div className="text-2xl sm:text-3xl font-bold text-white">{completedVillages}</div>
                        <p className="text-xs text-white/80 mt-1">
                            {totalVillages > 0 ? formatPercent(completedVillages / totalVillages) : '0%'} of total
                        </p>
                    </CardContent>
                    <div className="absolute bottom-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 sm:-mr-16 -mb-12 sm:-mb-16"></div>
                </Card>

                {/* Pending Villages */}
                <Card
                    className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-700 border-none shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 duration-300 cursor-pointer min-h-[120px] sm:min-h-[140px]"
                    onClick={() => {
                        useStore.getState().setStatusFilter('Pending');
                        document.getElementById('village-table')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                        <CardTitle className="text-xs sm:text-sm font-medium text-white/90">
                            Pending Villages
                        </CardTitle>
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 pt-0">
                        <div className="text-2xl sm:text-3xl font-bold text-white">{pendingVillages}</div>
                        <p className="text-xs text-white/80 mt-1">
                            Requires Attention<span className="hidden sm:inline"> (Click to view)</span>
                        </p>
                    </CardContent>
                    <div className="absolute bottom-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 sm:-mr-16 -mb-12 sm:-mb-16"></div>
                </Card>

                {/* Critical Villages */}
                <Card
                    className="relative overflow-hidden bg-gradient-to-br from-red-500 to-rose-700 border-none shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 duration-300 cursor-pointer min-h-[120px] sm:min-h-[140px]"
                    onClick={() => setShowCriticalModal(true)}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                        <CardTitle className="text-xs sm:text-sm font-medium text-white/90">
                            Critical Villages
                        </CardTitle>
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 pt-0">
                        <div className="text-2xl sm:text-3xl font-bold text-white">{criticalVillages}</div>
                        <p className="text-xs text-white/80 mt-1">
                            9(2) Published ≥90 days<span className="hidden sm:inline"> (Click to view)</span>
                        </p>
                    </CardContent>
                    <div className="absolute bottom-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 sm:-mr-16 -mb-12 sm:-mb-16"></div>
                </Card>
            </div>
        </>
    );
};
