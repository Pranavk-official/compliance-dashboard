
import { parseExcel } from './src/lib/parser';
import * as fs from 'fs';

// Mock File API for Node environment
class MockFile {
    constructor(buffer: Buffer, name: string) {
        this.buffer = buffer;
        this.name = name;
    }
    buffer: Buffer;
    name: string;
    async arrayBuffer() {
        return this.buffer;
    }
}

async function verify() {
    try {
        const filePath = '../DLS -  Check List.xlsx';
        const buffer = fs.readFileSync(filePath);
        const file = new MockFile(buffer, 'DLS.xlsx');

        // @ts-ignore
        const districts = await parseExcel(file);

        console.log(`Parsed ${districts.length} districts.`);

        districts.forEach(d => {
            console.log(`\nDistrict: ${d.name}`);
            console.log(`Total Villages: ${d.total_villages}`);
            console.log(`Avg 9(2): ${(d.avg_92_percent * 100).toFixed(2)}%`);
            console.log(`First Village: ${d.villages[0]?.name}`);
            console.log(`First Village 9(2) Status: ${d.villages[0]?.sec92_status}`);
            console.log(`First Village 9(2) Items: ${d.villages[0]?.sec92_items.length}`);
            console.log(`First Village Item 1: ${d.villages[0]?.sec92_items[0]?.name} = ${d.villages[0]?.sec92_items[0]?.value}`);
        });

    } catch (e) {
        console.error(e);
    }
}

verify();
