import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from '@testing-library/user-event';

import { Textarea } from '../textarea';

/**
 * Test suite for the Textarea component
 *
 * @remarks
 * Tests cover rendering, props, styling, event handling, accessibility,
 * and various textarea states and behaviors
 */
describe('Textarea', () => {
  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('data-slot', 'textarea');
    });

    it('should render as textarea element', () => {
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('should apply default classes', () => {
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('border-input');
      expect(textarea).toHaveClass('placeholder:text-muted-foreground');
      expect(textarea).toHaveClass('focus-visible:border-ring');
      expect(textarea).toHaveClass('focus-visible:ring-ring/50');
      expect(textarea).toHaveClass('flex');
      expect(textarea).toHaveClass('field-sizing-content');
      expect(textarea).toHaveClass('min-h-16');
      expect(textarea).toHaveClass('w-full');
      expect(textarea).toHaveClass('rounded-md');
      expect(textarea).toHaveClass('border');
      expect(textarea).toHaveClass('bg-transparent');
      expect(textarea).toHaveClass('px-3');
      expect(textarea).toHaveClass('py-2');
      expect(textarea).toHaveClass('text-base');
      expect(textarea).toHaveClass('shadow-xs');
      expect(textarea).toHaveClass('transition-[color,box-shadow]');
      expect(textarea).toHaveClass('outline-none');
      expect(textarea).toHaveClass('focus-visible:ring-[3px]');
      expect(textarea).toHaveClass('disabled:cursor-not-allowed');
      expect(textarea).toHaveClass('disabled:opacity-50');
      expect(textarea).toHaveClass('md:text-sm');
    });

    it('should merge custom className with defaults', () => {
      render(<Textarea className="custom-textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('flex');
      expect(textarea).toHaveClass('w-full');
      expect(textarea).toHaveClass('custom-textarea');
    });

    it('should forward all standard textarea props', () => {
      render(
        <Textarea
          id="test-textarea"
          name="testName"
          placeholder="Enter your message"
          value="test value"
          rows={5}
          cols={40}
          maxLength={100}
          readOnly
          aria-label="Test textarea"
          aria-describedby="helper-text"
        />,
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('id', 'test-textarea');
      expect(textarea).toHaveAttribute('name', 'testName');
      expect(textarea).toHaveAttribute('placeholder', 'Enter your message');
      expect(textarea).toHaveValue('test value');
      expect(textarea).toHaveAttribute('rows', '5');
      expect(textarea).toHaveAttribute('cols', '40');
      expect(textarea).toHaveAttribute('maxlength', '100');
      expect(textarea).toHaveAttribute('readonly');
      expect(textarea).toHaveAttribute('aria-label', 'Test textarea');
      expect(textarea).toHaveAttribute('aria-describedby', 'helper-text');
    });
  });

  describe('State Handling', () => {
    it('should handle disabled state', () => {
      render(<Textarea disabled />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
      expect(textarea).toHaveClass('disabled:cursor-not-allowed');
      expect(textarea).toHaveClass('disabled:opacity-50');
    });

    it('should handle required state', () => {
      render(<Textarea required />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeRequired();
    });

    it('should handle readonly state', () => {
      render(<Textarea readOnly />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('readonly');
    });

    it('should handle aria-invalid state with proper styling', () => {
      render(<Textarea aria-invalid="true" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
      expect(textarea).toHaveClass('aria-invalid:ring-destructive/20');
      expect(textarea).toHaveClass('dark:aria-invalid:ring-destructive/40');
      expect(textarea).toHaveClass('aria-invalid:border-destructive');
    });

    it('should handle aria-invalid="false" state', () => {
      render(<Textarea aria-invalid="false" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'false');
    });

    it('should handle multiple states simultaneously', () => {
      render(<Textarea required aria-invalid="true" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeRequired();
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Event Handling', () => {
    it('should handle onChange events', async () => {
      const handleChange = vi.fn();
      render(<Textarea onChange={handleChange} />);

      const textarea = screen.getByRole('textbox');
      await userEvent.type(textarea, 'Hello World');

      expect(handleChange).toHaveBeenCalled();
      expect(textarea).toHaveValue('Hello World');
    });

    it('should handle onFocus events', async () => {
      const handleFocus = vi.fn();
      render(<Textarea onFocus={handleFocus} />);

      const textarea = screen.getByRole('textbox');
      await userEvent.click(textarea);

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('should handle onBlur events', async () => {
      const handleBlur = vi.fn();
      render(<Textarea onBlur={handleBlur} />);

      const textarea = screen.getByRole('textbox');
      await userEvent.click(textarea);
      await userEvent.tab(); // Move focus away

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should handle onKeyDown events', async () => {
      const handleKeyDown = vi.fn();
      render(<Textarea onKeyDown={handleKeyDown} />);

      const textarea = screen.getByRole('textbox');
      await userEvent.type(textarea, 'a');

      expect(handleKeyDown).toHaveBeenCalled();
    });

    it('should handle onKeyUp events', async () => {
      const handleKeyUp = vi.fn();
      render(<Textarea onKeyUp={handleKeyUp} />);

      const textarea = screen.getByRole('textbox');
      await userEvent.type(textarea, 'a');

      expect(handleKeyUp).toHaveBeenCalled();
    });

    it('should handle multiple event handlers', async () => {
      const handleChange = vi.fn();
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();

      render(
        <Textarea
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />,
      );

      const textarea = screen.getByRole('textbox');
      await userEvent.click(textarea);
      await userEvent.type(textarea, 'test');
      await userEvent.tab();

      expect(handleFocus).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalled();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Value and Content Handling', () => {
    it('should handle controlled value', () => {
      const { rerender } = render(<Textarea value="initial value" readOnly />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('initial value');

      rerender(<Textarea value="updated value" readOnly />);
      expect(textarea).toHaveValue('updated value');
    });

    it('should handle defaultValue', () => {
      render(<Textarea defaultValue="default content" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('default content');
    });

    it('should handle empty value', () => {
      render(<Textarea value="" readOnly />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('');
    });

    it('should handle multiline content', async () => {
      const multilineText = 'Line 1\nLine 2\nLine 3';
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      await userEvent.type(textarea, multilineText);

      expect(textarea).toHaveValue(multilineText);
    });

    it('should respect maxLength constraint', () => {
      render(<Textarea maxLength={10} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('maxlength', '10');
    });

    it('should handle placeholder text', () => {
      render(<Textarea placeholder="Enter your thoughts..." />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('placeholder', 'Enter your thoughts...');
      expect(textarea).toHaveClass('placeholder:text-muted-foreground');
    });
  });

  describe('Dimensions and Layout', () => {
    it('should handle rows attribute', () => {
      render(<Textarea rows={8} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '8');
    });

    it('should handle cols attribute', () => {
      render(<Textarea cols={50} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('cols', '50');
    });

    it('should have minimum height class', () => {
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('min-h-16');
    });

    it('should be full width by default', () => {
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('w-full');
    });

    it('should handle field-sizing-content for auto-resize', () => {
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('field-sizing-content');
    });
  });

  describe('Accessibility', () => {
    it('should have proper role', () => {
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      render(<Textarea aria-label="Message content" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-label', 'Message content');
    });

    it('should support aria-labelledby', () => {
      render(<Textarea aria-labelledby="label-id" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-labelledby', 'label-id');
    });

    it('should support aria-describedby', () => {
      render(<Textarea aria-describedby="description-id" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-describedby', 'description-id');
    });

    it('should support aria-required', () => {
      render(<Textarea aria-required="true" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-required', 'true');
    });

    it('should be keyboard accessible', async () => {
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');

      // Should be focusable with Tab
      await userEvent.tab();
      expect(textarea).toHaveFocus();

      // Should accept text input
      await userEvent.type(textarea, 'Accessible text');
      expect(textarea).toHaveValue('Accessible text');
    });

    it('should handle screen reader announcements with aria-invalid', () => {
      render(<Textarea aria-invalid="true" aria-describedby="error-message" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
      expect(textarea).toHaveAttribute('aria-describedby', 'error-message');
    });
  });

  describe('Focus and Interaction States', () => {
    it('should apply focus-visible styles', () => {
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('focus-visible:border-ring');
      expect(textarea).toHaveClass('focus-visible:ring-ring/50');
      expect(textarea).toHaveClass('focus-visible:ring-[3px]');
    });

    it('should handle focus state programmatically', () => {
      render(<Textarea data-testid="textarea" />);

      const textarea = screen.getByTestId('textarea');
      textarea.focus();

      expect(textarea).toHaveFocus();
    });

    it('should handle blur state programmatically', () => {
      render(<Textarea data-testid="textarea" />);

      const textarea = screen.getByTestId('textarea');
      textarea.focus();
      expect(textarea).toHaveFocus();

      textarea.blur();
      expect(textarea).not.toHaveFocus();
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should apply all default styling classes', () => {
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');

      // Layout classes
      expect(textarea).toHaveClass('flex');
      expect(textarea).toHaveClass('w-full');
      expect(textarea).toHaveClass('min-h-16');

      // Border and background
      expect(textarea).toHaveClass('rounded-md');
      expect(textarea).toHaveClass('border');
      expect(textarea).toHaveClass('bg-transparent');

      // Spacing
      expect(textarea).toHaveClass('px-3');
      expect(textarea).toHaveClass('py-2');

      // Typography
      expect(textarea).toHaveClass('text-base');
      expect(textarea).toHaveClass('md:text-sm');

      // Effects
      expect(textarea).toHaveClass('shadow-xs');
      expect(textarea).toHaveClass('transition-[color,box-shadow]');
      expect(textarea).toHaveClass('outline-none');
    });

    it('should override default classes with custom className', () => {
      render(<Textarea className="bg-red-500 text-white" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('bg-red-500');
      expect(textarea).toHaveClass('text-white');
      // Should still have non-conflicting default classes
      expect(textarea).toHaveClass('w-full');
      expect(textarea).toHaveClass('rounded-md');
    });

    it('should handle dark mode classes', () => {
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('dark:bg-input/30');
      expect(textarea).toHaveClass('dark:aria-invalid:ring-destructive/40');
    });

    it('should apply responsive classes', () => {
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('md:text-sm');
    });
  });

  describe('Form Integration', () => {
    it('should work with form submission', () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());

      render(
        <form onSubmit={handleSubmit}>
          <Textarea name="message" defaultValue="Test message" />
          <button type="submit">Submit</button>
        </form>,
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('should handle form reset', () => {
      render(
        <form>
          <Textarea name="message" defaultValue="Initial value" />
          <button type="reset">Reset</button>
        </form>,
      );

      const textarea = screen.getByRole('textbox');
      const resetButton = screen.getByRole('button');

      // Change the value
      fireEvent.change(textarea, { target: { value: 'Changed value' } });
      expect(textarea).toHaveValue('Changed value');

      // Reset the form
      fireEvent.click(resetButton);
      expect(textarea).toHaveValue('Initial value');
    });

    it('should work with form validation', () => {
      render(<Textarea required name="message" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeRequired();
      expect(textarea).toBeInvalid(); // Empty required field is invalid
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined className gracefully', () => {
      render(<Textarea className={undefined} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveClass('w-full'); // Should still have default classes
    });

    it('should handle null className gracefully', () => {
      render(<Textarea className={null as unknown as string} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveClass('w-full');
    });

    it('should handle empty string className', () => {
      render(<Textarea className="" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveClass('w-full');
    });

    it('should handle very long text content', async () => {
      const longText = 'A'.repeat(1000); // Reduced size for performance
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: longText } });

      expect(textarea).toHaveValue(longText);
    });

    it('should handle special characters in content', async () => {
      const specialText = '!@#$%^&*()_+-=<>?`~';
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: specialText } });

      expect(textarea).toHaveValue(specialText);
    });

    it('should handle unicode characters', async () => {
      const unicodeText = '🚀 Hello 世界 🌍';
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: unicodeText } });

      expect(textarea).toHaveValue(unicodeText);
    });
  });

  describe('Performance and Optimization', () => {
    it('should not re-render unnecessarily with same props', () => {
      const { rerender } = render(<Textarea value="test" readOnly />);
      const textarea = screen.getByRole('textbox');
      const initialElement = textarea;

      rerender(<Textarea value="test" readOnly />);
      const afterRerender = screen.getByRole('textbox');

      expect(afterRerender).toBe(initialElement);
    });

    it('should handle rapid typing efficiently', async () => {
      const handleChange = vi.fn();
      render(<Textarea onChange={handleChange} />);

      const textarea = screen.getByRole('textbox');

      // Simulate rapid typing with fireEvent for better performance
      fireEvent.change(textarea, { target: { value: 'rapid typing test' } });

      expect(textarea).toHaveValue('rapid typing test');
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Data Attributes', () => {
    it('should have data-slot attribute', () => {
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('data-slot', 'textarea');
    });

    it('should support custom data attributes', () => {
      render(<Textarea data-testid="custom-textarea" data-custom="value" />);

      const textarea = screen.getByTestId('custom-textarea');
      expect(textarea).toHaveAttribute('data-custom', 'value');
    });
  });
});
