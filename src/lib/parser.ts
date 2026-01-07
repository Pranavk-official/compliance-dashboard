
import * as XLSX from 'xlsx';
import type { District, Village, ComplianceItem } from './types';

// Row Indices (0-based) based on inspection
// const ROW_VILLAGE_NAME = 1;

// Section 9(2) Items: Rows 59-72 (Indices 59 to 72 inclusive? Let's re-verify line numbers vs array index)
// In `inspect_rows_deep.js`: "Row 59: Percentage of Digital Survey Completed"
// Array index 59 corresponds to Excel Row 60.
// Let's assume the inspection script output "Row X" matches the array index `data[X]`.
// Yes, `data.forEach((row, index) => ... console.log('Row ' + index ...)` 
// So indices are correct.

// const SEC92_START_ROW = 59;
// const SEC92_END_ROW = 72; // Inclusive

// const SEC13_START_ROW = 75;
// const SEC13_END_ROW = 87; // Inclusive

// const DATA_START_COL = 3; // "PARASUVAIKKAL" is at index 3 in Row 53 (which is `Row 1` relative to data? No, `inspect_rows_deep` showed `Row 53` has Village names).
// Wait, `inspect_rows_deep` showed:
// Row 53: [null,null,"Village","PARASUVAIKKAL","KEEZHATTINGAL"]
// So Village Names are at Row 53?
// But `inspect_rows_v2` said "Row 1: Village".
// Ah, `inspect_rows_deep` was showing `data[i]`. 
// "Row 53" in `inspect_rows_deep` output means index 53.
// But `inspect_rows_v2` showed "Row 1: Village". 
// WHY IS THERE A DISCREPANCY?
// `inspect_rows_v2` used `sheet_to_json({header:1})` and printed `row[0]`.
// `inspect_rows_deep` printed rows 50-100.
// In `inspect_rows_deep`: `Row 53: [null,null,"Village","PARASUVAIKKAL"`. 
// This implies Row 53 (index) contains the Village headers.
// BUT `inspect_rows_v2` said `Row 1: Village`.
// This implies the file might have hidden rows or the inspection scripts ran on different sheets or I misread.
// `inspect_rows_v2` output: "Analyzing sheet: 'NTA'". 
// `inspect_rows_deep`: "Row 52: [null,null,"District"...]".
// It seems `inspect_rows_deep` output corresponds to indices around 50+.
// Wait, `inspect_rows_deep` loop: `for (let i = 50; i < 100; i++)`.
// So it printed content at index 50+.
// AND it found "Village" at index 53.
// `inspect_rows_v2` found "Village" at index 1.
// DIFFERENT SHEETS?
// `inspect_rows_v2`: "Analyzing sheet: 'NTA'".
// `inspect_rows_deep`: `workbook.SheetNames[1]` (which is likely NTA or Thiruvananthapuram).
// Let's re-read `inspect_rows_v2` output.
// "Row 0: District", "Row 1: Village".
// This suggests simpler structure.
// `inspect_rows_deep` output:
// "Row 52: [null, null, "District"...]"
// This looks like the table HEADER is repeated or shifted?
// OR, `inspect_rows_v2` output was processing a DIFFERENT sheet or I am hallucinating.
// Check `inspect_rows_v2.js` code: `const sheetName = workbook.SheetNames[1];`.
// Check `inspect_rows_deep.js` code: `const sheetName = workbook.SheetNames[1];`.
// They accessed the SAME sheet.
// How can Row 1 have "Village" and Row 53 have "Village"?
// Maybe "Village" appears multiple times?
// `inspect_rows_v2` printed `row[0]`.
// `inspect_rows_deep` printed `row`.
// In `inspect_rows_deep`: `Row 53: [null, null, "Village", ...]` -> Column 2 is "Village". Column 0 is null.
// In `inspect_rows_v2`: `Row 1: Village` -> Column 0 is "Village".
// This implies Row 1 has "Village" in Col 0. Row 53 has "Village" in Col 2.
// The data seems to be in a layout where Column A/B/C has labels.
// `inspect_rows_deep` showed `Row 53` has "Village" in Col 2 (`data[53][2]`).
// `inspect_rows_v2` showed `Row 1` has "Village" in Col 0 (`data[1][0]`).

// CRITICAL: The rows 59-72 and 75-87 I identified earlier from `inspect_rows_deep` output...
// Row 59 in `inspect_rows_deep` output was: `[null,null,"Percentage of Digital Survey Completed",1,1]`.
// So the labels are in Column 2 (Index 2).
// The values start from Column 3 (Index 3).

// So, for each sheet:
// Village Names are in Row 53, starting Col 3.
// District Name is in Row 52, Col 3.
// 9(2) Items are in Rows 59-72 (Indices). 
// 13 Items are in Rows 75-87 (Indices).

