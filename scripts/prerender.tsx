import { readFile, writeFile } from 'node:fs/promises';
import { renderToString } from 'react-dom/server';
import App from '../src/App';
const path = new URL('../dist/index.html', import.meta.url);
const html = await readFile(path, 'utf8');
if (!html.includes('<!--app-html-->')) throw new Error('Staatilise HTML-i kohatäitja puudub.');
await writeFile(path, html.replace('<!--app-html-->', renderToString(<App />)));
console.log('SEO HTML valmis: kogu lehe sisu on staatilises index.html failis.');
