
import * as XLSX from 'xlsx';
import fs from 'fs';

const filePath = '../DLS -  Check List.xlsx';

try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    console.log('Sheet Names:', workbook.SheetNames);

    if (workbook.SheetNames.length > 1) {
        const sheetName = workbook.SheetNames[1];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        console.log(`\nHeaders for sheet '${sheetName}':`);
        console.log(data[0]);

        console.log('\nFirst 3 rows of data:');
        console.log(data.slice(1, 4));
    }
} catch (error) {
    console.error('Error reading file:', error);
}
