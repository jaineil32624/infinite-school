// Bundles index.html + all scripts into one self-contained file: dist/infinite-school.html
// Usage: node tools/build.js
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace(/<script src="([^"]+)"><\/script>/g, (m, src) => {
  const code = fs.readFileSync(path.join(root, src), 'utf8').replace(/<\/script/gi, '<\\/script');
  return '<script>/* ' + src + ' */\n' + code + '\n</script>';
});
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'infinite-school.html'), html);
console.log('Built dist/infinite-school.html (' + Math.round(html.length / 1024) + ' KB)');
