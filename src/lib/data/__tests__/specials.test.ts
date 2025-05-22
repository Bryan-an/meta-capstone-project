/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  type MockedFunction,
} from 'vitest';
import { getSpecials, type FetchedSpecial, type MenuItem } from '../specials';
import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

const mockMenuItem: MenuItem = {
  id: 1,
  i18n_content: {
    en: { name: 'Delicious Pasta', description: 'A tasty pasta dish.' },
  },
  price: 12.99,
  category_id: 1,
  image_url: 'https://example.com/pasta.jpg',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockFetchedSpecial: FetchedSpecial = {
  id: 101,
  start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  menu_items: [mockMenuItem],
};

let mockSupabaseClient: {
  from: MockedFunction<any>;
  select: MockedFunction<any>;
  order: MockedFunction<any>;
  limit: MockedFunction<any>;
};

describe('getSpecials', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockSupabaseClient = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    (createClient as MockedFunction<typeof createClient>).mockResolvedValue(
      mockSupabaseClient as unknown as SupabaseClient,
    );
  });

  it('should fetch specials successfully with menu items', async () => {
    const specialsData: FetchedSpecial[] = [
      { ...mockFetchedSpecial, id: 1, menu_items: [mockMenuItem] },
      {
        ...mockFetchedSpecial,
        id: 2,
        menu_items: [
          {
            ...mockMenuItem,
            id: 2,
            i18n_content: {
              en: { name: 'Awesome Pizza', description: 'Best pizza ever.' },
            },
            price: 15.99,
          },
        ],
      },
    ];

    mockSupabaseClient.limit.mockResolvedValueOnce({
      data: specialsData,
      error: null,
    });

    const result = await getSpecials();

    expect(createClient).toHaveBeenCalledTimes(1);
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('specials');

    expect(mockSupabaseClient.select).toHaveBeenCalledWith(
      expect.stringContaining('menu_items ( id, i18n_content, price'),
    );

    expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', {
      ascending: false,
    });

    expect(mockSupabaseClient.limit).toHaveBeenCalledWith(3);
    expect(result).toEqual(specialsData);
    expect(result.length).toBe(2);
    expect(result[0].menu_items).toEqual([mockMenuItem]);
  });

  it('should return an empty array when no specials are found', async () => {
    mockSupabaseClient.limit.mockResolvedValueOnce({ data: [], error: null });

    const result = await getSpecials();

    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });

  it('should return an empty array on fetch error', async () => {
    const mockError = new Error('Supabase fetch failed');

    mockSupabaseClient.limit.mockResolvedValueOnce({
      data: null,
      error: mockError,
    });

    const result = await getSpecials();

    expect(result).toEqual([]);
  });

  it('should use the provided limit parameter', async () => {
    const limit = 5;
    mockSupabaseClient.limit.mockResolvedValueOnce({ data: [], error: null });

    await getSpecials(limit);

    expect(mockSupabaseClient.limit).toHaveBeenCalledWith(limit);
  });

  it('should handle menu_items being null', async () => {
    const specialsData: FetchedSpecial[] = [
      { ...mockFetchedSpecial, id: 3, menu_items: null },
    ];

    mockSupabaseClient.limit.mockResolvedValueOnce({
      data: specialsData,
      error: null,
    });

    const result = await getSpecials();

    expect(result).toEqual(specialsData);
    expect(result[0].menu_items).toBeNull();
  });

  it('should correctly return data when menu_items is a single object (for robustness testing)', async () => {
    const singleMenuItemAsObject = { ...mockMenuItem, price: 10.5 };

    const malformedSpecial: FetchedSpecial = {
      ...mockFetchedSpecial,
      id: 4,
      menu_items: singleMenuItemAsObject,
    };

    const specialsData = [malformedSpecial];

    mockSupabaseClient.limit.mockResolvedValueOnce({
      data: specialsData,
      error: null,
    });

    const result = await getSpecials();
    expect(result).toEqual(specialsData);
    const firstResultMenuItem = result[0].menu_items;

    if (
      firstResultMenuItem &&
      !Array.isArray(firstResultMenuItem) &&
      typeof firstResultMenuItem === 'object'
    ) {
      expect((firstResultMenuItem as MenuItem).id).toBe(
        singleMenuItemAsObject.id,
      );
    } else {
      throw new Error(
        'Test setup error: Expected menu_items to be a single object for this test case',
      );
    }
  });

  it('should ensure fetched data structure matches FetchedSpecial and MenuItem types', async () => {
    const specialsData: FetchedSpecial[] = [
      {
        id: 201,
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        menu_items: [
          {
            id: 301,
            i18n_content: {
              en: { name: 'Super Salad', description: 'Very healthy.' },
            },
            price: 9.5,
            category_id: 2,
            image_url: 'https://example.com/salad.jpg',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      },
    ];

    mockSupabaseClient.limit.mockResolvedValueOnce({
      data: specialsData,
      error: null,
    });

    const result = await getSpecials();

    expect(result).toEqual(specialsData);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('start_date');
    expect(result[0]).toHaveProperty('end_date');
    expect(result[0]).toHaveProperty('menu_items');

    const menuItemField = result[0].menu_items;
    expect(Array.isArray(menuItemField)).toBe(true);

    if (Array.isArray(menuItemField) && menuItemField.length > 0) {
      const menuItem = menuItemField[0];
      expect(menuItem).toHaveProperty('id');
      expect(menuItem).toHaveProperty('i18n_content');
      expect(menuItem).toHaveProperty('price');
      expect(menuItem).toHaveProperty('category_id');
      expect(menuItem).toHaveProperty('image_url');
      expect(menuItem).toHaveProperty('created_at');
      expect(menuItem).toHaveProperty('updated_at');

      if (
        menuItem.i18n_content &&
        typeof menuItem.i18n_content === 'object' &&
        'en' in menuItem.i18n_content
      ) {
        const enContent = (
          menuItem.i18n_content as { en: { name: string; description: string } }
        ).en;

        expect(enContent).toHaveProperty('name');
        expect(enContent).toHaveProperty('description');
      } else {
        throw new Error('i18n_content.en is not structured as expected');
      }
    } else {
      throw new Error(
        'menu_items is not an array with items as expected for this test data',
      );
    }
  });
});
