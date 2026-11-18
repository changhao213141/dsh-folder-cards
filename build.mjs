#!/usr/bin/env node
/**
 * Assemble the single browser module the DSH module loader expects.
 *
 * The loader hands the factory a `require` that resolves package names from the
 * module table — never relative files — so the browser half has to reach the
 * page as one script. The sections in `src/` are concatenated in file-name
 * order inside the factory closure: they share one scope, so there are no
 * imports to resolve and no bundler dependency to install.
 *
 *   node build.mjs
 *
 * `client.js` is the build output; edit `src/*.js` and rebuild.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const srcDir = join(root, 'src');
const outFile = join(root, 'client.js');

const HEADER = `window.__ModuleLoader__.load({
  id: 'dsh-folder-cards',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useCallback, useEffect, useMemo, useRef, useState } = React;
`;

const FOOTER = `  },
});
`;

const sections = readdirSync(srcDir)
  .filter(name => name.endsWith('.js'))
  .sort();
if (sections.length === 0) throw new Error('no sources found in src/');

const body = sections
  .map(name => readFileSync(join(srcDir, name), 'utf8').trimEnd())
  .join('\n\n');

writeFileSync(outFile, `${HEADER}\n${body}\n${FOOTER}`);
console.log(`built client.js from ${sections.length} sections: ${sections.join(', ')}`);
