
import * as XLSX from 'xlsx';
import fs from 'fs';

const filePath = '../DLS -  Check List.xlsx';

try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[1];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const headers = data.map((row, index) => `Row ${index}: ${row[0] || ''}`).join('\n');
    fs.writeFileSync('rows.txt', headers);
    console.log('Written rows.txt');

} catch (error) {
    console.error('Error:', error);
}
