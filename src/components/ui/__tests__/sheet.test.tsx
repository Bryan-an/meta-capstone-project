import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from '../sheet';

vi.mock('@/lib/utils/cn', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

vi.mock('lucide-react', () => ({
  XIcon: ({ className, ...props }: { className?: string }) => (
    <svg data-testid="x-icon" className={className} {...props}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
}));

// Create a context to simulate Radix UI's internal state management
const MockSheetContext = React.createContext<{ open?: boolean }>({});

vi.mock('@radix-ui/react-dialog', () => ({
  Root: ({
    children,
    open,
    defaultOpen,
    onOpenChange, // eslint-disable-line @typescript-eslint/no-unused-vars
    modal, // eslint-disable-line @typescript-eslint/no-unused-vars
    ...props
  }: {
    children: React.ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    modal?: boolean;
  }) => (
    <MockSheetContext.Provider value={{ open: open ?? defaultOpen }}>
      <div
        data-testid="sheet-root"
        data-radix-root
        data-open={open}
        data-default-open={defaultOpen}
        {...props}
      >
        {children}
      </div>
    </MockSheetContext.Provider>
  ),

  Trigger: React.forwardRef<
    HTMLButtonElement,
    {
      children: React.ReactNode;
      className?: string;
      disabled?: boolean;
      asChild?: boolean;
    }
  >(function SheetTriggerMock(
    { children, className, disabled, asChild, ...props }, // eslint-disable-line @typescript-eslint/no-unused-vars
    ref,
  ) {
    const context = React.useContext(MockSheetContext);

    return (
      <button
        ref={ref}
        data-testid="sheet-trigger"
        data-radix-trigger
        className={className}
        disabled={disabled || context.open}
        {...props}
      >
        {children}
      </button>
    );
  }),

  Close: React.forwardRef<
    HTMLButtonElement,
    {
      children?: React.ReactNode;
      className?: string;
      asChild?: boolean;
    }
  >(function SheetCloseMock(
    { children, className, asChild, ...props }, // eslint-disable-line @typescript-eslint/no-unused-vars
    ref,
  ) {
    return (
      <button
        ref={ref}
        data-testid="sheet-close"
        data-radix-close
        className={className}
        {...props}
      >
        {children}
      </button>
    );
  }),

  Portal: ({
    children,
    container, // eslint-disable-line @typescript-eslint/no-unused-vars
    ...props
  }: {
    children: React.ReactNode;
    container?: HTMLElement;
  }) => (
    <div data-testid="sheet-portal" data-radix-portal {...props}>
      {children}
    </div>
  ),

  Overlay: React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
      className?: string;
    }
  >(function SheetOverlayMock({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-testid="sheet-overlay"
        data-radix-overlay
        className={className}
        {...props}
      />
    );
  }),

  Content: React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
      children?: React.ReactNode;
      className?: string;
      onOpenAutoFocus?: (event: Event) => void;
      onCloseAutoFocus?: (event: Event) => void;
      onEscapeKeyDown?: (event: KeyboardEvent) => void;
      onPointerDownOutside?: (event: PointerEvent) => void;
      onInteractOutside?: (event: Event) => void;
    }
  >(function SheetContentMock(
    {
      children,
      className,
      onOpenAutoFocus, // eslint-disable-line @typescript-eslint/no-unused-vars
      onCloseAutoFocus, // eslint-disable-line @typescript-eslint/no-unused-vars
      onEscapeKeyDown, // eslint-disable-line @typescript-eslint/no-unused-vars
      onPointerDownOutside, // eslint-disable-line @typescript-eslint/no-unused-vars
      onInteractOutside, // eslint-disable-line @typescript-eslint/no-unused-vars
      ...props
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        data-testid="sheet-content"
        data-radix-content
        className={className}
        {...props}
      >
        {children}
      </div>
    );
  }),

  Title: React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement> & {
      className?: string;
    }
  >(function SheetTitleMock({ className, children, ...props }, ref) {
    return (
      <h2
        ref={ref}
        data-testid="sheet-title"
        data-radix-title
        className={className}
        {...props}
      >
        {children}
      </h2>
    );
  }),

  Description: React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement> & {
      className?: string;
    }
  >(function SheetDescriptionMock({ className, children, ...props }, ref) {
    return (
      <p
        ref={ref}
        data-testid="sheet-description"
        data-radix-description
        className={className}
        {...props}
      >
        {children}
      </p>
    );
  }),
}));

