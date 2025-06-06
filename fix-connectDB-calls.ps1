$file = "src/app/api/users/[id]/route.ts"
Write-Host "Processing $file"

# Get the content of the file
$content = Get-Content $file

# Replace all instances of connectDB with connectToDatabase
$updatedContent = $content -replace 'await connectDB\(\);', 'await connectToDatabase();'

# Write the updated content back to the file
Set-Content $file -Value $updatedContent
Write-Host "Updated $file"
