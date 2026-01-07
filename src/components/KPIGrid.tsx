
import { useStore } from '../lib/store';
import { formatPercent } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Activity,
    Building2,
    Home,
    AlertCircle
} from 'lucide-react';

export const KPIGrid = () => {
    const { districts, selectedDistrict, complianceType } = useStore();

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
    activeDistricts.forEach(d => {
        d.villages.forEach(v => {
            const status = complianceType === '9(2)' ? v.sec92_status : v.sec13_status;
            if (status === 'Completed') completedVillages++;
        });
    });
    const pendingVillages = totalVillages - completedVillages;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Districts / Scope */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 border-none shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white/90">
                        Scope
                    </CardTitle>
                    <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-white" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-white">{selectedDistrict ? '1 District' : `${totalDistricts} Districts`}</div>
                    <p className="text-xs text-white/80 mt-1">
                        Covering {totalVillages} Villages
                    </p>
                </CardContent>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16"></div>
            </Card>

            {/* Average Compliance */}
            <Card className={`relative overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 duration-300 ${avgCompliance >= 0.75 ? 'bg-gradient-to-br from-green-500 to-emerald-700' : avgCompliance >= 0.50 ? 'bg-gradient-to-br from-amber-500 to-orange-700' : 'bg-gradient-to-br from-red-500 to-rose-700'}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white/90">
                        Avg Compliance
                    </CardTitle>
                    <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Activity className="h-5 w-5 text-white" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-white">
                        {formatPercent(avgCompliance)}
                    </div>
                    <p className="text-xs text-white/80 mt-1">
                        For Section {complianceType}
                    </p>
                </CardContent>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16"></div>
            </Card>

            {/* Completed Villages */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-teal-500 to-cyan-700 border-none shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white/90">
                        Completed Villages
                    </CardTitle>
                    <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Home className="h-5 w-5 text-white" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-white">{completedVillages}</div>
                    <p className="text-xs text-white/80 mt-1">
                        {totalVillages > 0 ? formatPercent(completedVillages / totalVillages) : '0%'} of total
                    </p>
                </CardContent>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16"></div>
            </Card>

            {/* Pending Villages */}
            <Card
                className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-700 border-none shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 duration-300 cursor-pointer"
                onClick={() => {
                    useStore.getState().setStatusFilter('Pending');
                    document.getElementById('village-table')?.scrollIntoView({ behavior: 'smooth' });
                }}
            >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white/90">
                        Pending Villages
                    </CardTitle>
                    <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-white" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-white">{pendingVillages}</div>
                    <p className="text-xs text-white/80 mt-1">
                        Requires Attention (Click to view)
                    </p>
                </CardContent>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16"></div>
            </Card>
        </div>
    );
};
