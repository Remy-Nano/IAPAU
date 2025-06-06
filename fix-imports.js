const fs = require('fs');
const path = require('path');

const files = [
    'src/app/api/users/me/route.ts',
    'src/app/api/users/import/route.ts',
    'src/app/api/users/[id]/route.ts',
    'src/app/api/users/route.ts',
    'src/app/api/health/route.ts',
    'src/app/api/hackathons/[id]/route.ts',
    'src/app/api/hackathons/route.ts',
    'src/app/api/evaluations/route.ts',
    'src/app/api/evaluations/examiner/[id]/route.ts',
    'src/app/api/conversations/[id]/route.ts',
    'src/app/api/conversations/[id]/messages/route.ts',
    'src/app/api/conversations/[id]/final/route.ts',
    'src/app/api/conversations/[id]/ai-response/route.ts',
    'src/app/api/conversations/student/[id]/route.ts',
    'src/app/api/conversations/route.ts'
];

files.forEach(file => {
    console.log(`Processing ${file}`);
    try {
        const content = fs.readFileSync(file, 'utf8');
        const updatedContent = content
            .replace('import connectDB from "@/lib/mongoose";', 'import { connectToDatabase } from "@/lib/mongoose";')
            .replace(/await connectDB\(\);/g, 'await connectToDatabase();');
        fs.writeFileSync(file, updatedContent, 'utf8');
        console.log(`Updated ${file}`);
    } catch (error) {
        console.error(`Error processing ${file}: ${error.message}`);
    }
});
