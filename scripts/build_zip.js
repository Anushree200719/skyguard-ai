const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("=================================================");
console.log("📦 PACKAGING SKYGUARD AI DISTRIBUTION (.ZIP)");
console.log("=================================================\n");

const zipFileName = "SkyGuard-AI.zip";
const zipPath = path.join(__dirname, '..', zipFileName);

if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
  console.log(`  [-] Removed existing ${zipFileName}`);
}

// Use PowerShell Compress-Archive for clean cross-platform zipping on Windows
const psCommand = `powershell -ExecutionPolicy Bypass -Command "
$excludes = @('node_modules', '.venv', '__pycache__', '.git', 'dist', 'SkyGuard-AI.zip', '.DS_Store');
$files = Get-ChildItem -Path . -Exclude $excludes;
Compress-Archive -Path $files -DestinationPath '${zipFileName}' -Force;
Write-Host 'Zip created successfully.'
"`;

try {
  console.log("  [+] Compressing project files into SkyGuard-AI.zip...");
  execSync(psCommand, { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
  
  if (fs.existsSync(zipPath)) {
    const stats = fs.statSync(zipPath);
    console.log(`\n✅ Successfully generated ${zipFileName} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`📍 Archive path: ${zipPath}`);
  }
} catch (err) {
  console.error("❌ Zip creation failed:", err.message);
  process.exit(1);
}
