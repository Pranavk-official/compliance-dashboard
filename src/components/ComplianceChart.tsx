
import { useStore } from '../lib/store';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { formatPercent } from '../lib/utils';
import { useEffect, useState } from 'react';

export const ComplianceChart = () => {
    const { districts, complianceType, selectedDistrict } = useStore();
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [isMediumScreen, setIsMediumScreen] = useState(false);

    // Detect screen size for responsive chart
    useEffect(() => {
        const checkScreenSize = () => {
            setIsSmallScreen(window.innerWidth < 640);
            setIsMediumScreen(window.innerWidth >= 640 && window.innerWidth < 1024);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

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

    // Limit based on screen size
    const maxItems = isSmallScreen ? 10 : isMediumScreen ? 20 : 30;
    const displayData = data.slice(0, maxItems);

    const getColor = (val: number) => {
        if (val >= 0.75) return '#10b981'; // emerald-500
        if (val >= 0.50) return '#f59e0b'; // amber-500
        return '#ef4444'; // red-500
    };

    return (
        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl border-2 border-blue-100/50 shadow-lg min-h-[250px] h-[35vh] sm:min-h-[300px] sm:h-[40vh] md:min-h-[350px] md:h-[45vh] max-h-[400px] sm:max-h-[500px] md:max-h-[600px] bg-gradient-to-br from-white to-blue-50/30 outline-none focus:outline-none">
            <h3 className="text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-3 sm:mb-4 md:mb-6">
                {selectedDistrict ? 'Village Progress' : 'District Comparison'}
            </h3>

            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={displayData}
                    margin={{
                        bottom: isSmallScreen ? 50 : 30,
                        left: isSmallScreen ? -10 : 0,
                        right: isSmallScreen ? 5 : 10
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: isSmallScreen ? 8 : isMediumScreen ? 10 : 12 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: isSmallScreen ? 8 : isMediumScreen ? 10 : 12 }}
                        tickFormatter={(val) => `${Math.round(val * 100)}%`}
                        domain={[0, 1]}
                    />
                    <Tooltip
                        formatter={(val: any) => [formatPercent(Number(val)), 'Compliance']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: isSmallScreen ? '12px' : '14px' }}
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
