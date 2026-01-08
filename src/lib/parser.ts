import * as XLSX from 'xlsx';
import type { District, Village, ComplianceItem } from './types';
import { EXCEL_ROW_INDICES, COMPLIANCE_THRESHOLDS } from './constants';
import { excelDateToISO, isNonEmptyString, isValidNumber, clamp } from './helpers';

/**
 * Type definition for Excel row data
 */
type ExcelRow = Array<string | number | boolean | null | undefined>;

/**
 * Parses an Excel file and extracts district compliance data
 * @param file - Excel file to parse
 * @returns Array of District objects with village compliance data
 * @throws Error if file parsing fails
 */
export const parseExcel = async (file: File): Promise<District[]> => {
    try {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const districts: District[] = [];

        // Skip first sheet (Guideline) and process all other sheets except 'test'
        for (let i = 1; i < workbook.SheetNames.length; i++) {
            const sheetName = workbook.SheetNames[i];

            // Skip 'test' sheet (case-insensitive)
            if (sheetName.toLowerCase() === 'test') {
                continue;
            }

            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as ExcelRow[];

            const district = parseDistrictSheet(data, sheetName);
            if (district && district.villages.length > 0) {
                districts.push(district);
            }
        }

        return districts;
    } catch (error) {
        console.error('Failed to parse Excel file:', error);
        throw new Error(`Excel parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Parses a single district sheet
 * @param data - Raw Excel sheet data
 * @param districtName - Name of the district (sheet name)
 * @returns District object or null if no valid data
 */
function parseDistrictSheet(data: ExcelRow[], districtName: string): District | null {
    // Find village row dynamically, with fallback to default
    let villageRowIndex = EXCEL_ROW_INDICES.VILLAGE_NAME;
    const foundIndex = data.findIndex(row => row && row[2] === 'Village');
    if (foundIndex !== -1) {
        villageRowIndex = foundIndex;
    }

    const villageRow = data[villageRowIndex];
    if (!villageRow) return null;

    const villages: Village[] = [];

    // Iterate through columns starting from data start column
    for (let col = EXCEL_ROW_INDICES.DATA_START_COL; col < villageRow.length; col++) {
        const village = parseVillageColumn(data, col, districtName, villageRowIndex);
        if (village) {
            villages.push(village);
        }
    }

    if (villages.length === 0) return null;

    // Calculate district averages
    const avg92 = villages.reduce((sum, v) => sum + v.sec92_percent, 0) / villages.length;
    const avg13 = villages.reduce((sum, v) => sum + v.sec13_percent, 0) / villages.length;

    return {
        name: districtName,
        villages,
        total_villages: villages.length,
        avg_92_percent: avg92,
        avg_13_percent: avg13
    };
}

/**
 * Parses a single village column from the sheet
 * @param data - Raw Excel sheet data
 * @param col - Column index
 * @param districtName - Name of the district
 * @param villageRowIndex - Row index where village names are located
 * @returns Village object or null if invalid data
 */
function parseVillageColumn(
    data: ExcelRow[],
    col: number,
    districtName: string,
    villageRowIndex: number
): Village | null {
    const villageRow = data[villageRowIndex];
    const villageName = villageRow?.[col];

    // Skip empty columns or reference errors
    if (!isNonEmptyString(villageName) || villageName === '#REF!') {
        return null;
    }

    // Extract village metadata
    const metadata = extractVillageMetadata(data, col);

    // Extract compliance items
    const sec92Items = extractComplianceItems(
        data,
        col,
        EXCEL_ROW_INDICES.SEC92_START,
        EXCEL_ROW_INDICES.SEC92_END,
        '9(2)'
    );

    const sec13Items = extractComplianceItems(
        data,
        col,
        EXCEL_ROW_INDICES.SEC13_START,
        EXCEL_ROW_INDICES.SEC13_END,
        '13'
    );

    // Calculate statistics
    const sec92Stats = calculateComplianceStats(sec92Items, metadata.stage);
    const sec13Stats = calculateComplianceStats(sec13Items, metadata.stage);

    const overallPercent = (sec92Stats.percent + sec13Stats.percent) / 2;
    const overallStatus: 'Completed' | 'Pending' =
        metadata.stage.toLowerCase().includes('13 published') ? 'Completed' : 'Pending';

    return {
        id: `${villageName}-${col}`,
        name: villageName,
        district: districtName,
        headSurveyor: metadata.headSurveyor,
        governmentSurveyor: metadata.governmentSurveyor,
        assistantDirector: metadata.assistantDirector,
        superintendent: metadata.superintendent,
        stage: metadata.stage,
        publishedDate: metadata.publishedDate,
        daysPassedAfter92: metadata.daysPassedAfter92,
        isCritical: metadata.isCritical,
        sec92_items: sec92Items,
        sec92_completed_count: sec92Stats.completedCount,
        sec92_total_count: sec92Items.length,
        sec92_percent: sec92Stats.percent,
        sec92_status: sec92Stats.status,
        sec13_items: sec13Items,
        sec13_completed_count: sec13Stats.completedCount,
        sec13_total_count: sec13Items.length,
        sec13_percent: sec13Stats.percent,
        sec13_status: sec13Stats.status,
        overall_percent: overallPercent,
        overall_status: overallStatus
    };
}

/**
 * Extracts village metadata from various rows
 */
function extractVillageMetadata(data: ExcelRow[], col: number) {
    const stageRow = data[EXCEL_ROW_INDICES.STAGE];
    const stage = stageRow?.[col] ? String(stageRow[col]).trim() : 'Unknown';

    let publishedDate: string | null = null;
    let daysPassedAfter92: number | null = null;
    let isCritical = false;

    // Only extract date if stage includes "9(2) Published"
    if (stage.toLowerCase().includes('9(2)') && stage.toLowerCase().includes('published')) {
        const dateRow = data[EXCEL_ROW_INDICES.PUBLISHED_DATE];
        const dateValue = dateRow?.[col];

        if (isValidNumber(dateValue)) {
            publishedDate = excelDateToISO(dateValue);
        }

        const daysRow = data[EXCEL_ROW_INDICES.DAYS_PASSED];
        const daysValue = daysRow?.[col];

        if (isValidNumber(daysValue)) {
            daysPassedAfter92 = daysValue;
            isCritical = daysValue >= COMPLIANCE_THRESHOLDS.CRITICAL_DAYS;
        }
    }

    return {
        stage,
        publishedDate,
        daysPassedAfter92,
        isCritical,
        headSurveyor: getRowValue(data, EXCEL_ROW_INDICES.HEAD_SURVEYOR, col, 'Not Assigned'),
        governmentSurveyor: getRowValue(data, EXCEL_ROW_INDICES.GOVERNMENT_SURVEYOR, col, 'Not Assigned'),
        assistantDirector: getRowValue(data, EXCEL_ROW_INDICES.ASSISTANT_DIRECTOR, col, 'Not Assigned'),
        superintendent: getRowValue(data, EXCEL_ROW_INDICES.SUPERINTENDENT, col, 'Not Assigned'),
    };
}

/**
 * Safely extracts a value from a specific row and column
 */
function getRowValue(
    data: ExcelRow[],
    rowIndex: number,
    colIndex: number,
    defaultValue: string
): string {
    const row = data[rowIndex];
    const value = row?.[colIndex];
    return isNonEmptyString(value) ? value.trim() : defaultValue;
}

/**
 * Extracts compliance items from a range of rows
 */
function extractComplianceItems(
    data: ExcelRow[],
    col: number,
    startRow: number,
    endRow: number,
    sectionPrefix: string
): ComplianceItem[] {
    const items: ComplianceItem[] = [];

    for (let r = startRow; r <= endRow; r++) {
        const row = data[r];
        if (!row) continue;

        const name = row[2]; // Label in Col 2
        const value = row[col];

        items.push(normalizeItem(`${sectionPrefix}-${r}`, name, value));
    }

    return items;
}

/**
 * Calculates compliance statistics for a set of items
 */
function calculateComplianceStats(items: ComplianceItem[], stage: string) {
    const completedCount = items.filter(i => i.status === 'Completed').length;
    const percent = items.reduce((sum, item) => sum + item.value, 0) / items.length;

    // Status based on stage, not compliance percentage
    const stageLower = stage.toLowerCase();
    const status: 'Completed' | 'Pending' =
        stageLower.includes('13 published') ? 'Completed' : 'Pending';

    return { completedCount, percent, status };
}

/**
 * Normalizes a compliance item value to a standard format
 * @param id - Unique identifier for the item
 * @param name - Name/label of the compliance item
 * @param value - Raw value from Excel (can be number, string, etc.)
 * @returns Normalized ComplianceItem object
 */
function normalizeItem(id: string, name: unknown, value: unknown): ComplianceItem {
    let numVal = 0;
    let status: 'Completed' | 'Pending' = 'Pending';

    if (isValidNumber(value)) {
        // Clamp value between 0 and 1
        numVal = clamp(value, 0, 1);

        // Rule: >= 90% is Completed
        if (numVal >= COMPLIANCE_THRESHOLDS.COMPLETED) {
            status = 'Completed';
        }
    } else if (typeof value === 'string') {
        const lower = value.toLowerCase().trim();
        if (lower === 'yes' || lower === 'completed' || lower === 'ready') {
            numVal = 1;
            status = 'Completed';
        } else {
            numVal = 0;
            status = 'Pending';
        }
    }

    return {
        id,
        name: String(name || 'Unknown Item'),
        value: numVal,
        status,
        raw: value as string | number | undefined
    };
}
