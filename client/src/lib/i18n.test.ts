import { describe, it, expect, beforeEach } from 'vitest';
import i18n from './i18n';
import en from '../locales/en.json';
import lv from '../locales/lv.json';
import ru from '../locales/ru.json';

// Helper to flatten nested objects into dot-notation keys
function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys = keys.concat(flattenKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

describe('i18n Translation Integrity', () => {
  const locales = { en, lv, ru };
  const localeNames = ['en', 'lv', 'ru'] as const;
  const baseKeys = flattenKeys(en);

  describe('Key Parity', () => {
    it('should have English as canonical locale with all keys', () => {
      expect(baseKeys.length).toBeGreaterThan(200);
    });

    it.each(localeNames)('%s should have all keys from English', (locale) => {
      const localeData = locales[locale];
      const localeKeys = flattenKeys(localeData);
      
      const missingKeys = baseKeys.filter(key => !localeKeys.includes(key));
      
      expect(missingKeys).toEqual([]);
    });

    it.each(localeNames)('%s should not have extra keys not in English', (locale) => {
      const localeData = locales[locale];
      const localeKeys = flattenKeys(localeData);
      
      const extraKeys = localeKeys.filter(key => !baseKeys.includes(key));
      
      expect(extraKeys).toEqual([]);
    });
  });

  describe('No Empty Translations', () => {
    it.each(localeNames)('%s should have no empty string values', (locale) => {
      const localeData = locales[locale];
      const keys = flattenKeys(localeData);
      
      const emptyKeys = keys.filter(key => {
        let current: unknown = localeData;
        for (const k of key.split('.')) {
          current = (current as Record<string, unknown>)?.[k];
        }
        return current === '' || current === null || current === undefined;
      });
      
      expect(emptyKeys).toEqual([]);
    });
  });

  describe('ICU Syntax Validation', () => {
    function validateICU(message: string): boolean {
      let braceCount = 0;
      for (const char of message) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        if (braceCount < 0) return false;
      }
      return braceCount === 0;
    }

    it.each(localeNames)('%s should have valid ICU syntax in all messages', (locale) => {
      const localeData = locales[locale];
      const keys = flattenKeys(localeData);
      
      const invalidKeys: string[] = [];
      
      keys.forEach(key => {
        let current: unknown = localeData;
        for (const k of key.split('.')) {
          current = (current as Record<string, unknown>)?.[k];
        }
        
        if (typeof current === 'string' && !validateICU(current)) {
          invalidKeys.push(key);
        }
      });
      
      expect(invalidKeys).toEqual([]);
    });
  });

  describe('Critical UI Keys Present', () => {
    const criticalKeys = [
      'app.title',
      'header.tutorial',
      'header.reset',
      'zones.main',
      'zones.guest',
      'zones.iot',
      'controls.wifiSecurity',
      'controls.strongWifiPassword',
      'controls.mfaEnabled',
      'author.winConditions',
      'badges.firstSteps',
      'author.title',
      'author.createNew',
      'common.save',
      'common.cancel'
    ];

    it.each(criticalKeys)('should have critical key: %s', (key) => {
      expect(baseKeys).toContain(key);
    });

    it.each(localeNames)('%s should have all critical keys translated', (locale) => {
      const localeData = locales[locale];
      const localeKeys = flattenKeys(localeData);
      
      const missingCritical = criticalKeys.filter(key => !localeKeys.includes(key));
      
      expect(missingCritical).toEqual([]);
    });
  });

  describe('Runtime Translation Check', () => {
    beforeEach(async () => {
      await i18n.changeLanguage('en');
    });

    it('should translate a key without returning raw key', () => {
      const translation = i18n.t('app.title');
      expect(translation).not.toContain('[MISSING:');
      expect(translation).not.toBe('app.title');
    });

    it.each(localeNames)('should translate app.title in %s', async (locale) => {
      await i18n.changeLanguage(locale);
      const translation = i18n.t('app.title');
      
      expect(translation).not.toContain('[MISSING:');
      expect(translation).toBeTruthy();
      expect(translation.length).toBeGreaterThan(0);
    });

    it.each(localeNames)('should translate all zone labels in %s', async (locale) => {
      await i18n.changeLanguage(locale);
      
      const zones = ['main', 'guest', 'iot'];
      for (const zone of zones) {
        const translation = i18n.t(`zones.${zone}`);
        expect(translation).not.toContain('[MISSING:');
        expect(translation.length).toBeGreaterThan(0);
      }
    });

    it.each(localeNames)('should translate all control labels in %s', async (locale) => {
      await i18n.changeLanguage(locale);
      
      const controls = [
        'wifiSecurity',
        'strongWifiPassword', 
        'guestNetworkEnabled',
        'iotNetworkEnabled',
        'mfaEnabled',
        'autoUpdatesEnabled',
        'defaultPasswordsAddressed'
      ];
      
      for (const control of controls) {
        const translation = i18n.t(`controls.${control}`);
        expect(translation).not.toContain('[MISSING:');
        expect(translation.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Locale Count Verification', () => {
    it('should have exactly 493 keys in all locales', () => {
      expect(flattenKeys(en).length).toBe(493);
      expect(flattenKeys(lv).length).toBe(493);
      expect(flattenKeys(ru).length).toBe(493);
    });
  });
});
