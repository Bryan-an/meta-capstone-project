import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getLocale, getTranslations } from 'next-intl/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { parse } from 'date-fns';
import {
  createReservation,
  getReservationForEditAction,
  updateReservationAction,
  cancelReservationAction,
} from '../actions';

vi.mock('next-intl/server', () => ({
  getLocale: vi.fn(),
  getTranslations: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock('date-fns', () => ({
  parse: vi.fn(),
}));

const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  not: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn(),
  single: vi.fn(),
  throwOnError: vi.fn().mockReturnThis(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

vi.mock('@/lib/data/reservations', () => ({
  fetchReservationByIdForUser: vi.fn(),
}));

const { fetchReservationByIdForUser } = await import('@/lib/data/reservations');

const mockTranslations = {
  'errors.userNotAuthenticated': 'User not authenticated',
  'errors.databaseError': 'Database error',
  'errors.reservationTimeNotInFuture': 'Reservation time must be in the future',
  'errors.table_id_invalid': 'Invalid table ID',
  'errors.partySizeExceedsTableCapacity': 'Party size exceeds table capacity',
  'errors.tableAlreadyBookedAtTime': 'Table already booked at this time',
  'errors.unknownError': 'Unknown error',
  'success.reservationCreated': 'Reservation created successfully',
  'errors.requiredField': 'This field is required',
  'errors.reservationTimeInvalid': 'Invalid reservation time format',
  'errors.partySizeInvalid': 'Party size must be at least 1',
  'errors.partySizeTooLarge': 'Party size is too large',
  'errors.notFound': 'Reservation not found',
  'errors.updateFailed': 'Cannot update this reservation',
  'success.reservationUpdated': 'Reservation updated successfully',
  cancelErrorInvalidInput: 'Invalid input',
  cancelErrorUnauthorized: 'Unauthorized',
  cancelErrorNotFound: 'Reservation not found',
  cancelErrorAlreadyCancelled: 'Already cancelled',
  cancelErrorCannotCancelPast: 'Cannot cancel past reservations',
  cancelSuccess: 'Reservation cancelled successfully',
  genericError: 'Something went wrong',
  userNotAuthenticated: 'User not authenticated',
  notFound: 'Reservation not found',
  updateFailed: 'Cannot update this reservation',
  databaseError: 'Database error',
  unknownError: 'Unknown error',
};

describe('Reservation Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getLocale).mockResolvedValue('en');

    vi.mocked(getTranslations).mockImplementation(
      () =>
        Promise.resolve((key: string) => {
          return mockTranslations[key as keyof typeof mockTranslations] || key;
        }) as ReturnType<typeof getTranslations>,
    );

    mockSupabaseClient.from.mockReturnThis();
    mockSupabaseClient.select.mockReturnThis();
    mockSupabaseClient.eq.mockReturnThis();
    mockSupabaseClient.insert.mockReturnThis();
    mockSupabaseClient.update.mockReturnThis();
    mockSupabaseClient.not.mockReturnThis();
    mockSupabaseClient.in.mockReturnThis();
    mockSupabaseClient.throwOnError.mockReturnThis();

    mockSupabaseClient.update.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
  });

  describe('createReservation', () => {
    const mockUser = { id: 'user-123' };
    const validFormData = new FormData();

    beforeEach(() => {
      validFormData.set('reservation_date', '2024-12-25');
      validFormData.set('reservation_time', '18:00');
      validFormData.set('party_size', '4');
      validFormData.set('customer_notes', 'Birthday celebration');
      validFormData.set('table_id', '1');

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });
    });

    it('should create a reservation successfully', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { capacity: 6 },
        error: null,
      });

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      mockSupabaseClient.insert.mockResolvedValue({
        error: null,
      });

      const futureTimestamp = Date.now() + 1000 * 60 * 60 * 24 * 30; // 30 days from now
      vi.spyOn(Date, 'now').mockReturnValue(Date.now());
      vi.spyOn(Date, 'UTC').mockReturnValue(futureTimestamp);

      const result = await createReservation(null, validFormData);

      expect(result).toEqual({
        type: 'success',
        message: 'Reservation created successfully',
      });

      expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
        user_id: mockUser.id,
        reservation_date: '2024-12-25',
        reservation_time: '18:00',
        party_size: 4,
        customer_notes_i18n: { en: 'Birthday celebration' },
        status: 'pending',
        table_id: 1,
      });

      expect(revalidatePath).toHaveBeenCalledWith('/en/reservations');
    });

    it('should return error if user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const result = await createReservation(null, validFormData);

      expect(result).toEqual({
        type: 'error',
        messageKey: 'userNotAuthenticated',
        message: 'User not authenticated',
      });
    });

    it('should return validation errors for invalid data', async () => {
      const invalidFormData = new FormData();
      invalidFormData.set('reservation_date', '');
      invalidFormData.set('reservation_time', 'invalid-time');
      invalidFormData.set('party_size', '0');

      const result = await createReservation(null, invalidFormData);

      expect(result?.type).toBe('error');
      expect(result?.fieldErrors).toBeDefined();
    });

    it('should return error for reservation in the past', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { capacity: 6 },
        error: null,
      });

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const pastTimestamp = Date.now() - 1000 * 60 * 60; // 1 hour ago
      vi.spyOn(Date, 'UTC').mockReturnValue(pastTimestamp);

      const result = await createReservation(null, validFormData);

      expect(result).toEqual({
        type: 'error',
        messageKey: 'reservationTimeNotInFuture',
        message: 'Reservation time must be in the future',
        fieldErrors: {
          reservation_date: ['Reservation time must be in the future'],
          reservation_time: ['Reservation time must be in the future'],
        },
      });
    });

    it('should return error if party size exceeds table capacity', async () => {
      const { createClient } = await import('@/lib/supabase/server');

      const mockTableValidationClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { capacity: 2 }, // Table capacity smaller than party size (4)
                error: null,
              }),
            }),
          }),
        }),
        auth: mockSupabaseClient.auth,
      };

      vi.mocked(createClient).mockResolvedValue(
        mockTableValidationClient as unknown as Awaited<
          ReturnType<typeof createClient>
        >,
      );

      const futureTimestamp = Date.now() + 1000 * 60 * 60 * 24; // 1 day from now
      vi.spyOn(Date, 'UTC').mockReturnValue(futureTimestamp);

      const result = await createReservation(null, validFormData);

      expect(result?.type).toBe('error');
      expect(result?.fieldErrors?.party_size).toBeDefined();
    });

    it('should return error if table is already booked', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { capacity: 6 },
        error: null,
      });

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: { id: 123 },
        error: null,
      });

      const futureTimestamp = Date.now() + 1000 * 60 * 60 * 24; // 1 day from now
      vi.spyOn(Date, 'UTC').mockReturnValue(futureTimestamp);

      const result = await createReservation(null, validFormData);

      expect(result).toEqual({
        type: 'error',
        messageKey: 'tableAlreadyBookedAtTime',
        message: 'Table already booked at this time',
        fieldErrors: {
          table_id: ['Table already booked at this time'],
          reservation_date: ['Table already booked at this time'],
          reservation_time: ['Table already booked at this time'],
        },
      });
    });

    it('should handle database errors', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { capacity: 6 },
        error: null,
      });

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      mockSupabaseClient.insert.mockResolvedValue({
        error: { message: 'Database connection failed' },
      });

      const futureTimestamp = Date.now() + 1000 * 60 * 60 * 24; // 1 day from now
      vi.spyOn(Date, 'UTC').mockReturnValue(futureTimestamp);

      const result = await createReservation(null, validFormData);

      expect(result).toEqual({
        type: 'error',
        messageKey: 'databaseError',
        message: 'Database connection failed',
      });
    });
  });

  describe('getReservationForEditAction', () => {
    const mockUser = { id: 'user-123' };

    const mockReservation = {
      id: 1,
      user_id: mockUser.id,
      status: 'pending',
      reservation_date: '2024-12-25',
      reservation_time: '18:00:00',
      party_size: 4,
    };

    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });
    });

    it('should fetch reservation successfully', async () => {
      vi.mocked(fetchReservationByIdForUser).mockResolvedValue(
        mockReservation as import('@/lib/data/reservations').ReservationWithTableDetails,
      );

      const result = await getReservationForEditAction('1');

      expect(result).toEqual({
        success: true,
        data: mockReservation,
      });

      expect(fetchReservationByIdForUser).toHaveBeenCalledWith(
        '1',
        mockUser.id,
      );
    });

    it('should return error if user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const result = await getReservationForEditAction('1');

      expect(result).toEqual({
        success: false,
        errorKey: 'userNotAuthenticated',
        message: 'User not authenticated',
      });
    });

    it('should return error if reservationId is missing', async () => {
      const result = await getReservationForEditAction('');

      expect(result).toEqual({
        success: false,
        errorKey: 'missingReservationId',
        message: 'Something went wrong',
      });
    });

    it('should return error if reservation is not found', async () => {
      vi.mocked(fetchReservationByIdForUser).mockResolvedValue(null);

      const result = await getReservationForEditAction('999');

      expect(result).toEqual({
        success: false,
        errorKey: 'notFound',
        message: 'Reservation not found',
      });
    });

    it('should return error if reservation cannot be edited (wrong status)', async () => {
      const cancelledReservation = { ...mockReservation, status: 'cancelled' };

      vi.mocked(fetchReservationByIdForUser).mockResolvedValue(
        cancelledReservation as import('@/lib/data/reservations').ReservationWithTableDetails,
      );

      const result = await getReservationForEditAction('1');

      expect(result).toEqual({
        success: false,
        errorKey: 'cannotEditStatus',
        message: 'Cannot update this reservation',
      });
    });

    it('should handle fetch errors', async () => {
      vi.mocked(fetchReservationByIdForUser).mockRejectedValue(
        new Error('Fetch failed'),
      );

      const result = await getReservationForEditAction('1');

      expect(result).toEqual({
        success: false,
        errorKey: 'genericError',
        message: 'Something went wrong',
      });
    });
  });

  describe('updateReservationAction', () => {
    const mockUser = { id: 'user-123' };
    const validFormData = new FormData();

    beforeEach(() => {
      validFormData.set('reservationId', '1');
      validFormData.set('reservation_date', '2024-12-25');
      validFormData.set('reservation_time', '18:00');
      validFormData.set('party_size', '4');
      validFormData.set('customer_notes', 'Updated notes');
      validFormData.set('table_id', '2');

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });
    });

    it('should update reservation successfully', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: {
          id: 1,
          status: 'pending',
          user_id: mockUser.id,
          table_id: 1,
        },
        error: null,
      });

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { capacity: 6 },
        error: null,
      });

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      mockSupabaseClient.update.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      const futureTimestamp = Date.now() + 1000 * 60 * 60 * 24; // 1 day from now
      vi.spyOn(Date, 'UTC').mockReturnValue(futureTimestamp);

      const result = await updateReservationAction(null, validFormData);

      expect(result).toEqual({
        type: 'success',
        message: 'Reservation updated successfully',
      });

      expect(mockSupabaseClient.update).toHaveBeenCalledWith({
        reservation_date: '2024-12-25',
        reservation_time: '18:00',
        party_size: 4,
        customer_notes_i18n: { en: 'Updated notes' },
        table_id: 2,
      });

      expect(revalidatePath).toHaveBeenCalledWith('/en/reservations');
      expect(revalidatePath).toHaveBeenCalledWith('/en/reservations/1/edit');
    });

    it('should return error if user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const result = await updateReservationAction(null, validFormData);

      expect(result).toEqual({
        type: 'error',
        messageKey: 'userNotAuthenticated',
        message: 'User not authenticated',
      });
    });

    it('should return validation errors for invalid data', async () => {
      const invalidFormData = new FormData();
      invalidFormData.set('reservationId', '');
      invalidFormData.set('reservation_date', '');
      invalidFormData.set('reservation_time', 'invalid');
      invalidFormData.set('party_size', '0');

      const result = await updateReservationAction(null, invalidFormData);

      expect(result?.type).toBe('error');
      expect(result?.fieldErrors).toBeDefined();
    });

    it('should return error if reservation not found or unauthorized', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      const result = await updateReservationAction(null, validFormData);

      expect(result).toEqual({
        type: 'error',
        messageKey: 'databaseError',
        message: 'Reservation not found',
      });
    });

    it('should return error if reservation status cannot be updated', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: {
          id: 1,
          status: 'cancelled',
          user_id: mockUser.id,
          table_id: 1,
        },
        error: null,
      });

      const result = await updateReservationAction(null, validFormData);

      expect(result).toEqual({
        type: 'error',
        messageKey: 'databaseError',
        message: 'Cannot update this reservation',
      });
    });

    it('should handle table unassignment with empty table_id', async () => {
      const formDataWithUnassign = new FormData();
      formDataWithUnassign.set('reservationId', '1');
      formDataWithUnassign.set('reservation_date', '2024-12-25');
      formDataWithUnassign.set('reservation_time', '18:00');
      formDataWithUnassign.set('party_size', '4');
      formDataWithUnassign.set('customer_notes', '');
      formDataWithUnassign.set('table_id', '');

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: {
          id: 1,
          status: 'pending',
          user_id: mockUser.id,
          table_id: 1,
        },
        error: null,
      });

      mockSupabaseClient.update.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      const futureTimestamp = Date.now() + 1000 * 60 * 60 * 24; // 1 day from now
      vi.spyOn(Date, 'UTC').mockReturnValue(futureTimestamp);

      const result = await updateReservationAction(null, formDataWithUnassign);

      expect(result?.type).toBe('success');

      expect(mockSupabaseClient.update).toHaveBeenCalledWith(
        expect.objectContaining({
          table_id: 1,
        }),
      );
    });
  });

  describe('cancelReservationAction', () => {
    const mockUser = { id: 'user-123' };
    const formData = new FormData();

    beforeEach(() => {
      formData.set('reservationId', '1');

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });

      vi.mocked(parse).mockReturnValue(new Date('2024-12-25'));
    });

    it('should cancel reservation successfully', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: {
          id: 1,
          user_id: mockUser.id,
          status: 'pending',
          reservation_date: '2024-12-25',
        },
        error: null,
      });

      mockSupabaseClient.update.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const futureDate = new Date(today.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
      vi.mocked(parse).mockReturnValue(futureDate);

      const result = await cancelReservationAction(null, formData);

      expect(result).toEqual({
        type: 'success',
        message: 'Reservation cancelled successfully',
      });

      expect(mockSupabaseClient.update).toHaveBeenCalledWith({
        status: 'cancelled',
      });

      expect(revalidatePath).toHaveBeenCalledWith('/en/reservations');
      expect(revalidateTag).toHaveBeenCalledWith('user-reservations');
      expect(revalidateTag).toHaveBeenCalledWith('reservation-1');
    });

    it('should return error if reservationId is missing', async () => {
      const invalidFormData = new FormData();

      const result = await cancelReservationAction(null, invalidFormData);

      expect(result).toEqual({
        type: 'error',
        message: 'Invalid input',
      });
    });

    it('should return error if user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const result = await cancelReservationAction(null, formData);

      expect(result).toEqual({
        type: 'error',
        message: 'Unauthorized',
      });
    });

    it('should return error if reservation not found', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      const result = await cancelReservationAction(null, formData);

      expect(result).toEqual({
        type: 'error',
        message: 'Reservation not found',
      });
    });

    it('should return error if reservation is already cancelled', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: {
          id: 1,
          user_id: mockUser.id,
          status: 'cancelled',
          reservation_date: '2024-12-25',
        },
        error: null,
      });

      const result = await cancelReservationAction(null, formData);

      expect(result).toEqual({
        type: 'error',
        message: 'Already cancelled',
      });
    });

    it('should return error if trying to cancel past reservation', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: {
          id: 1,
          user_id: mockUser.id,
          status: 'pending',
          reservation_date: '2024-01-01',
        },
        error: null,
      });

      // Mock past date
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const pastDate = new Date(today.getTime() - 24 * 60 * 60 * 1000); // Yesterday
      vi.mocked(parse).mockReturnValue(pastDate);

      const result = await cancelReservationAction(null, formData);

      expect(result).toEqual({
        type: 'error',
        message: 'Cannot cancel past reservations',
      });
    });

    it('should handle database errors during cancellation', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: {
          id: 1,
          user_id: mockUser.id,
          status: 'pending',
          reservation_date: '2024-12-25',
        },
        error: null,
      });

      mockSupabaseClient.update.mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: { message: 'Update failed' },
        }),
      });

      // Mock future date
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const futureDate = new Date(today.getTime() + 24 * 60 * 60 * 1000); // 1 day from now
      vi.mocked(parse).mockReturnValue(futureDate);

      const result = await cancelReservationAction(null, formData);

      expect(result).toEqual({
        type: 'error',
        message: 'Database error',
      });
    });

    it('should handle unexpected errors', async () => {
      mockSupabaseClient.single.mockRejectedValue(new Error('Network error'));

      const result = await cancelReservationAction(null, formData);

      expect(result).toEqual({
        type: 'error',
        message: 'Unknown error',
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
