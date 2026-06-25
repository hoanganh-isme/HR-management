import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';

const samplesDir = './samples';
const files = [
    'HR_HopDongLaoDongReport.docx',
    'HR_HopDongLaoDong2Report.docx',
    'HR_HopDongLaoDong3Report.docx'
];

for (const file of files) {
    const filePath = path.join(samplesDir, file);
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        continue;
    }
    
    console.log(`\n========================================`);
    console.log(`FILE: ${file}`);
    console.log(`========================================`);
    
    try {
        const content = fs.readFileSync(filePath);
        const zip = new PizZip(content);
        
        // Normalize zip file paths for backslashes
        const fileNames = Object.keys(zip.files);
        for (const name of fileNames) {
            if (name.includes('\\')) {
                const normalizedName = name.replace(/\\/g, '/');
                zip.files[normalizedName] = zip.files[name];
                if (zip.files[normalizedName]) {
                    zip.files[normalizedName].name = normalizedName;
                }
                delete zip.files[name];
            }
        }
        
        if (!zip.files['word/document.xml']) {
            console.log("No word/document.xml found!");
            continue;
        }
        
        const xml = zip.files['word/document.xml'].asText();
        
        // Check for placeholders
        const matches = xml.match(/\{[^}]+\}/g);
        if (matches) {
            console.log("Placeholders found:");
            const uniqueMatches = [...new Set(matches)].sort();
            console.log(JSON.stringify(uniqueMatches, null, 2));
        } else {
            console.log("No placeholders found.");
        }
        
        console.log("\n--- Clean Document Text Content (First 1500 chars) ---");
        const text = xml.replace(/<[^>]+>/g, ' ');
        const cleanedText = text.replace(/\s+/g, ' ').trim();
        console.log(cleanedText.substring(0, 1500));
    } catch (err) {
        console.error(`Error reading ${file}:`, err);
    }
}
