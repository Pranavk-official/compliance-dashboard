/**
 * Centralized Configuration for Compliance Dashboard
 * 
 * This file contains all configurable settings for the application,
 * making it easy to modify parsing rules, thresholds, and business logic
 * without touching the core implementation.
 */

// ============================================================================
// EXCEL PARSER CONFIGURATION
// ============================================================================

/**
 * Excel Sheet Processing Rules
 */
export const SHEET_CONFIG = {
    /**
     * Index of the first sheet to process (0-based)
     * Set to 1 to skip the first sheet (usually guidelines/instructions)
     */
    FIRST_SHEET_INDEX: 1,

    /**
     * Sheets to exclude from processing (case-insensitive)
     * Add sheet names that should be ignored during parsing
     */
    EXCLUDED_SHEETS: [
        'test',
        'sheet 17',
        'sheet 128',
        'sheet17',
        'sheet128',
        'guideline',
        'guidelines',
        'instructions',
        'template',
    ] as const,

    /**
     * Whether to use case-insensitive matching for excluded sheets
     */
    CASE_INSENSITIVE_EXCLUSION: true,

    /**
     * Whether to trim whitespace when checking sheet names
     */
    TRIM_SHEET_NAMES: true,
} as const;

/**
 * Excel Row Indices Configuration
 * Maps logical data fields to their physical row positions in the Excel sheet
 */
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
} as const;

/**
 * Village Name Detection Configuration
 */
export const VILLAGE_DETECTION = {
    /**
     * Text to look for in row to identify village name row
     */
    IDENTIFIER: 'Village',

    /**
     * Column index where identifier should be found
     */
    IDENTIFIER_COLUMN: 2,

    /**
     * Fallback row index if identifier is not found
     */
    FALLBACK_ROW: EXCEL_ROW_INDICES.VILLAGE_NAME,
} as const;

// ============================================================================
// BUSINESS RULES & THRESHOLDS
// ============================================================================

/**
 * Compliance Thresholds
 */
export const COMPLIANCE_THRESHOLDS = {
    /**
     * Percentage threshold for "Completed" status (0.0 to 1.0)
     */
    COMPLETED: 0.9, // 90%

    /**
     * High compliance threshold (0.0 to 1.0)
     */
    HIGH: 0.75, // 75%

    /**
     * Medium compliance threshold (0.0 to 1.0)
     */
    MEDIUM: 0.5, // 50%

    /**
     * Days after 9(2) publication to mark a village as critical
     */
    CRITICAL_DAYS: 90,
} as const;

/**
 * Stage Detection Patterns
 * Configure how different stages are identified in the data
 */
export const STAGE_PATTERNS = {
    /**
     * Patterns to identify villages with Section 13 published
     */
    SECTION_13_PUBLISHED: ['13 published', 'section 13 published'] as const,

    /**
     * Patterns to identify villages with Section 9(2) published
     */
    SECTION_92_PUBLISHED: ['9(2)', 'published', '9(2) published'] as const,

    /**
     * Patterns to identify villages with >90% field survey completion
     * These villages have high survey completion but pending publication
     */
    ABOVE_90_PERCENT: [
        'above 90',
        'above90',
        '>90',
        '> 90',
        'above 90%',
        'above90%',
        '>90%',
        '> 90%',
    ] as const,

    /**
     * Whether pattern matching should be case-insensitive
     */
    CASE_INSENSITIVE: true,
} as const;

/**
 * Data Validation Rules
 */
export const VALIDATION_RULES = {
    /**
     * Values to treat as empty or invalid in village names
     */
    INVALID_VILLAGE_NAMES: ['#REF!', '#N/A', '#VALUE!', '#DIV/0!', 'undefined', 'null'] as const,

    /**
     * Minimum village name length
     */
    MIN_VILLAGE_NAME_LENGTH: 1,

    /**
     * Default values for missing personnel data
     */
    DEFAULT_SURVEYOR: 'Not Assigned',
    DEFAULT_OFFICER: 'Not Assigned',
} as const;

/**
 * Value Normalization Rules
 */
export const NORMALIZATION_RULES = {
    /**
     * String values to treat as "Completed" (case-insensitive)
     */
    COMPLETED_VALUES: ['yes', 'completed', 'ready', 'done', 'finish', 'finished'] as const,

    /**
     * String values to treat as "Pending" (case-insensitive)
     */
    PENDING_VALUES: ['no', 'pending', 'not ready', 'incomplete', 'not done'] as const,

    /**
     * Minimum valid number value (percentages)
     */
    MIN_VALUE: 0,

    /**
     * Maximum valid number value (percentages)
     */
    MAX_VALUE: 1,
} as const;

// ============================================================================
// UI CONFIGURATION
// ============================================================================

/**
 * Pagination Settings
 */
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 50,
    CHART_ITEMS_SMALL: 10,
    CHART_ITEMS_MEDIUM: 20,
    CHART_ITEMS_LARGE: 30,
} as const;

/**
 * Chart Color Scheme
 */
export const CHART_COLORS = {
    HIGH_COMPLIANCE: '#10b981', // emerald-500
    MEDIUM_COMPLIANCE: '#f59e0b', // amber-500
    LOW_COMPLIANCE: '#ef4444', // red-500
} as const;

