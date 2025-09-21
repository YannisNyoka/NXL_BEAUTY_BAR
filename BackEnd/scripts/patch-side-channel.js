const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'node_modules', 'side-channel-list', 'index.js');

if (!fs.existsSync(target)) {
  console.warn('patch-side-channel: target not found:', target);
  process.exit(0);
}

let src = fs.readFileSync(target, 'utf8');

if (src.includes("require('es-errors/type')") && !src.includes('try {') ) {
  // Apply a safe try/catch around the require
  src = src.replace(
    "var $TypeError = require('es-errors/type');",
    "var $TypeError;\ntry {\n\t$TypeError = require('es-errors/type');\n} catch (e) {\n\t$TypeError = typeof TypeError !== 'undefined' ? TypeError : Error;\n}"
  );
  fs.writeFileSync(target, src, 'utf8');
  console.log('patch-side-channel: applied patch to', target);
} else {
  console.log('patch-side-channel: already patched or pattern not found');
}
