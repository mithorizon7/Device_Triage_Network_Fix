#!/usr/bin/env node
/**
 * i18n Type Generator
 * 
 * Generates TypeScript types from the English locale file (en.json).
 * This enables compile-time checking of translation keys.
 * 
 * Output: client/src/lib/i18n-keys.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EN_LOCALE_PATH = path.join(__dirname, '../client/src/locales/en.json');
const OUTPUT_PATH = path.join(__dirname, '../client/src/lib/i18n-keys.ts');

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys = keys.concat(getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function main() {
  console.log('Generating i18n TypeScript types...');
  
  const enData = JSON.parse(fs.readFileSync(EN_LOCALE_PATH, 'utf8'));
  const keys = getAllKeys(enData).sort();
  
  const output = `/**
 * Auto-generated translation keys from en.json
 * DO NOT EDIT MANUALLY - run \`node scripts/generate-i18n-types.js\` to regenerate
 * 
 * Generated: ${new Date().toISOString()}
 * Total keys: ${keys.length}
 */

export type TranslationKey =
${keys.map(k => `  | '${k}'`).join('\n')};

export const translationKeys = [
${keys.map(k => `  '${k}',`).join('\n')}
] as const;

export type TranslationKeyType = typeof translationKeys[number];
`;

  fs.writeFileSync(OUTPUT_PATH, output);
  console.log(`Generated ${keys.length} translation keys to ${OUTPUT_PATH}`);
}

main();
