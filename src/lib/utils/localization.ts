/**
 * Safely extracts a localized string value from a field that might be a plain string,
 * a JSON string (e.g., '\{"en": "Hello", "es": "Hola"\}'), or a JavaScript object
 * with locale keys (e.g., \{ en: "Hello", es: "Hola" \}).
 *
 * It prioritizes the provided `locale`, falls back to 'en', and then to a direct
 * string representation if no structured i18n content is found.
 *
 * @param i18nField - The field containing the potentially internationalized data. Can be unknown type.
 * @param locale - The desired locale string (e.g., 'en', 'es').
 * @returns The localized string if found, or the most appropriate fallback, or null if the input is null/undefined.
 */
export function getSimpleLocalizedValue(
  i18nField: unknown,
  locale: string,
): string | null {
  if (i18nField === null || typeof i18nField === 'undefined') return null;

  // Check if i18nField is a string that might be JSON
  if (typeof i18nField === 'string') {
    try {
      const parsed = JSON.parse(i18nField);

      // Ensure parsed is an object before trying to access locale keys
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed[locale] || parsed.en || String(parsed);
      }

      return i18nField; // Return original string if not parsable to a suitable object
    } catch {
      // If JSON.parse fails, it's likely a plain string, so return it directly.
      return i18nField;
    }
  }

  // Check if i18nField is an object (but not null, already checked)
  if (typeof i18nField === 'object') {
    // We need to assert the type here or use a more specific type for i18nField if possible
    // For now, using a type assertion assuming it's a Record<string, string>
    const obj = i18nField as Record<string, string>; // Be cautious with direct type assertions
    return obj[locale] || obj.en || null; // Fallback to null if no 'en' key and not stringifiable
  }

  // Fallback for other types (e.g., number, boolean if they were somehow passed)
  return String(i18nField);
}
