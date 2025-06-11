import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AuthLayout from '../layout';

/**
 * Test suite for the AuthLayout component
 *
 * @remarks
 * Tests cover component structure, styling, children rendering,
 * accessibility, and responsive design aspects
 */
describe('AuthLayout', () => {
  describe('Component Structure', () => {
    it('should render the basic layout structure', () => {
      const testChildren = <div data-testid="test-child">Test Content</div>;

      render(<AuthLayout>{testChildren}</AuthLayout>);

      // Check that the main container exists
      const container = screen.getByTestId('test-child').parentElement;
      expect(container).toBeInTheDocument();
      expect(container?.tagName).toBe('DIV');
    });

    it('should render children correctly', () => {
      const testChildren = (
        <>
          <h1 data-testid="test-heading">Login Form</h1>

          <form data-testid="test-form">
            <input data-testid="test-input" />
            <button data-testid="test-button">Submit</button>
          </form>
        </>
      );

      render(<AuthLayout>{testChildren}</AuthLayout>);

      expect(screen.getByTestId('test-heading')).toBeInTheDocument();
      expect(screen.getByTestId('test-form')).toBeInTheDocument();
      expect(screen.getByTestId('test-input')).toBeInTheDocument();
      expect(screen.getByTestId('test-button')).toBeInTheDocument();
    });

    it('should handle empty children gracefully', () => {
      render(<AuthLayout>{null}</AuthLayout>);

      // Container should still exist even with no children
      const container = document.querySelector('.bg-background');
      expect(container).toBeInTheDocument();
    });

    it('should handle undefined children gracefully', () => {
      render(<AuthLayout>{undefined}</AuthLayout>);

      // Container should still exist even with undefined children
      const container = document.querySelector('.bg-background');
      expect(container).toBeInTheDocument();
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should apply all required CSS classes', () => {
      const testChildren = <div data-testid="test-child">Test Content</div>;

      render(<AuthLayout>{testChildren}</AuthLayout>);

      const container = screen.getByTestId('test-child').parentElement;

      // Check all the Tailwind classes are applied
      expect(container).toHaveClass('bg-background');
      expect(container).toHaveClass('flex');
      expect(container).toHaveClass('min-h-screen');
      expect(container).toHaveClass('flex-col');
      expect(container).toHaveClass('items-center');
      expect(container).toHaveClass('justify-center');
      expect(container).toHaveClass('p-4');
    });

    it('should apply the correct combination of classes for centering', () => {
      const testChildren = <div data-testid="test-child">Test Content</div>;

      render(<AuthLayout>{testChildren}</AuthLayout>);

      const container = screen.getByTestId('test-child').parentElement;

      // Verify the layout creates proper centering
      expect(container).toHaveClass(
        'bg-background',
        'flex',
        'min-h-screen',
        'flex-col',
        'items-center',
        'justify-center',
        'p-4',
      );
    });

    it('should not have any additional unexpected classes', () => {
      const testChildren = <div data-testid="test-child">Test Content</div>;

      render(<AuthLayout>{testChildren}</AuthLayout>);

      const container = screen.getByTestId('test-child').parentElement;

      // Get all classes as a string
      const classNames = container?.className || '';
      const classArray = classNames.split(' ').filter(Boolean);

      const expectedClasses = [
        'bg-background',
        'flex',
        'min-h-screen',
        'flex-col',
        'items-center',
        'justify-center',
        'p-4',
      ];

      // Should have exactly the expected classes
      expect(classArray).toHaveLength(expectedClasses.length);

      expectedClasses.forEach((className) => {
        expect(classArray).toContain(className);
      });
    });
  });

  describe('Layout Behavior', () => {
    it('should create a full-height container', () => {
      const testChildren = <div data-testid="test-child">Test Content</div>;

      render(<AuthLayout>{testChildren}</AuthLayout>);

      const container = screen.getByTestId('test-child').parentElement;
      expect(container).toHaveClass('min-h-screen');
    });

    it('should center content both horizontally and vertically', () => {
      const testChildren = <div data-testid="test-child">Test Content</div>;

      render(<AuthLayout>{testChildren}</AuthLayout>);

      const container = screen.getByTestId('test-child').parentElement;

      // Flexbox centering classes
      expect(container).toHaveClass('items-center'); // vertical centering
      expect(container).toHaveClass('justify-center'); // horizontal centering
      expect(container).toHaveClass('flex');
      expect(container).toHaveClass('flex-col');
    });

    it('should apply consistent padding', () => {
      const testChildren = <div data-testid="test-child">Test Content</div>;

      render(<AuthLayout>{testChildren}</AuthLayout>);

      const container = screen.getByTestId('test-child').parentElement;
      expect(container).toHaveClass('p-4');
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive with padding on all screen sizes', () => {
      const testChildren = <div data-testid="test-child">Test Content</div>;

      render(<AuthLayout>{testChildren}</AuthLayout>);

      const container = screen.getByTestId('test-child').parentElement;

      // p-4 provides responsive padding
      expect(container).toHaveClass('p-4');
    });

    it('should maintain layout structure on different viewports', () => {
      const testChildren = <div data-testid="test-child">Test Content</div>;

      render(<AuthLayout>{testChildren}</AuthLayout>);

      const container = screen.getByTestId('test-child').parentElement;

      // Layout should be consistent across viewports
      expect(container).toHaveClass('flex', 'flex-col', 'min-h-screen');
    });
  });

  describe('Children Rendering', () => {
    it('should render simple text children', () => {
      render(<AuthLayout>Simple text content</AuthLayout>);

      expect(screen.getByText('Simple text content')).toBeInTheDocument();
    });

    it('should render complex JSX children', () => {
      const complexChildren = (
        <div data-testid="complex-content">
          <header data-testid="header">
            <h1>Auth Page Title</h1>
          </header>

          <main data-testid="main-content">
            <form data-testid="auth-form">
              <input type="email" placeholder="Email" />
              <input type="password" placeholder="Password" />
              <button type="submit">Submit</button>
            </form>
          </main>

          <footer data-testid="footer">
            <p>Footer content</p>
          </footer>
        </div>
      );

      render(<AuthLayout>{complexChildren}</AuthLayout>);

      expect(screen.getByTestId('complex-content')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
      expect(screen.getByTestId('auth-form')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByText('Auth Page Title')).toBeInTheDocument();
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('should render multiple child elements', () => {
      render(
        <AuthLayout>
          <div data-testid="child-1">First child</div>
          <div data-testid="child-2">Second child</div>
          <div data-testid="child-3">Third child</div>
        </AuthLayout>,
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
      expect(screen.getByText('Third child')).toBeInTheDocument();
    });

    it('should render React components as children', () => {
      const ChildComponent = ({ message }: { message: string }) => (
        <div data-testid="child-component">{message}</div>
      );

      render(
        <AuthLayout>
          <ChildComponent message="Hello from child component" />
        </AuthLayout>,
      );

      expect(screen.getByTestId('child-component')).toBeInTheDocument();

      expect(
        screen.getByText('Hello from child component'),
      ).toBeInTheDocument();
    });
  });

  describe('TypeScript Props Interface', () => {
    it('should accept ReactNode children', () => {
      // This test verifies the TypeScript interface works correctly
      const stringChild = 'String child';
      const numberChild = 42;
      const booleanChild = true;
      const arrayChild = ['item1', 'item2'];
      const elementChild = <span>Element child</span>;

      // These should all compile and render without TypeScript errors
      expect(() => {
        render(<AuthLayout>{stringChild}</AuthLayout>);
      }).not.toThrow();

      expect(() => {
        render(<AuthLayout>{numberChild}</AuthLayout>);
      }).not.toThrow();

      expect(() => {
        render(<AuthLayout>{booleanChild}</AuthLayout>);
      }).not.toThrow();

      expect(() => {
        render(<AuthLayout>{arrayChild}</AuthLayout>);
      }).not.toThrow();

      expect(() => {
        render(<AuthLayout>{elementChild}</AuthLayout>);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper DOM structure for screen readers', () => {
      const accessibleChildren = (
        <main role="main" data-testid="main-content">
          <h1>Login</h1>

          <form data-testid="auth-form">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" />
            <label htmlFor="password">Password</label>
            <input id="password" type="password" />
            <button type="submit">Sign In</button>
          </form>
        </main>
      );

      render(<AuthLayout>{accessibleChildren}</AuthLayout>);

      const mainContent = screen.getByRole('main');
      expect(mainContent).toBeInTheDocument();
      expect(screen.getByTestId('auth-form')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should not interfere with accessibility attributes of children', () => {
      const childrenWithA11y = (
        <div
          role="dialog"
          aria-labelledby="title"
          aria-describedby="description"
          data-testid="dialog"
        >
          <h2 id="title">Dialog Title</h2>
          <p id="description">Dialog description</p>
        </div>
      );

      render(<AuthLayout>{childrenWithA11y}</AuthLayout>);

      const dialog = screen.getByTestId('dialog');
      expect(dialog).toHaveAttribute('role', 'dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'title');
      expect(dialog).toHaveAttribute('aria-describedby', 'description');
    });
  });

  describe('Edge Cases', () => {
    it('should handle falsy children values', () => {
      const falsyValues = [null, undefined, false, 0, ''];

      falsyValues.forEach((value) => {
        const { unmount } = render(<AuthLayout>{value}</AuthLayout>);

        // Container should still exist
        const container = document.querySelector('.bg-background');
        expect(container).toBeInTheDocument();

        unmount();
      });
    });

    it('should handle empty fragments', () => {
      render(
        <AuthLayout>
          <></>
        </AuthLayout>,
      );

      const container = document.querySelector('.bg-background');
      expect(container).toBeInTheDocument();
    });

    it('should handle nested fragments', () => {
      render(
        <AuthLayout>
          <>
            <>
              <div data-testid="nested-content">Nested content</div>
            </>
          </>
        </AuthLayout>,
      );

      expect(screen.getByTestId('nested-content')).toBeInTheDocument();
      expect(screen.getByText('Nested content')).toBeInTheDocument();
    });
  });

  describe('Component Props Destructuring', () => {
    it('should properly destructure children from props', () => {
      // This tests the internal implementation detail: const { children } = props;
      const testChild = (
        <div data-testid="prop-test">Props destructuring test</div>
      );

      render(<AuthLayout>{testChild}</AuthLayout>);

      expect(screen.getByTestId('prop-test')).toBeInTheDocument();
      expect(screen.getByText('Props destructuring test')).toBeInTheDocument();
    });

    it('should handle props with additional properties gracefully', () => {
      // Even though the interface only defines children,
      // we should test that the component doesn't break with additional props
      const testChild = (
        <div data-testid="extra-props-test">Extra props test</div>
      );

      const AuthLayoutWithExtraProps = AuthLayout as React.ComponentType<{
        children: React.ReactNode;
        [key: string]: unknown;
      }>;

      render(
        <AuthLayoutWithExtraProps data-extra="extra-value">
          {testChild}
        </AuthLayoutWithExtraProps>,
      );

      expect(screen.getByTestId('extra-props-test')).toBeInTheDocument();
    });
  });
});
