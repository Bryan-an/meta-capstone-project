import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useTranslations } from 'next-intl';
import { LoaderSpinner } from '../loader-spinner';
import { cn } from '@/lib/utils/cn';

vi.mock('@/lib/utils/cn', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

const mockTranslations = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => mockTranslations),
}));

describe('LoaderSpinner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTranslations.mockReturnValue('Loading...');
  });

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<LoaderSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('flex', 'items-center', 'justify-center');

      const svg = spinner.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg).toHaveAttribute('viewBox', '0 0 100 101');
      expect(svg).toHaveAttribute('fill', 'none');

      const screenReaderText = screen.getByText('Loading...');
      expect(screenReaderText).toBeInTheDocument();
      expect(screenReaderText).toHaveClass('sr-only');
    });

    it('should render with default medium size classes', () => {
      render(<LoaderSpinner />);

      const svg = screen.getByRole('status').querySelector('svg');
      expect(svg).toHaveClass('h-6', 'w-6');
    });

    it('should have proper accessibility attributes', () => {
      render(<LoaderSpinner />);

      const status = screen.getByRole('status');
      expect(status).toBeInTheDocument();

      const svg = status.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');

      const srText = screen.getByText('Loading...');
      expect(srText).toHaveClass('sr-only');
    });
  });

  describe('Size Variants', () => {
    it('should render small size correctly', () => {
      render(<LoaderSpinner size="sm" />);

      const svg = screen.getByRole('status').querySelector('svg');
      expect(svg).toHaveClass('h-4', 'w-4');
    });

    it('should render medium size correctly', () => {
      render(<LoaderSpinner size="md" />);

      const svg = screen.getByRole('status').querySelector('svg');
      expect(svg).toHaveClass('h-6', 'w-6');
    });

    it('should render large size correctly', () => {
      render(<LoaderSpinner size="lg" />);

      const svg = screen.getByRole('status').querySelector('svg');
      expect(svg).toHaveClass('h-8', 'w-8');
    });

    it('should default to medium size when size prop is undefined', () => {
      render(<LoaderSpinner size={undefined} />);

      const svg = screen.getByRole('status').querySelector('svg');
      expect(svg).toHaveClass('h-6', 'w-6');
    });
  });

  describe('Custom Styling', () => {
    it('should merge custom className with default classes', () => {
      render(<LoaderSpinner className="custom-spinner-class" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('custom-spinner-class');
      expect(spinner).toHaveClass('flex', 'items-center', 'justify-center');
    });

    it('should handle multiple custom classes', () => {
      render(<LoaderSpinner className="class1 class2 class3" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('class1', 'class2', 'class3');
    });

    it('should handle undefined className gracefully', () => {
      render(<LoaderSpinner className={undefined} />);

      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('flex', 'items-center', 'justify-center');
    });

    it('should handle null className gracefully', () => {
      render(<LoaderSpinner className={null as unknown as string} />);

      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });

    it('should handle empty className gracefully', () => {
      render(<LoaderSpinner className="" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Loading Text', () => {
    it('should use default translation when no loadingText provided', () => {
      mockTranslations.mockReturnValue('Loading...');
      render(<LoaderSpinner />);

      expect(mockTranslations).toHaveBeenCalledWith('loading');
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should use custom loadingText when provided', () => {
      const customText = 'Please wait...';
      render(<LoaderSpinner loadingText={customText} />);

      expect(screen.getByText(customText)).toBeInTheDocument();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('should use custom loadingText even when translation is available', () => {
      mockTranslations.mockReturnValue('Loading...');
      const customText = 'Processing your request...';
      render(<LoaderSpinner loadingText={customText} />);

      expect(screen.getByText(customText)).toBeInTheDocument();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('should handle empty custom loadingText', () => {
      render(<LoaderSpinner loadingText="" />);

      const spinner = screen.getByRole('status');
      const srText = spinner.querySelector('.sr-only');
      expect(srText).toBeInTheDocument();
      expect(srText).toHaveClass('sr-only');
    });

    it('should handle custom loadingText with special characters', () => {
      const specialText = 'Loading... 🔄 Please wait!';
      render(<LoaderSpinner loadingText={specialText} />);

      expect(screen.getByText(specialText)).toBeInTheDocument();
    });

    it('should handle very long custom loadingText', () => {
      const longText =
        'This is a very long loading message that should be handled gracefully by the component';

      render(<LoaderSpinner loadingText={longText} />);

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should call translation function with loading key', () => {
      render(<LoaderSpinner />);

      expect(mockTranslations).toHaveBeenCalledWith('loading');
    });

    it('should not call translation function when custom loadingText is provided', () => {
      render(<LoaderSpinner loadingText="Custom text" />);

      // When loadingText is provided, the OR operator short-circuits and t('loading') is not called
      expect(mockTranslations).not.toHaveBeenCalled();
      expect(screen.getByText('Custom text')).toBeInTheDocument();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('should handle different translation results', () => {
      mockTranslations.mockReturnValue('Chargement...');
      render(<LoaderSpinner />);

      expect(screen.getByText('Chargement...')).toBeInTheDocument();
    });

    it('should handle missing translation gracefully', () => {
      mockTranslations.mockReturnValue(undefined);
      render(<LoaderSpinner />);

      const spinner = screen.getByRole('status');
      const srText = spinner.querySelector('.sr-only');
      expect(srText).toBeInTheDocument();
      expect(srText).toHaveClass('sr-only');
    });
  });

  describe('SVG Structure', () => {
    it('should render SVG with correct structure', () => {
      render(<LoaderSpinner />);

      const svg = screen.getByRole('status').querySelector('svg');
      expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 100 101');
      expect(svg).toHaveAttribute('fill', 'none');

      const paths = svg?.querySelectorAll('path');
      expect(paths).toHaveLength(2);
    });

    it('should have proper SVG classes', () => {
      render(<LoaderSpinner />);

      const svg = screen.getByRole('status').querySelector('svg');

      expect(svg).toHaveClass(
        'text-muted-foreground',
        'fill-primary',
        'animate-spin',
      );
    });

    it('should render first path with correct attributes', () => {
      render(<LoaderSpinner />);

      const svg = screen.getByRole('status').querySelector('svg');
      const firstPath = svg?.querySelector('path:first-child');

      expect(firstPath).toHaveAttribute('fill', 'currentColor');
      expect(firstPath).toHaveClass('text-border');
      expect(firstPath).toHaveAttribute('d');
    });

    it('should render second path with correct attributes', () => {
      render(<LoaderSpinner />);

      const svg = screen.getByRole('status').querySelector('svg');
      const secondPath = svg?.querySelector('path:last-child');

      expect(secondPath).toHaveAttribute('fill', 'currentFill');
      expect(secondPath).toHaveAttribute('d');
    });
  });

  describe('Internationalization', () => {
    it('should call useTranslations with Common namespace', () => {
      render(<LoaderSpinner />);

      expect(useTranslations).toHaveBeenCalledWith('Common');
    });

    it('should call translation function with loading key when no custom text provided', () => {
      render(<LoaderSpinner />);

      expect(mockTranslations).toHaveBeenCalledWith('loading');
    });

    it('should not call translation function when custom loadingText is provided', () => {
      render(<LoaderSpinner loadingText="Custom text" />);

      // When loadingText is provided, the OR operator short-circuits and t('loading') is not called
      expect(mockTranslations).not.toHaveBeenCalled();
      expect(screen.getByText('Custom text')).toBeInTheDocument();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('should handle different translation results', () => {
      mockTranslations.mockReturnValue('Chargement...');
      render(<LoaderSpinner />);

      expect(screen.getByText('Chargement...')).toBeInTheDocument();
    });

    it('should handle missing translation gracefully', () => {
      mockTranslations.mockReturnValue(undefined);
      render(<LoaderSpinner />);

      const spinner = screen.getByRole('status');
      const srText = spinner.querySelector('.sr-only');
      expect(srText).toBeInTheDocument();
      expect(srText).toHaveClass('sr-only');
    });
  });

  describe('Props Combination', () => {
    it('should handle all props together', () => {
      render(
        <LoaderSpinner
          size="lg"
          className="custom-class"
          loadingText="Processing..."
        />,
      );

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('custom-class');

      const svg = spinner.querySelector('svg');
      expect(svg).toHaveClass('h-8', 'w-8');

      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('should prioritize custom loadingText over translation', () => {
      mockTranslations.mockReturnValue('Default loading');
      render(<LoaderSpinner loadingText="Custom loading" />);

      expect(screen.getByText('Custom loading')).toBeInTheDocument();
      expect(screen.queryByText('Default loading')).not.toBeInTheDocument();
    });

    it('should work with size and className combination', () => {
      render(<LoaderSpinner size="sm" className="extra-styling" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('extra-styling');

      const svg = spinner.querySelector('svg');
      expect(svg).toHaveClass('h-4', 'w-4');
    });
  });

  describe('Edge Cases', () => {
    it('should handle all undefined props', () => {
      render(
        <LoaderSpinner
          size={undefined}
          className={undefined}
          loadingText={undefined}
        />,
      );

      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();

      const svg = spinner.querySelector('svg');
      expect(svg).toHaveClass('h-6', 'w-6'); // Default medium size

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle invalid size gracefully', () => {
      render(<LoaderSpinner size={'invalid' as 'sm' | 'md' | 'lg'} />);

      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();

      // Should not have any size classes for invalid size
      const svg = spinner.querySelector('svg');
      expect(svg).not.toHaveClass('h-4', 'w-4');
      expect(svg).not.toHaveClass('h-6', 'w-6');
      expect(svg).not.toHaveClass('h-8', 'w-8');
    });

    it('should handle null loadingText', () => {
      render(<LoaderSpinner loadingText={null as unknown as string} />);

      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });

    it('should handle number loadingText', () => {
      render(<LoaderSpinner loadingText={42 as unknown as string} />);

      const srText = screen.getByText('42');
      expect(srText).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for screen readers', () => {
      render(<LoaderSpinner />);

      const status = screen.getByRole('status');
      expect(status).toBeInTheDocument();

      const svg = status.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('should provide screen reader text', () => {
      render(<LoaderSpinner loadingText="Loading content..." />);

      const srText = screen.getByText('Loading content...');
      expect(srText).toHaveClass('sr-only');
    });

    it('should maintain semantic structure', () => {
      render(<LoaderSpinner />);

      const status = screen.getByRole('status');
      expect(status.tagName).toBe('DIV');

      const svg = status.querySelector('svg');
      expect(svg?.tagName).toBe('svg');

      const srText = status.querySelector('.sr-only');
      expect(srText?.tagName).toBe('SPAN');
    });

    it('should work with assistive technology', () => {
      render(
        <LoaderSpinner loadingText="Please wait while we process your request" />,
      );

      const status = screen.getByRole('status');
      expect(status).toBeInTheDocument();

      // Verify that screen reader text is not visible but accessible
      const srText = screen.getByText(
        'Please wait while we process your request',
      );

      expect(srText).toHaveClass('sr-only');
      expect(srText).toBeInTheDocument();
    });
  });

  describe('CN Utility Integration', () => {
    it('should call cn utility for wrapper classes', () => {
      render(<LoaderSpinner className="custom-class" />);

      expect(cn).toHaveBeenCalledWith(
        'flex items-center justify-center',
        'custom-class',
      );
    });

    it('should call cn utility for SVG classes', () => {
      render(<LoaderSpinner size="lg" />);

      expect(cn).toHaveBeenCalledWith(
        'text-muted-foreground fill-primary animate-spin',
        'h-8 w-8',
      );
    });

    it('should handle cn utility with undefined className', () => {
      render(<LoaderSpinner className={undefined} />);

      expect(cn).toHaveBeenCalledWith(
        'flex items-center justify-center',
        undefined,
      );
    });

    it('should call cn utility multiple times for different elements', () => {
      render(<LoaderSpinner size="sm" className="wrapper-class" />);

      // Should be called for wrapper
      expect(cn).toHaveBeenCalledWith(
        'flex items-center justify-center',
        'wrapper-class',
      );

      // Should be called for SVG
      expect(cn).toHaveBeenCalledWith(
        'text-muted-foreground fill-primary animate-spin',
        'h-4 w-4',
      );
    });
  });

  describe('Return Type', () => {
    it('should return a ReactElement', () => {
      const result = render(<LoaderSpinner />);
      expect(result.container.firstChild).toBeInTheDocument();
    });

    it('should render as a div element', () => {
      render(<LoaderSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner.tagName).toBe('DIV');
    });

    it('should contain exactly one SVG element', () => {
      render(<LoaderSpinner />);

      const svgs = screen.getByRole('status').querySelectorAll('svg');
      expect(svgs).toHaveLength(1);
    });

    it('should contain exactly one span with sr-only class', () => {
      render(<LoaderSpinner />);

      const srSpans = screen
        .getByRole('status')
        .querySelectorAll('span.sr-only');

      expect(srSpans).toHaveLength(1);
    });
  });
});
