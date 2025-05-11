'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';
import type { FormState, GeneralErrorKeys } from '@/types/actions';
import { processZodErrors } from '@/lib/utils/validation';

/**
 * Defines a type for the error keys used in the authentication actions.
 * This type combines the general error keys with specific authentication-related keys.
 */
export type AuthActionErrorKeys =
  | GeneralErrorKeys // Include common error keys
  | 'invalidEmail'
  | 'passwordTooShort'
  | 'passwordRequired'
  | 'signUpError'
  | 'signUpSuccess'
  | 'signInError'
  | 'signOutError';

/**
 * Zod schema for sign-up form validation.
 * This schema ensures that the email is a valid email address,
 * the password is at least 6 characters long,
 * and the confirmPassword matches the password.
 */
const SignUpSchema = z
  .object({
    email: z
      .string({
        required_error: 'requiredFields' as AuthActionErrorKeys,
      })
      .email({ message: 'invalidEmail' as AuthActionErrorKeys }),
    password: z
      .string({
        required_error: 'requiredFields' as AuthActionErrorKeys,
      })
      .min(6, { message: 'passwordTooShort' as AuthActionErrorKeys }),
    confirmPassword: z.string({
      required_error: 'requiredFields' as AuthActionErrorKeys,
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'passwordNoMatch' as AuthActionErrorKeys,
    path: ['confirmPassword'],
  });

/**
 * Zod schema for sign-in form validation.
 * This schema ensures that the email is a valid email address,
 * and the password is at least 1 character long.
 */
const SignInSchema = z.object({
  email: z
    .string({
      required_error: 'requiredFields' as AuthActionErrorKeys,
    })
    .email({ message: 'invalidEmail' as AuthActionErrorKeys }),
  password: z.string().min(1, {
    message: 'passwordRequired' as AuthActionErrorKeys,
  }),
});

/**
 * Handles user sign-up using email and password with Zod validation.
 * @param prevState - The previous form state (used with useFormState).
 * @param formData - The form data containing email and password.
 * @returns A promise that resolves to the new form state.
 */
export async function signUpWithEmailPassword(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const t = await getTranslations('AuthActions');
  const supabase = await createClient();
  const rawFormData = Object.fromEntries(formData.entries());

  // Extract locale from formData, default to 'en' if not provided
  const locale = (formData.get('locale') as string) || 'en';

  const validatedFields = SignUpSchema.safeParse(rawFormData);
  const validationErrorState = processZodErrors(validatedFields, t);

  if (validationErrorState) {
    return validationErrorState;
  }

  const { email, password } = (
    validatedFields as { data: z.infer<typeof SignUpSchema> }
  ).data;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // emailRedirectTo should point to a page that handles the session,
      // often by exchanging the code for a session with Supabase.
      // The callback route should be under [locale]
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/auth/callback`,
    },
  });

  if (error) {
    return {
      message: error.message || t('signUpError'), // Use Supabase error or fallback
      type: 'error',
      timestamp: Date.now(),
    };
  }

  // Revalidate the root path to reflect potential UI changes (e.g., showing user avatar)
  revalidatePath('/');

  return {
    message: t('emailConfirmationMessage'),
    type: 'success',
    timestamp: Date.now(),
  };
}

/**
 * Handles user sign-in using email and password with Zod validation.
 * @param prevState - The previous form state.
 * @param formData - The form data containing email and password.
 * @returns A promise that resolves to the new form state (or redirects on success).
 */
export async function signInWithEmailPassword(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const t = await getTranslations('AuthActions');
  const supabase = await createClient();
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = SignInSchema.safeParse(rawFormData);
  const validationErrorState = processZodErrors(validatedFields, t);

  if (validationErrorState) {
    return validationErrorState;
  }

  const { email, password } = (
    validatedFields as { data: z.infer<typeof SignInSchema> }
  ).data;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      message: error.message || t('signInError'), // Use Supabase error or fallback
      type: 'error',
      timestamp: Date.now(),
    };
  }

  revalidatePath('/', 'layout'); // Revalidate all data associated with the layout
  redirect('/'); // Redirect to the homepage or a dashboard after successful login
}

/**
 * Handles user sign-out.
 * This action doesn't typically take prevState or formData if it's just a button click.
 */
export async function signOut(): Promise<void> {
  const t = await getTranslations('AuthActions');
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error(t('signOutError', { errorMessage: error.message }));
    // Consider how to handle this for the user if not redirecting to an error page
  }

  revalidatePath('/', 'layout');
  redirect('/login'); // Redirect to the login page after sign out
}
