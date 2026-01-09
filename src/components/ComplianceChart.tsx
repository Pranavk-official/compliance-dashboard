
import { useStore } from '../lib/store';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { formatPercent } from '../lib/utils';
import { useEffect, useState, useMemo } from 'react';
import { CHART_COLORS, PAGINATION, COMPLIANCE_THRESHOLDS, BREAKPOINTS } from '../lib/constants';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown, Filter as FilterIcon } from 'lucide-react';

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{
        payload: {
            name: string;
            value: number;
            stageCounts: Record<string, number>;
        };
    }>;
}) => {
    if (active && payload && payload.length > 0) {
        const data = payload[0].payload;

        return (
            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                <p className="font-semibold text-gray-900 mb-2">{data.name}</p>
                <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Compliance:</span> {formatPercent(data.value)}
                </p>
                <div className="border-t pt-2 mt-2">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Stage Breakdown:</p>
                    {Object.entries(data.stageCounts).map(([stage, count]) => (
                        <div key={stage} className="text-xs text-gray-600 flex justify-between gap-3">
                            <span className="truncate max-w-[150px]">{stage}:</span>
                            <span className="font-medium">{count}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

type SortOption = 'default' | 'name-asc' | 'name-desc' | 'compliance-desc' | 'compliance-asc';
type FilterOption = 'all' | 'high' | 'medium' | 'low';

export const ComplianceChart = () => {
    const { districts, complianceType, selectedDistrict } = useStore();
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [isMediumScreen, setIsMediumScreen] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>('default');
    const [filterBy, setFilterBy] = useState<FilterOption>('all');

    // Detect screen size for responsive chart
    useEffect(() => {
        const checkScreenSize = () => {
            setIsSmallScreen(window.innerWidth < BREAKPOINTS.SMALL);
            setIsMediumScreen(window.innerWidth >= BREAKPOINTS.SMALL && window.innerWidth < BREAKPOINTS.LARGE);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Memoize chart data for performance
    const displayData = useMemo(() => {
        let data: { name: string; value: number; stageCounts: Record<string, number> }[] = [];

        if (!selectedDistrict) {
            // Compare Districts - aggregate stage counts across all villages
            data = districts.map(d => {
                const stageCounts: Record<string, number> = {};
                d.villages.forEach(v => {
                    stageCounts[v.stage] = (stageCounts[v.stage] || 0) + 1;
                });
                return {
                    name: d.name,
                    value: complianceType === '9(2)' ? d.avg_92_percent : d.avg_13_percent,
                    stageCounts
                };
            });
        } else {
            // Compare Villages in District - show single stage for each village
            const district = districts.find(d => d.name === selectedDistrict);
            if (district) {
                data = district.villages.map(v => ({
                    name: v.name,
                    value: complianceType === '9(2)' ? v.sec92_percent : v.sec13_percent,
                    stageCounts: { [v.stage]: 1 }
                }));
            }
        }

        // Apply filter
        if (filterBy !== 'all') {
            data = data.filter(item => {
                if (filterBy === 'high') return item.value >= COMPLIANCE_THRESHOLDS.HIGH;
                if (filterBy === 'medium') return item.value >= COMPLIANCE_THRESHOLDS.MEDIUM && item.value < COMPLIANCE_THRESHOLDS.HIGH;
                if (filterBy === 'low') return item.value < COMPLIANCE_THRESHOLDS.MEDIUM;
                return true;
            });
        }

        // Apply sort (only if not default)
        if (sortBy !== 'default') {
            data.sort((a, b) => {
                switch (sortBy) {
                    case 'name-asc':
                        return a.name.localeCompare(b.name);
                    case 'name-desc':
                        return b.name.localeCompare(a.name);
                    case 'compliance-desc':
                        return b.value - a.value;
                    case 'compliance-asc':
                        return a.value - b.value;
                    default:
                        return 0;
                }
            });
        }

        // Limit based on screen size
        const maxItems = isSmallScreen ? PAGINATION.CHART_ITEMS_SMALL : isMediumScreen ? PAGINATION.CHART_ITEMS_MEDIUM : PAGINATION.CHART_ITEMS_LARGE;
        return data.slice(0, maxItems);
    }, [districts, complianceType, selectedDistrict, isSmallScreen, isMediumScreen, sortBy, filterBy]);

    /**
     * Returns color based on compliance value
     */
    const getColor = (val: number): string => {
        if (val >= COMPLIANCE_THRESHOLDS.HIGH) return CHART_COLORS.HIGH_COMPLIANCE;
        if (val >= COMPLIANCE_THRESHOLDS.MEDIUM) return CHART_COLORS.MEDIUM_COMPLIANCE;
        return CHART_COLORS.LOW_COMPLIANCE;
    };

    return (
        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl border-2 border-blue-100/50 shadow-lg min-h-[250px] h-[35vh] sm:min-h-[300px] sm:h-[40vh] md:min-h-[350px] md:h-[45vh] max-h-[400px] sm:max-h-[500px] md:max-h-[600px] bg-gradient-to-br from-white to-blue-50/30 outline-none focus:outline-none flex flex-col">
            {/* Header with Title and Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4 md:mb-6">
                <h3 className="text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                    {selectedDistrict ? 'Village Progress' : 'District Comparison'}
                </h3>

                {/* Filter and Sort Controls */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {/* Filter Dropdown */}
                    <div className="flex items-center gap-1.5 min-w-[140px]">
                        <FilterIcon className="h-3.5 w-3.5 text-gray-400 hidden sm:block" />
                        <Select value={filterBy} onValueChange={(val) => setFilterBy(val as FilterOption)}>
                            <SelectTrigger className="h-8 text-xs border-gray-200">
                                <SelectValue placeholder="Filter" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Levels</SelectItem>
                                <SelectItem value="high">High (≥90%)</SelectItem>
                                <SelectItem value="medium">Medium (50-90%)</SelectItem>
                                <SelectItem value="low">Low (&lt;50%)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-1.5 min-w-[160px]">
                        <ArrowUpDown className="h-3.5 w-3.5 text-gray-400 hidden sm:block" />
                        <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
                            <SelectTrigger className="h-8 text-xs border-gray-200">
                                <SelectValue placeholder="Sort" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default">Default</SelectItem>
                                <SelectItem value="compliance-desc">Compliance: High to Low</SelectItem>
                                <SelectItem value="compliance-asc">Compliance: Low to High</SelectItem>
                                <SelectItem value="name-asc">Name: A to Z</SelectItem>
                                <SelectItem value="name-desc">Name: Z to A</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="flex-1 min-h-0">
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
                            content={<CustomTooltip />}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {displayData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getColor(entry.value)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
