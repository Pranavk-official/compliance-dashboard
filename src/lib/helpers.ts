/**
 * Converts Excel serial date number to ISO date string
 * @param serialDate - Excel serial date number (days since 1899-12-30)
 * @returns ISO date string in YYYY-MM-DD format
 */
export function excelDateToISO(serialDate: number): string {
    const EXCEL_EPOCH = new Date(1899, 11, 30);
    const MS_PER_DAY = 86400000;
    const date = new Date(EXCEL_EPOCH.getTime() + serialDate * MS_PER_DAY);
    return date.toISOString().split('T')[0];
}

/**
 * Extracts Google Sheets ID from URL
 * @param url - Google Sheets URL
 * @returns Sheet ID or null if invalid URL
 */
export function extractGoogleSheetId(url: string): string | null {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
}

/**
 * Builds Google Sheets export URL
 * @param sheetId - Google Sheets ID
 * @param format - Export format (default: xlsx)
 * @returns Export URL
 */
export function buildGoogleSheetsExportUrl(sheetId: string, format: string = 'xlsx'): string {
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=${format}`;
}

/**
 * Type guard to check if value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Type guard to check if value is a valid number
 */
export function isValidNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Safely parse a value to a number, with fallback
 */
export function safeParseNumber(value: unknown, fallback: number = 0): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
}

/**
 * Clamps a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Debounce function for performance optimization
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