/**
 * Status Badge Color Classes
 */
export const STATUS_COLORS = {
    COMPLETED: 'bg-green-100 text-green-700 border-green-300',
    HIGH: 'bg-blue-100 text-blue-700 border-blue-300',
    MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    LOW: 'bg-red-100 text-red-700 border-red-300',
} as const;

/**
 * Stage Badge Color Classes
 */
export const STAGE_COLORS = {
    PUBLISHED_13: 'bg-green-100 text-green-700 border-green-300',
    PUBLISHED_92: 'bg-blue-100 text-blue-700 border-blue-300',
    ABOVE_90: 'bg-amber-100 text-amber-700 border-amber-300',
    DEFAULT: 'bg-gray-100 text-gray-700 border-gray-300',
} as const;

// ============================================================================
// EXPORT & IMPORT CONFIGURATION
// ============================================================================

/**
 * Excel Export Settings
 */
export const EXCEL_EXPORT = {
    MIME_TYPE: 'text/csv;charset=utf-8;',
    DEFAULT_FILENAME_PREFIX: 'compliance',
} as const;

/**
 * File Upload Settings
 */
export const FILE_UPLOAD = {
    ACCEPTED_FORMATS: '.xlsx, .csv',
    MAX_SIZE_MB: 10,
} as const;

/**
 * Google Sheets Integration
 */
export const GOOGLE_SHEETS = {
    URL_PATTERN: /\/d\/([a-zA-Z0-9-_]+)/,
    EXPORT_FORMAT: 'xlsx',
} as const;

// ============================================================================
// DATE & TIME CONFIGURATION
// ============================================================================

/**
 * Excel Date Conversion Constants
 */
export const EXCEL_DATE = {
    EPOCH: new Date(1899, 11, 30),
    MS_PER_DAY: 86400000,
} as const;

// ============================================================================
// APPLICATION SETTINGS
// ============================================================================

/**
 * Responsive Breakpoints (matching Tailwind CSS)
 */
export const BREAKPOINTS = {
    SMALL: 640,
    MEDIUM: 768,
    LARGE: 1024,
    XL: 1280,
    XXL: 1536,
} as const;

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
    DASHBOARD_STATE: 'compliance-dashboard-storage',
} as const;

/**
 * Application Metadata
 */
export const APP_CONFIG = {
    NAME: 'Compliance Dashboard',
    VERSION: '1.0.0',
    ORGANIZATION: 'Government of Kerala',
    DEPARTMENT: 'IT Department',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a sheet should be excluded from processing
 * @param sheetName - Name of the sheet to check
 * @returns true if sheet should be excluded, false otherwise
 */
export function shouldExcludeSheet(sheetName: string): boolean {
    let name = sheetName;

    if (SHEET_CONFIG.TRIM_SHEET_NAMES) {
        name = name.trim();
    }

    if (SHEET_CONFIG.CASE_INSENSITIVE_EXCLUSION) {
        name = name.toLowerCase();
    }

    return SHEET_CONFIG.EXCLUDED_SHEETS.some(excluded => {
        const excludedName = SHEET_CONFIG.CASE_INSENSITIVE_EXCLUSION
            ? excluded.toLowerCase()
            : excluded;
        return name === excludedName;
    });
}

/**
 * Check if a stage matches "Above 90%" patterns
 * @param stage - Stage string to check
 * @returns true if stage indicates above 90% completion
 */
export function isAbove90Stage(stage: string | null | undefined): boolean {
    if (!stage) return false;

    const stageCheck = STAGE_PATTERNS.CASE_INSENSITIVE
        ? stage.toLowerCase().trim()
        : stage.trim();

    return STAGE_PATTERNS.ABOVE_90_PERCENT.some(pattern => {
        const patternCheck = STAGE_PATTERNS.CASE_INSENSITIVE
            ? pattern.toLowerCase()
            : pattern;
        return stageCheck.includes(patternCheck);
    });
}

/**
 * Check if a stage indicates Section 9(2) published
 * @param stage - Stage string to check
 * @returns true if stage indicates 9(2) is published
 */
export function is92PublishedStage(stage: string | null | undefined): boolean {
    if (!stage) return false;

    const stageCheck = STAGE_PATTERNS.CASE_INSENSITIVE
        ? stage.toLowerCase()
        : stage;

    // Must contain both "9(2)" and "published"
    return STAGE_PATTERNS.SECTION_92_PUBLISHED.every(pattern => {
        const patternCheck = STAGE_PATTERNS.CASE_INSENSITIVE
            ? pattern.toLowerCase()
            : pattern;
        return stageCheck.includes(patternCheck);
    });
}

/**
 * Check if a stage indicates Section 13 published
 * @param stage - Stage string to check
 * @returns true if stage indicates Section 13 is published
 */
export function is13PublishedStage(stage: string | null | undefined): boolean {
    if (!stage) return false;

    const stageCheck = STAGE_PATTERNS.CASE_INSENSITIVE
        ? stage.toLowerCase()
        : stage;

    return STAGE_PATTERNS.SECTION_13_PUBLISHED.some(pattern => {
        const patternCheck = STAGE_PATTERNS.CASE_INSENSITIVE
            ? pattern.toLowerCase()
            : pattern;
        return stageCheck.includes(patternCheck);
    });
}
