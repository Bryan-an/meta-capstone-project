import { vi, describe, it, expect, beforeEach } from 'vitest';
import { getReservableTables } from '../tables';
import { createClient } from '@/lib/supabase/client';

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}));

interface MockSupabaseClient {
  from: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
}

describe('getReservableTables', () => {
  let mockSupabaseClient: MockSupabaseClient;

  beforeEach(() => {
    vi.resetAllMocks();

    mockSupabaseClient = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    };

    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockSupabaseClient,
    );
  });

  it('should return reservable tables when successful', async () => {
    const mockTables = [
      {
        id: '1',
        table_number: 'T1',
        capacity: 4,
        description_i18n: { en: 'Window table', es: 'Mesa junto a la ventana' },
      },
      {
        id: '2',
        table_number: 'T2',
        capacity: 2,
        description_i18n: null,
      },
    ];

    mockSupabaseClient.order.mockResolvedValue({
      data: mockTables,
      error: null,
    });

    const result = await getReservableTables();

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('restaurant_tables');

    expect(mockSupabaseClient.select).toHaveBeenCalledWith(
      'id, table_number, capacity, description_i18n',
    );

    expect(mockSupabaseClient.eq).toHaveBeenCalledWith('is_reservable', true);

    expect(mockSupabaseClient.order).toHaveBeenCalledWith('table_number', {
      ascending: true,
    });

    expect(result.type).toBe('success');

    expect(result).toEqual({
      type: 'success',
      data: [
        {
          id: 1,
          table_number: 'T1',
          capacity: 4,
          description_i18n: {
            en: 'Window table',
            es: 'Mesa junto a la ventana',
          },
        },
        {
          id: 2,
          table_number: 'T2',
          capacity: 2,
          description_i18n: null,
        },
      ],
    });
  });

  it('should handle Supabase errors', async () => {
    const mockError = {
      message: 'Database error occurred',
    };

    mockSupabaseClient.order.mockResolvedValue({
      data: null,
      error: mockError,
    });

    const result = await getReservableTables();

    expect(result.type).toBe('error');

    expect(result).toEqual({
      type: 'error',
      message: 'Database error occurred',
      messageKey: 'databaseError',
    });
  });

  it('should handle unexpected exceptions', async () => {
    const errorMessage = 'Unexpected error';

    mockSupabaseClient.order.mockImplementation(() => {
      throw new Error(errorMessage);
    });

    const result = await getReservableTables();

    expect(result.type).toBe('error');

    expect(result).toEqual({
      type: 'error',
      message: errorMessage,
      messageKey: 'unknownError',
    });
  });

  it('should convert table id to number type', async () => {
    const mockTables = [
      {
        id: '123',
        table_number: 'T3',
        capacity: 6,
        description_i18n: { en: 'Outdoor table' },
      },
    ];

    mockSupabaseClient.order.mockResolvedValue({
      data: mockTables,
      error: null,
    });

    const result = await getReservableTables();

    expect(result.type).toBe('success');

    if (result.type === 'success') {
      expect(typeof result.data[0].id).toBe('number');
      expect(result.data[0].id).toBe(123);
    }
  });

  it('should handle non-Error exceptions', async () => {
    mockSupabaseClient.order.mockImplementation(() => {
      throw 'String error';
    });

    const result = await getReservableTables();

    expect(result.type).toBe('error');

    expect(result).toEqual({
      type: 'error',
      message: 'String error',
      messageKey: 'unknownError',
    });
  });
});
