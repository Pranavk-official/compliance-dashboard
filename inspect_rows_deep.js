
import * as XLSX from 'xlsx';
import fs from 'fs';

const filePath = '../DLS -  Check List.xlsx';

try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[1];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log('--- Rows 50 to 100 Content (Cols 0-4) ---');
    for (let i = 50; i < 100; i++) {
        if (data[i]) {
            console.log(`Row ${i}: ${JSON.stringify(data[i].slice(0, 5))}`);
        }
    }

} catch (error) {
    console.error('Error:', error);
}
