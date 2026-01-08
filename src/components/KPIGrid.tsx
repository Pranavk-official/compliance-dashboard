import { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import { formatPercent } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Activity,
    Home,
    AlertCircle,
    AlertTriangle,
    FileCheck,
    type LucideIcon
} from 'lucide-react';
import { CriticalVillagesModal } from './CriticalVillagesModal';

// --- Reusable Card Component ---
interface StatCardProps {
    title: string;
    value: string | number;
    subtext: React.ReactNode;
    icon: LucideIcon;
    gradient: string;
    onClick?: () => void;
    largeIcon?: boolean;
}

const StatCard = ({ title, value, subtext, icon: Icon, gradient, onClick }: StatCardProps) => {
    return (
        <Card
            className={`relative overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 duration-300 min-h-[120px] sm:min-h-[140px] ${gradient} ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium text-white/90">
                    {title}
                </CardTitle>
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-2xl sm:text-3xl font-bold text-white">{value}</div>
                <p className="text-xs text-white/80 mt-1">
                    {subtext}
                </p>
            </CardContent>
            {/* Decorative background circle */}
            <div className="absolute bottom-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 sm:-mr-16 -mb-12 sm:-mb-16 pointer-events-none"></div>
        </Card>
    );
};

export const KPIGrid = () => {
    const { districts, selectedDistrict, complianceType } = useStore();
    const [showCriticalModal, setShowCriticalModal] = useState(false);

    // Compute Metrics based on selection - Memoized
    const metrics = useMemo(() => {
        const activeDistricts = selectedDistrict
            ? districts.filter(d => d.name === selectedDistrict)
            : districts;

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
        let published92Villages = 0;
        let criticalVillages = 0;
        activeDistricts.forEach(d => {
            d.villages.forEach(v => {
                const status = complianceType === '9(2)' ? v.sec92_status : v.sec13_status;
                if (status === 'Completed') completedVillages++;
                if (v.publishedDate) published92Villages++;
                if (v.isCritical) criticalVillages++;
            });
        });
        const pendingVillages = totalVillages - completedVillages;

        return {
            totalVillages,
            avgCompliance,
            completedVillages,
            pendingVillages,
            criticalVillages,
            published92Villages
        };
    }, [districts, selectedDistrict, complianceType]);

    const {
        totalVillages,
        avgCompliance,
        completedVillages,
        pendingVillages,
        criticalVillages,
        published92Villages
    } = metrics;

    const avgComplianceColor = avgCompliance >= 0.75
        ? 'bg-gradient-to-br from-emerald-500 to-green-700'
        : avgCompliance >= 0.50
            ? 'bg-gradient-to-br from-amber-500 to-orange-700'
            : 'bg-gradient-to-br from-rose-500 to-red-700';

    return (
        <>
            <CriticalVillagesModal
                open={showCriticalModal}
                onClose={() => setShowCriticalModal(false)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6">

                {/* 1. Completed Villages (13) */}
                <StatCard
                    title="13 Completed Villages"
                    value={completedVillages}
                    subtext={`${totalVillages > 0 ? formatPercent(completedVillages / totalVillages) : '0%'} of total`}
                    icon={Home}
                    gradient="bg-gradient-to-br from-sky-500 to-blue-700"
                />

                {/* 2. 9(2) Published */}
                <StatCard
                    title="9(2) Published"
                    value={published92Villages}
                    subtext={`${totalVillages > 0 ? formatPercent(published92Villages / totalVillages) : '0%'} of total`}
                    icon={FileCheck}
                    gradient="bg-gradient-to-br from-orange-400 to-pink-600"
                />

                {/* 3. Average Compliance */}
                <StatCard
                    title="Avg Compliance"
                    value={formatPercent(avgCompliance)}
                    subtext={`For Section ${complianceType}`}
                    icon={Activity}
                    gradient={avgComplianceColor}
                />

                {/* 4. Pending Villages */}
                <StatCard
                    title="Pending Villages"
                    value={pendingVillages}
                    subtext={
                        <span>
                            Requires Attention<span className="hidden sm:inline"> (Click to view)</span>
                        </span>
                    }
                    icon={AlertCircle}
                    gradient="bg-gradient-to-br from-violet-500 to-purple-700"
                    onClick={() => {
                        useStore.getState().setStatusFilter('Pending');
                        document.getElementById('village-table')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                />

                {/* 5. Critical Villages */}
                <StatCard
                    title="Critical Villages"
                    value={criticalVillages}
                    subtext={
                        <span>
                            9(2) Published ≥90 days<span className="hidden sm:inline"> (Click to view)</span>
                        </span>
                    }
                    icon={AlertTriangle}
                    gradient="bg-gradient-to-br from-red-500 to-rose-700"
                    onClick={() => setShowCriticalModal(true)}
                />
            </div>
        </>
    );
};
