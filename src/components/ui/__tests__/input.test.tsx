import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Input } from '../input';

/**
 * Test suite for the Input component
 *
 * @remarks
 * Tests cover rendering, props, styling, event handling,
 * accessibility, and various input types
 */
describe('Input', () => {
  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('data-slot', 'input');
    });

    it('should render as input element', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input.tagName).toBe('INPUT');
    });

    it('should apply default classes', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('flex');
      expect(input).toHaveClass('h-9');
      expect(input).toHaveClass('w-full');
      expect(input).toHaveClass('min-w-0');
      expect(input).toHaveClass('rounded-md');
      expect(input).toHaveClass('border');
      expect(input).toHaveClass('bg-transparent');
      expect(input).toHaveClass('px-3');
      expect(input).toHaveClass('py-1');
      expect(input).toHaveClass('text-base');
    });

    it('should merge custom className with defaults', () => {
      render(<Input className="custom-input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('flex');
      expect(input).toHaveClass('custom-input');
    });

    it('should forward all standard input props', () => {
      render(
        <Input
          id="test-input"
          name="testName"
          placeholder="Enter text"
          value="test value"
          readOnly
          aria-label="Test input"
        />,
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'test-input');
      expect(input).toHaveAttribute('name', 'testName');
      expect(input).toHaveAttribute('placeholder', 'Enter text');
      expect(input).toHaveValue('test value');
      expect(input).toHaveAttribute('readonly');
      expect(input).toHaveAttribute('aria-label', 'Test input');
    });
  });

  describe('Type Prop', () => {
    it('should use specified type prop', () => {
      render(<Input type="email" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render password input', () => {
      render(<Input type="password" />);

      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should render number input', () => {
      render(<Input type="number" />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should render search input', () => {
      render(<Input type="search" />);

      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('type', 'search');
    });

    it('should render tel input', () => {
      render(<Input type="tel" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'tel');
    });

    it('should render url input', () => {
      render(<Input type="url" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'url');
    });

    it('should render date input', () => {
      render(<Input type="date" />);

      const input = document.querySelector('input[type="date"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'date');
    });

    it('should render time input', () => {
      render(<Input type="time" />);

      const input = document.querySelector('input[type="time"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'time');
    });

    it('should render checkbox input', () => {
      render(<Input type="checkbox" />);

      const input = screen.getByRole('checkbox');
      expect(input).toHaveAttribute('type', 'checkbox');
    });

    it('should render radio input', () => {
      render(<Input type="radio" />);

      const input = screen.getByRole('radio');
      expect(input).toHaveAttribute('type', 'radio');
    });
  });

  describe('File Input Handling', () => {
    it('should render file input with proper classes', () => {
      render(<Input type="file" />);

      const input = document.querySelector('input[type="file"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'file');
      expect(input).toHaveClass('file:text-foreground');
      expect(input).toHaveClass('file:inline-flex');
      expect(input).toHaveClass('file:h-7');
      expect(input).toHaveClass('file:border-0');
      expect(input).toHaveClass('file:bg-transparent');
      expect(input).toHaveClass('file:text-sm');
      expect(input).toHaveClass('file:font-medium');
    });

    it('should handle file input with accept attribute', () => {
      render(<Input type="file" accept=".jpg,.png,.gif" />);

      const input = document.querySelector('input[type="file"]');
      expect(input).toHaveAttribute('accept', '.jpg,.png,.gif');
    });

    it('should handle multiple file selection', () => {
      render(<Input type="file" multiple />);

      const input = document.querySelector('input[type="file"]');
      expect(input).toHaveAttribute('multiple');
    });
  });

  describe('State Handling', () => {
    it('should handle disabled state', () => {
      render(<Input disabled />);

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:pointer-events-none');
      expect(input).toHaveClass('disabled:cursor-not-allowed');
      expect(input).toHaveClass('disabled:opacity-50');
    });

    it('should handle required state', () => {
      render(<Input required />);

      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('should handle readonly state', () => {
      render(<Input readOnly />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });

    it('should handle invalid state with aria-invalid', () => {
      render(<Input aria-invalid />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid');
      expect(input).toHaveClass('aria-invalid:ring-destructive/20');
      expect(input).toHaveClass('dark:aria-invalid:ring-destructive/40');
      expect(input).toHaveClass('aria-invalid:border-destructive');
    });

    it('should handle aria-invalid="true"', () => {
      render(<Input aria-invalid="true" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should handle aria-invalid="false"', () => {
      render(<Input aria-invalid="false" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('Event Handling', () => {
    it('should handle onChange event', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test input' } });

      expect(handleChange).toHaveBeenCalledTimes(1);

      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: 'test input',
          }),
        }),
      );
    });

    it('should handle onFocus event', () => {
      const handleFocus = vi.fn();
      render(<Input onFocus={handleFocus} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('should handle onBlur event', () => {
      const handleBlur = vi.fn();
      render(<Input onBlur={handleBlur} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input);

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should handle onKeyDown event', () => {
      const handleKeyDown = vi.fn();
      render(<Input onKeyDown={handleKeyDown} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      expect(handleKeyDown).toHaveBeenCalledTimes(1);

      expect(handleKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'Enter',
          code: 'Enter',
        }),
      );
    });

    it('should handle onClick event', () => {
      const handleClick = vi.fn();
      render(<Input onClick={handleClick} />);

      const input = screen.getByRole('textbox');
      fireEvent.click(input);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Focus Management', () => {
    it('should be focusable', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      input.focus();

      expect(document.activeElement).toBe(input);
    });

    it('should apply focus-visible classes', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus-visible:border-ring');
      expect(input).toHaveClass('focus-visible:ring-ring/50');
      expect(input).toHaveClass('focus-visible:ring-[3px]');
    });

    it('should handle tabIndex', () => {
      render(<Input tabIndex={-1} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Accessibility', () => {
    it('should support aria-label', () => {
      render(<Input aria-label="Username input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'Username input');
    });

    it('should support aria-labelledby', () => {
      render(
        <>
          <label id="username-label">Username</label>
          <Input aria-labelledby="username-label" />
        </>,
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-labelledby', 'username-label');
    });

    it('should support aria-describedby', () => {
      render(
        <>
          <Input aria-describedby="username-help" />
          <div id="username-help">Enter your username</div>
        </>,
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'username-help');
    });

    it('should support aria-required', () => {
      render(<Input aria-required />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-required');
    });

    it('should work with screen readers', () => {
      render(
        <>
          <label htmlFor="accessible-input">Email Address</label>

          <Input
            id="accessible-input"
            type="email"
            aria-describedby="email-help"
            required
          />

          <div id="email-help">We&apos;ll never share your email</div>
        </>,
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'accessible-input');
      expect(input).toHaveAttribute('type', 'email');
      expect(input).toHaveAttribute('aria-describedby', 'email-help');
      expect(input).toBeRequired();

      const label = screen.getByText('Email Address');
      expect(label).toHaveAttribute('for', 'accessible-input');
    });
  });

  describe('Styling and Theming', () => {
    it('should apply dark mode classes', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('dark:bg-input/30');
      expect(input).toHaveClass('dark:aria-invalid:ring-destructive/40');
    });

    it('should handle selection styling', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('selection:bg-primary');
      expect(input).toHaveClass('selection:text-primary-foreground');
    });

    it('should handle placeholder styling', () => {
      render(<Input placeholder="Enter text" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('placeholder:text-muted-foreground');
      expect(input).toHaveAttribute('placeholder', 'Enter text');
    });

    it('should apply responsive text sizing', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('text-base');
      expect(input).toHaveClass('md:text-sm');
    });

    it('should handle shadow and transition classes', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('shadow-xs');
      expect(input).toHaveClass('transition-[color,box-shadow]');
      expect(input).toHaveClass('outline-none');
    });

    it('should override classes with custom className', () => {
      render(<Input className="border-red-300 bg-red-100 text-red-900" />);

      const input = screen.getByRole('textbox');
      // Custom classes should override defaults due to cn() utility
      expect(input).toHaveClass('bg-red-100');
      expect(input).toHaveClass('text-red-900');
      expect(input).toHaveClass('border-red-300');
    });
  });

  describe('Controlled vs Uncontrolled', () => {
    it('should work as controlled input', () => {
      const handleChange = vi.fn();

      const { rerender } = render(
        <Input value="initial" onChange={handleChange} />,
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('initial');

      fireEvent.change(input, { target: { value: 'updated' } });
      expect(handleChange).toHaveBeenCalled();

      rerender(<Input value="updated" onChange={handleChange} />);
      expect(input).toHaveValue('updated');
    });

    it('should work as uncontrolled input', () => {
      render(<Input defaultValue="default" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('default');

      fireEvent.change(input, { target: { value: 'user input' } });
      expect(input).toHaveValue('user input');
    });

    it('should handle empty value', () => {
      render(<Input value="" onChange={vi.fn()} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
    });
  });

  describe('Form Integration', () => {
    it('should work with form submission', () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());

      render(
        <form onSubmit={handleSubmit}>
          <Input name="testInput" defaultValue="test value" />
          <button type="submit">Submit</button>
        </form>,
      );

      const form = screen.getByText('Submit').closest('form');
      fireEvent.submit(form!);

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('should work with form validation', () => {
      render(
        <form>
          <Input
            type="email"
            required
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
          />
        </form>,
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();

      expect(input).toHaveAttribute(
        'pattern',
        '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$',
      );
    });

    it('should handle min/max attributes for number input', () => {
      render(<Input type="number" min="0" max="100" step="1" />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('min', '0');
      expect(input).toHaveAttribute('max', '100');
      expect(input).toHaveAttribute('step', '1');
    });

    it('should handle maxLength attribute', () => {
      render(<Input maxLength={50} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxlength', '50');
    });

    it('should work with file upload', () => {
      const handleFileChange = vi.fn();

      render(
        <div>
          <label htmlFor="file-upload">Upload File</label>

          <Input
            id="file-upload"
            type="file"
            accept=".jpg,.png,.pdf"
            multiple
            onChange={handleFileChange}
          />
        </div>,
      );

      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute('accept', '.jpg,.png,.pdf');
      expect(fileInput).toHaveAttribute('multiple');
    });
  });

  describe('Error Handling', () => {
    it('should handle undefined props gracefully', () => {
      expect(() => {
        render(<Input value={undefined} onChange={undefined} />);
      }).not.toThrow();
    });

    it('should handle null className', () => {
      expect(() => {
        render(<Input className={undefined} />);
      }).not.toThrow();
    });
  });
});

/**
 * Integration tests for practical Input usage scenarios
 */
describe('Input Integration Examples', () => {
  it('should work in a login form', () => {
    const handleSubmit = vi.fn((e) => e.preventDefault());

    render(
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>

          <Input
            id="email"
            type="email"
            name="email"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>

          <Input
            id="password"
            type="password"
            name="password"
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit">Login</button>
      </form>,
    );

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('user@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('should work with validation states', () => {
    render(
      <div>
        <label htmlFor="username">Username</label>

        <Input
          id="username"
          aria-invalid="true"
          aria-describedby="username-error"
          className="border-red-500"
        />

        <p id="username-error" className="text-red-500">
          Username is required
        </p>
      </div>,
    );

    const input = screen.getByLabelText('Username');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'username-error');
    expect(input).toHaveClass('border-red-500');
  });

  it('should work with search functionality', () => {
    const handleSearch = vi.fn();

    render(
      <div>
        <label htmlFor="search">Search</label>

        <Input
          id="search"
          type="search"
          placeholder="Search products..."
          onChange={handleSearch}
        />
      </div>,
    );

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'laptop' } });

    expect(handleSearch).toHaveBeenCalled();
    expect(searchInput).toHaveValue('laptop');
  });

  it('should work with file upload', () => {
    const handleFileChange = vi.fn();

    render(
      <div>
        <label htmlFor="file-upload">Upload File</label>

        <Input
          id="file-upload"
          type="file"
          accept=".jpg,.png,.pdf"
          multiple
          onChange={handleFileChange}
        />
      </div>,
    );

    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toHaveAttribute('accept', '.jpg,.png,.pdf');
    expect(fileInput).toHaveAttribute('multiple');
  });
});
