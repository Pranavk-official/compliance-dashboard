/**
 * Constants used throughout the application
 * Extracted from various components for better maintainability
 */

// Excel Parser Constants
export const EXCEL_ROW_INDICES = {
    VILLAGE_NAME: 55,
    STAGE: 1,
    PUBLISHED_DATE: 2,
    DAYS_PASSED: 3,
    HEAD_SURVEYOR: 7,
    GOVERNMENT_SURVEYOR: 8,
    ASSISTANT_DIRECTOR: 5,
    SUPERINTENDENT: 6,
    SEC92_START: 61,
    SEC92_END: 73,
    SEC13_START: 77,
    SEC13_END: 89,
    DATA_START_COL: 3,
};

// Compliance Thresholds
export const COMPLIANCE_THRESHOLDS = {
    COMPLETED: 0.9, // 90%
    HIGH: 0.75, // 75%
    MEDIUM: 0.5, // 50%
    CRITICAL_DAYS: 90, // Days after 9(2) publication to mark as critical
} as const;

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 50,
    CHART_ITEMS_SMALL: 10,
    CHART_ITEMS_MEDIUM: 20,
    CHART_ITEMS_LARGE: 30,
} as const;

// Chart Colors
export const CHART_COLORS = {
    HIGH_COMPLIANCE: '#10b981', // emerald-500
    MEDIUM_COMPLIANCE: '#f59e0b', // amber-500
    LOW_COMPLIANCE: '#ef4444', // red-500
} as const;

// Status Badge Colors
export const STATUS_COLORS = {
    COMPLETED: 'bg-green-100 text-green-700 border-green-300',
    HIGH: 'bg-blue-100 text-blue-700 border-blue-300',
    MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    LOW: 'bg-red-100 text-red-700 border-red-300',
} as const;

// Stage Badge Colors
export const STAGE_COLORS = {
    PUBLISHED_13: 'bg-green-100 text-green-700 border-green-300',
    PUBLISHED_92: 'bg-blue-100 text-blue-700 border-blue-300',
    ABOVE_90: 'bg-amber-100 text-amber-700 border-amber-300',
    DEFAULT: 'bg-gray-100 text-gray-700 border-gray-300',
} as const;

// Excel Export Settings
export const EXCEL_EXPORT = {
    MIME_TYPE: 'text/csv;charset=utf-8;',
    DEFAULT_FILENAME_PREFIX: 'compliance',
} as const;

// Responsive Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
    SMALL: 640,
    MEDIUM: 768,
    LARGE: 1024,
    XL: 1280,
    XXL: 1536,
} as const;

// Excel Date Conversion
export const EXCEL_DATE = {
    EPOCH: new Date(1899, 11, 30),
    MS_PER_DAY: 86400000,
} as const;

// Google Sheets
export const GOOGLE_SHEETS = {
    URL_PATTERN: /\/d\/([a-zA-Z0-9-_]+)/,
    EXPORT_FORMAT: 'xlsx',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
    DASHBOARD_STATE: 'compliance-dashboard-storage',
} as const;

// File Upload
export const FILE_UPLOAD = {
    ACCEPTED_FORMATS: '.xlsx, .csv',
    MAX_SIZE_MB: 10,
} as const;
