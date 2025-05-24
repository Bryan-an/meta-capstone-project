import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '../alert-dialog';

vi.mock('@/lib/utils/cn', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

vi.mock('@/components/ui/button', () => ({
  buttonVariants: vi.fn((props) => {
    const { variant } = props || {};
    return `button-base ${variant ? `button-${variant}` : 'button-default'}`;
  }),
}));

vi.mock('@radix-ui/react-alert-dialog', () => ({
  Root: ({
    children,
    onOpenChange, // eslint-disable-line @typescript-eslint/no-unused-vars
    defaultOpen, // eslint-disable-line @typescript-eslint/no-unused-vars
    ...props
  }: {
    children: React.ReactNode;
    onOpenChange?: (open: boolean) => void;
    defaultOpen?: boolean;
  }) => (
    <div data-testid="alert-dialog-root" data-radix-root {...props}>
      {children}
    </div>
  ),
  Trigger: ({
    children,
    asChild,
    ...props
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement<Record<string, unknown>>,
        {
          ...props,
          'data-testid': 'alert-dialog-trigger',
          'data-radix-trigger': true,
        },
      );
    }

    return (
      <button data-testid="alert-dialog-trigger" data-radix-trigger {...props}>
        {children}
      </button>
    );
  },
  Portal: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-portal" data-radix-portal {...props}>
      {children}
    </div>
  ),
  Overlay: ({
    children,
    className,
    ...props
  }: {
    children?: React.ReactNode;
    className?: string;
  }) => (
    <div
      data-testid="alert-dialog-overlay"
      data-radix-overlay
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
  Content: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      data-testid="alert-dialog-content"
      data-radix-content
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
  Title: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <h2
      data-testid="alert-dialog-title"
      data-radix-title
      className={className}
      {...props}
    >
      {children}
    </h2>
  ),
  Description: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <p
      data-testid="alert-dialog-description"
      data-radix-description
      className={className}
      {...props}
    >
      {children}
    </p>
  ),
  Action: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <button
      data-testid="alert-dialog-action"
      data-radix-action
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
  Cancel: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <button
      data-testid="alert-dialog-cancel"
      data-radix-cancel
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

describe('AlertDialog', () => {
  describe('AlertDialog (Root)', () => {
    it('should render with data-slot attribute', () => {
      render(
        <AlertDialog>
          <div>Content</div>
        </AlertDialog>,
      );

      const root = screen.getByTestId('alert-dialog-root');
      expect(root).toBeInTheDocument();
      expect(root).toHaveAttribute('data-slot', 'alert-dialog');
      expect(root).toHaveAttribute('data-radix-root');
    });

    it('should forward props to Radix Root', () => {
      render(
        <AlertDialog open={true} onOpenChange={vi.fn()}>
          <div>Content</div>
        </AlertDialog>,
      );

      const root = screen.getByTestId('alert-dialog-root');
      expect(root).toHaveAttribute('open');
    });
  });

  describe('AlertDialogTrigger', () => {
    it('should render with data-slot attribute', () => {
      render(<AlertDialogTrigger>Open Dialog</AlertDialogTrigger>);

      const trigger = screen.getByTestId('alert-dialog-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('data-slot', 'alert-dialog-trigger');
      expect(trigger).toHaveAttribute('data-radix-trigger');
      expect(trigger).toHaveTextContent('Open Dialog');
    });

    it('should handle asChild prop correctly', () => {
      render(
        <AlertDialogTrigger asChild>
          <span>Custom Trigger</span>
        </AlertDialogTrigger>,
      );

      const trigger = screen.getByTestId('alert-dialog-trigger');
      expect(trigger.tagName).toBe('SPAN');
      expect(trigger).toHaveTextContent('Custom Trigger');
    });

    it('should forward props correctly', () => {
      const handleClick = vi.fn();

      render(
        <AlertDialogTrigger onClick={handleClick} disabled>
          Click me
        </AlertDialogTrigger>,
      );

      const trigger = screen.getByTestId('alert-dialog-trigger');
      expect(trigger).toBeDisabled();
    });
  });

  describe('AlertDialogPortal', () => {
    it('should render with data-slot attribute', () => {
      render(
        <AlertDialogPortal>
          <div>Portal Content</div>
        </AlertDialogPortal>,
      );

      const portal = screen.getByTestId('alert-dialog-portal');
      expect(portal).toBeInTheDocument();
      expect(portal).toHaveAttribute('data-slot', 'alert-dialog-portal');
      expect(portal).toHaveAttribute('data-radix-portal');
    });

    it('should forward container prop', () => {
      const container = document.createElement('div');

      render(
        <AlertDialogPortal container={container}>
          <div>Portal Content</div>
        </AlertDialogPortal>,
      );

      const portal = screen.getByTestId('alert-dialog-portal');
      expect(portal).toBeInTheDocument();
    });
  });

  describe('AlertDialogOverlay', () => {
    it('should render with default classes and data-slot', () => {
      render(<AlertDialogOverlay />);

      const overlay = screen.getByTestId('alert-dialog-overlay');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveAttribute('data-slot', 'alert-dialog-overlay');
      expect(overlay).toHaveAttribute('data-radix-overlay');

      expect(overlay).toHaveClass(
        'data-[state=open]:animate-in',
        'data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0',
        'data-[state=open]:fade-in-0',
        'fixed',
        'inset-0',
        'z-50',
        'bg-black/50',
      );
    });

    it('should merge custom className with default classes', () => {
      render(<AlertDialogOverlay className="custom-overlay" />);

      const overlay = screen.getByTestId('alert-dialog-overlay');
      expect(overlay).toHaveClass('custom-overlay');
      expect(overlay).toHaveClass('fixed', 'inset-0', 'z-50');
    });

    it('should forward props correctly', () => {
      render(<AlertDialogOverlay data-state="open" />);

      const overlay = screen.getByTestId('alert-dialog-overlay');
      expect(overlay).toHaveAttribute('data-state', 'open');
    });
  });

  describe('AlertDialogContent', () => {
    it('should render with Portal and Overlay automatically', () => {
      render(
        <AlertDialogContent>
          <div>Dialog Content</div>
        </AlertDialogContent>,
      );

      expect(screen.getByTestId('alert-dialog-portal')).toBeInTheDocument();
      expect(screen.getByTestId('alert-dialog-overlay')).toBeInTheDocument();
      expect(screen.getByTestId('alert-dialog-content')).toBeInTheDocument();
    });

    it('should render with default classes and data-slot', () => {
      render(
        <AlertDialogContent>
          <div>Content</div>
        </AlertDialogContent>,
      );

      const content = screen.getByTestId('alert-dialog-content');
      expect(content).toHaveAttribute('data-slot', 'alert-dialog-content');
      expect(content).toHaveAttribute('data-radix-content');

      expect(content).toHaveClass(
        'bg-background',
        'data-[state=open]:animate-in',
        'data-[state=closed]:animate-out',
        'fixed',
        'top-[50%]',
        'left-[50%]',
        'z-50',
        'grid',
        'w-full',
        'max-w-[calc(100%-2rem)]',
        'translate-x-[-50%]',
        'translate-y-[-50%]',
        'gap-4',
        'rounded-lg',
        'border',
        'p-6',
        'shadow-lg',
        'duration-200',
        'sm:max-w-lg',
      );
    });

    it('should merge custom className with default classes', () => {
      render(
        <AlertDialogContent className="custom-content">
          <div>Content</div>
        </AlertDialogContent>,
      );

      const content = screen.getByTestId('alert-dialog-content');
      expect(content).toHaveClass('custom-content');
      expect(content).toHaveClass('bg-background', 'rounded-lg');
    });
  });

  describe('AlertDialogHeader', () => {
    it('should render with default classes and data-slot', () => {
      render(
        <AlertDialogHeader>
          <div>Header Content</div>
        </AlertDialogHeader>,
      );

      const header = screen.getByText('Header Content').parentElement;
      expect(header).toHaveAttribute('data-slot', 'alert-dialog-header');

      expect(header).toHaveClass(
        'flex',
        'flex-col',
        'gap-2',
        'text-center',
        'sm:text-left',
      );
    });

    it('should merge custom className with default classes', () => {
      render(
        <AlertDialogHeader className="custom-header">
          <div>Header Content</div>
        </AlertDialogHeader>,
      );

      const header = screen.getByText('Header Content').parentElement;
      expect(header).toHaveClass('custom-header');
      expect(header).toHaveClass('flex', 'flex-col', 'gap-2');
    });

    it('should forward props correctly', () => {
      render(
        <AlertDialogHeader id="dialog-header" role="banner">
          <div>Header Content</div>
        </AlertDialogHeader>,
      );

      const header = screen.getByText('Header Content').parentElement;
      expect(header).toHaveAttribute('id', 'dialog-header');
      expect(header).toHaveAttribute('role', 'banner');
    });
  });

  describe('AlertDialogFooter', () => {
    it('should render with default classes and data-slot', () => {
      render(
        <AlertDialogFooter>
          <div>Footer Content</div>
        </AlertDialogFooter>,
      );

      const footer = screen.getByText('Footer Content').parentElement;
      expect(footer).toHaveAttribute('data-slot', 'alert-dialog-footer');

      expect(footer).toHaveClass(
        'flex',
        'flex-col-reverse',
        'gap-2',
        'sm:flex-row',
        'sm:justify-end',
      );
    });

    it('should merge custom className with default classes', () => {
      render(
        <AlertDialogFooter className="custom-footer">
          <div>Footer Content</div>
        </AlertDialogFooter>,
      );

      const footer = screen.getByText('Footer Content').parentElement;
      expect(footer).toHaveClass('custom-footer');
      expect(footer).toHaveClass('flex', 'flex-col-reverse', 'gap-2');
    });
  });

  describe('AlertDialogTitle', () => {
    it('should render with default classes and data-slot', () => {
      render(<AlertDialogTitle>Dialog Title</AlertDialogTitle>);

      const title = screen.getByTestId('alert-dialog-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveAttribute('data-slot', 'alert-dialog-title');
      expect(title).toHaveAttribute('data-radix-title');
      expect(title).toHaveClass('text-lg', 'font-semibold');
      expect(title).toHaveTextContent('Dialog Title');
      expect(title.tagName).toBe('H2');
    });

    it('should merge custom className with default classes', () => {
      render(
        <AlertDialogTitle className="custom-title">Title</AlertDialogTitle>,
      );

      const title = screen.getByTestId('alert-dialog-title');
      expect(title).toHaveClass('custom-title');
      expect(title).toHaveClass('text-lg', 'font-semibold');
    });

    it('should forward props correctly', () => {
      render(<AlertDialogTitle id="dialog-title">Title</AlertDialogTitle>);

      const title = screen.getByTestId('alert-dialog-title');
      expect(title).toHaveAttribute('id', 'dialog-title');
    });
  });

  describe('AlertDialogDescription', () => {
    it('should render with default classes and data-slot', () => {
      render(
        <AlertDialogDescription>
          Dialog description text
        </AlertDialogDescription>,
      );

      const description = screen.getByTestId('alert-dialog-description');
      expect(description).toBeInTheDocument();

      expect(description).toHaveAttribute(
        'data-slot',
        'alert-dialog-description',
      );

      expect(description).toHaveAttribute('data-radix-description');
      expect(description).toHaveClass('text-muted-foreground', 'text-sm');
      expect(description).toHaveTextContent('Dialog description text');
      expect(description.tagName).toBe('P');
    });

    it('should merge custom className with default classes', () => {
      render(
        <AlertDialogDescription className="custom-description">
          Description
        </AlertDialogDescription>,
      );

      const description = screen.getByTestId('alert-dialog-description');
      expect(description).toHaveClass('custom-description');
      expect(description).toHaveClass('text-muted-foreground', 'text-sm');
    });
  });

  describe('AlertDialogAction', () => {
    it('should render with button variants and forward props', () => {
      const handleClick = vi.fn();

      render(
        <AlertDialogAction onClick={handleClick}>Confirm</AlertDialogAction>,
      );

      const action = screen.getByTestId('alert-dialog-action');
      expect(action).toBeInTheDocument();
      expect(action).toHaveAttribute('data-radix-action');
      expect(action).toHaveClass('button-base', 'button-default');
      expect(action).toHaveTextContent('Confirm');
      expect(action.tagName).toBe('BUTTON');
    });

    it('should merge custom className with button variants', () => {
      render(
        <AlertDialogAction className="custom-action">Action</AlertDialogAction>,
      );

      const action = screen.getByTestId('alert-dialog-action');
      expect(action).toHaveClass('custom-action');
      expect(action).toHaveClass('button-base', 'button-default');
    });

    it('should handle click events', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <AlertDialogAction onClick={handleClick}>Click me</AlertDialogAction>,
      );

      const action = screen.getByTestId('alert-dialog-action');
      await user.click(action);
      expect(handleClick).toHaveBeenCalledOnce();
    });
  });

  describe('AlertDialogCancel', () => {
    it('should render with outline button variant', () => {
      render(<AlertDialogCancel>Cancel</AlertDialogCancel>);

      const cancel = screen.getByTestId('alert-dialog-cancel');
      expect(cancel).toBeInTheDocument();
      expect(cancel).toHaveAttribute('data-radix-cancel');
      expect(cancel).toHaveClass('button-base', 'button-outline');
      expect(cancel).toHaveTextContent('Cancel');
      expect(cancel.tagName).toBe('BUTTON');
    });

    it('should merge custom className with button variants', () => {
      render(
        <AlertDialogCancel className="custom-cancel">Cancel</AlertDialogCancel>,
      );

      const cancel = screen.getByTestId('alert-dialog-cancel');
      expect(cancel).toHaveClass('custom-cancel');
      expect(cancel).toHaveClass('button-base', 'button-outline');
    });

    it('should handle click events', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <AlertDialogCancel onClick={handleClick}>Cancel</AlertDialogCancel>,
      );

      const cancel = screen.getByTestId('alert-dialog-cancel');
      await user.click(cancel);
      expect(handleClick).toHaveBeenCalledOnce();
    });
  });

  describe('Complete AlertDialog Integration', () => {
    it('should render a complete alert dialog structure', () => {
      render(
        <AlertDialog open={true}>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>,
      );

      // Check that all parts are rendered
      expect(screen.getByTestId('alert-dialog-root')).toBeInTheDocument();
      expect(screen.getByTestId('alert-dialog-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('alert-dialog-portal')).toBeInTheDocument();
      expect(screen.getByTestId('alert-dialog-overlay')).toBeInTheDocument();
      expect(screen.getByTestId('alert-dialog-content')).toBeInTheDocument();
      expect(screen.getByTestId('alert-dialog-title')).toBeInTheDocument();

      expect(
        screen.getByTestId('alert-dialog-description'),
      ).toBeInTheDocument();

      expect(screen.getByTestId('alert-dialog-action')).toBeInTheDocument();
      expect(screen.getByTestId('alert-dialog-cancel')).toBeInTheDocument();

      // Check content
      expect(screen.getByText('Are you absolutely sure?')).toBeInTheDocument();

      expect(
        screen.getByText(
          'This action cannot be undone. This will permanently delete your account.',
        ),
      ).toBeInTheDocument();

      expect(screen.getByText('Continue')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should handle complex interactions', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const onAction = vi.fn();
      const onCancel = vi.fn();

      render(
        <AlertDialog open={true} onOpenChange={onOpenChange}>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Action</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to proceed?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onAction}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>,
      );

      // Test action button
      const actionButton = screen.getByTestId('alert-dialog-action');
      await user.click(actionButton);
      expect(onAction).toHaveBeenCalledOnce();

      // Test cancel button
      const cancelButton = screen.getByTestId('alert-dialog-cancel');
      await user.click(cancelButton);
      expect(onCancel).toHaveBeenCalledOnce();
    });

    it('should maintain accessibility structure', () => {
      render(
        <AlertDialog open={true}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Accessible Title</AlertDialogTitle>
              <AlertDialogDescription>
                Accessible description
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>,
      );

      const title = screen.getByTestId('alert-dialog-title');
      const description = screen.getByTestId('alert-dialog-description');

      expect(title.tagName).toBe('H2');
      expect(description.tagName).toBe('P');
      expect(title).toHaveTextContent('Accessible Title');
      expect(description).toHaveTextContent('Accessible description');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content gracefully', () => {
      render(
        <AlertDialog>
          <AlertDialogContent>
            <AlertDialogTitle></AlertDialogTitle>
            <AlertDialogDescription></AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>,
      );

      expect(screen.getByTestId('alert-dialog-title')).toBeInTheDocument();

      expect(
        screen.getByTestId('alert-dialog-description'),
      ).toBeInTheDocument();
    });

    it('should handle missing optional components', () => {
      render(
        <AlertDialog>
          <AlertDialogContent>
            <AlertDialogTitle>Title Only</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>,
      );

      expect(screen.getByTestId('alert-dialog-title')).toBeInTheDocument();

      expect(
        screen.queryByTestId('alert-dialog-description'),
      ).not.toBeInTheDocument();
    });

    it('should handle disabled states', () => {
      render(
        <div>
          <AlertDialogAction disabled>Disabled Action</AlertDialogAction>
          <AlertDialogCancel disabled>Disabled Cancel</AlertDialogCancel>
        </div>,
      );

      expect(screen.getByTestId('alert-dialog-action')).toBeDisabled();
      expect(screen.getByTestId('alert-dialog-cancel')).toBeDisabled();
    });
  });
});
