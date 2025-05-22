import { vi, describe, it, expect, beforeEach } from 'vitest';
import { getTestimonials, type TestimonialItem } from '../testimonials';
import { createClient } from '@/lib/supabase/server';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

interface MockSupabaseClient {
  from: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
}

const mockTestimonial: TestimonialItem = {
  id: 1,
  customer_name: 'John Doe',
  rating: 5,
  quote_i18n: { en: 'Great experience!', es: '¡Gran experiencia!' },
  image_url: 'https://example.com/john.jpg',
  is_featured: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('getTestimonials', () => {
  let mockSupabaseClient: MockSupabaseClient;

  beforeEach(() => {
    vi.resetAllMocks();

    mockSupabaseClient = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    };

    (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockSupabaseClient,
    );
  });

  it('should return testimonials when successful', async () => {
    const mockData = [
      mockTestimonial,
      { ...mockTestimonial, id: 2, customer_name: 'Jane Doe' },
    ];

    mockSupabaseClient.limit.mockResolvedValue({ data: mockData, error: null });

    const result = await getTestimonials();

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('testimonials');
    expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');

    expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', {
      ascending: false,
    });

    expect(mockSupabaseClient.limit).toHaveBeenCalledWith(4);
    expect(result).toEqual(mockData);
  });

  it('should handle Supabase errors and return empty array', async () => {
    const mockError = { message: 'Supabase query failed' };

    mockSupabaseClient.limit.mockResolvedValue({
      data: null,
      error: mockError,
    });

    const result = await getTestimonials();

    expect(result).toEqual([]);
  });

  it('should return an empty array if data is null and no error', async () => {
    mockSupabaseClient.limit.mockResolvedValue({ data: null, error: null });

    const result = await getTestimonials();

    expect(result).toEqual([]);
  });

  it('should return an empty array if data is an empty array and no error', async () => {
    mockSupabaseClient.limit.mockResolvedValue({ data: [], error: null });

    const result = await getTestimonials();

    expect(result).toEqual([]);
  });

  it('should use the provided limit parameter', async () => {
    const specificLimit = 2;
    const mockData = [mockTestimonial];
    mockSupabaseClient.limit.mockResolvedValue({ data: mockData, error: null });

    await getTestimonials(specificLimit);

    expect(mockSupabaseClient.limit).toHaveBeenCalledWith(specificLimit);
  });

  it('should handle non-array data gracefully', async () => {
    mockSupabaseClient.limit.mockResolvedValue({
      data: {
        message: 'Unexpected data format',
      } as unknown as TestimonialItem[],
      error: null,
    });

    const result = await getTestimonials();

    expect(result).toEqual([]);
  });
});
