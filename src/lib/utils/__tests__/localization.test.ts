import { describe, it, expect } from 'vitest';
import { getSimpleLocalizedValue } from '../localization';

describe('getSimpleLocalizedValue', () => {
  it('should return null if i18nField is null', () => {
    expect(getSimpleLocalizedValue(null, 'en')).toBeNull();
  });

  it('should return null if i18nField is undefined', () => {
    expect(getSimpleLocalizedValue(undefined, 'en')).toBeNull();
  });

  it('should return the string itself if i18nField is a plain string', () => {
    expect(getSimpleLocalizedValue('Hello', 'en')).toBe('Hello');
  });

  it('should return the string itself if i18nField is a non-JSON string that looks like an object', () => {
    expect(getSimpleLocalizedValue('{en: "Hello"}', 'en')).toBe(
      '{en: "Hello"}',
    );
  });

  it('should extract value from JSON string for the given locale', () => {
    const jsonString = '{"en": "Hello", "es": "Hola"}';
    expect(getSimpleLocalizedValue(jsonString, 'es')).toBe('Hola');
  });

  it("should fallback to 'en' from JSON string if locale not found", () => {
    const jsonString = '{"en": "Hello", "fr": "Bonjour"}';
    expect(getSimpleLocalizedValue(jsonString, 'es')).toBe('Hello');
  });

  it("should return the original JSON string if locale and 'en' not found", () => {
    const jsonString = '{"fr": "Bonjour", "de": "Guten Tag"}';

    expect(getSimpleLocalizedValue(jsonString, 'es')).toBe(
      String(JSON.parse(jsonString)),
    );
  });

  it("should return the original string if JSON parsing fails but it's a valid string", () => {
    const malformedJsonString = '{"en": "Hello'; // Missing closing brace and quote

    expect(getSimpleLocalizedValue(malformedJsonString, 'en')).toBe(
      malformedJsonString,
    );
  });

  it('should extract value from object for the given locale', () => {
    const obj = { en: 'Hello', es: 'Hola' };
    expect(getSimpleLocalizedValue(obj, 'es')).toBe('Hola');
  });

  it("should fallback to 'en' from object if locale not found", () => {
    const obj = { en: 'Hello', fr: 'Bonjour' };
    expect(getSimpleLocalizedValue(obj, 'es')).toBe('Hello');
  });

  it("should return null from object if locale and 'en' not found", () => {
    const obj = { fr: 'Bonjour', de: 'Guten Tag' };
    expect(getSimpleLocalizedValue(obj, 'es')).toBeNull();
  });

  it('should convert other data types to string as a last resort', () => {
    expect(getSimpleLocalizedValue(123, 'en')).toBe('123');
    expect(getSimpleLocalizedValue(true, 'en')).toBe('true');
  });

  it('should handle JSON string that is not an object gracefully', () => {
    const jsonStringArray = '["en", "es"]';
    const expectedStringifiedArray = JSON.parse(jsonStringArray).toString();

    expect(getSimpleLocalizedValue(jsonStringArray, 'en')).toBe(
      expectedStringifiedArray,
    );
  });

  it('should handle empty object correctly', () => {
    expect(getSimpleLocalizedValue({}, 'en')).toBeNull();
  });

  it('should handle object with only non-target, non-en locale correctly', () => {
    const obj = { fr: 'Bonjour' };
    expect(getSimpleLocalizedValue(obj, 'es')).toBeNull();
  });
});
