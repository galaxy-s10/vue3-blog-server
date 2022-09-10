const fs = require('fs');
const path = require('path');

const a = fs.existsSync(path.resolve(__dirname, './src'));
const b = fs.isDirectory(path.resolve(__dirname, './src'));
console.log(a, b);
