import { describe, it, expect } from 'vitest';
import { pl } from '../../src/i18n/pl';
import { en } from '../../src/i18n/en';

type NestedRecord = { [key: string]: string | NestedRecord };

function collectKeys(obj: NestedRecord, prefix = ''): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (typeof value === 'object' && value !== null) {
      keys.push(...collectKeys(value as NestedRecord, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function getValue(obj: NestedRecord, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, k) => {
    if (acc && typeof acc === 'object') {
      return (acc as NestedRecord)[k];
    }
    return undefined;
  }, obj);
}

describe('i18n completeness', () => {
  const plKeys = collectKeys(pl as unknown as NestedRecord);
  const enKeys = collectKeys(en as unknown as NestedRecord);

  it('English has all keys that Polish has', () => {
    const missingInEn = plKeys.filter((k) => !enKeys.includes(k));
    expect(missingInEn, `Keys missing in en.ts: ${missingInEn.join(', ')}`).toEqual([]);
  });

  it('Polish has all keys that English has', () => {
    const missingInPl = enKeys.filter((k) => !plKeys.includes(k));
    expect(missingInPl, `Keys missing in pl.ts: ${missingInPl.join(', ')}`).toEqual([]);
  });

  it('no Polish translation value is an empty string', () => {
    const empty = plKeys.filter((k) => getValue(pl as unknown as NestedRecord, k) === '');
    expect(empty, `Empty values in pl.ts: ${empty.join(', ')}`).toEqual([]);
  });

  it('no English translation value is an empty string', () => {
    const empty = enKeys.filter((k) => getValue(en as unknown as NestedRecord, k) === '');
    expect(empty, `Empty values in en.ts: ${empty.join(', ')}`).toEqual([]);
  });
});
