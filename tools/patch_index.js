const fs = require('fs');
const path = './apps/web/public/index.html';
let content = fs.readFileSync(path, 'utf8');

// Replace standard WhatsApp Get Quote links
content = content.replace(/href="https:\/\/wa\.me\/15614034603[^"]*"/g, 'href="/client"');

// Replace the Careers Talent Pool link
content = content.replace(/href="https:\/\/careers\.bbqcarioca\.work"/g, 'href="/careers"');

fs.writeFileSync(path, content, 'utf8');
console.log('Patched index.html');
