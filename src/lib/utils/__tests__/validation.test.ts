import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { processZodErrors } from '../validation';
import type { FormState, GeneralErrorKeys } from '@/types/actions';

const TestSchema = z.object({
  name: z.string().min(1, { message: 'nameRequired' as const }),
  email: z.string().email({ message: 'emailInvalid' as const }),
  age: z.number().min(18, { message: 'ageTooYoung' as const }),
});

type TestInput = z.input<typeof TestSchema>;
type TestOutput = z.output<typeof TestSchema>;
type TestSchemaErrorKey = 'nameRequired' | 'emailInvalid' | 'ageTooYoung';

const KEY_THAT_WILL_BE_MISSING = 'keyThatWillBeMissing' as const;
type KeyThatWillBeMissingType = typeof KEY_THAT_WILL_BE_MISSING;

const KEY_THAT_WILL_THROW_UNEXPECTED_ERROR =
  'keyThatWillThrowUnexpectedError' as const;

type KeyThatWillThrowUnexpectedErrorType =
  typeof KEY_THAT_WILL_THROW_UNEXPECTED_ERROR;

type MockTestSpecificKeys =
  | KeyThatWillBeMissingType
  | KeyThatWillThrowUnexpectedErrorType;

const schemaErrorTranslations: Record<TestSchemaErrorKey, string> = {
  nameRequired: 'Name is required.',
  emailInvalid: 'Email is not valid.',
  ageTooYoung: 'Must be 18 or older.',
};

const generalErrorTranslations: Record<GeneralErrorKeys, string> = {
  validationError: 'Please correct the errors below.',
  unknownValidationError: 'An unknown validation error occurred.',
  unknownError: 'Simulated unknown error',
  rateLimitExceeded: 'Simulated rate limit exceeded',
  submissionFailed: 'Simulated submission failed',
  requiredField: 'Simulated required field',
  requiredFields: 'Simulated required fields',
  formNotFilled: 'Simulated form not filled',
};

const mockTestSpecificTranslations: Record<MockTestSpecificKeys, string> = {
  [KEY_THAT_WILL_BE_MISSING]: 'This should not be returned directly',
  [KEY_THAT_WILL_THROW_UNEXPECTED_ERROR]:
    'This should not be returned directly',
};

const allMockTranslations: Record<
  TestSchemaErrorKey | GeneralErrorKeys | MockTestSpecificKeys,
  string
> = {
  ...schemaErrorTranslations,
  ...generalErrorTranslations,
  ...mockTestSpecificTranslations,
};

const mockT = (
  key: TestSchemaErrorKey | GeneralErrorKeys | MockTestSpecificKeys,
): string => {
  if (key === KEY_THAT_WILL_BE_MISSING) {
    const error = new Error(`Missing message for key: ${key}`) as Error & {
      code?: string;
    };

    error.code = 'MISSING_MESSAGE';
    throw error;
  }

  if (key === KEY_THAT_WILL_THROW_UNEXPECTED_ERROR) {
    throw new Error('Unexpected translation error!');
  }

  const translated = allMockTranslations[key];

  if (translated === undefined) {
    return `UNTRANSLATED: ${key}`;
  }

  return translated;
};

describe('processZodErrors', () => {
  it('should return null if validation is successful', () => {
    const validInput: TestInput = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
    };

    const validatedFields = TestSchema.safeParse(validInput);

    const result = processZodErrors<TestInput, TestOutput, TestSchemaErrorKey>(
      validatedFields,
      mockT,
    );

    expect(result).toBeNull();
  });

  it('should return FormState with one field error if validation fails', () => {
    const invalidInput: TestInput = {
      name: '',
      email: 'john@example.com',
      age: 30,
    };

    const validatedFields = TestSchema.safeParse(invalidInput);

    const result = processZodErrors<TestInput, TestOutput, TestSchemaErrorKey>(
      validatedFields,
      mockT,
    ) as NonNullable<FormState>;

    expect(result).not.toBeNull();
    expect(result.type).toBe('error');
    expect(result.message).toBe(allMockTranslations.validationError);

    if (result.fieldErrors) {
      expect(result.fieldErrors.name).toEqual([
        allMockTranslations.nameRequired,
      ]);

      expect(result.fieldErrors.email).toBeUndefined();
      expect(result.fieldErrors.age).toBeUndefined();
    }

    expect(result.timestamp).toBeTypeOf('number');
  });

  it('should return FormState with multiple field errors if validation fails', () => {
    const invalidInput: TestInput = {
      name: 'John',
      email: 'not-an-email',
      age: 17,
    };

    const validatedFields = TestSchema.safeParse(invalidInput);

    const result = processZodErrors<TestInput, TestOutput, TestSchemaErrorKey>(
      validatedFields,
      mockT,
    ) as NonNullable<FormState>;

    expect(result).not.toBeNull();
    expect(result.type).toBe('error');
    expect(result.message).toBe(allMockTranslations.validationError);

    if (result.fieldErrors) {
      expect(result.fieldErrors.email).toEqual([
        allMockTranslations.emailInvalid,
      ]);

      expect(result.fieldErrors.age).toEqual([allMockTranslations.ageTooYoung]);
      expect(result.fieldErrors.name).toBeUndefined();
    }
  });

  it('should use unknownValidationError for missing translation keys (MISSING_MESSAGE error)', () => {
    const SchemaWithMissingKey = z.object({
      testField: z.string().min(1, { message: KEY_THAT_WILL_BE_MISSING }),
    });

    type SchemaWithMissingKeyInput = z.input<typeof SchemaWithMissingKey>;
    type SchemaWithMissingKeyOutput = z.output<typeof SchemaWithMissingKey>;

    const invalidInput: SchemaWithMissingKeyInput = { testField: '' };
    const validatedFields = SchemaWithMissingKey.safeParse(invalidInput);

    const result = processZodErrors<
      SchemaWithMissingKeyInput,
      SchemaWithMissingKeyOutput,
      KeyThatWillBeMissingType
    >(validatedFields, mockT) as NonNullable<FormState>;

    expect(result).not.toBeNull();

    if (result.fieldErrors) {
      expect(result.fieldErrors.testField).toEqual([
        allMockTranslations.unknownValidationError,
      ]);
    }
  });

  it('should re-throw unexpected errors from the translation function', () => {
    const SchemaWithUnexpectedErrorKey = z.object({
      anotherField: z
        .string()
        .min(1, { message: KEY_THAT_WILL_THROW_UNEXPECTED_ERROR }),
    });

    type SchemaWithUnexpectedErrorKeyInput = z.input<
      typeof SchemaWithUnexpectedErrorKey
    >;

    type SchemaWithUnexpectedErrorKeyOutput = z.output<
      typeof SchemaWithUnexpectedErrorKey
    >;

    const invalidInput: SchemaWithUnexpectedErrorKeyInput = {
      anotherField: '',
    };

    const validatedFields =
      SchemaWithUnexpectedErrorKey.safeParse(invalidInput);

    expect(() =>
      processZodErrors<
        SchemaWithUnexpectedErrorKeyInput,
        SchemaWithUnexpectedErrorKeyOutput,
        KeyThatWillThrowUnexpectedErrorType
      >(validatedFields, mockT),
    ).toThrow('Unexpected translation error!');
  });
});
