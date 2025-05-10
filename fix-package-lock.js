const fs = require('fs');
const path = require('path');

// Path to the package-lock.json file
const packageLockPath = path.join(__dirname, 'frontend', 'package-lock.json');

// Read the file content
let content = fs.readFileSync(packageLockPath, 'utf8');

// Fix the first conflict (web-vitals dependency)
content = content.replace(
  /<<<<<<< HEAD\s+("uuid": "\^11\.1\.0",)\s+"web-vitals": "\^4\.2\.4"\s+=======\s+\1\s+>>>>>>> feature\/admin-analytics-dashboard/g,
  '"uuid": "^11.1.0",\n        "web-vitals": "^4.2.4"'
);

// Fix conflicts in node_modules section
content = content.replace(
  /<<<<<<< HEAD\s+([\s\S]*?)=======\s+([\s\S]*?)>>>>>>> feature\/admin-analytics-dashboard/g,
  (match, head, feature) => {
    // Combine both sections, prioritizing feature branch content
    return feature;
  }
);

// Write the fixed content back to the file
fs.writeFileSync(packageLockPath, content, 'utf8');

console.log('Fixed package-lock.json conflicts');
