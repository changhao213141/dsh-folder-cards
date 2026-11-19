#!/usr/bin/env node
/**
 * Smoke checks for the published bundle. No dependencies, no network:
 * everything here is what a broken commit would otherwise ship.
 *
 *   node test/smoke.mjs
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

const read = file => readFileSync(join(root, file), 'utf8');
const exists = file => existsSync(join(root, file));
const fileSize = file => (exists(file) ? statSync(join(root, file)).size : 0);

function check(name, run) {
  try {
    const problem = run();
    if (problem) failures.push(`${name}: ${problem}`);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
  }
}

check('package.json', () => {
  const pkg = JSON.parse(read('package.json'));
  if (pkg.name !== 'dsh-folder-cards') return `unexpected name ${pkg.name}`;
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(pkg.version)) return `bad version ${pkg.version}`;
  if (!pkg.dsh || !pkg.dsh.bundle || !pkg.dsh.bundle.patch) return 'dsh.bundle.patch is missing';
  if (!pkg.dsh.client || pkg.dsh.client.platform !== 'web') return 'dsh.client with platform "web" is missing';
  if (!pkg.engines || !pkg.engines.dsh) return 'engines.dsh is missing';
  if (!pkg.exports || !pkg.exports['./client']) return 'exports["./client"] is missing';
  if (!pkg.exports['./locale/*.json']) return 'exports for locale files is missing';
  if (!pkg.exports['./icon']) return 'exports["./icon"] is missing';
  if (!Array.isArray(pkg.files) || !pkg.files.includes('client.js')) return 'files[] must ship client.js';
  if (!Array.isArray(pkg.files) || !pkg.files.includes('cordis.patch.yml')) return 'files[] must ship cordis.patch.yml';
  return null;
});

check('cordis.patch.yml', () => {
  const pkg = JSON.parse(read('package.json'));
  const patch = read('cordis.patch.yml');
  if (!patch.includes(`name: '${pkg.name}'`)) return 'patch row name does not match the package name';
  if (!/id:\s*\S+/.test(patch)) return 'patch row id is missing';
  return null;
});

check('client.js', () => {
  const bundle = read('client.js');
  if (!bundle.includes("id: 'dsh-folder-cards'")) return 'the module loader id is missing';
  for (const slot of ['sidebar.workspaces', 'conversation.input.left', 'settings.section']) {
    if (!bundle.includes(slot)) return `the ${slot} registration is missing`;
  }
  new Function(bundle); // parses the bundle without executing it
  return null;
});

check('src sections', () => {
  const dir = join(root, 'src');
  if (!existsSync(dir)) return 'src/ is missing';
  const sections = readdirSync(dir).filter(name => name.endsWith('.js')).sort();
  if (sections.length < 8) return `expected at least 8 sections, found ${sections.length}`;
  for (const name of sections) {
    if (fileSize(join('src', name)) < 300) return `src/${name} looks empty`;
  }
  return null;
});

check('locales', () => {
  for (const locale of ['zh', 'en']) {
    const file = `locale/${locale}.json`;
    if (!exists(file)) return `${file} is missing`;
    const data = JSON.parse(read(file));
    const meta = data && data.meta ? data.meta : {};
    if (!meta.title) return `${file} has no meta.title`;
    if (!meta.description) return `${file} has no meta.description`;
  }
  const zh = JSON.parse(read('locale/zh.json')).meta;
  if (zh.detail && !exists(zh.detail)) return `meta.detail points at a missing file: ${zh.detail}`;
  return null;
});

check('icon', () => {
  if (!exists('icon.svg')) return 'icon.svg is missing';
  const svg = read('icon.svg');
  if (!svg.trimStart().startsWith('<svg')) return 'icon.svg is not an SVG document';
  if (fileSize('icon.svg') > 256 * 1024) return 'icon.svg exceeds 256 KiB';
  return null;
});

check('screenshots.json', () => {
  if (!exists('screenshots.json')) return 'screenshots.json is missing';
  const data = JSON.parse(read('screenshots.json'));
  const list = Array.isArray(data) ? data : data.screenshots;
  if (!Array.isArray(list) || list.length < 1 || list.length > 8) return 'expected 1 to 8 screenshots';
  for (const item of list) {
    if (!exists(item)) return `screenshot does not exist: ${item}`;
  }
  return null;
});

check('README images', () => {
  for (const file of ['README.md', 'README.en.md']) {
    if (!exists(file)) return `${file} is missing`;
    const text = read(file);
    const refs = [];
    for (const match of text.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)) refs.push(match[1]);
    for (const match of text.matchAll(/<img[^>]+src="([^"]+)"/g)) refs.push(match[1]);
    for (const ref of refs) {
      if (/^https?:/i.test(ref)) continue;
      if (!exists(ref)) return `${file} references a missing image: ${ref}`;
    }
  }
  return null;
});

check('no machine-specific paths', () => {
  const files = ['package.json', 'README.md', 'README.en.md', 'CONTRIBUTING.md', 'cordis.patch.yml'];
  for (const file of files) {
    if (!exists(file)) continue;
    const text = read(file);
    if (/[A-Za-z]:\\\\/.test(text) || /\/Users\/[a-z0-9._-]+\//i.test(text)) {
      return `${file} contains an absolute local path`;
    }
  }
  return null;
});

if (failures.length > 0) {
  console.error(`smoke test failed (${failures.length}):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log('smoke test passed.');