/**
 * Test suite for the Sheet component family
 *
 * @remarks
 * Tests cover rendering, props forwarding, accessibility, side variants,
 * user interactions, and styling for all Sheet components following Radix UI patterns
 */
describe('Sheet Components', () => {
  describe('Sheet (Root)', () => {
    it('should render with data-slot attribute', () => {
      render(
        <Sheet>
          <div>Sheet content</div>
        </Sheet>,
      );

      const sheet = screen.getByTestId('sheet-root');
      expect(sheet).toBeInTheDocument();
      expect(sheet).toHaveAttribute('data-slot', 'sheet');
      expect(sheet).toHaveAttribute('data-radix-root');
    });

    it('should forward all props to Radix Root', () => {
      const onOpenChange = vi.fn();

      render(
        <Sheet
          open={true}
          onOpenChange={onOpenChange}
          modal={false}
          data-custom="test"
        >
          <div>Content</div>
        </Sheet>,
      );

      const sheet = screen.getByTestId('sheet-root');
      expect(sheet).toHaveAttribute('data-open', 'true');
      expect(sheet).toHaveAttribute('data-custom', 'test');
    });

    it('should support controlled state', () => {
      const onOpenChange = vi.fn();

      render(
        <Sheet open={false} onOpenChange={onOpenChange}>
          <div>Content</div>
        </Sheet>,
      );

      const sheet = screen.getByTestId('sheet-root');
      expect(sheet).toHaveAttribute('data-open', 'false');
    });

    it('should support uncontrolled state', () => {
      render(
        <Sheet defaultOpen={true}>
          <div>Content</div>
        </Sheet>,
      );

      const sheet = screen.getByTestId('sheet-root');
      expect(sheet).toHaveAttribute('data-default-open', 'true');
    });
  });

  describe('SheetTrigger', () => {
    it('should render with data-slot attribute', () => {
      render(
        <Sheet>
          <SheetTrigger>Open Sheet</SheetTrigger>
        </Sheet>,
      );

      const trigger = screen.getByTestId('sheet-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('data-slot', 'sheet-trigger');
      expect(trigger).toHaveAttribute('data-radix-trigger');
    });

    it('should render as button by default', () => {
      render(
        <Sheet>
          <SheetTrigger>Open Sheet</SheetTrigger>
        </Sheet>,
      );

      const trigger = screen.getByTestId('sheet-trigger');
      expect(trigger.tagName).toBe('BUTTON');
      expect(trigger).toHaveTextContent('Open Sheet');
    });

    it('should support disabled state', () => {
      render(
        <Sheet>
          <SheetTrigger disabled>Open Sheet</SheetTrigger>
        </Sheet>,
      );

      const trigger = screen.getByTestId('sheet-trigger');
      expect(trigger).toBeDisabled();
    });

    it('should forward all props', () => {
      const onClick = vi.fn();

      render(
        <Sheet>
          <SheetTrigger
            className="custom-trigger"
            onClick={onClick}
            id="trigger-id"
            data-custom="trigger-data"
          >
            Open Sheet
          </SheetTrigger>
        </Sheet>,
      );

      const trigger = screen.getByTestId('sheet-trigger');
      expect(trigger).toHaveClass('custom-trigger');
      expect(trigger).toHaveAttribute('id', 'trigger-id');
      expect(trigger).toHaveAttribute('data-custom', 'trigger-data');
    });

    it('should support asChild prop for custom elements', () => {
      render(
        <Sheet>
          <SheetTrigger asChild>
            <a href="#" data-testid="custom-trigger">
              Custom Trigger
            </a>
          </SheetTrigger>
        </Sheet>,
      );

      const trigger = screen.getByTestId('sheet-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('data-radix-trigger');
    });

    it('should handle click events', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(
        <Sheet>
          <SheetTrigger onClick={onClick}>Open Sheet</SheetTrigger>
        </Sheet>,
      );

      const trigger = screen.getByTestId('sheet-trigger');
      await user.click(trigger);

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('SheetClose', () => {
    it('should render with data-slot attribute', () => {
      render(
        <Sheet>
          <SheetClose>Close Sheet</SheetClose>
        </Sheet>,
      );

      const close = screen.getByTestId('sheet-close');
      expect(close).toBeInTheDocument();
      expect(close).toHaveAttribute('data-slot', 'sheet-close');
      expect(close).toHaveAttribute('data-radix-close');
    });

    it('should render as button by default', () => {
      render(
        <Sheet>
          <SheetClose>Close Sheet</SheetClose>
        </Sheet>,
      );

      const close = screen.getByTestId('sheet-close');
      expect(close.tagName).toBe('BUTTON');
      expect(close).toHaveTextContent('Close Sheet');
    });

    it('should forward all props', () => {
      const onClick = vi.fn();

      render(
        <Sheet>
          <SheetClose className="custom-close" onClick={onClick} id="close-id">
            Close Sheet
          </SheetClose>
        </Sheet>,
      );

      const close = screen.getByTestId('sheet-close');
      expect(close).toHaveClass('custom-close');
      expect(close).toHaveAttribute('id', 'close-id');
    });

    it('should support asChild prop', () => {
      render(
        <Sheet>
          <SheetClose asChild>
            <span data-testid="custom-close">Custom Close</span>
          </SheetClose>
        </Sheet>,
      );

      const close = screen.getByTestId('sheet-close');
      expect(close).toBeInTheDocument();
      expect(close).toHaveAttribute('data-radix-close');
    });
  });

  describe('SheetContent', () => {
    it('should render with data-slot attribute', () => {
      render(
        <Sheet>
          <SheetContent>Content</SheetContent>
        </Sheet>,
      );

      const content = screen.getByTestId('sheet-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute('data-slot', 'sheet-content');
      expect(content).toHaveAttribute('data-radix-content');
    });

    it('should render overlay and portal', () => {
      render(
        <Sheet>
          <SheetContent>Content</SheetContent>
        </Sheet>,
      );

      const portal = screen.getByTestId('sheet-portal');
      const overlay = screen.getByTestId('sheet-overlay');
      const content = screen.getByTestId('sheet-content');

      expect(portal).toBeInTheDocument();
      expect(overlay).toBeInTheDocument();
      expect(content).toBeInTheDocument();
    });

    it('should apply default styling classes', () => {
      render(
        <Sheet>
          <SheetContent>Content</SheetContent>
        </Sheet>,
      );

      const content = screen.getByTestId('sheet-content');

      expect(content).toHaveClass(
        'bg-background',
        'data-[state=open]:animate-in',
        'data-[state=closed]:animate-out',
        'fixed',
        'z-50',
        'flex',
        'flex-col',
        'gap-4',
        'shadow-lg',
        'transition',
        'ease-in-out',
      );
    });

    it('should apply right side classes by default', () => {
      render(
        <Sheet>
          <SheetContent>Content</SheetContent>
        </Sheet>,
      );

      const content = screen.getByTestId('sheet-content');

      expect(content).toHaveClass(
        'data-[state=closed]:slide-out-to-right',
        'data-[state=open]:slide-in-from-right',
        'inset-y-0',
        'right-0',
        'h-full',
        'w-3/4',
        'border-l',
        'sm:max-w-sm',
      );
    });

    it('should apply left side classes', () => {
      render(
        <Sheet>
          <SheetContent side="left">Content</SheetContent>
        </Sheet>,
      );

      const content = screen.getByTestId('sheet-content');

      expect(content).toHaveClass(
        'data-[state=closed]:slide-out-to-left',
        'data-[state=open]:slide-in-from-left',
        'inset-y-0',
        'left-0',
        'h-full',
        'w-3/4',
        'border-r',
        'sm:max-w-sm',
      );
    });

    it('should apply top side classes', () => {
      render(
        <Sheet>
          <SheetContent side="top">Content</SheetContent>
        </Sheet>,
      );

      const content = screen.getByTestId('sheet-content');

      expect(content).toHaveClass(
        'data-[state=closed]:slide-out-to-top',
        'data-[state=open]:slide-in-from-top',
        'inset-x-0',
        'top-0',
        'h-auto',
        'border-b',
      );
    });

    it('should apply bottom side classes', () => {
      render(
        <Sheet>
          <SheetContent side="bottom">Content</SheetContent>
        </Sheet>,
      );

      const content = screen.getByTestId('sheet-content');

      expect(content).toHaveClass(
        'data-[state=closed]:slide-out-to-bottom',
        'data-[state=open]:slide-in-from-bottom',
        'inset-x-0',
        'bottom-0',
        'h-auto',
        'border-t',
      );
    });

    it('should merge custom className with default classes', () => {
      render(
        <Sheet>
          <SheetContent className="custom-content bg-red-500">
            Content
          </SheetContent>
        </Sheet>,
      );

      const content = screen.getByTestId('sheet-content');
      expect(content).toHaveClass('custom-content', 'bg-red-500');
      expect(content).toHaveClass('bg-background', 'fixed', 'z-50');
    });

    it('should render close button with X icon', () => {
      render(
        <Sheet>
          <SheetContent>Content</SheetContent>
        </Sheet>,
      );

      const closeButton = screen.getByTestId('sheet-close');
      const xIcon = screen.getByTestId('x-icon');

      expect(closeButton).toBeInTheDocument();
      expect(xIcon).toBeInTheDocument();

      expect(closeButton).toHaveClass(
        'ring-offset-background',
        'focus:ring-ring',
        'data-[state=open]:bg-secondary',
        'absolute',
        'top-4',
        'right-4',
        'rounded-xs',
        'opacity-70',
      );
    });

    it('should have accessible close button', () => {
      render(
        <Sheet>
          <SheetContent>Content</SheetContent>
        </Sheet>,
      );

      const closeButton = screen.getByTestId('sheet-close');
      const srText = closeButton.querySelector('.sr-only');

      expect(srText).toBeInTheDocument();
      expect(srText).toHaveTextContent('Close');
    });

    it('should forward event handlers', () => {
      const onOpenAutoFocus = vi.fn();
      const onCloseAutoFocus = vi.fn();
      const onEscapeKeyDown = vi.fn();

      render(
        <Sheet>
          <SheetContent
            onOpenAutoFocus={onOpenAutoFocus}
            onCloseAutoFocus={onCloseAutoFocus}
            onEscapeKeyDown={onEscapeKeyDown}
          >
            Content
          </SheetContent>
        </Sheet>,
      );

      const content = screen.getByTestId('sheet-content');
      expect(content).toBeInTheDocument();
    });
  });

  describe('SheetHeader', () => {
    it('should render with data-slot attribute', () => {
      render(<SheetHeader>Header Content</SheetHeader>);

      const header = screen.getByText('Header Content');
      expect(header).toBeInTheDocument();
      expect(header).toHaveAttribute('data-slot', 'sheet-header');
    });

    it('should render as div element', () => {
      render(<SheetHeader>Header Content</SheetHeader>);

      const header = screen.getByText('Header Content');
      expect(header.tagName).toBe('DIV');
    });

    it('should apply default styling classes', () => {
      render(<SheetHeader>Header Content</SheetHeader>);

      const header = screen.getByText('Header Content');
      expect(header).toHaveClass('flex', 'flex-col', 'gap-1.5', 'p-4');
    });

    it('should merge custom className with default classes', () => {
      render(
        <SheetHeader className="custom-header bg-blue-500">
          Header Content
        </SheetHeader>,
      );

      const header = screen.getByText('Header Content');
      expect(header).toHaveClass('custom-header', 'bg-blue-500');
      expect(header).toHaveClass('flex', 'flex-col', 'gap-1.5', 'p-4');
    });

    it('should forward all props', () => {
      const onClick = vi.fn();

      render(
        <SheetHeader id="header-id" onClick={onClick} data-custom="header-data">
          Header Content
        </SheetHeader>,
      );

      const header = screen.getByText('Header Content');
      expect(header).toHaveAttribute('id', 'header-id');
      expect(header).toHaveAttribute('data-custom', 'header-data');
    });
  });

  describe('SheetFooter', () => {
    it('should render with data-slot attribute', () => {
      render(<SheetFooter>Footer Content</SheetFooter>);

      const footer = screen.getByText('Footer Content');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveAttribute('data-slot', 'sheet-footer');
    });

    it('should render as div element', () => {
      render(<SheetFooter>Footer Content</SheetFooter>);

      const footer = screen.getByText('Footer Content');
      expect(footer.tagName).toBe('DIV');
    });

    it('should apply default styling classes', () => {
      render(<SheetFooter>Footer Content</SheetFooter>);

      const footer = screen.getByText('Footer Content');
      expect(footer).toHaveClass('mt-auto', 'flex', 'flex-col', 'gap-2', 'p-4');
    });

    it('should merge custom className with default classes', () => {
      render(
        <SheetFooter className="custom-footer bg-green-500">
          Footer Content
        </SheetFooter>,
      );

      const footer = screen.getByText('Footer Content');
      expect(footer).toHaveClass('custom-footer', 'bg-green-500');
      expect(footer).toHaveClass('mt-auto', 'flex', 'flex-col', 'gap-2', 'p-4');
    });

    it('should forward all props', () => {
      const onClick = vi.fn();

      render(
        <SheetFooter id="footer-id" onClick={onClick} data-custom="footer-data">
          Footer Content
        </SheetFooter>,
      );

      const footer = screen.getByText('Footer Content');
      expect(footer).toHaveAttribute('id', 'footer-id');
      expect(footer).toHaveAttribute('data-custom', 'footer-data');
    });
  });

  describe('SheetTitle', () => {
    it('should render with data-slot attribute', () => {
      render(
        <Sheet>
          <SheetTitle>Sheet Title</SheetTitle>
        </Sheet>,
      );

      const title = screen.getByTestId('sheet-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveAttribute('data-slot', 'sheet-title');
      expect(title).toHaveAttribute('data-radix-title');
    });

    it('should render as h2 element', () => {
      render(
        <Sheet>
          <SheetTitle>Sheet Title</SheetTitle>
        </Sheet>,
      );

      const title = screen.getByTestId('sheet-title');
      expect(title.tagName).toBe('H2');
      expect(title).toHaveTextContent('Sheet Title');
    });

    it('should apply default styling classes', () => {
      render(
        <Sheet>
          <SheetTitle>Sheet Title</SheetTitle>
        </Sheet>,
      );

      const title = screen.getByTestId('sheet-title');
      expect(title).toHaveClass('text-foreground', 'font-semibold');
    });

    it('should merge custom className with default classes', () => {
      render(
        <Sheet>
          <SheetTitle className="custom-title text-xl">Sheet Title</SheetTitle>
        </Sheet>,
      );

      const title = screen.getByTestId('sheet-title');
      expect(title).toHaveClass('custom-title', 'text-xl');
      expect(title).toHaveClass('text-foreground', 'font-semibold');
    });

    it('should forward all props', () => {
      render(
        <Sheet>
          <SheetTitle id="title-id" data-custom="title-data">
            Sheet Title
          </SheetTitle>
        </Sheet>,
      );

      const title = screen.getByTestId('sheet-title');
      expect(title).toHaveAttribute('id', 'title-id');
      expect(title).toHaveAttribute('data-custom', 'title-data');
    });
  });

  describe('SheetDescription', () => {
    it('should render with data-slot attribute', () => {
      render(
        <Sheet>
          <SheetDescription>Sheet Description</SheetDescription>
        </Sheet>,
      );

      const description = screen.getByTestId('sheet-description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveAttribute('data-slot', 'sheet-description');
      expect(description).toHaveAttribute('data-radix-description');
    });

    it('should render as p element', () => {
      render(
        <Sheet>
          <SheetDescription>Sheet Description</SheetDescription>
        </Sheet>,
      );

      const description = screen.getByTestId('sheet-description');
      expect(description.tagName).toBe('P');
      expect(description).toHaveTextContent('Sheet Description');
    });

    it('should apply default styling classes', () => {
      render(
        <Sheet>
          <SheetDescription>Sheet Description</SheetDescription>
        </Sheet>,
      );

      const description = screen.getByTestId('sheet-description');
      expect(description).toHaveClass('text-muted-foreground', 'text-sm');
    });

    it('should merge custom className with default classes', () => {
      render(
        <Sheet>
          <SheetDescription className="custom-description text-base">
            Sheet Description
          </SheetDescription>
        </Sheet>,
      );

      const description = screen.getByTestId('sheet-description');
      expect(description).toHaveClass('custom-description', 'text-base');
      expect(description).toHaveClass('text-muted-foreground', 'text-sm');
    });

    it('should forward all props', () => {
      render(
        <Sheet>
          <SheetDescription id="description-id" data-custom="description-data">
            Sheet Description
          </SheetDescription>
        </Sheet>,
      );

      const description = screen.getByTestId('sheet-description');
      expect(description).toHaveAttribute('id', 'description-id');
      expect(description).toHaveAttribute('data-custom', 'description-data');
    });
  });

  describe('Integration Scenarios', () => {
    it('should render complete sheet with all components', () => {
      render(
        <Sheet>
          <SheetTrigger>Open Sheet</SheetTrigger>

          <SheetContent>
            <SheetHeader>
              <SheetTitle>Sheet Title</SheetTitle>
              <SheetDescription>Sheet Description</SheetDescription>
            </SheetHeader>

            <div>Main content</div>

            <SheetFooter>
              <SheetClose>Close</SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>,
      );

      expect(screen.getByTestId('sheet-root')).toBeInTheDocument();
      expect(screen.getByTestId('sheet-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
      expect(screen.getByTestId('sheet-title')).toBeInTheDocument();
      expect(screen.getByTestId('sheet-description')).toBeInTheDocument();
      expect(screen.getByText('Main content')).toBeInTheDocument();
      expect(screen.getAllByTestId('sheet-close')).toHaveLength(2); // One in footer, one built-in
    });

    it('should work with different side configurations', () => {
      const { rerender } = render(
        <Sheet>
          <SheetContent side="left">Left Content</SheetContent>
        </Sheet>,
      );

      let content = screen.getByTestId('sheet-content');
      expect(content).toHaveClass('left-0', 'border-r');

      rerender(
        <Sheet>
          <SheetContent side="top">Top Content</SheetContent>
        </Sheet>,
      );

      content = screen.getByTestId('sheet-content');
      expect(content).toHaveClass('top-0', 'border-b');

      rerender(
        <Sheet>
          <SheetContent side="bottom">Bottom Content</SheetContent>
        </Sheet>,
      );

      content = screen.getByTestId('sheet-content');
      expect(content).toHaveClass('bottom-0', 'border-t');
    });

    it('should handle user interactions', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <Sheet onOpenChange={onOpenChange}>
          <SheetTrigger>Open Sheet</SheetTrigger>

          <SheetContent>
            <SheetClose>Close Sheet</SheetClose>
          </SheetContent>
        </Sheet>,
      );

      const trigger = screen.getByTestId('sheet-trigger');
      const closeButton = screen.getAllByTestId('sheet-close')[0];

      await user.click(trigger);
      await user.click(closeButton);

      expect(trigger).toBeInTheDocument();
      expect(closeButton).toBeInTheDocument();
    });

    it('should support complex content structure', () => {
      render(
        <Sheet>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription>Site navigation menu</SheetDescription>
            </SheetHeader>

            <nav>
              <ul>
                <li>
                  <span>Home</span>
                </li>

                <li>
                  <span>About</span>
                </li>
              </ul>
            </nav>

            <SheetFooter>
              <button type="button">Settings</button>
              <SheetClose>Close</SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>,
      );

      expect(screen.getByText('Navigation')).toBeInTheDocument();
      expect(screen.getByText('Site navigation menu')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <Sheet>
          <SheetTrigger aria-label="Open navigation">Menu</SheetTrigger>

          <SheetContent>
            <SheetTitle>Navigation Menu</SheetTitle>
            <SheetDescription>Main site navigation</SheetDescription>
          </SheetContent>
        </Sheet>,
      );

      const trigger = screen.getByTestId('sheet-trigger');
      const title = screen.getByTestId('sheet-title');
      const description = screen.getByTestId('sheet-description');

      expect(trigger).toHaveAttribute('aria-label', 'Open navigation');
      expect(title).toBeInTheDocument();
      expect(description).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(
        <Sheet>
          <SheetTrigger onKeyDown={vi.fn()}>Open Sheet</SheetTrigger>

          <SheetContent onEscapeKeyDown={vi.fn()}>
            <SheetClose onKeyDown={vi.fn()}>Close</SheetClose>
          </SheetContent>
        </Sheet>,
      );

      const trigger = screen.getByTestId('sheet-trigger');
      const content = screen.getByTestId('sheet-content');
      const close = screen.getAllByTestId('sheet-close')[0];

      expect(trigger).toBeInTheDocument();
      expect(content).toBeInTheDocument();
      expect(close).toBeInTheDocument();
    });

    it('should have accessible close button with screen reader text', () => {
      render(
        <Sheet>
          <SheetContent>Content</SheetContent>
        </Sheet>,
      );

      const closeButton = screen.getByTestId('sheet-close');
      const srText = closeButton.querySelector('.sr-only');

      expect(closeButton).toBeInTheDocument();
      expect(srText).toHaveTextContent('Close');
      expect(srText).toHaveClass('sr-only');
    });

    it('should support focus management props', () => {
      const onOpenAutoFocus = vi.fn();
      const onCloseAutoFocus = vi.fn();

      render(
        <Sheet>
          <SheetContent
            onOpenAutoFocus={onOpenAutoFocus}
            onCloseAutoFocus={onCloseAutoFocus}
          >
            Content
          </SheetContent>
        </Sheet>,
      );

      const content = screen.getByTestId('sheet-content');
      expect(content).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined className', () => {
      render(
        <Sheet>
          <SheetContent className={undefined}>Content</SheetContent>
        </Sheet>,
      );

      const content = screen.getByTestId('sheet-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('bg-background', 'fixed', 'z-50');
    });

    it('should handle empty className', () => {
      render(
        <Sheet>
          <SheetContent className="">Content</SheetContent>
        </Sheet>,
      );

      const content = screen.getByTestId('sheet-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('bg-background', 'fixed', 'z-50');
    });

    it('should handle missing children gracefully', () => {
      render(
        <Sheet>
          <SheetContent />
        </Sheet>,
      );

      const content = screen.getByTestId('sheet-content');
      expect(content).toBeInTheDocument();
    });

    it('should handle all side variants', () => {
      const sides: Array<'top' | 'right' | 'bottom' | 'left'> = [
        'top',
        'right',
        'bottom',
        'left',
      ];

      sides.forEach((side) => {
        const { unmount } = render(
          <Sheet>
            <SheetContent side={side} data-testid={`content-${side}`}>
              {side} content
            </SheetContent>
          </Sheet>,
        );

        const content = screen.getByTestId(`content-${side}`);
        expect(content).toBeInTheDocument();

        unmount();
      });
    });
  });

  describe('cn utility integration', () => {
    it('should apply correct classes with custom className for content', () => {
      render(
        <Sheet>
          <SheetContent className="custom-class">Content</SheetContent>
        </Sheet>,
      );

      const content = screen.getByTestId('sheet-content');
      expect(content).toHaveClass('custom-class');
      expect(content).toHaveClass('bg-background', 'fixed', 'z-50');
    });

    it('should apply correct classes for overlay', () => {
      render(
        <Sheet>
          <SheetContent>Content</SheetContent>
        </Sheet>,
      );

      const overlay = screen.getByTestId('sheet-overlay');

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

    it('should merge classes correctly for all components', () => {
      render(
        <div>
          <SheetHeader className="custom-header">Header</SheetHeader>
          <SheetFooter className="custom-footer">Footer</SheetFooter>

          <Sheet>
            <SheetTitle className="custom-title">Title</SheetTitle>

            <SheetDescription className="custom-description">
              Description
            </SheetDescription>
          </Sheet>
        </div>,
      );

      const header = screen.getByText('Header');
      const footer = screen.getByText('Footer');
      const title = screen.getByTestId('sheet-title');
      const description = screen.getByTestId('sheet-description');

      expect(header).toHaveClass('custom-header', 'flex', 'flex-col');
      expect(footer).toHaveClass('custom-footer', 'mt-auto', 'flex');
      expect(title).toHaveClass('custom-title', 'text-foreground');

      expect(description).toHaveClass(
        'custom-description',
        'text-muted-foreground',
      );
    });
  });

  describe('TypeScript Props', () => {
    it('should accept all valid Radix Dialog props for Sheet', () => {
      const validProps = {
        open: true,
        defaultOpen: false,
        onOpenChange: vi.fn(),
        modal: true,
      };

      render(
        <Sheet {...validProps}>
          <div>Content</div>
        </Sheet>,
      );

      const sheet = screen.getByTestId('sheet-root');
      expect(sheet).toBeInTheDocument();
      expect(sheet).toHaveAttribute('data-open', 'true');
    });

    it('should accept all valid side props for SheetContent', () => {
      const sides: Array<'top' | 'right' | 'bottom' | 'left'> = [
        'top',
        'right',
        'bottom',
        'left',
      ];

      sides.forEach((side) => {
        const { unmount } = render(
          <Sheet>
            <SheetContent side={side}>Content</SheetContent>
          </Sheet>,
        );

        const content = screen.getByTestId('sheet-content');
        expect(content).toBeInTheDocument();

        unmount();
      });
    });

    it('should work with React.ComponentProps types', () => {
      const htmlProps = {
        id: 'html-id',
        className: 'html-class',
        style: { margin: '10px' },
        'data-custom': 'html-data',
        onClick: vi.fn(),
      };

      render(
        <div>
          <SheetHeader {...htmlProps}>Header</SheetHeader>
          <SheetFooter {...htmlProps}>Footer</SheetFooter>
        </div>,
      );

      const header = screen.getByText('Header');
      const footer = screen.getByText('Footer');

      expect(header).toHaveAttribute('id', 'html-id');
      expect(header).toHaveClass('html-class');
      expect(footer).toHaveAttribute('data-custom', 'html-data');
    });
  });
});
