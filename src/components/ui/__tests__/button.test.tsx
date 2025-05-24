import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Button, buttonVariants } from '../button';

/**
 * Test suite for the Button component
 *
 * @remarks
 * Tests cover rendering, variants, sizes, props, and accessibility features
 */
describe('Button', () => {
  describe('Rendering', () => {
    it('should render with default variant and size', () => {
      render(<Button>Test Button</Button>);

      const button = screen.getByRole('button', { name: 'Test Button' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('data-slot', 'button');
    });

    it('should render as button element by default', () => {
      render(<Button>Test Button</Button>);

      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('should render children content', () => {
      render(
        <Button>
          <span>Icon</span>
          Button Text
        </Button>,
      );

      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Button Text')).toBeInTheDocument();
    });

    it('should render with SVG icons', () => {
      render(
        <Button>
          <svg
            data-testid="button-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
          With Icon
        </Button>,
      );

      expect(screen.getByTestId('button-icon')).toBeInTheDocument();
      expect(screen.getByText('With Icon')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should apply default variant classes', () => {
      render(<Button variant="default">Default</Button>);

      const button = screen.getByRole('button');

      expect(button).toHaveClass(
        'bg-primary',
        'text-primary-foreground',
        'shadow-xs',
      );
    });

    it('should apply destructive variant classes', () => {
      render(<Button variant="destructive">Destructive</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive', 'text-white', 'shadow-xs');
    });

    it('should apply outline variant classes', () => {
      render(<Button variant="outline">Outline</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('border', 'bg-background', 'shadow-xs');
    });

    it('should apply secondary variant classes', () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByRole('button');

      expect(button).toHaveClass(
        'bg-secondary',
        'text-secondary-foreground',
        'shadow-xs',
      );
    });

    it('should apply ghost variant classes', () => {
      render(<Button variant="ghost">Ghost</Button>);

      const button = screen.getByRole('button');

      expect(button).toHaveClass(
        'hover:bg-accent',
        'hover:text-accent-foreground',
      );
    });

    it('should apply link variant classes', () => {
      render(<Button variant="link">Link</Button>);

      const button = screen.getByRole('button');

      expect(button).toHaveClass(
        'text-primary',
        'underline-offset-4',
        'hover:underline',
      );
    });

    it('should default to default variant when no variant is specified', () => {
      render(<Button>No Variant</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
    });
  });

  describe('Sizes', () => {
    it('should apply default size classes', () => {
      render(<Button size="default">Default Size</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9', 'px-4', 'py-2');
    });

    it('should apply small size classes', () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-8', 'rounded-md', 'gap-1.5', 'px-3');
    });

    it('should apply large size classes', () => {
      render(<Button size="lg">Large</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10', 'rounded-md', 'px-6');
    });

    it('should apply icon size classes', () => {
      render(
        <Button size="icon" aria-label="Icon button">
          🔍
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('size-9');
    });

    it('should default to default size when no size is specified', () => {
      render(<Button>No Size</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9', 'px-4', 'py-2');
    });
  });

  describe('Custom className', () => {
    it('should merge custom className with variant and size classes', () => {
      render(<Button className="custom-class">Custom Class</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
      // Should still have default variant and size classes
      expect(button).toHaveClass('bg-primary', 'h-9');
    });

    it('should allow custom className to override variant classes', () => {
      render(<Button className="bg-red-500">Override</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-500');
    });
  });

  describe('asChild prop', () => {
    it('should render as Slot when asChild is true', () => {
      render(
        <Button asChild>
          <a href="https://example.com">Link Button</a>
        </Button>,
      );

      const button = screen.getByRole('link', { name: 'Link Button' });
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('A');
      expect(button).toHaveAttribute('data-slot', 'button');
    });

    it('should render as button when asChild is false', () => {
      render(<Button asChild={false}>Button</Button>);

      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('should pass className to child element when using asChild', () => {
      render(
        <Button asChild variant="secondary" className="custom-button">
          <a href="https://example.com">Styled Link</a>
        </Button>,
      );

      const button = screen.getByRole('link', { name: 'Styled Link' });
      expect(button).toHaveClass('custom-button');
      expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');
    });

    it('should work with complex child elements', () => {
      render(
        <Button asChild variant="outline">
          <label htmlFor="file-input">
            <svg
              data-testid="upload-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3 3h4v14H5V5h4l3-3z" />
            </svg>
            Upload File
          </label>
        </Button>,
      );

      const button = screen.getByText('Upload File');
      expect(button.tagName).toBe('LABEL');
      expect(button).toHaveClass('border', 'bg-background');
      expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
    });
  });

  describe('Props forwarding', () => {
    it('should forward HTML button attributes', () => {
      render(
        <Button
          id="test-button"
          type="submit"
          disabled
          aria-label="Submit form"
        >
          Submit
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('id', 'test-button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-label', 'Submit form');
    });

    it('should forward data attributes', () => {
      render(<Button data-testid="custom-button">Test Button</Button>);

      const button = screen.getByTestId('custom-button');
      expect(button).toBeInTheDocument();
    });

    it('should forward aria attributes', () => {
      render(
        <Button aria-describedby="help-text" aria-pressed="true">
          Toggle Button
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'help-text');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should forward event handlers', () => {
      const handleClick = vi.fn();
      const handleMouseOver = vi.fn();

      render(
        <Button onClick={handleClick} onMouseOver={handleMouseOver}>
          Interactive Button
        </Button>,
      );

      const button = screen.getByRole('button');

      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);

      fireEvent.mouseOver(button);
      expect(handleMouseOver).toHaveBeenCalledTimes(1);
    });
  });

  describe('Base styling', () => {
    it('should always include base classes', () => {
      render(<Button>Base Classes</Button>);

      const button = screen.getByRole('button');

      expect(button).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'gap-2',
        'whitespace-nowrap',
        'rounded-md',
        'text-sm',
        'font-medium',
        'transition-all',
      );
    });

    it('should include disabled state classes', () => {
      render(<Button disabled>Disabled Button</Button>);

      const button = screen.getByRole('button');

      expect(button).toHaveClass(
        'disabled:pointer-events-none',
        'disabled:opacity-50',
      );

      expect(button).toBeDisabled();
    });

    it('should include accessibility and interaction classes', () => {
      render(<Button>Interactive</Button>);

      const button = screen.getByRole('button');

      expect(button).toHaveClass(
        'outline-none',
        'focus-visible:border-ring',
        'focus-visible:ring-ring/50',
        'focus-visible:ring-[3px]',
      );
    });

    it('should include SVG styling classes', () => {
      render(<Button>SVG Styles</Button>);

      const button = screen.getByRole('button');

      expect(button).toHaveClass(
        '[&_svg]:pointer-events-none',
        '[&_svg]:shrink-0',
      );
    });
  });

  describe('Disabled state', () => {
    it('should apply disabled styles when disabled', () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();

      expect(button).toHaveClass(
        'disabled:opacity-50',
        'disabled:pointer-events-none',
      );
    });

    it('should not trigger click events when disabled', () => {
      const handleClick = vi.fn();

      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>,
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});

/**
 * Test suite for the buttonVariants function
 *
 * @remarks
 * Tests the class variance authority configuration directly
 */
describe('buttonVariants', () => {
  it('should return default variant and size classes when no options provided', () => {
    const classes = buttonVariants();
    expect(classes).toContain('bg-primary');
    expect(classes).toContain('text-primary-foreground');
    expect(classes).toContain('h-9');
    expect(classes).toContain('px-4');
  });

  it('should return specific variant classes', () => {
    const variants = [
      'default',
      'destructive',
      'outline',
      'secondary',
      'ghost',
      'link',
    ] as const;

    variants.forEach((variant) => {
      const classes = buttonVariants({ variant });
      expect(classes).toContain('inline-flex');
      expect(classes).toContain('items-center');
      expect(classes).toContain('justify-center');
    });
  });

  it('should return specific size classes', () => {
    const sizes = ['default', 'sm', 'lg', 'icon'] as const;

    sizes.forEach((size) => {
      const classes = buttonVariants({ size });
      expect(classes).toContain('inline-flex');
      if (size === 'default') expect(classes).toContain('h-9');
      if (size === 'sm') expect(classes).toContain('h-8');
      if (size === 'lg') expect(classes).toContain('h-10');
      if (size === 'icon') expect(classes).toContain('size-9');
    });
  });

  it('should combine variant and size classes', () => {
    const classes = buttonVariants({ variant: 'destructive', size: 'lg' });
    expect(classes).toContain('bg-destructive');
    expect(classes).toContain('text-white');
    expect(classes).toContain('h-10');
    expect(classes).toContain('px-6');
  });

  it('should include custom className when provided', () => {
    const classes = buttonVariants({ className: 'custom-class' });
    expect(classes).toContain('custom-class');
  });

  it('should always include base classes regardless of variant and size', () => {
    const classes = buttonVariants({ variant: 'ghost', size: 'icon' });
    expect(classes).toContain('inline-flex');
    expect(classes).toContain('items-center');
    expect(classes).toContain('justify-center');
    expect(classes).toContain('rounded-md');
    expect(classes).toContain('transition-all');
  });
});

/**
 * Test suite for example usage scenarios
 *
 * @remarks
 * Demonstrates practical usage patterns with real-world examples
 */
describe('Button Usage Examples', () => {
  it('should work as a primary action button', () => {
    const handleSubmit = vi.fn();

    render(
      <Button variant="default" onClick={handleSubmit}>
        Save Changes
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Save Changes' });
    expect(button).toHaveClass('bg-primary');

    fireEvent.click(button);
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('should work as a destructive action button', () => {
    render(
      <Button variant="destructive" aria-describedby="delete-warning">
        Delete Account
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Delete Account' });
    expect(button).toHaveClass('bg-destructive', 'text-white');
    expect(button).toHaveAttribute('aria-describedby', 'delete-warning');
  });

  it('should work as an icon-only button', () => {
    render(
      <Button size="icon" variant="ghost" aria-label="Search">
        <svg
          data-testid="search-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Search' });
    expect(button).toHaveClass('size-9');
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('should work as a link button using asChild', () => {
    render(
      <Button asChild variant="link">
        <a href="https://example.com" target="_blank" rel="noopener noreferrer">
          Learn More
        </a>
      </Button>,
    );

    const link = screen.getByRole('link', { name: 'Learn More' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveClass('text-primary', 'underline-offset-4');
  });

  it('should work in a form context', () => {
    const handleSubmit = vi.fn((e) => e.preventDefault());

    render(
      <form onSubmit={handleSubmit}>
        <Button type="submit" variant="secondary">
          Submit Form
        </Button>
      </form>,
    );

    const button = screen.getByRole('button', { name: 'Submit Form' });
    expect(button).toHaveAttribute('type', 'submit');

    fireEvent.click(button);
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('should work with loading state', () => {
    render(
      <Button disabled className="opacity-75">
        <svg
          data-testid="loading-spinner"
          className="animate-spin"
          width="16"
          height="16"
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
        </svg>
        Loading...
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Loading...' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-75');
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should work with button groups', () => {
    render(
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          Previous
        </Button>

        <Button variant="default" size="sm">
          Next
        </Button>
      </div>,
    );

    const prevButton = screen.getByRole('button', { name: 'Previous' });
    const nextButton = screen.getByRole('button', { name: 'Next' });

    expect(prevButton).toHaveClass('h-8', 'border');
    expect(nextButton).toHaveClass('h-8', 'bg-primary');
  });
});
