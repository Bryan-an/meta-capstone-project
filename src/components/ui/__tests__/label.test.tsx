import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Label } from '../label';

/**
 * Test suite for the Label component
 *
 * @remarks
 * Tests cover rendering, props, styling, event handling,
 * accessibility, and integration with form inputs
 */
describe('Label', () => {
  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<Label>Test Label</Label>);

      const label = screen.getByText('Test Label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute('data-slot', 'label');
    });

    it('should render as label element', () => {
      render(<Label>Test Label</Label>);

      const label = screen.getByText('Test Label');
      expect(label.tagName).toBe('LABEL');
    });

    it('should apply default classes', () => {
      render(<Label>Test Label</Label>);

      const label = screen.getByText('Test Label');
      expect(label).toHaveClass('flex');
      expect(label).toHaveClass('items-center');
      expect(label).toHaveClass('gap-2');
      expect(label).toHaveClass('text-sm');
      expect(label).toHaveClass('leading-none');
      expect(label).toHaveClass('font-medium');
      expect(label).toHaveClass('select-none');

      expect(label).toHaveClass(
        'group-data-[disabled=true]:pointer-events-none',
      );

      expect(label).toHaveClass('group-data-[disabled=true]:opacity-50');
      expect(label).toHaveClass('peer-disabled:cursor-not-allowed');
      expect(label).toHaveClass('peer-disabled:opacity-50');
    });

    it('should merge custom className with defaults', () => {
      render(<Label className="custom-label">Test Label</Label>);

      const label = screen.getByText('Test Label');
      expect(label).toHaveClass('flex');
      expect(label).toHaveClass('custom-label');
    });

    it('should render with children content', () => {
      render(<Label>Custom Label Text</Label>);

      expect(screen.getByText('Custom Label Text')).toBeInTheDocument();
    });

    it('should render with complex children', () => {
      render(
        <Label>
          <span>Required</span>
          <span className="text-red-500">*</span>
        </Label>,
      );

      expect(screen.getByText('Required')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('Props Forwarding', () => {
    it('should forward htmlFor prop', () => {
      render(<Label htmlFor="test-input">Test Label</Label>);

      const label = screen.getByText('Test Label');
      expect(label).toHaveAttribute('for', 'test-input');
    });

    it('should forward id prop', () => {
      render(<Label id="test-label">Test Label</Label>);

      const label = screen.getByText('Test Label');
      expect(label).toHaveAttribute('id', 'test-label');
    });

    it('should forward aria attributes', () => {
      render(
        <Label aria-label="Custom aria label" aria-required="true">
          Test Label
        </Label>,
      );

      const label = screen.getByText('Test Label');
      expect(label).toHaveAttribute('aria-label', 'Custom aria label');
      expect(label).toHaveAttribute('aria-required', 'true');
    });

    it('should forward data attributes', () => {
      render(<Label data-testid="custom-label">Test Label</Label>);

      const label = screen.getByTestId('custom-label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent('Test Label');
    });

    it('should forward title attribute', () => {
      render(<Label title="Tooltip text">Test Label</Label>);

      const label = screen.getByText('Test Label');
      expect(label).toHaveAttribute('title', 'Tooltip text');
    });

    it('should forward role attribute', () => {
      render(<Label role="presentation">Test Label</Label>);

      const label = screen.getByText('Test Label');
      expect(label).toHaveAttribute('role', 'presentation');
    });
  });

  describe('Event Handling', () => {
    it('should handle onClick event', () => {
      const handleClick = vi.fn();
      render(<Label onClick={handleClick}>Clickable Label</Label>);

      const label = screen.getByText('Clickable Label');
      fireEvent.click(label);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle onMouseOver event', () => {
      const handleMouseOver = vi.fn();
      render(<Label onMouseOver={handleMouseOver}>Hoverable Label</Label>);

      const label = screen.getByText('Hoverable Label');
      fireEvent.mouseOver(label);

      expect(handleMouseOver).toHaveBeenCalledTimes(1);
    });

    it('should handle onMouseLeave event', () => {
      const handleMouseLeave = vi.fn();
      render(<Label onMouseLeave={handleMouseLeave}>Hoverable Label</Label>);

      const label = screen.getByText('Hoverable Label');
      fireEvent.mouseLeave(label);

      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    });

    it('should handle onFocus event', () => {
      const handleFocus = vi.fn();
      render(<Label onFocus={handleFocus}>Focusable Label</Label>);

      const label = screen.getByText('Focusable Label');
      fireEvent.focus(label);

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('should handle onBlur event', () => {
      const handleBlur = vi.fn();
      render(<Label onBlur={handleBlur}>Focusable Label</Label>);

      const label = screen.getByText('Focusable Label');
      fireEvent.focus(label);
      fireEvent.blur(label);

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should handle keyboard events', () => {
      const handleKeyDown = vi.fn();
      render(<Label onKeyDown={handleKeyDown}>Keyboard Label</Label>);

      const label = screen.getByText('Keyboard Label');
      fireEvent.keyDown(label, { key: 'Enter', code: 'Enter' });

      expect(handleKeyDown).toHaveBeenCalledTimes(1);

      expect(handleKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'Enter',
          code: 'Enter',
        }),
      );
    });
  });

  describe('Styling and Theming', () => {
    it('should override classes with custom className', () => {
      render(
        <Label className="bg-red-100 text-lg font-bold">Custom Label</Label>,
      );

      const label = screen.getByText('Custom Label');
      // Custom classes should override defaults due to cn() utility
      expect(label).toHaveClass('text-lg');
      expect(label).toHaveClass('font-bold');
      expect(label).toHaveClass('bg-red-100');
    });

    it('should handle disabled group states', () => {
      render(
        <div data-disabled="true" className="group">
          <Label>Disabled Group Label</Label>
        </div>,
      );

      const label = screen.getByText('Disabled Group Label');

      expect(label).toHaveClass(
        'group-data-[disabled=true]:pointer-events-none',
      );

      expect(label).toHaveClass('group-data-[disabled=true]:opacity-50');
    });

    it('should handle peer disabled states', () => {
      render(
        <div>
          <input disabled className="peer" />
          <Label>Peer Disabled Label</Label>
        </div>,
      );

      const label = screen.getByText('Peer Disabled Label');
      expect(label).toHaveClass('peer-disabled:cursor-not-allowed');
      expect(label).toHaveClass('peer-disabled:opacity-50');
    });

    it('should maintain consistent text styling', () => {
      render(<Label>Styled Label</Label>);

      const label = screen.getByText('Styled Label');
      expect(label).toHaveClass('text-sm');
      expect(label).toHaveClass('leading-none');
      expect(label).toHaveClass('font-medium');
    });

    it('should have proper layout classes', () => {
      render(<Label>Layout Label</Label>);

      const label = screen.getByText('Layout Label');
      expect(label).toHaveClass('flex');
      expect(label).toHaveClass('items-center');
      expect(label).toHaveClass('gap-2');
    });

    it('should be non-selectable by default', () => {
      render(<Label>Non-selectable Label</Label>);

      const label = screen.getByText('Non-selectable Label');
      expect(label).toHaveClass('select-none');
    });
  });

  describe('Accessibility', () => {
    it('should work with form inputs via htmlFor', () => {
      render(
        <div>
          <Label htmlFor="username">Username</Label>
          <input id="username" type="text" />
        </div>,
      );

      const label = screen.getByText('Username');
      const input = screen.getByRole('textbox');

      expect(label).toHaveAttribute('for', 'username');
      expect(input).toHaveAttribute('id', 'username');
    });

    it('should work when wrapping an input', () => {
      render(
        <Label>
          Email Address
          <input type="email" />
        </Label>,
      );

      const label = screen.getByText('Email Address');
      const input = screen.getByRole('textbox');

      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
    });

    it('should support aria-labelledby relationship', () => {
      render(
        <div>
          <Label id="password-label">Password</Label>
          <input type="password" aria-labelledby="password-label" />
        </div>,
      );

      const label = screen.getByText('Password');
      const input = document.querySelector('input[type="password"]');

      expect(label).toHaveAttribute('id', 'password-label');
      expect(input).toHaveAttribute('aria-labelledby', 'password-label');
    });

    it('should support aria-describedby relationship', () => {
      render(
        <div>
          <Label htmlFor="email" id="email-label">
            Email
          </Label>

          <input id="email" type="email" aria-describedby="email-label" />
        </div>,
      );

      const label = screen.getByText('Email');
      const input = screen.getByRole('textbox');

      expect(label).toHaveAttribute('id', 'email-label');
      expect(input).toHaveAttribute('aria-describedby', 'email-label');
    });

    it('should be accessible to screen readers', () => {
      render(
        <Label htmlFor="accessible-input" aria-label="Required field">
          Required Field <span aria-hidden="true">*</span>
        </Label>,
      );

      const label = screen.getByText(/Required Field/);
      expect(label).toHaveAttribute('aria-label', 'Required field');
      expect(label).toHaveAttribute('for', 'accessible-input');
    });

    it('should handle required field indicators', () => {
      render(
        <Label htmlFor="required-field">
          Name{' '}
          <span className="text-red-500" aria-label="required">
            *
          </span>
        </Label>,
      );

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByLabelText('required')).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('should be focusable when tabIndex is set', () => {
      render(<Label tabIndex={0}>Focusable Label</Label>);

      const label = screen.getByText('Focusable Label');
      label.focus();

      expect(document.activeElement).toBe(label);
    });

    it('should handle tabIndex attribute', () => {
      render(<Label tabIndex={-1}>Non-tabbable Label</Label>);

      const label = screen.getByText('Non-tabbable Label');
      expect(label).toHaveAttribute('tabindex', '-1');
    });

    it('should have proper htmlFor association', () => {
      render(
        <div>
          <Label htmlFor="focus-test">Focus Test</Label>
          <input id="focus-test" type="text" />
        </div>,
      );

      const label = screen.getByText('Focus Test');
      const input = screen.getByRole('textbox');

      expect(label).toHaveAttribute('for', 'focus-test');
      expect(input).toHaveAttribute('id', 'focus-test');
    });
  });

  describe('Error Handling', () => {
    it('should handle undefined props gracefully', () => {
      expect(() => {
        render(<Label className={undefined}>Test Label</Label>);
      }).not.toThrow();
    });

    it('should handle null children', () => {
      expect(() => {
        render(<Label>{null}</Label>);
      }).not.toThrow();
    });

    it('should handle empty string className', () => {
      expect(() => {
        render(<Label className="">Test Label</Label>);
      }).not.toThrow();
    });

    it('should handle missing htmlFor gracefully', () => {
      expect(() => {
        render(<Label>Label without htmlFor</Label>);
      }).not.toThrow();
    });
  });
});

/**
 * Integration tests for practical Label usage scenarios
 */
describe('Label Integration Examples', () => {
  it('should work in a complete form', () => {
    render(
      <form>
        <div>
          <Label htmlFor="first-name">First Name</Label>
          <input id="first-name" type="text" required />
        </div>

        <div>
          <Label htmlFor="last-name">Last Name</Label>
          <input id="last-name" type="text" required />
        </div>

        <div>
          <Label htmlFor="email">
            Email Address
            <span className="text-red-500">*</span>
          </Label>

          <input id="email" type="email" required />
        </div>
      </form>,
    );

    const firstNameLabel = screen.getByText('First Name');
    const lastNameLabel = screen.getByText('Last Name');
    const emailLabel = screen.getByText(/Email Address/);

    expect(firstNameLabel).toHaveAttribute('for', 'first-name');
    expect(lastNameLabel).toHaveAttribute('for', 'last-name');
    expect(emailLabel).toHaveAttribute('for', 'email');

    // Verify inputs have correct IDs
    expect(
      screen.getByRole('textbox', { name: /first name/i }),
    ).toHaveAttribute('id', 'first-name');

    expect(screen.getByRole('textbox', { name: /last name/i })).toHaveAttribute(
      'id',
      'last-name',
    );

    expect(
      screen.getByRole('textbox', { name: /email address/i }),
    ).toHaveAttribute('id', 'email');
  });

  it('should work with checkbox inputs', () => {
    render(
      <div>
        <Label htmlFor="terms">
          <input id="terms" type="checkbox" />I agree to the terms and
          conditions
        </Label>
      </div>,
    );

    const label = screen.getByText(/I agree to the terms and conditions/);
    const checkbox = screen.getByRole('checkbox');

    expect(label).toHaveAttribute('for', 'terms');
    expect(checkbox).toHaveAttribute('id', 'terms');

    // Clicking label should toggle checkbox
    fireEvent.click(label);
    expect(checkbox).toBeChecked();
  });

  it('should work with radio button groups', () => {
    render(
      <fieldset>
        <legend>Select your preference</legend>

        <div>
          <Label htmlFor="option1">
            <input
              id="option1"
              name="preference"
              type="radio"
              value="option1"
            />
            Option 1
          </Label>
        </div>

        <div>
          <Label htmlFor="option2">
            <input
              id="option2"
              name="preference"
              type="radio"
              value="option2"
            />
            Option 2
          </Label>
        </div>
      </fieldset>,
    );

    const label1 = screen.getByText('Option 1');
    const label2 = screen.getByText('Option 2');
    const radio1 = screen.getByDisplayValue('option1');
    const radio2 = screen.getByDisplayValue('option2');

    expect(label1).toHaveAttribute('for', 'option1');
    expect(label2).toHaveAttribute('for', 'option2');

    // Clicking labels should select radio buttons
    fireEvent.click(label1);
    expect(radio1).toBeChecked();
    expect(radio2).not.toBeChecked();

    fireEvent.click(label2);
    expect(radio2).toBeChecked();
    expect(radio1).not.toBeChecked();
  });

  it('should work with validation states', () => {
    render(
      <div>
        <Label htmlFor="validated-input" className="text-red-600">
          Username
          <span aria-label="required">*</span>
        </Label>

        <input
          id="validated-input"
          type="text"
          aria-invalid="true"
          aria-describedby="username-error"
        />

        <div id="username-error" className="text-sm text-red-500">
          Username is required
        </div>
      </div>,
    );

    const label = screen.getByText('Username');
    const input = screen.getByRole('textbox');
    const errorMessage = screen.getByText('Username is required');

    expect(label).toHaveClass('text-red-600');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'username-error');
    expect(errorMessage).toBeInTheDocument();

    // Verify proper associations
    expect(label).toHaveAttribute('for', 'validated-input');
    expect(input).toHaveAttribute('id', 'validated-input');
  });

  it('should work with disabled form fields', () => {
    render(
      <div className="group" data-disabled="true">
        <Label htmlFor="disabled-input">Disabled Field</Label>
        <input id="disabled-input" type="text" disabled />
      </div>,
    );

    const label = screen.getByText('Disabled Field');
    const input = screen.getByRole('textbox');

    expect(input).toBeDisabled();
    expect(label).toHaveClass('group-data-[disabled=true]:pointer-events-none');
    expect(label).toHaveClass('group-data-[disabled=true]:opacity-50');
  });
});
