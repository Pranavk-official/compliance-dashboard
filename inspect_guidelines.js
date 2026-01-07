
import * as XLSX from 'xlsx';
import fs from 'fs';

const filePath = '../DLS -  Check List.xlsx';

try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0]; // First sheet (Guidelines)
    console.log(`Reading sheet: '${sheetName}'`);
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log(`Total Rows: ${data.length}`);

    // Print all rows to see guidelines
    data.forEach((row, index) => {
        if (row.some(c => c)) { // Print if row has any content
            console.log(`Row ${index}: ${JSON.stringify(row)}`);
        }
    });

} catch (error) {
    console.error('Error:', error);
}
