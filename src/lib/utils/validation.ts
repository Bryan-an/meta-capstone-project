import type { SafeParseReturnType, ZodError, ZodIssue } from 'zod';
import type { FormState, GeneralErrorKeys } from '@/types/actions'; // Adjust path as necessary

/**
 * Processes Zod validation errors and prepares a structured {@link FormState} object.
 * This function is generic and can be used with different Zod schemas and translation key sets.
 *
 * @typeParam TInput - The type of the input data being validated.
 * @typeParam TOutput - The type of the successfully parsed output data.
 * @typeParam TSchemaErrorKey - The union type of specific translation keys that Zod schemas are configured
 * to return as error messages (e.g., 'invalidEmail', 'passwordTooShort').
 * @param validatedFields - The result from Zod's `safeParse` method.
 * @param t - The translation function (from `getTranslations` or `useTranslations`).
 * It takes a key of type `TSchemaErrorKey` or `GeneralErrorKeys` and returns the translated string.
 * @returns A `FormState` object if validation fails, containing translated error messages,
 * or `null` if validation is successful.
 */
export function processZodErrors<
  TInput,
  TOutput,
  TSchemaErrorKey extends string,
>(
  validatedFields: SafeParseReturnType<TInput, TOutput>,
  t: (key: TSchemaErrorKey | GeneralErrorKeys) => string,
): Pick<
  NonNullable<FormState>,
  'message' | 'type' | 'fieldErrors' | 'timestamp'
> | null {
  if (!validatedFields.success) {
    const fieldErrors: Record<string, string[]> = {};

    const zodFlattenedErrors = (
      validatedFields.error as ZodError<TInput>
    ).flatten((issue: ZodIssue) => issue.message as TSchemaErrorKey);

    // Process field-specific errors
    for (const fieldKey in zodFlattenedErrors.fieldErrors) {
      if (
        Object.prototype.hasOwnProperty.call(
          zodFlattenedErrors.fieldErrors,
          fieldKey,
        )
      ) {
        const errorMessages = zodFlattenedErrors.fieldErrors[
          fieldKey as keyof typeof zodFlattenedErrors.fieldErrors
        ] as TSchemaErrorKey[] | undefined;

        if (errorMessages && errorMessages.length > 0) {
          fieldErrors[fieldKey] = errorMessages.map((errKey) => {
            try {
              return t(errKey);
            } catch (e: unknown) {
              // Handle cases where a key might be missing in translations,
              // though ideally, all keys from Zod schemas should be in message files.
              if (
                typeof e === 'object' &&
                e !== null &&
                'code' in e &&
                (e as { code: string }).code === 'MISSING_MESSAGE'
              ) {
                // Fallback to a generic unknown error message
                return t('unknownValidationError');
              }

              // Re-throw other unexpected errors
              throw e;
            }
          });
        }
      }
    }

    return {
      message: t('validationError'), // General validation error message
      type: 'error',
      fieldErrors,
      timestamp: Date.now(),
    };
  }

  return null; // Indicates validation was successful
}
