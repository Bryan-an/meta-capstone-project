import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Separator } from '../separator';

vi.mock('@/lib/utils/cn', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

vi.mock('@radix-ui/react-separator', () => ({
  Root: React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
      children?: React.ReactNode;
      className?: string;
      orientation?: 'horizontal' | 'vertical';
      decorative?: boolean;
    }
  >(function SeparatorRootMock(
    { children, className, orientation, decorative, ...props },
    ref,
  ) {
    return (
      <div
        ref={ref}
        data-testid="separator-root"
        data-radix-separator
        className={className}
        data-orientation={orientation}
        data-decorative={decorative}
        role={decorative ? 'none' : 'separator'}
        aria-orientation={orientation}
        {...props}
      >
        {children}
      </div>
    );
  }),
}));

/**
 * Test suite for the Separator component
 *
 * @remarks
 * Tests cover rendering, props forwarding, accessibility, orientation variants,
 * and styling for the Separator component following Radix UI patterns
 */
describe('Separator', () => {
  describe('Basic Rendering', () => {
    it('should render with data-slot attribute', () => {
      render(<Separator />);

      const separator = screen.getByTestId('separator-root');
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveAttribute('data-slot', 'separator-root');
      expect(separator).toHaveAttribute('data-radix-separator');
    });

    it('should render as div element', () => {
      render(<Separator />);

      const separator = screen.getByTestId('separator-root');
      expect(separator.tagName).toBe('DIV');
    });

    it('should apply default styling classes', () => {
      render(<Separator />);

      const separator = screen.getByTestId('separator-root');

      expect(separator).toHaveClass(
        'bg-border',
        'shrink-0',
        'data-[orientation=horizontal]:h-px',
        'data-[orientation=horizontal]:w-full',
        'data-[orientation=vertical]:h-full',
        'data-[orientation=vertical]:w-px',
      );
    });

    it('should merge custom className with default classes', () => {
      render(<Separator className="custom-separator bg-red-500" />);

      const separator = screen.getByTestId('separator-root');
      expect(separator).toHaveClass('custom-separator', 'bg-red-500');
      // Should still have default classes
      expect(separator).toHaveClass('bg-border', 'shrink-0');
    });
  });

  describe('Orientation', () => {
    it('should use horizontal orientation by default', () => {
      render(<Separator />);

      const separator = screen.getByTestId('separator-root');
      expect(separator).toHaveAttribute('data-orientation', 'horizontal');
      expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('should accept horizontal orientation explicitly', () => {
      render(<Separator orientation="horizontal" />);

      const separator = screen.getByTestId('separator-root');
      expect(separator).toHaveAttribute('data-orientation', 'horizontal');
      expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('should accept vertical orientation', () => {
      render(<Separator orientation="vertical" />);

      const separator = screen.getByTestId('separator-root');
      expect(separator).toHaveAttribute('data-orientation', 'vertical');
      expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('should apply correct classes for horizontal orientation', () => {
      render(<Separator orientation="horizontal" />);

      const separator = screen.getByTestId('separator-root');

      expect(separator).toHaveClass(
        'data-[orientation=horizontal]:h-px',
        'data-[orientation=horizontal]:w-full',
      );
    });

    it('should apply correct classes for vertical orientation', () => {
      render(<Separator orientation="vertical" />);

      const separator = screen.getByTestId('separator-root');

      expect(separator).toHaveClass(
        'data-[orientation=vertical]:h-full',
        'data-[orientation=vertical]:w-px',
      );
    });
  });

  describe('Decorative Prop', () => {
    it('should be decorative by default', () => {
      render(<Separator />);

      const separator = screen.getByTestId('separator-root');
      expect(separator).toHaveAttribute('data-decorative', 'true');
      expect(separator).toHaveAttribute('role', 'none');
    });

    it('should accept decorative=true explicitly', () => {
      render(<Separator decorative={true} />);

      const separator = screen.getByTestId('separator-root');
      expect(separator).toHaveAttribute('data-decorative', 'true');
      expect(separator).toHaveAttribute('role', 'none');
    });

    it('should accept decorative=false for semantic separator', () => {
      render(<Separator decorative={false} />);

      const separator = screen.getByTestId('separator-root');
      expect(separator).toHaveAttribute('data-decorative', 'false');
      expect(separator).toHaveAttribute('role', 'separator');
    });
  });

  describe('Props Forwarding', () => {
    it('should forward all props to Radix Root', () => {
      render(
        <Separator
          id="custom-separator"
          data-custom="test"
          aria-label="Custom separator"
          style={{ margin: '10px' }}
        />,
      );

      const separator = screen.getByTestId('separator-root');
      expect(separator).toHaveAttribute('id', 'custom-separator');
      expect(separator).toHaveAttribute('data-custom', 'test');
      expect(separator).toHaveAttribute('aria-label', 'Custom separator');
      expect(separator).toHaveStyle({ margin: '10px' });
    });

    it('should handle all Radix Separator props', () => {
      render(
        <Separator
          orientation="vertical"
          decorative={false}
          className="custom-class"
        />,
      );

      const separator = screen.getByTestId('separator-root');
      expect(separator).toHaveAttribute('data-orientation', 'vertical');
      expect(separator).toHaveAttribute('data-decorative', 'false');
      expect(separator).toHaveClass('custom-class');
    });

    it('should support ref forwarding', () => {
      const ref = React.createRef<HTMLDivElement>();

      render(<Separator ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveAttribute('data-testid', 'separator-root');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for decorative separator', () => {
      render(<Separator decorative={true} orientation="horizontal" />);

      const separator = screen.getByTestId('separator-root');
      expect(separator).toHaveAttribute('role', 'none');
      expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('should have proper ARIA attributes for semantic separator', () => {
      render(<Separator decorative={false} orientation="vertical" />);

      const separator = screen.getByTestId('separator-root');
      expect(separator).toHaveAttribute('role', 'separator');
      expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('should support custom ARIA attributes', () => {
      render(
        <Separator
          decorative={false}
          aria-label="Section divider"
          aria-describedby="separator-description"
        />,
      );

      const separator = screen.getByTestId('separator-root');
      expect(separator).toHaveAttribute('aria-label', 'Section divider');

      expect(separator).toHaveAttribute(
        'aria-describedby',
        'separator-description',
      );
    });

    it('should be accessible by role when not decorative', () => {
      render(<Separator decorative={false} />);

      const separator = screen.getByRole('separator');
      expect(separator).toBeInTheDocument();
    });

    it('should not be accessible by role when decorative', () => {
      render(<Separator decorative={true} />);

      expect(screen.queryByRole('separator')).not.toBeInTheDocument();
    });
  });

  describe('Integration Scenarios', () => {
    it('should work in a list context', () => {
      render(
        <div data-testid="list-container">
          <div>Item 1</div>
          <Separator />
          <div>Item 2</div>
          <Separator orientation="horizontal" />
          <div>Item 3</div>
        </div>,
      );

      const container = screen.getByTestId('list-container');
      const separators = screen.getAllByTestId('separator-root');

      expect(container).toBeInTheDocument();
      expect(separators).toHaveLength(2);
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('should work in a sidebar layout', () => {
      render(
        <div data-testid="sidebar-layout" style={{ display: 'flex' }}>
          <nav data-testid="sidebar">Navigation</nav>
          <Separator orientation="vertical" />
          <main data-testid="content">Main Content</main>
        </div>,
      );

      const layout = screen.getByTestId('sidebar-layout');
      const separator = screen.getByTestId('separator-root');
      const sidebar = screen.getByTestId('sidebar');
      const content = screen.getByTestId('content');

      expect(layout).toBeInTheDocument();
      expect(separator).toHaveAttribute('data-orientation', 'vertical');
      expect(sidebar).toBeInTheDocument();
      expect(content).toBeInTheDocument();
    });

    it('should work with complex styling', () => {
      render(
        <Separator
          className="my-4 bg-gradient-to-r from-blue-500 to-purple-500"
          orientation="horizontal"
          style={{ height: '2px' }}
        />,
      );

      const separator = screen.getByTestId('separator-root');

      expect(separator).toHaveClass(
        'my-4',
        'bg-gradient-to-r',
        'from-blue-500',
        'to-purple-500',
      );

      expect(separator).toHaveStyle({ height: '2px' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined className', () => {
      render(<Separator className={undefined} />);

      const separator = screen.getByTestId('separator-root');
      expect(separator).toBeInTheDocument();
      // Should still have default classes
      expect(separator).toHaveClass('bg-border', 'shrink-0');
    });

    it('should handle empty className', () => {
      render(<Separator className="" />);

      const separator = screen.getByTestId('separator-root');
      expect(separator).toBeInTheDocument();
      // Should still have default classes
      expect(separator).toHaveClass('bg-border', 'shrink-0');
    });

    it('should handle multiple class names', () => {
      render(
        <Separator className="class1 class2 class3 border-2 bg-red-500" />,
      );

      const separator = screen.getByTestId('separator-root');

      expect(separator).toHaveClass(
        'class1',
        'class2',
        'class3',
        'bg-red-500',
        'border-2',
      );

      // Should still have default classes
      expect(separator).toHaveClass('bg-border', 'shrink-0');
    });

    it('should handle boolean props correctly', () => {
      render(<Separator decorative={false} />);

      const separator = screen.getByTestId('separator-root');
      expect(separator).toHaveAttribute('data-decorative', 'false');
      expect(separator).toHaveAttribute('role', 'separator');
    });
  });

  describe('cn utility integration', () => {
    it('should apply correct classes with custom className', () => {
      render(<Separator className="custom-class" />);

      const separator = screen.getByTestId('separator-root');
      expect(separator).toHaveClass('custom-class');
      // Should also have default classes merged
      expect(separator).toHaveClass('bg-border', 'shrink-0');
    });

    it('should apply default classes without custom className', () => {
      render(<Separator />);

      const separator = screen.getByTestId('separator-root');

      expect(separator).toHaveClass(
        'bg-border',
        'shrink-0',
        'data-[orientation=horizontal]:h-px',
        'data-[orientation=horizontal]:w-full',
        'data-[orientation=vertical]:h-full',
        'data-[orientation=vertical]:w-px',
      );
    });

    it('should merge multiple custom classes with defaults', () => {
      render(<Separator className="custom-1 custom-2 bg-blue-500" />);

      const separator = screen.getByTestId('separator-root');

      expect(separator).toHaveClass(
        'custom-1',
        'custom-2',
        'bg-blue-500',
        'bg-border',
        'shrink-0',
      );
    });
  });

  describe('TypeScript Props', () => {
    it('should accept all valid Radix Separator props', () => {
      // This test ensures TypeScript compatibility
      const validProps = {
        orientation: 'horizontal' as const,
        decorative: true,
        className: 'test-class',
        id: 'test-id',
        'aria-label': 'Test separator',
      };

      render(<Separator {...validProps} />);

      const separator = screen.getByTestId('separator-root');
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveAttribute('id', 'test-id');
      expect(separator).toHaveClass('test-class');
      expect(separator).toHaveAttribute('aria-label', 'Test separator');
      expect(separator).toHaveAttribute('data-orientation', 'horizontal');
      expect(separator).toHaveAttribute('data-decorative', 'true');
    });

    it('should work with React.ComponentProps type', () => {
      // Test that the component accepts all standard HTML div props
      const htmlProps = {
        id: 'html-id',
        className: 'html-class',
        style: { margin: '10px' },
        'data-custom': 'html-data',
        onClick: vi.fn(),
        onMouseEnter: vi.fn(),
        onFocus: vi.fn(),
      };

      render(<Separator {...htmlProps} />);

      const separator = screen.getByTestId('separator-root');
      expect(separator).toHaveAttribute('id', 'html-id');
      expect(separator).toHaveClass('html-class');
      expect(separator).toHaveStyle({ margin: '10px' });
      expect(separator).toHaveAttribute('data-custom', 'html-data');
    });
  });
});
