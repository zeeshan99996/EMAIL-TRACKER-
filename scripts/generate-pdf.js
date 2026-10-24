const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = path.resolve(__dirname, '..', 'report.html');
const pdfPath = path.resolve(__dirname, '..', 'MAILIFY_PRO_SYSTEM_ARCHITECTURE_REPORT.pdf');
const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');

console.log('Rendering PDF from:', fileUrl);
console.log('Target PDF:', pdfPath);

const command = `"${chromePath}" --headless=new --disable-gpu --no-pdf-header-footer --run-all-compositor-stages-before-draw --print-to-pdf="${pdfPath}" "${fileUrl}"`;

try {
  execSync(command, { stdio: 'inherit' });
  if (fs.existsSync(pdfPath)) {
    const stat = fs.statSync(pdfPath);
    console.log(`✅ PDF Generated successfully! Size: ${stat.size} bytes`);
  } else {
    console.error('❌ PDF file was not created.');
  }
} catch (err) {
  console.error('Error executing Chrome:', err.message);
}
