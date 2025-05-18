import type { ZodIssue } from 'zod';

/**
 * Represents the state of a form submission, typically returned by Server Actions.
 * Provides structured feedback to the client.
 */
export type FormState<
  TErrorKey extends string =
    | GeneralErrorKeys
    | AuthActionErrorKeys
    | ReservationActionErrorKeys,
> = {
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
  /**
   * Optional. A key for a localized error message.
   * This is used to display a specific error message to the user.
   */
  messageKey?: TErrorKey;
  /**
   * Optional. Zod validation issues.
   * This is used to display specific validation errors to the user.
   */
  issues?: ZodIssue[];
} | null;

/**
 * Defines a set of common translation keys for error messages
 * that can be reused across different Server Actions and Zod schemas.
 */
export type GeneralErrorKeys =
  | 'unknownError'
  | 'rateLimitExceeded'
  | 'submissionFailed'
  | 'requiredField'
  | 'requiredFields'
  | 'validationError'
  | 'unknownValidationError'
  | 'formNotFilled';

/**
 * Specific error keys that can be returned by authentication-related server actions.
 * These should correspond to keys in the translation files (e.g., en.json, es.json).
 */
export type AuthActionErrorKeys =
  | GeneralErrorKeys
  | 'invalidCredentials'
  | 'emailNotVerified'
  | 'userNotFound'
  | 'emailAlreadyExists'
  | 'passwordTooShort'
  | 'passwordNoMatch'
  | 'invalidToken'
  | 'linkExpired'
  | 'resendNotAllowed';

/**
 * Specific error keys that can be returned by reservation-related server actions.
 * These should correspond to keys in the translation files (e.g., en.json, es.json).
 */
export type ReservationActionErrorKeys =
  | GeneralErrorKeys
  | 'reservationDateInPast'
  | 'reservationTimeInvalid'
  | 'reservationTimeNotInFuture'
  | 'partySizeInvalid'
  | 'partySizeTooLarge'
  | 'userNotAuthenticated'
  | 'databaseError'
  | 'tableUnavailableForGuests' // If trying to book a table not suitable for party size
  | 'noTablesAvailable' // If no tables are available at all for the given time/date
  | 'slotUnavailable'; // Generic slot unavailable message
