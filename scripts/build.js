const { cpSync, mkdirSync, rmSync } = require('node:fs');
const { join } = require('node:path');

const root = process.cwd();
const dist = join(root, 'dist');
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(join(root, 'index.html'), join(dist, 'index.html'));
cpSync(join(root, 'src'), join(dist, 'src'), { recursive: true });
for (const item of ['manifest.webmanifest', 'sw.js', 'icons']) {
  cpSync(join(root, item), join(dist, item), { recursive: true });
}
console.log('Built static PWA into dist/');
