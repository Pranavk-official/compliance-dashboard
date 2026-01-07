
import * as XLSX from 'xlsx';
import fs from 'fs';

const filePath = '../DLS -  Check List.xlsx';

try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = 'Thiruvananthapuram';
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log(`\nColumn 0 (Item Names) for sheet '${sheetName}':`);
    data.forEach((row, index) => {
        if (row[0]) {
            console.log(`Row ${index}: ${row[0]}`);
        }
    });

} catch (error) {
    console.error('Error reading file:', error);
}
