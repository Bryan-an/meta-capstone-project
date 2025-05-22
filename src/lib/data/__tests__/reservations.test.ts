import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getUserReservations,
  fetchReservationByIdForUser,
  type ReservationFromSupabase,
  type RestaurantTableFromSupabase,
} from '../reservations';

// Test-specific type for getUserReservations mock to reflect missing capacity
interface MockReservationForGetUser
  extends Omit<ReservationFromSupabase, 'restaurant_tables'> {
  restaurant_tables?: Pick<
    RestaurantTableFromSupabase,
    'table_number' | 'description_i18n'
  > | null; // Capacity is omitted here
}

const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
};

vi.mock('@/lib/supabase/server', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('@/lib/supabase/server')>();

  return {
    ...originalModule,
    createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
  };
});

const { createClient } = await import('@/lib/supabase/server');

describe('Reservation Data Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.from.mockReturnThis();
    mockSupabaseClient.select.mockReturnThis();
    mockSupabaseClient.eq.mockReturnThis();
    mockSupabaseClient.order.mockReturnThis();
    mockSupabaseClient.single.mockReturnThis();
  });

  describe('getUserReservations', () => {
    const mockUserId = 'test-user-123';

    const mockReservationsList: MockReservationForGetUser[] = [
      {
        id: 1,
        user_id: mockUserId,
        reservation_date: '2024-08-01',
        reservation_time: '18:00:00',
        party_size: 2,
        status: 'confirmed',
        customer_notes_i18n: { en: 'Window seat please' },
        internal_notes_i18n: null,
        table_id: 101,
        created_at: '2024-01-01T10:00:00.000Z',
        updated_at: '2024-01-01T10:00:00.000Z',
        restaurant_tables: {
          table_number: 'T1',
          description_i18n: { en: 'By the window' },
        },
      },
      {
        id: 2,
        user_id: mockUserId,
        reservation_date: '2024-08-05',
        reservation_time: '19:30:00',
        party_size: 4,
        status: 'pending',
        customer_notes_i18n: { en: 'Birthday celebration' },
        internal_notes_i18n: { en: 'Prepare cake' },
        table_id: 102,
        created_at: '2024-01-02T11:00:00.000Z',
        updated_at: '2024-01-02T11:00:00.000Z',
        restaurant_tables: {
          table_number: 'T2',
          description_i18n: { en: 'Large table' },
        },
      },
    ];

    it('should fetch reservations for a user successfully', async () => {
      mockSupabaseClient.order
        .mockReturnValueOnce(mockSupabaseClient)
        .mockResolvedValueOnce({
          data: mockReservationsList,
          error: null,
        });

      const result = await getUserReservations(mockUserId);

      expect(result).toEqual(mockReservationsList);
      expect(createClient).toHaveBeenCalledTimes(1);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('reservations');

      expect(mockSupabaseClient.select).toHaveBeenCalledWith(
        '\n      *,\n      restaurant_tables (\n        table_number,\n        description_i18n\n      )\n    ',
      );

      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', mockUserId);

      expect(mockSupabaseClient.order).toHaveBeenNthCalledWith(
        1,
        'reservation_date',
        { ascending: false },
      );

      expect(mockSupabaseClient.order).toHaveBeenNthCalledWith(
        2,
        'reservation_time',
        { ascending: false },
      );
    });

    it('should return null and log error if Supabase call fails', async () => {
      mockSupabaseClient.order
        .mockReturnValueOnce(mockSupabaseClient)
        .mockResolvedValueOnce({
          data: null,
          error: { message: 'Supabase fetch error' },
        });

      const result = await getUserReservations(mockUserId);

      expect(result).toBeNull();
    });

    it('should return null and log error if no userId is provided', async () => {
      const result = await getUserReservations(undefined);

      expect(result).toBeNull();
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });
  });

  describe('fetchReservationByIdForUser', () => {
    const mockReservationId = 'res-abc-789';
    const mockUserId = 'user-def-456';

    const mockSingleReservation: import('../reservations').ReservationWithTableDetails =
      {
        id: 789,
        user_id: mockUserId,
        reservation_date: '2024-09-10',
        reservation_time: '20:00:00',
        party_size: 3,
        status: 'confirmed',
        customer_notes_i18n: { en: 'Need high chair' },
        internal_notes_i18n: null,
        table_id: 205,
        created_at: '2024-02-01T12:00:00.000Z',
        updated_at: '2024-02-01T12:30:00.000Z',
        restaurant_tables: {
          table_number: 'T5',
          description_i18n: { en: 'Near the play area' },
          capacity: 4,
        },
      };

    it('should fetch a single reservation successfully', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockSingleReservation,
        error: null,
      });

      const result = await fetchReservationByIdForUser(
        mockReservationId,
        mockUserId,
      );

      expect(result).toEqual(mockSingleReservation);
      expect(createClient).toHaveBeenCalledTimes(1);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('reservations');

      expect(mockSupabaseClient.select).toHaveBeenCalledWith(
        '\n      id,\n      user_id,\n      reservation_date,\n      reservation_time,\n      party_size,\n      status,\n      customer_notes_i18n,\n      internal_notes_i18n,\n      table_id,\n      created_at,\n      updated_at,\n      restaurant_tables (\n        table_number,\n        description_i18n,\n        capacity\n      )\n    ',
      );

      expect(mockSupabaseClient.eq).toHaveBeenNthCalledWith(
        1,
        'id',
        mockReservationId,
      );

      expect(mockSupabaseClient.eq).toHaveBeenNthCalledWith(
        2,
        'user_id',
        mockUserId,
      );

      expect(mockSupabaseClient.single).toHaveBeenCalledTimes(1);
    });

    it('should return null if Supabase call fails', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Supabase single fetch error' },
      });

      const result = await fetchReservationByIdForUser(
        mockReservationId,
        mockUserId,
      );

      expect(result).toBeNull();
    });

    it('should return null if reservationId is not provided (empty string)', async () => {
      const result = await fetchReservationByIdForUser('', mockUserId);
      expect(result).toBeNull();
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });

    it('should return null if userId is not provided (empty string)', async () => {
      const result = await fetchReservationByIdForUser(mockReservationId, '');
      expect(result).toBeNull();
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });
  });
});
