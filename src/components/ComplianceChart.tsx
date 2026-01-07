
import { useStore } from '../lib/store';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { formatPercent } from '../lib/utils';

export const ComplianceChart = () => {
    const { districts, complianceType, selectedDistrict } = useStore();

    // If a district is selected, maybe show Villages?
    // For now, let's keep it simple: Show District Comparison if "All", show Villages if "District Select" (limit 20?)

    let data: { name: string; value: number }[] = [];

    if (!selectedDistrict) {
        // Compare Districts
        data = districts.map(d => ({
            name: d.name,
            value: complianceType === '9(2)' ? d.avg_92_percent : d.avg_13_percent
        }));
    } else {
        // Compare Villages in District (Top 50?)
        const district = districts.find(d => d.name === selectedDistrict);
        if (district) {
            data = district.villages.map(v => ({
                name: v.name,
                value: complianceType === '9(2)' ? v.sec92_percent : v.sec13_percent
            }));
        }
    }

    // Sort by value desc
    data.sort((a, b) => b.value - a.value);

    // Limit if too many
    const displayData = data.slice(0, 30);

    const getColor = (val: number) => {
        if (val >= 0.75) return '#10b981'; // emerald-500
        if (val >= 0.50) return '#f59e0b'; // amber-500
        return '#ef4444'; // red-500
    };

    return (
        <div className="bg-white p-6 rounded-xl border-2 border-blue-100/50 shadow-lg h-[400px] bg-gradient-to-br from-white to-blue-50/30">
            <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-6">
                {selectedDistrict ? 'Village Progress' : 'District Comparison'}
            </h3>

            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayData} margin={{ bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        tickFormatter={(val) => `${Math.round(val * 100)}%`}
                        domain={[0, 1]}
                    />
                    <Tooltip
                        formatter={(val: any) => [formatPercent(Number(val)), 'Compliance']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {displayData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getColor(entry.value)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
