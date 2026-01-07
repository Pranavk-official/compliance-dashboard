
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
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Scope
                    </CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{selectedDistrict ? '1 District' : `${totalDistricts} Districts`}</div>
                    <p className="text-xs text-muted-foreground">
                        Covering {totalVillages} Villages
                    </p>
                </CardContent>
            </Card>

            {/* Average Compliance */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Avg Compliance
                    </CardTitle>
                    <Activity className={`h-4 w-4 ${avgCompliance >= 0.75 ? 'text-green-600' : avgCompliance >= 0.50 ? 'text-amber-600' : 'text-red-600'}`} />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${avgCompliance >= 0.75 ? 'text-green-600' : avgCompliance >= 0.50 ? 'text-amber-600' : 'text-red-600'}`}>
                        {formatPercent(avgCompliance)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        For Section {complianceType}
                    </p>
                </CardContent>
            </Card>

            {/* Completed Villages */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Completed Villages
                    </CardTitle>
                    <Home className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-700">{completedVillages}</div>
                    <p className="text-xs text-muted-foreground">
                        {totalVillages > 0 ? formatPercent(completedVillages / totalVillages) : '0%'} of total
                    </p>
                </CardContent>
            </Card>

            {/* Pending Villages */}
            <Card
                className="cursor-pointer hover:bg-muted/50 transition-colors border-l-4 border-l-red-500"
                onClick={() => {
                    useStore.getState().setStatusFilter('Pending');
                    document.getElementById('village-table')?.scrollIntoView({ behavior: 'smooth' });
                }}
            >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-600">
                        Pending Villages
                    </CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-700">{pendingVillages}</div>
                    <p className="text-xs text-muted-foreground">
                        Requires Attention (Click to view)
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
