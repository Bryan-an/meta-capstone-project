import { describe, it, expect } from 'vitest';
import { cn } from '../cn';

describe('cn utility function', () => {
  it('should combine simple string arguments', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional class names (truthy and falsy)', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  it('should ignore falsy values like null, undefined, false', () => {
    expect(
      cn('foo', null, 'bar', undefined, false, { baz: true, qux: false }),
    ).toBe('foo bar baz');
  });

  it('should merge conflicting Tailwind classes, with the last one taking precedence', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('should merge multiple conflicting Tailwind classes correctly', () => {
    expect(cn('px-4 py-2', 'p-3', 'px-1')).toBe('p-3 px-1'); // p-3 overrides py-2 and px-4, then px-1 overrides px-3 part of p-3. py-2 from original is lost.
  });

  it('should handle complex conflicting Tailwind classes from tailwind-merge documentation', () => {
    expect(cn('px-2 py-1', 'p-3', 'p-2')).toBe('p-2'); // p-2 overrides p-3

    expect(cn('text-sm leading-5', 'text-base leading-6')).toBe(
      'text-base leading-6',
    );

    expect(cn('bg-red-500', 'bg-blue-500', 'hover:bg-green-500')).toBe(
      'bg-blue-500 hover:bg-green-500',
    );
  });

  it('should handle mixed array, string, and object inputs', () => {
    expect(
      cn(['foo', 'bar'], 'baz', { qux: true, quux: false }, 'p-4', {
        'p-2': true,
      }),
    ).toBe('foo bar baz qux p-2');
  });

  it('should return an empty string for no arguments', () => {
    expect(cn()).toBe('');
  });

  it('should return an empty string for only falsy arguments', () => {
    expect(cn(null, undefined, false, { foo: false })).toBe('');
  });

  it('should handle a more complex real-world example', () => {
    const hasError = true;
    const isDisabled = false;
    const isLoading = true;

    expect(
      cn(
        'base-class',
        'text-red-500',
        'bg-blue-500',
        {
          'font-bold': true,
          'text-red-500': false, // This should be overridden by clsx
          'opacity-50': isLoading,
        },
        hasError && 'border border-red-700',
        isDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
        'bg-green-500', // This should override bg-blue-500
      ),
    ).toBe(
      'base-class text-red-500 font-bold opacity-50 border border-red-700 cursor-pointer bg-green-500',
    );
  });

  it('should preserve non-conflicting classes', () => {
    expect(cn('text-lg', 'font-semibold', 'mb-4')).toBe(
      'text-lg font-semibold mb-4',
    );
  });

  it('should handle arbitrary values correctly', () => {
    expect(cn('m-[3px]', 'm-[10px]')).toBe('m-[10px]');
    expect(cn('h-auto', 'h-[100px]')).toBe('h-[100px]');
  });

  it('should correctly merge classes with modifiers', () => {
    expect(cn('hover:text-red-500', 'hover:text-blue-500')).toBe(
      'hover:text-blue-500',
    );

    expect(cn('focus:ring-2 focus:ring-offset-2', 'focus:ring-4')).toBe(
      'focus:ring-offset-2 focus:ring-4',
    );
  });

  it('should handle class arrays within inputs', () => {
    expect(cn('foo', ['bar', { baz: true }], 'qux')).toBe('foo bar baz qux');
  });
});
