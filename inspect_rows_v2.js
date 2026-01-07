
import * as XLSX from 'xlsx';
import fs from 'fs';

const filePath = '../DLS -  Check List.xlsx';

try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    if (workbook.SheetNames.length > 1) {
        const sheetName = workbook.SheetNames[1];
        console.log(`Analyzing sheet: '${sheetName}'`);
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        console.log(`Total Rows: ${data.length}`);

        // Print first column of every row to identify items
        console.log('\n--- Row Headers (Column 0) ---');
        data.forEach((row, index) => {
            const val = row[0];
            // Print first 50 rows and then any row containing '9(2)' or '13' or 'Code'
            if (index < 50 || (val && String(val).includes('9(2)')) || (val && String(val).includes('13')) || (val && String(val).includes('Code'))) {
                console.log(`Row ${index}: ${val}`);
            }
        });
    }
} catch (error) {
    console.error('Error:', error);
}
