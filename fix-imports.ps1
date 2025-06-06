$files = @(
    "src/app/api/users/me/route.ts",
    "src/app/api/users/import/route.ts",
    "src/app/api/health/route.ts",
    "src/app/api/hackathons/[id]/route.ts",
    "src/app/api/hackathons/route.ts",
    "src/app/api/evaluations/route.ts",
    "src/app/api/evaluations/examiner/[id]/route.ts",
    "src/app/api/conversations/[id]/route.ts",
    "src/app/api/conversations/[id]/messages/route.ts",
    "src/app/api/conversations/[id]/final/route.ts",
    "src/app/api/conversations/[id]/ai-response/route.ts",
    "src/app/api/conversations/student/[id]/route.ts",
    "src/app/api/conversations/route.ts"
)

foreach ($file in $files) {
    Write-Host "Processing $file"
    (Get-Content $file) -replace 'import connectDB from "@/lib/mongoose";', 'import { connectToDatabase } from "@/lib/mongoose";' | Set-Content $file
    Write-Host "Updated $file"
}