// Wait, what about `inspect_rows_v2` finding "Row 1: Village"? 
// Maybe the file has a "Print Area" or split view? 
// No, `xlsx` parses the whole sheet.
// It is possible row 1 contains "Village" in Col 0 (Metadata?) and Row 53 contains the table header.
// I will trust the DEEP inspection because it showed the actual DATA VALUES (1, 0, 0.19...).
// Deep inspection showed:
// Row 53: Village names in Col 3+.
// Row 59+: Compliance items.

// Re-verifying indices from `inspect_rows_deep` output:
// Row 59: "Percentage of..." (Item 1 of 9(2))
// Row 72: "Rediness for 9(2)..." (Last item of 9(2))?
// Row 73: []
// Row 74: "13 Compliance Items"
// Row 75: "Percentage of Certification..." (Item 1 of 13)
// Row 87: "Verification of Topology..." (Last item of 13)

export const parseExcel = async (file: File): Promise<District[]> => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    // Ignore Sheet 0 (Guideline)
    // Process all other sheets
    const districts: District[] = [];

    // Skip first sheet (index 0)
    for (let i = 1; i < workbook.SheetNames.length; i++) {
        const sheetName = workbook.SheetNames[i];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]; // Array of Arrays

        // Locate Village Row. Based on deep inspection, it's Row 53 (Index 53).
        // Let's try to dynamic find "Village" in Col 2 just in case.
        let villageRowIndex = 53;
        let dataStartCol = 3;

        // Simple scan for "Village" in the first 100 rows, col 2
        const foundIndex = data.findIndex(r => r && r[2] === 'Village');
        if (foundIndex !== -1) {
            villageRowIndex = foundIndex;
        }

        const villages: Village[] = [];
        const villageRow = data[villageRowIndex];

        if (!villageRow) continue;

        // Iterate Columns starting from dataStartCol
        for (let col = dataStartCol; col < villageRow.length; col++) {
            const villageName = villageRow[col];
            if (!villageName || typeof villageName !== 'string' || villageName === '#REF!') continue; // Skip empty columns or reference errors


            // Extract 9(2) Items
            const sec92_items: ComplianceItem[] = [];
            for (let r = 59; r <= 72; r++) {
                if (!data[r]) continue;
                const name = data[r][2]; // Label in Col 2
                const val = data[r][col];
                sec92_items.push(normalizeItem(`9(2)-${r}`, name, val));
            }

            // Extract 13 Items
            const sec13_items: ComplianceItem[] = [];
            for (let r = 75; r <= 87; r++) {
                if (!data[r]) continue;
                const name = data[r][2];
                const val = data[r][col];
                sec13_items.push(normalizeItem(`13-${r}`, name, val));
            }

            // Calculate Stats
            const sec92_completed = sec92_items.filter(i => i.status === 'Completed').length;
            const sec92_percent = sec92_items.reduce((sum, item) => sum + item.value, 0) / sec92_items.length;
            const sec92_status = sec92_completed === sec92_items.length ? 'Completed' : 'Pending';

            const sec13_completed = sec13_items.filter(i => i.status === 'Completed').length;
            const sec13_percent = sec13_items.reduce((sum, item) => sum + item.value, 0) / sec13_items.length;
            const sec13_status = sec13_completed === sec13_items.length ? 'Completed' : 'Pending';

            villages.push({
                id: `${villageName}-${col}`,
                name: String(villageName),
                district: sheetName,
                sec92_items,
                sec92_completed_count: sec92_completed,
                sec92_total_count: sec92_items.length,
                sec92_percent,
                sec92_status,
                sec13_items,
                sec13_completed_count: sec13_completed,
                sec13_total_count: sec13_items.length,
                sec13_percent,
                sec13_status
            });
        }

        if (villages.length > 0) {
            const avg92 = villages.reduce((sum, v) => sum + v.sec92_percent, 0) / villages.length;
            const avg13 = villages.reduce((sum, v) => sum + v.sec13_percent, 0) / villages.length;

            districts.push({
                name: sheetName,
                villages,
                total_villages: villages.length,
                avg_92_percent: avg92,
                avg_13_percent: avg13
            });
        }
    }

    return districts;
};

// Normalize Helper
function normalizeItem(id: string, name: string, value: any): ComplianceItem {
    let numVal = 0;
    let status: 'Completed' | 'Pending' = 'Pending';

    if (typeof value === 'number') {
        numVal = value;
        // Cap at 1
        if (numVal > 1) numVal = 1;
        if (numVal < 0) numVal = 0;

        // Rule: >= 75% (.75) is Completed
        if (numVal >= 0.75) status = 'Completed';
    } else if (typeof value === 'string') {
        const lower = value.toLowerCase().trim();
        if (lower === 'yes' || lower === 'completed' || lower === 'ready') {
            numVal = 1;
            status = 'Completed';
        } else {
            // Check for explicit "Pending" or "No"
            numVal = 0;
            status = 'Pending';
        }
    }

    return {
        id,
        name: String(name || 'Unknown Item'),
        value: numVal,
        status,
        raw: value
    };
}
