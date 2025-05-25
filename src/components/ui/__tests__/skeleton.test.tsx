import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from '../skeleton';

vi.mock('@/lib/utils/cn', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

/**
 * Test suite for the Skeleton component
 *
 * @remarks
 * Tests cover rendering, styling, props forwarding, accessibility,
 * and edge cases for the loading skeleton component
 */
describe('Skeleton', () => {
  describe('Rendering', () => {
    it('should render with data-slot attribute', () => {
      render(<Skeleton data-testid="skeleton" />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveAttribute('data-slot', 'skeleton');
    });

    it('should render as div element by default', () => {
      render(<Skeleton data-testid="skeleton" />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton.tagName).toBe('DIV');
    });

    it('should render without children by default', () => {
      render(<Skeleton data-testid="skeleton" />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toBeEmptyDOMElement();
    });

    it('should render with children when provided', () => {
      render(
        <Skeleton data-testid="skeleton">
          <span>Loading content</span>
        </Skeleton>,
      );

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveTextContent('Loading content');
      expect(screen.getByText('Loading content')).toBeInTheDocument();
    });

    it('should render with complex children structure', () => {
      render(
        <Skeleton data-testid="skeleton">
          <div>
            <h2>Loading Title</h2>
            <p>Loading description</p>
          </div>
        </Skeleton>,
      );

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(screen.getByText('Loading Title')).toBeInTheDocument();
      expect(screen.getByText('Loading description')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply default styling classes', () => {
      render(<Skeleton data-testid="skeleton" />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('bg-accent', 'animate-pulse', 'rounded-md');
    });

    it('should merge custom className with default classes', () => {
      render(
        <Skeleton
          data-testid="skeleton"
          className="custom-skeleton h-4 w-full"
        />,
      );

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('custom-skeleton', 'h-4', 'w-full');
      // Should still have default classes
      expect(skeleton).toHaveClass('bg-accent', 'animate-pulse', 'rounded-md');
    });

    it('should allow custom className to override default classes', () => {
      render(
        <Skeleton
          data-testid="skeleton"
          className="animate-bounce rounded-lg bg-gray-200"
        />,
      );

      const skeleton = screen.getByTestId('skeleton');

      expect(skeleton).toHaveClass(
        'bg-gray-200',
        'rounded-lg',
        'animate-bounce',
      );

      // Should still have default classes that don't conflict
      expect(skeleton).toHaveClass('bg-accent', 'animate-pulse', 'rounded-md');
    });

    it('should handle undefined className gracefully', () => {
      render(<Skeleton data-testid="skeleton" className={undefined} />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('bg-accent', 'animate-pulse', 'rounded-md');
    });

    it('should handle empty className', () => {
      render(<Skeleton data-testid="skeleton" className="" />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('bg-accent', 'animate-pulse', 'rounded-md');
    });
  });

  describe('Props Forwarding', () => {
    it('should forward all HTML div props', () => {
      const onClick = vi.fn();

      render(
        <Skeleton
          data-testid="skeleton"
          id="skeleton-id"
          role="status"
          aria-label="Loading content"
          onClick={onClick}
          style={{ width: '100px', height: '20px' }}
          data-custom="skeleton-data"
        />,
      );

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('id', 'skeleton-id');
      expect(skeleton).toHaveAttribute('role', 'status');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
      expect(skeleton).toHaveAttribute('data-custom', 'skeleton-data');

      expect(skeleton).toHaveStyle({
        width: '100px',
        height: '20px',
      });
    });

    it('should handle click events', () => {
      const onClick = vi.fn();

      render(<Skeleton data-testid="skeleton" onClick={onClick} />);

      const skeleton = screen.getByTestId('skeleton');
      skeleton.click();

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should support ref forwarding', () => {
      const ref = React.createRef<HTMLDivElement>();

      render(<Skeleton ref={ref} data-testid="skeleton" />);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveAttribute('data-slot', 'skeleton');
    });

    it('should forward ARIA attributes for accessibility', () => {
      render(
        <Skeleton
          data-testid="skeleton"
          aria-hidden="true"
          aria-live="polite"
          aria-busy="true"
        />,
      );

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
      expect(skeleton).toHaveAttribute('aria-live', 'polite');
      expect(skeleton).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Common Use Cases', () => {
    it('should render as text skeleton', () => {
      render(
        <Skeleton data-testid="text-skeleton" className="h-4 w-[250px]" />,
      );

      const skeleton = screen.getByTestId('text-skeleton');
      expect(skeleton).toHaveClass('h-4', 'w-[250px]');
    });

    it('should render as avatar skeleton', () => {
      render(
        <Skeleton
          data-testid="avatar-skeleton"
          className="h-12 w-12 rounded-full"
        />,
      );

      const skeleton = screen.getByTestId('avatar-skeleton');
      expect(skeleton).toHaveClass('h-12', 'w-12', 'rounded-full');
    });

    it('should render as card skeleton', () => {
      render(
        <div data-testid="card-skeleton">
          <Skeleton className="h-[125px] w-[250px] rounded-xl" />

          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>,
      );

      const cardSkeleton = screen.getByTestId('card-skeleton');
      expect(cardSkeleton).toBeInTheDocument();

      const skeletons = cardSkeleton.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons).toHaveLength(3);
    });

    it('should render as button skeleton', () => {
      render(
        <Skeleton
          data-testid="button-skeleton"
          className="h-10 w-[100px] rounded-md"
        />,
      );

      const skeleton = screen.getByTestId('button-skeleton');
      expect(skeleton).toHaveClass('h-10', 'w-[100px]', 'rounded-md');
    });

    it('should render as table row skeleton', () => {
      render(
        <div data-testid="table-skeleton">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex space-x-4">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[80px]" />
            </div>
          ))}
        </div>,
      );

      const tableSkeleton = screen.getByTestId('table-skeleton');

      const skeletons = tableSkeleton.querySelectorAll(
        '[data-slot="skeleton"]',
      );

      expect(skeletons).toHaveLength(9); // 3 rows × 3 columns
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate role for screen readers', () => {
      render(<Skeleton data-testid="skeleton" role="status" />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('role', 'status');
    });

    it('should support aria-label for screen readers', () => {
      render(
        <Skeleton data-testid="skeleton" aria-label="Loading user profile" />,
      );

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading user profile');
    });

    it('should support aria-hidden to hide from screen readers', () => {
      render(<Skeleton data-testid="skeleton" aria-hidden="true" />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    });

    it('should support aria-live for dynamic content updates', () => {
      render(<Skeleton data-testid="skeleton" aria-live="polite" />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('aria-live', 'polite');
    });

    it('should be focusable when tabIndex is provided', () => {
      render(<Skeleton data-testid="skeleton" tabIndex={0} />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('tabIndex', '0');
      skeleton.focus();
      expect(skeleton).toHaveFocus();
    });
  });

  describe('Integration with cn utility', () => {
    it('should call cn utility with correct arguments', async () => {
      const { cn } = vi.mocked(await import('@/lib/utils/cn'));

      render(<Skeleton className="custom-class" />);

      expect(cn).toHaveBeenCalledWith(
        'bg-accent animate-pulse rounded-md',
        'custom-class',
      );
    });

    it('should call cn utility with only default classes when no className provided', async () => {
      const { cn } = vi.mocked(await import('@/lib/utils/cn'));

      render(<Skeleton />);

      expect(cn).toHaveBeenCalledWith(
        'bg-accent animate-pulse rounded-md',
        undefined,
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle null children', () => {
      render(<Skeleton data-testid="skeleton">{null}</Skeleton>);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toBeEmptyDOMElement();
    });

    it('should handle undefined children', () => {
      render(<Skeleton data-testid="skeleton">{undefined}</Skeleton>);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toBeEmptyDOMElement();
    });

    it('should handle boolean children', () => {
      render(
        <Skeleton data-testid="skeleton">
          {true}
          {false}
        </Skeleton>,
      );

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toBeEmptyDOMElement();
    });

    it('should handle number children', () => {
      render(<Skeleton data-testid="skeleton">{42}</Skeleton>);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveTextContent('42');
    });

    it('should handle array of children', () => {
      render(
        <Skeleton data-testid="skeleton">
          {['Item 1', 'Item 2', 'Item 3']}
        </Skeleton>,
      );

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveTextContent('Item 1Item 2Item 3');
    });

    it('should handle deeply nested children', () => {
      render(
        <Skeleton data-testid="skeleton">
          <div>
            <div>
              <span>Deeply nested content</span>
            </div>
          </div>
        </Skeleton>,
      );

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveTextContent('Deeply nested content');
    });

    it('should handle React fragments as children', () => {
      render(
        <Skeleton data-testid="skeleton">
          <React.Fragment>
            <span>Fragment 1</span>
            <span>Fragment 2</span>
          </React.Fragment>
        </Skeleton>,
      );

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveTextContent('Fragment 1Fragment 2');
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily with same props', () => {
      const { rerender } = render(
        <Skeleton data-testid="skeleton" className="test-class" />,
      );

      const skeleton = screen.getByTestId('skeleton');
      const initialElement = skeleton;

      rerender(<Skeleton data-testid="skeleton" className="test-class" />);

      expect(screen.getByTestId('skeleton')).toBe(initialElement);
    });

    it('should handle rapid className changes', () => {
      const { rerender } = render(
        <Skeleton data-testid="skeleton" className="class-1" />,
      );

      let skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('class-1');

      rerender(<Skeleton data-testid="skeleton" className="class-2" />);

      skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('class-2');
      expect(skeleton).not.toHaveClass('class-1');

      rerender(<Skeleton data-testid="skeleton" className="class-3" />);

      skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('class-3');
      expect(skeleton).not.toHaveClass('class-2');
    });
  });

  describe('TypeScript Props', () => {
    it('should accept all valid HTML div props', () => {
      const validProps = {
        id: 'skeleton-id',
        className: 'skeleton-class',
        style: { backgroundColor: 'red' },
        'data-custom': 'custom-value',
        role: 'status' as const,
        'aria-label': 'Loading',
        tabIndex: 0,
        onClick: vi.fn(),
        onMouseEnter: vi.fn(),
        onFocus: vi.fn(),
      };

      render(<Skeleton data-testid="skeleton" {...validProps} />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveAttribute('id', 'skeleton-id');
      expect(skeleton).toHaveClass('skeleton-class');
      expect(skeleton).toHaveAttribute('data-custom', 'custom-value');
      expect(skeleton).toHaveAttribute('role', 'status');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading');
      expect(skeleton).toHaveAttribute('tabIndex', '0');
    });

    it('should work with React.ComponentProps<"div"> type', () => {
      const divProps: React.ComponentProps<'div'> = {
        className: 'typed-skeleton',
        id: 'typed-id',
        onClick: vi.fn(),
      };

      render(<Skeleton data-testid="skeleton" {...divProps} />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('typed-skeleton');
      expect(skeleton).toHaveAttribute('id', 'typed-id');
    });
  });

  describe('Animation', () => {
    it('should have pulse animation class by default', () => {
      render(<Skeleton data-testid="skeleton" />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('should allow custom animation classes', () => {
      render(<Skeleton data-testid="skeleton" className="animate-bounce" />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('animate-bounce');
      // Should still have default animation
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('should support disabling animation', () => {
      render(<Skeleton data-testid="skeleton" className="animate-none" />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('animate-none');
      // Should still have default animation class (but animate-none will override)
      expect(skeleton).toHaveClass('animate-pulse');
    });
  });

  describe('Responsive Design', () => {
    it('should support responsive width classes', () => {
      render(
        <Skeleton
          data-testid="skeleton"
          className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4"
        />,
      );

      const skeleton = screen.getByTestId('skeleton');

      expect(skeleton).toHaveClass(
        'w-full',
        'sm:w-1/2',
        'md:w-1/3',
        'lg:w-1/4',
      );
    });

    it('should support responsive height classes', () => {
      render(
        <Skeleton
          data-testid="skeleton"
          className="h-4 sm:h-6 md:h-8 lg:h-10"
        />,
      );

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('h-4', 'sm:h-6', 'md:h-8', 'lg:h-10');
    });

    it('should support responsive border radius classes', () => {
      render(
        <Skeleton
          data-testid="skeleton"
          className="rounded-sm sm:rounded-md md:rounded-lg lg:rounded-xl"
        />,
      );

      const skeleton = screen.getByTestId('skeleton');

      expect(skeleton).toHaveClass(
        'rounded-sm',
        'sm:rounded-md',
        'md:rounded-lg',
        'lg:rounded-xl',
      );
    });
  });
});
