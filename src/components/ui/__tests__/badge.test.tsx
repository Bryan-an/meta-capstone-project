import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Badge, badgeVariants } from '../badge';

/**
 * Test suite for the Badge component
 *
 * @remarks
 * Tests cover rendering, variants, props, and accessibility features
 */
describe('Badge', () => {
  describe('Rendering', () => {
    it('should render with default variant', () => {
      render(<Badge>Test Badge</Badge>);

      const badge = screen.getByText('Test Badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('data-slot', 'badge');
    });

    it('should render as span element by default', () => {
      render(<Badge>Test Badge</Badge>);

      const badge = screen.getByText('Test Badge');
      expect(badge.tagName).toBe('SPAN');
    });

    it('should render children content', () => {
      render(
        <Badge>
          <span>Icon</span>
          Badge Text
        </Badge>,
      );

      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Badge Text')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should apply default variant classes', () => {
      render(<Badge variant="default">Default</Badge>);

      const badge = screen.getByText('Default');

      expect(badge).toHaveClass(
        'border-transparent',
        'bg-primary',
        'text-primary-foreground',
      );
    });

    it('should apply secondary variant classes', () => {
      render(<Badge variant="secondary">Secondary</Badge>);

      const badge = screen.getByText('Secondary');

      expect(badge).toHaveClass(
        'border-transparent',
        'bg-secondary',
        'text-secondary-foreground',
      );
    });

    it('should apply destructive variant classes', () => {
      render(<Badge variant="destructive">Destructive</Badge>);

      const badge = screen.getByText('Destructive');

      expect(badge).toHaveClass(
        'border-transparent',
        'bg-destructive',
        'text-white',
      );
    });

    it('should apply outline variant classes', () => {
      render(<Badge variant="outline">Outline</Badge>);

      const badge = screen.getByText('Outline');
      expect(badge).toHaveClass('text-foreground');
    });

    it('should default to default variant when no variant is specified', () => {
      render(<Badge>No Variant</Badge>);

      const badge = screen.getByText('No Variant');

      expect(badge).toHaveClass(
        'border-transparent',
        'bg-primary',
        'text-primary-foreground',
      );
    });
  });

  describe('Custom className', () => {
    it('should merge custom className with variant classes', () => {
      render(<Badge className="custom-class">Custom Class</Badge>);

      const badge = screen.getByText('Custom Class');
      expect(badge).toHaveClass('custom-class');
      // Should still have default variant classes
      expect(badge).toHaveClass('border-transparent', 'bg-primary');
    });

    it('should allow custom className to override variant classes', () => {
      render(<Badge className="bg-red-500">Override</Badge>);

      const badge = screen.getByText('Override');
      expect(badge).toHaveClass('bg-red-500');
    });
  });

  describe('asChild prop', () => {
    it('should render as Slot when asChild is true', () => {
      render(
        <Badge asChild>
          <button type="button">Button Badge</button>
        </Badge>,
      );

      const badge = screen.getByRole('button', { name: 'Button Badge' });
      expect(badge).toBeInTheDocument();
      expect(badge.tagName).toBe('BUTTON');
      expect(badge).toHaveAttribute('data-slot', 'badge');
    });

    it('should render as span when asChild is false', () => {
      render(<Badge asChild={false}>Span Badge</Badge>);

      const badge = screen.getByText('Span Badge');
      expect(badge.tagName).toBe('SPAN');
    });

    it('should pass className to child element when using asChild', () => {
      render(
        <Badge asChild className="custom-badge">
          <a href="https://example.com">Link Badge</a>
        </Badge>,
      );

      const badge = screen.getByRole('link', { name: 'Link Badge' });
      expect(badge).toHaveClass('custom-badge');
      expect(badge).toHaveClass('border-transparent', 'bg-primary');
    });
  });

  describe('Props forwarding', () => {
    it('should forward HTML attributes', () => {
      render(
        <Badge id="test-badge" role="status">
          Accessible Badge
        </Badge>,
      );

      const badge = screen.getByText('Accessible Badge');
      expect(badge).toHaveAttribute('id', 'test-badge');
      expect(badge).toHaveAttribute('role', 'status');
    });

    it('should forward data attributes', () => {
      render(<Badge data-testid="badge-test">Test Badge</Badge>);

      const badge = screen.getByTestId('badge-test');
      expect(badge).toBeInTheDocument();
    });

    it('should forward aria attributes', () => {
      render(<Badge aria-label="Status badge">Status</Badge>);

      const badge = screen.getByLabelText('Status badge');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Base styling', () => {
    it('should always include base classes', () => {
      render(<Badge>Base Classes</Badge>);

      const badge = screen.getByText('Base Classes');

      expect(badge).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'rounded-md',
        'border',
        'px-2',
        'py-0.5',
        'text-xs',
        'font-medium',
        'w-fit',
      );
    });

    it('should include accessibility and interaction classes', () => {
      render(<Badge>Interactive</Badge>);

      const badge = screen.getByText('Interactive');

      expect(badge).toHaveClass(
        'focus-visible:border-ring',
        'focus-visible:ring-ring/50',
        'focus-visible:ring-[3px]',
        'transition-[color,box-shadow]',
      );
    });
  });
});

/**
 * Test suite for the badgeVariants function
 *
 * @remarks
 * Tests the class variance authority configuration directly
 */
describe('badgeVariants', () => {
  it('should return default variant classes when no options provided', () => {
    const classes = badgeVariants();
    expect(classes).toContain('border-transparent');
    expect(classes).toContain('bg-primary');
    expect(classes).toContain('text-primary-foreground');
  });

  it('should return secondary variant classes', () => {
    const classes = badgeVariants({ variant: 'secondary' });
    expect(classes).toContain('bg-secondary');
    expect(classes).toContain('text-secondary-foreground');
  });

  it('should return destructive variant classes', () => {
    const classes = badgeVariants({ variant: 'destructive' });
    expect(classes).toContain('bg-destructive');
    expect(classes).toContain('text-white');
  });

  it('should return outline variant classes', () => {
    const classes = badgeVariants({ variant: 'outline' });
    expect(classes).toContain('text-foreground');
  });

  it('should include custom className when provided', () => {
    const classes = badgeVariants({ className: 'custom-class' });
    expect(classes).toContain('custom-class');
  });

  it('should always include base classes regardless of variant', () => {
    const variants = [
      'default',
      'secondary',
      'destructive',
      'outline',
    ] as const;

    variants.forEach((variant) => {
      const classes = badgeVariants({ variant });
      expect(classes).toContain('inline-flex');
      expect(classes).toContain('items-center');
      expect(classes).toContain('rounded-md');
      expect(classes).toContain('border');
    });
  });
});

/**
 * Test suite for example usage scenarios
 *
 * @remarks
 * Demonstrates practical usage patterns with real-world examples
 */
describe('Badge Usage Examples', () => {
  it('should work as a status indicator', () => {
    render(
      <Badge variant="secondary" aria-label="Order status">
        Pending
      </Badge>,
    );

    const status = screen.getByLabelText('Order status');
    expect(status).toHaveTextContent('Pending');
    expect(status).toHaveClass('bg-secondary');
  });

  it('should work as an error indicator', () => {
    render(
      <Badge variant="destructive" role="alert">
        Error
      </Badge>,
    );

    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('Error');
    expect(error).toHaveClass('bg-destructive');
  });

  it('should work with icons', () => {
    render(
      <Badge variant="outline">
        <svg data-testid="icon" width="12" height="12" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
        </svg>
        3 notifications
      </Badge>,
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('3 notifications')).toBeInTheDocument();
  });

  it('should work as a clickable link badge', () => {
    render(
      <Badge asChild variant="secondary">
        <a href="https://example.com" target="_blank" rel="noopener noreferrer">
          Visit Site
        </a>
      </Badge>,
    );

    const link = screen.getByRole('link', { name: 'Visit Site' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveClass('bg-secondary');
  });

  it('should work as a count indicator', () => {
    render(<Badge className="ml-2">42</Badge>);

    const count = screen.getByText('42');
    expect(count).toHaveClass('ml-2');
    expect(count).toHaveClass('bg-primary');
  });
});
