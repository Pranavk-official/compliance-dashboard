import { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Activity,
    Home,
    AlertTriangle,
    FileCheck,
    type LucideIcon
} from 'lucide-react';
import { VillageListModal } from './VillageListModal';
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
                <div className="text-6xl font-bold text-white">{value}</div>
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
    const [modalConfig, setModalConfig] = useState<{
        open: boolean;
        title: string;
        villages: any[];
        colorScheme: 'green' | 'blue' | 'red' | 'orange' | 'purple';
        icon?: React.ReactNode;
        description?: string;
        complianceType?: '9(2)' | '13';
    }>({
        open: false,
        title: '',
        villages: [],
        colorScheme: 'blue'
    });

    // Compute Metrics based on selection - Memoized
    const metrics = useMemo(() => {
        const activeDistricts = selectedDistrict
            ? districts.filter(d => d.name === selectedDistrict)
            : districts;

        const totalVillages = activeDistricts.reduce((acc, d) => acc + d.total_villages, 0);

        // Lists for modals
        const list13Published: any[] = [];
        const list92Published: any[] = [];
        const listAbove90: any[] = [];
        const listCritical: any[] = [];

        activeDistricts.forEach(d => {
            d.villages.forEach(v => {
                // Metric 1 Logic: Count where 13 is completed
                if (v.sec13_status === 'Completed') {
                    list13Published.push(v);
                }

                // Metric 2 Logic: 9(2) Published AND NOT 13 Published
                const is92Published = v.stage.toLowerCase().includes('9(2)') && v.stage.toLowerCase().includes('published');
                if (is92Published && v.sec13_status !== 'Completed') {
                    list92Published.push(v);
                }

                // Metric 3 Logic: Compliance > 90%
                // CHANGED: Now based on Stage containing "Above 90%"
                if (v.stage && v.stage.toLowerCase().includes('above 90')) {
                    listAbove90.push(v);
                }

                // Metric 4 Logic: Critical
                if (v.isCritical) {
                    listCritical.push(v);
                }
            });
        });

        return {
            totalVillages,
            list13Published,
            list92Published,
            listAbove90,
            listCritical
        };
    }, [districts, selectedDistrict, complianceType]);

    const {
        list13Published,
        list92Published,
        listAbove90,
        listCritical
    } = metrics;

    const openModal = (title: string, villages: any[], colorScheme: any, icon: any, desc?: string, cType: '9(2)' | '13' = '9(2)') => {
        setModalConfig({
            open: true,
            title,
            villages,
            colorScheme,
            icon: <div className="text-current scale-150">{icon}</div>, // Scaled icon wrapper
            description: desc,
            complianceType: cType
        });
    };

    return (
        <>
            <VillageListModal
                open={modalConfig.open}
                onClose={() => setModalConfig(prev => ({ ...prev, open: false }))}
                title={modalConfig.title}
                villages={modalConfig.villages}
                colorScheme={modalConfig.colorScheme}
                icon={modalConfig.icon}
                description={modalConfig.description}
                complianceType={modalConfig.complianceType}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">

                {/* 1. 13 Published Villages */}
                <StatCard
                    title="13 Published Villages"
                    value={list13Published.length}
                    subtext="Villages with Sec 13 Completed"
                    icon={Home}
                    gradient="bg-gradient-to-br from-emerald-500 to-green-700"
                    onClick={() => openModal("13 Published Villages", list13Published, 'green', <Home />, "List of villages where Section 13 is fully published.", '13')}
                />

                {/* 2. 9(2) Published Villages ( to be 13 Published ) */}
                <StatCard
                    title="9(2) Published Villages"
                    value={list92Published.length}
                    subtext="(to be 13 Published)"
                    icon={FileCheck}
                    gradient="bg-gradient-to-br from-orange-400 to-pink-600"
                    onClick={() => openModal("9(2) Published Villages", list92Published, 'orange', <FileCheck />, "Villages with 9(2) published but pending Section 13.", '9(2)')}
                />

                {/* 3. Above 90% Villages */}
                <StatCard
                    title="Above 90% Villages"
                    value={listAbove90.length}
                    subtext="High Compliance (>90%)"
                    icon={Activity}
                    gradient="bg-gradient-to-br from-sky-500 to-indigo-700"
                    onClick={() => openModal("Above 90% Villages", listAbove90, 'blue', <Activity />, "Villages with more than 90% overall compliance.", '9(2)')}
                />

                {/* 4. No of Villages > 90 days passed after 9 (2) Publication */}
                <StatCard
                    title="Pending > 90 Days"
                    value={listCritical.length}
                    subtext="After 9(2) Publication"
                    icon={AlertTriangle}
                    gradient="bg-gradient-to-br from-red-500 to-rose-700"
                    onClick={() => setShowCriticalModal(true)}
                />
            </div>

            <CriticalVillagesModal
                open={showCriticalModal}
                onClose={() => setShowCriticalModal(false)}
            />
        </>
    );
};
