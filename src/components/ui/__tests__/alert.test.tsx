import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from '../alert';

vi.mock('@/lib/utils/cn', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

vi.mock('class-variance-authority', () => ({
  cva: vi.fn((base, config) => {
    return vi.fn((props) => {
      const variant =
        props?.variant || config?.defaultVariants?.variant || 'default';

      const baseClasses = Array.isArray(base) ? base.join(' ') : base;
      const variantClasses = config?.variants?.variant?.[variant] || '';

      const variantClassString = Array.isArray(variantClasses)
        ? variantClasses.join(' ')
        : variantClasses;

      return `${baseClasses} ${variantClassString}`.trim();
    });
  }),
}));

describe('Alert Components', () => {
  describe('Alert', () => {
    it('should render with default variant and required attributes', () => {
      render(<Alert>Alert content</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute('data-slot', 'alert');
      expect(alert).toHaveAttribute('role', 'alert');
      expect(alert).toHaveTextContent('Alert content');
      expect(alert.tagName).toBe('DIV');
    });

    it('should apply default variant classes', () => {
      render(<Alert>Default alert</Alert>);

      const alert = screen.getByRole('alert');

      expect(alert).toHaveClass(
        'relative',
        'w-full',
        'rounded-lg',
        'border',
        'px-4',
        'py-3',
        'text-sm',
        'grid',
        'bg-card',
        'text-card-foreground',
      );
    });

    it('should apply destructive variant classes', () => {
      render(<Alert variant="destructive">Destructive alert</Alert>);

      const alert = screen.getByRole('alert');

      expect(alert).toHaveClass(
        'relative',
        'w-full',
        'rounded-lg',
        'border',
        'px-4',
        'py-3',
        'text-sm',
        'grid',
        'text-destructive',
        'bg-card',
      );
    });

    it('should merge custom className with variant classes', () => {
      render(
        <Alert className="custom-alert-class" variant="destructive">
          Custom alert
        </Alert>,
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('custom-alert-class');
      expect(alert).toHaveClass('text-destructive', 'bg-card');
    });

    it('should forward all other props correctly', () => {
      render(
        <Alert
          id="custom-alert"
          data-testid="test-alert"
          aria-label="Custom alert label"
        >
          Alert with props
        </Alert>,
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('id', 'custom-alert');
      expect(alert).toHaveAttribute('data-testid', 'test-alert');
      expect(alert).toHaveAttribute('aria-label', 'Custom alert label');
    });

    it('should handle children correctly', () => {
      render(
        <Alert>
          <span>Child 1</span>
          <span>Child 2</span>
        </Alert>,
      );

      const alert = screen.getByRole('alert');
      expect(alert).toContainElement(screen.getByText('Child 1'));
      expect(alert).toContainElement(screen.getByText('Child 2'));
    });

    it('should handle empty content', () => {
      render(<Alert />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toBeEmptyDOMElement();
    });

    it('should support all valid HTML div props', () => {
      const handleClick = vi.fn();

      render(
        <Alert
          onClick={handleClick}
          onMouseEnter={handleClick}
          style={{ backgroundColor: 'red' }}
          tabIndex={0}
        >
          Interactive alert
        </Alert>,
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('tabindex', '0');
      expect(alert).toHaveAttribute('style');
    });
  });

  describe('AlertTitle', () => {
    it('should render with correct data-slot and default classes', () => {
      render(<AlertTitle>Alert Title</AlertTitle>);

      const title = screen.getByText('Alert Title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveAttribute('data-slot', 'alert-title');

      expect(title).toHaveClass(
        'col-start-2',
        'line-clamp-1',
        'min-h-4',
        'font-medium',
        'tracking-tight',
      );

      expect(title.tagName).toBe('DIV');
    });

    it('should merge custom className with default classes', () => {
      render(<AlertTitle className="custom-title">Title</AlertTitle>);

      const title = screen.getByText('Title');
      expect(title).toHaveClass('custom-title');
      expect(title).toHaveClass('font-medium', 'tracking-tight');
    });

    it('should forward props correctly', () => {
      render(
        <AlertTitle id="alert-title" data-testid="test-title" role="heading">
          Title with props
        </AlertTitle>,
      );

      const title = screen.getByText('Title with props');
      expect(title).toHaveAttribute('id', 'alert-title');
      expect(title).toHaveAttribute('data-testid', 'test-title');
      expect(title).toHaveAttribute('role', 'heading');
    });

    it('should handle complex children', () => {
      render(
        <AlertTitle>
          <strong>Bold</strong> and <em>italic</em> text
        </AlertTitle>,
      );

      const container = screen.getByText('Bold').parentElement;
      expect(container).toContainElement(screen.getByText('Bold'));
      expect(container).toContainElement(screen.getByText('italic'));
      expect(container).toHaveAttribute('data-slot', 'alert-title');
    });

    it('should handle empty content', () => {
      render(<AlertTitle />);

      const title = document.querySelector('[data-slot="alert-title"]');
      expect(title).toBeInTheDocument();
      expect(title).toBeEmptyDOMElement();
    });
  });

  describe('AlertDescription', () => {
    it('should render with correct data-slot and default classes', () => {
      render(<AlertDescription>Alert description text</AlertDescription>);

      const description = screen.getByText('Alert description text');
      expect(description).toBeInTheDocument();
      expect(description).toHaveAttribute('data-slot', 'alert-description');

      expect(description).toHaveClass(
        'text-muted-foreground',
        'col-start-2',
        'grid',
        'justify-items-start',
        'gap-1',
        'text-sm',
      );

      expect(description.tagName).toBe('DIV');
    });

    it('should merge custom className with default classes', () => {
      render(
        <AlertDescription className="custom-description">
          Description text
        </AlertDescription>,
      );

      const description = screen.getByText('Description text');
      expect(description).toHaveClass('custom-description');
      expect(description).toHaveClass('text-muted-foreground', 'text-sm');
    });

    it('should forward props correctly', () => {
      render(
        <AlertDescription
          id="alert-desc"
          data-testid="test-description"
          aria-label="Alert description"
        >
          Description with props
        </AlertDescription>,
      );

      const description = screen.getByText('Description with props');
      expect(description).toHaveAttribute('id', 'alert-desc');
      expect(description).toHaveAttribute('data-testid', 'test-description');
      expect(description).toHaveAttribute('aria-label', 'Alert description');
    });

    it('should handle complex children with paragraphs', () => {
      render(
        <AlertDescription>
          <p>First paragraph</p>
          <p>Second paragraph</p>
        </AlertDescription>,
      );

      const description = screen.getByText('First paragraph').parentElement;
      expect(description).toContainElement(screen.getByText('First paragraph'));

      expect(description).toContainElement(
        screen.getByText('Second paragraph'),
      );
    });

    it('should handle empty content', () => {
      render(<AlertDescription />);

      const description = document.querySelector(
        '[data-slot="alert-description"]',
      );

      expect(description).toBeInTheDocument();
      expect(description).toBeEmptyDOMElement();
    });
  });

  describe('Complete Alert Integration', () => {
    it('should render a complete alert with title and description', () => {
      render(
        <Alert variant="destructive">
          <AlertTitle>Error occurred</AlertTitle>
          <AlertDescription>
            There was an error processing your request. Please try again.
          </AlertDescription>
        </Alert>,
      );

      const alert = screen.getByRole('alert');
      const title = screen.getByText('Error occurred');

      const description = screen.getByText(
        'There was an error processing your request. Please try again.',
      );

      expect(alert).toBeInTheDocument();
      expect(title).toBeInTheDocument();
      expect(description).toBeInTheDocument();

      expect(alert).toContainElement(title);
      expect(alert).toContainElement(description);

      // Check variant classes are applied
      expect(alert).toHaveClass('text-destructive');
    });

    it('should handle alerts with only title', () => {
      render(
        <Alert>
          <AlertTitle>Info Alert</AlertTitle>
        </Alert>,
      );

      expect(screen.getByRole('alert')).toContainElement(
        screen.getByText('Info Alert'),
      );

      expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
    });

    it('should handle alerts with only description', () => {
      render(
        <Alert>
          <AlertDescription>Simple alert message</AlertDescription>
        </Alert>,
      );

      expect(screen.getByRole('alert')).toContainElement(
        screen.getByText('Simple alert message'),
      );
    });

    it('should maintain proper semantic structure', () => {
      render(
        <Alert>
          <AlertTitle>Accessible Title</AlertTitle>
          <AlertDescription>Accessible description</AlertDescription>
        </Alert>,
      );

      const alert = screen.getByRole('alert');
      const title = screen.getByText('Accessible Title');
      const description = screen.getByText('Accessible description');

      expect(alert).toHaveAttribute('role', 'alert');
      expect(title).toHaveAttribute('data-slot', 'alert-title');
      expect(description).toHaveAttribute('data-slot', 'alert-description');
    });

    it('should support complex nested content', () => {
      render(
        <Alert>
          <AlertTitle>
            <span role="img" aria-label="warning">
              ⚠️
            </span>{' '}
            Warning
          </AlertTitle>

          <AlertDescription>
            <p>This is a warning message.</p>

            <ul>
              <li>Check your input</li>
              <li>Verify your settings</li>
            </ul>
          </AlertDescription>
        </Alert>,
      );

      const alert = screen.getByRole('alert');
      expect(alert).toContainElement(screen.getByLabelText('warning'));
      expect(alert).toContainElement(screen.getByText('Check your input'));
      expect(alert).toContainElement(screen.getByText('Verify your settings'));
    });
  });

  describe('CVA Integration', () => {
    it('should apply correct classes for each variant', () => {
      // Test default variant
      render(<Alert>Default</Alert>);
      const defaultAlert = screen.getByRole('alert');
      expect(defaultAlert).toHaveClass('bg-card', 'text-card-foreground');

      // Test destructive variant
      render(<Alert variant="destructive">Destructive</Alert>);
      const destructiveAlert = screen.getAllByRole('alert')[1];
      expect(destructiveAlert).toHaveClass('text-destructive', 'bg-card');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined variant gracefully', () => {
      render(<Alert variant={undefined}>Undefined variant</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveClass('bg-card', 'text-card-foreground'); // default variant
    });

    it('should handle null className gracefully', () => {
      render(<Alert className={undefined}>Null className</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should handle boolean className gracefully', () => {
      render(
        <Alert className={false as unknown as string}>Boolean className</Alert>,
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should handle multiple className values', () => {
      render(<Alert className="class1 class2 class3">Multiple classes</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('class1', 'class2', 'class3');
    });
  });
});
