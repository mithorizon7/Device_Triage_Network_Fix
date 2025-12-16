#!/usr/bin/env node
/**
 * i18n Validation Script
 * 
 * Validates translation files for:
 * 1. Key parity - all locales have the same keys as the base locale (English)
 * 2. No empty values - all keys have non-empty translations
 * 3. ICU syntax validation - checks for valid ICU message format
 * 4. Placeholder consistency - ensures ICU placeholders match between locales
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '../client/src/locales');
const BASE_LOCALE = 'en';
const TARGET_LOCALES = ['lv', 'ru'];

let hasErrors = false;
let hasWarnings = false;

function log(type, message) {
  const prefix = {
    error: '\x1b[31m[ERROR]\x1b[0m',
    warn: '\x1b[33m[WARN]\x1b[0m',
    info: '\x1b[36m[INFO]\x1b[0m',
    success: '\x1b[32m[OK]\x1b[0m'
  };
  console.log(`${prefix[type]} ${message}`);
}

function loadLocale(locale) {
  const filePath = path.join(LOCALES_DIR, `${locale}.json`);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    log('error', `Failed to load ${locale}.json: ${err.message}`);
    hasErrors = true;
    return null;
  }
}

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

function getValue(obj, keyPath) {
  const parts = keyPath.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
}

function extractICUPlaceholders(message) {
  if (typeof message !== 'string') return [];
  const placeholders = [];
  const regex = /\{([^,}]+)(?:,[^}]+)?\}/g;
  let match;
  while ((match = regex.exec(message)) !== null) {
    placeholders.push(match[1].trim());
  }
  return [...new Set(placeholders)].sort();
}

function validateICUSyntax(message, key, locale) {
  if (typeof message !== 'string') return true;
  
  let braceCount = 0;
  for (const char of message) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
    if (braceCount < 0) {
      log('error', `[${locale}] Invalid ICU syntax in "${key}": Unmatched closing brace`);
      hasErrors = true;
      return false;
    }
  }
  
  if (braceCount !== 0) {
    log('error', `[${locale}] Invalid ICU syntax in "${key}": Unmatched opening brace`);
    hasErrors = true;
    return false;
  }
  
  return true;
}

function validateKeyParity(baseKeys, targetLocale, targetData) {
  const targetKeys = getAllKeys(targetData);
  
  const missingInTarget = baseKeys.filter(k => !targetKeys.includes(k));
  const extraInTarget = targetKeys.filter(k => !baseKeys.includes(k));
  
  if (missingInTarget.length > 0) {
    log('error', `[${targetLocale}] Missing ${missingInTarget.length} keys from ${BASE_LOCALE}:`);
    missingInTarget.forEach(k => console.log(`    - ${k}`));
    hasErrors = true;
  }
  
  if (extraInTarget.length > 0) {
    log('warn', `[${targetLocale}] Has ${extraInTarget.length} extra keys not in ${BASE_LOCALE}:`);
    extraInTarget.forEach(k => console.log(`    - ${k}`));
    hasWarnings = true;
  }
  
  return missingInTarget.length === 0;
}

function validateEmptyValues(locale, data, keys) {
  const emptyKeys = keys.filter(key => {
    const value = getValue(data, key);
    return value === '' || value === null || value === undefined;
  });
  
  if (emptyKeys.length > 0) {
    log('error', `[${locale}] Has ${emptyKeys.length} empty/missing values:`);
    emptyKeys.forEach(k => console.log(`    - ${k}`));
    hasErrors = true;
    return false;
  }
  
  return true;
}

function validatePlaceholderConsistency(baseData, targetLocale, targetData, keys) {
  let allMatch = true;
  
  for (const key of keys) {
    const baseValue = getValue(baseData, key);
    const targetValue = getValue(targetData, key);
    
    if (typeof baseValue !== 'string' || typeof targetValue !== 'string') continue;
    
    const basePlaceholders = extractICUPlaceholders(baseValue);
    const targetPlaceholders = extractICUPlaceholders(targetValue);
    
    const missingPlaceholders = basePlaceholders.filter(p => !targetPlaceholders.includes(p));
    const extraPlaceholders = targetPlaceholders.filter(p => !basePlaceholders.includes(p));
    
    if (missingPlaceholders.length > 0) {
      log('warn', `[${targetLocale}] "${key}" missing placeholders: ${missingPlaceholders.join(', ')}`);
      hasWarnings = true;
      allMatch = false;
    }
    
    if (extraPlaceholders.length > 0) {
      log('warn', `[${targetLocale}] "${key}" has extra placeholders: ${extraPlaceholders.join(', ')}`);
      hasWarnings = true;
      allMatch = false;
    }
  }
  
  return allMatch;
}

function main() {
  console.log('\n=== i18n Validation ===\n');
  
  const baseData = loadLocale(BASE_LOCALE);
  if (!baseData) {
    process.exit(1);
  }
  
  const baseKeys = getAllKeys(baseData).sort();
  log('info', `Base locale (${BASE_LOCALE}) has ${baseKeys.length} keys`);
  
  validateEmptyValues(BASE_LOCALE, baseData, baseKeys);
  baseKeys.forEach(key => {
    validateICUSyntax(getValue(baseData, key), key, BASE_LOCALE);
  });
  
  for (const targetLocale of TARGET_LOCALES) {
    console.log('');
    const targetData = loadLocale(targetLocale);
    if (!targetData) continue;
    
    const targetKeys = getAllKeys(targetData);
    log('info', `Target locale (${targetLocale}) has ${targetKeys.length} keys`);
    
    validateKeyParity(baseKeys, targetLocale, targetData);
    
    validateEmptyValues(targetLocale, targetData, targetKeys);
    
    targetKeys.forEach(key => {
      validateICUSyntax(getValue(targetData, key), key, targetLocale);
    });
    
    validatePlaceholderConsistency(baseData, targetLocale, targetData, baseKeys);
  }
  
  console.log('\n=== Summary ===\n');
  
  if (hasErrors) {
    log('error', 'Validation failed with errors');
    process.exit(1);
  } else if (hasWarnings) {
    log('warn', 'Validation passed with warnings');
    process.exit(0);
  } else {
    log('success', 'All validations passed!');
    process.exit(0);
  }
}

main();
