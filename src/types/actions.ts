/**
 * Represents the state of a form submission, typically returned by Server Actions.
 * Provides structured feedback to the client.
 */
export type FormState = {
  /** A general message summarizing the outcome (e.g., "Validation failed", "Successfully signed up"). */
  message: string;
  /** Indicates whether the operation was a 'success' or an 'error'. */
  type: 'success' | 'error';
  /**
   * Optional. A record of field-specific error messages.
   * The keys are field names, and the values are arrays of error strings for that field.
   * This structure is compatible with Zod's `flatten().fieldErrors`.
   */
  fieldErrors?: Record<string, string[] | undefined>;
  /**
   * Optional. A timestamp that can be used to help trigger UI updates
   * if the message and type alone are not sufficient to cause a re-render.
   */
  timestamp?: number;
} | null;

/**
 * Defines a set of common translation keys for error messages
 * that can be reused across different Server Actions and Zod schemas.
 */
export type GeneralErrorKeys =
  | 'validationError' // General validation error message
  | 'unknownValidationError' // Fallback for an unrecognized validation error key
  | 'requiredFields'; // Message indicating some fields are required
