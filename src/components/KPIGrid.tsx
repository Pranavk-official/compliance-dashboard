import { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import { formatPercent } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Activity,
    Home,
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

        // Metric 1: 13 Published Villages
        let published13Villages = 0;

        // Metric 2: 9(2) Published (to be 13 Published)
        let published92ToBe13Villages = 0;

        // Metric 3: Above 90% Villages (based on toggled compliance type)
        let above90Villages = 0;

        // Metric 4: Critical Villages (9(2) published > 90 days)
        let criticalVillages = 0;

        activeDistricts.forEach(d => {
            d.villages.forEach(v => {
                // Metric 1 Logic: Count where 13 is completed
                if (v.sec13_status === 'Completed') {
                    published13Villages++;
                }

                // Metric 2 Logic: 9(2) Published AND NOT 13 Published
                // Check if stage contains "9(2)" and "Published" (loosely)
                const is92Published = v.stage.toLowerCase().includes('9(2)') && v.stage.toLowerCase().includes('published');
                if (is92Published && v.sec13_status !== 'Completed') {
                    published92ToBe13Villages++;
                }

                // Metric 3 Logic: Compliance > 90% (0.9)
                const currentPercent = complianceType === '9(2)' ? v.sec92_percent : v.sec13_percent;
                if (currentPercent >= 0.9) {
                    above90Villages++;
                }

                // Metric 4 Logic: Critical (already calculated in parser)
                if (v.isCritical) {
                    criticalVillages++;
                }
            });
        });

        return {
            totalVillages,
            avgCompliance,
            published13Villages,
            published92ToBe13Villages,
            above90Villages,
            criticalVillages
        };
    }, [districts, selectedDistrict, complianceType]);

    const {
        totalVillages,
        published13Villages,
        published92ToBe13Villages,
        above90Villages,
        criticalVillages
    } = metrics;

    return (
        <>
            <CriticalVillagesModal
                open={showCriticalModal}
                onClose={() => setShowCriticalModal(false)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">

                {/* 1. 13 Published Villages */}
                <StatCard
                    title="13 Published Villages"
                    value={published13Villages}
                    subtext={`${totalVillages > 0 ? formatPercent(published13Villages / totalVillages) : '0%'} of total`}
                    icon={Home}
                    gradient="bg-gradient-to-br from-emerald-500 to-green-700"
                />

                {/* 2. 9(2) Published Villages ( to be 13 Published ) */}
                <StatCard
                    title="9(2) Published Villages"
                    value={published92ToBe13Villages}
                    subtext="(to be 13 Published)"
                    icon={FileCheck}
                    gradient="bg-gradient-to-br from-orange-400 to-pink-600"
                />

                {/* 3. Above 90% Villages */}
                <StatCard
                    title="Above 90% Villages"
                    value={above90Villages}
                    subtext={`${totalVillages > 0 ? formatPercent(above90Villages / totalVillages) : '0%'} of total`}
                    icon={Activity}
                    gradient="bg-gradient-to-br from-sky-500 to-indigo-700"
                />

                {/* 4. No of Villages > 90 days passed after 9 (2) Publication */}
                <StatCard
                    title="Pending > 90 Days"
                    value={criticalVillages}
                    subtext={
                        <span>
                            After 9(2) Publication <span className="hidden sm:inline">(Click to view)</span>
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
