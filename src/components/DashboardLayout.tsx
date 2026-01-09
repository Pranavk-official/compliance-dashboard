import React from 'react';
import { useStore } from '../lib/store';
import { LayoutDashboard, FileUp, Download, Link as LinkIcon, Loader2, RefreshCw, LogOut, FileSpreadsheet } from 'lucide-react';
import { parseExcel } from '../lib/parser';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { cn } from '../lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const DashboardSkeleton = () => {
    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col">
            {/* Header Skeleton - Responsive */}
            <header className="bg-background border-b border-border px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3 shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-2 sm:gap-3">
                    <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl" />
                    <div>
                        <Skeleton className="h-5 sm:h-6 w-32 sm:w-48 mb-1 sm:mb-2" />
                        <Skeleton className="h-2 sm:h-3 w-24 sm:w-32 hidden xs:block" />
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <Skeleton className="h-8 sm:h-9 w-20 sm:w-24 rounded-lg" />
                    <Skeleton className="h-8 sm:h-9 w-24 sm:w-32 rounded-lg" />
                    <Skeleton className="h-8 sm:h-9 w-24 sm:w-32 rounded-lg" />
                </div>
            </header>

            {/* Sub-Header Skeleton - Responsive */}
            <div className="bg-background border-b border-border px-3 sm:px-4 md:px-6 py-2 sm:py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 md:gap-6 sticky z-10" style={{ top: 'calc(60px + env(safe-area-inset-top))' }}>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <Skeleton className="h-4 sm:h-5 w-12 sm:w-16" />
                    <Skeleton className="h-9 sm:h-10 w-full sm:w-[180px] rounded-md" />
                </div>
                <div className="bg-muted p-1 rounded-lg flex items-center w-full sm:w-auto">
                    <Skeleton className="h-9 w-full sm:w-[200px] rounded-md" />
                </div>
            </div>

            {/* Main Content Skeleton - Responsive */}
            <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
                <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5 md:space-y-6">
                    {/* KPI Grid Skeleton - Progressive 1-5 columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-[120px] sm:h-32 rounded-xl" />
                        ))}
                    </div>
                    {/* Chart Skeleton - Responsive height */}
                    <Skeleton className="min-h-[250px] h-[35vh] sm:min-h-[300px] sm:h-[40vh] md:min-h-[350px] md:h-[45vh] max-h-[400px] sm:max-h-[500px] md:max-h-[600px] rounded-xl" />
                    {/* Table Skeleton - Responsive height */}
                    {/* <Skeleton className="min-h-[500px] h-[700px] sm:h-[750px] md:h-[700px] max-h-[80vh] rounded-xl" /> */}
                </div>
            </main>
        </div>
    );
};

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const {
        setDistricts,
        districts,
        selectedDistrict,
        setSelectedDistrict,
        currentSheetUrl,
        setCurrentSheetUrl
    } = useStore();



    // State for loading and input
    const [sheetUrlInput, setSheetUrlInput] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                setIsLoading(true);
                const data = await parseExcel(e.target.files[0]);
                setDistricts(data);
                setCurrentSheetUrl(null); // Clear sheet URL as we are using file
            } catch (error) {
                console.error("Failed to parse", error);
                alert("Failed to parse file");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const loadFromUrl = React.useCallback(async (url: string) => {
        // Extract ID: https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit...
        const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (!match) {
            alert("Invalid Google Sheet URL. Could not find Sheet ID.");
            return;
        }

        const sheetId = match[1];
        const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;

        try {
            setIsLoading(true);
            const response = await fetch(exportUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.statusText}`);
            }
            const blob = await response.blob();
            const file = new File([blob], "google-sheet.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const data = await parseExcel(file);
            setDistricts(data);
            setCurrentSheetUrl(url); // Store the original URL for refreshing
        } catch (error) {
            console.error("Failed to load from URL", error);
            alert("Failed to load Google Sheet. Ensure it is discoverable via link (Anyone with the link can view).");
        } finally {
            setIsLoading(false);
        }
    }, [setDistricts, setCurrentSheetUrl, setIsLoading]);

    // Auto-load persisted URL
    React.useEffect(() => {
        if (currentSheetUrl && districts.length === 0) {
            loadFromUrl(currentSheetUrl);
        }
    }, [currentSheetUrl, districts.length, loadFromUrl]); // Run once on mount if URL exists

    const handleUrlSubmit = () => {
        if (!sheetUrlInput) return;
        loadFromUrl(sheetUrlInput);
    };

    const handleRefresh = () => {
        if (currentSheetUrl) {
            loadFromUrl(currentSheetUrl);
        }
    };

    const handleChangeSource = () => {
        if (confirm("Are you sure you want to change source? Current data will be cleared.")) {
            setDistricts([]);
            setCurrentSheetUrl(null);
            setSheetUrlInput('');
            setSelectedDistrict(null);
        }
    };

    const handleExportSummary = () => {
        // District-wise summary
        const summary = districts.map(d => ({
            District: d.name,
            'Total Villages': d.total_villages,
            'Avg 9(2) %': (d.avg_92_percent * 100).toFixed(2) + '%',
            'Avg 13 %': (d.avg_13_percent * 100).toFixed(2) + '%'
        }));

        const ws = XLSX.utils.json_to_sheet(summary);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Summary");
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([wbout], { type: "application/octet-stream" }), 'District_Summary.xlsx');
    };

    // Show Skeleton when loading and no data exists
    if (isLoading && districts.length === 0) {
        return <DashboardSkeleton />;
    }

    // New "Welcome" Screen
    if (districts.length === 0) {
        return (
            <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4">
                <Card className="w-full max-w-lg shadow-2xl border-2 border-blue-100/50 overflow-hidden">
                    <div className="bg-linear-to-br from-blue-600 via-blue-700 to-indigo-700 p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
                        <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-lg relative z-10">
                            <LayoutDashboard className="text-white w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-white relative z-10">Compliance Dashboard</h1>
                        <p className="text-blue-100 mt-2 relative z-10">Government of Kerala - Digital Survey</p>
                    </div>

                    <div className="p-8">
                        <Tabs defaultValue="upload" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-8">
                                <TabsTrigger value="upload" className="flex items-center gap-2">
                                    <FileUp className="w-4 h-4" />
                                    Upload File
                                </TabsTrigger>
                                <TabsTrigger value="link" className="flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4" />
                                    Google Sheet
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="upload" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 mt-0">
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors group cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept=".xlsx, .csv"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={isLoading}
                                    />
                                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                                        <FileSpreadsheet className="text-blue-600 w-6 h-6" />
                                    </div>
                                    <h3 className="text-gray-900 font-medium">Upload Excel File</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Drag and drop or click to browse</p>
                                </div>
                                <p className="text-xs text-center text-muted-foreground">Supported formats: .xlsx, .csv</p>
                            </TabsContent>

                            <TabsContent value="link" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 mt-0">
                                <div className="space-y-2">
                                    <Label htmlFor="sheet-url">Google Sheet Link</Label>
                                    <Input
                                        id="sheet-url"
                                        placeholder="https://docs.google.com/spreadsheets/d/..."
                                        value={sheetUrlInput}
                                        onChange={(e) => setSheetUrlInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Ensure the sheet is accessible to "Anyone with the link".
                                    </p>
                                </div>
                                <Button
                                    onClick={handleUrlSubmit}
                                    disabled={!sheetUrlInput || isLoading}
                                    className="w-full gap-2"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                                    Load Data
                                </Button>
                            </TabsContent>
                        </Tabs>
                    </div>
                </Card>
            </div>
        );
    }

    // Main Dashboard Layout (Data Source Loaded)
    return (
        <div className="min-h-screen bg-linear-to-brrom-slate-50 via-blue-50/30 to-indigo-50/50 flex flex-col">
            {/* Header */}
            <header className="bg-linear-to-r from-white via-blue-50/30 to-white border-b-2 border-blue-100/50 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3 shadow-md sticky top-0 z-20 backdrop-blur-sm bg-white/80" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-linear-to-br from-blue-600 to-indigo-600 p-2 sm:p-2.5 rounded-lg sm:rounded-xl shadow-lg">
                        <LayoutDashboard className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <h1 className="text-base sm:text-lg md:text-xl font-bold bg-linear-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent leading-none">Compliance Dashboard</h1>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden xs:block">Government of Kerala</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    {/* Refresh Button (Only for Google Sheets) */}
                    {currentSheetUrl && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
                            title="Refresh Data from Google Sheet"
                        >
                            <RefreshCw className={cn("w-3 h-3 sm:w-4 sm:h-4", isLoading && "animate-spin")} />
                            <span className="hidden sm:inline">Refresh Data</span>
                        </Button>
                    )}

                    <div className="h-4 sm:h-6 w-px bg-border hidden sm:block"></div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportSummary}
                        className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
                    >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden md:inline">Export Summary</span>
                        <span className="md:hidden">Export</span>
                    </Button>

                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleChangeSource}
                        className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
                        title="Change Data Source"
                    >
                        <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden md:inline">Change Source</span>
                        <span className="md:hidden">Change</span>
                    </Button>
                </div>
            </header>

            {/* Sub-Header / Controls */}
            {districts.length > 0 && (
                <div className="bg-background border-b border-border px-3 sm:px-4 md:px-6 py-2 sm:py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 md:gap-6 overflow-x-auto sticky z-10" style={{ top: 'calc(60px + env(safe-area-inset-top))' }}>
                    {/* District Selector */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">District/AD:</span>
                        <Select
                            value={selectedDistrict || "all"}
                            onValueChange={(val) => setSelectedDistrict(val === "all" ? null : val)}
                        >
                            <SelectTrigger className="w-full sm:w-[180px] h-9">
                                <SelectValue placeholder="All Districts" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Districts</SelectItem>
                                {districts.map(d => (
                                    <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>


                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
                <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5 md:space-y-6">
                    {children}
                </div>
            </main>
        </div>
    );
};
