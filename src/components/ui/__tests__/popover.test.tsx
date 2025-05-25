import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
} from '../popover';

vi.mock('@/lib/utils/cn', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

vi.mock('@radix-ui/react-popover', () => ({
  Root: ({
    children,
    open,
    defaultOpen,
    onOpenChange, // eslint-disable-line @typescript-eslint/no-unused-vars
    modal,
    ...props
  }: {
    children: React.ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    modal?: boolean;
  }) => (
    <div
      data-testid="popover-root"
      data-radix-root
      data-open={open}
      data-default-open={defaultOpen}
      data-modal={modal}
      {...props}
    >
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
          'data-testid': 'popover-trigger',
          'data-radix-trigger': true,
        },
      );
    }

    return (
      <button data-testid="popover-trigger" data-radix-trigger {...props}>
        {children}
      </button>
    );
  },
  Portal: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="popover-portal" data-radix-portal {...props}>
      {children}
    </div>
  ),
  Content: ({
    children,
    className,
    align,
    side,
    sideOffset,
    alignOffset,
    avoidCollisions,
    collisionBoundary, // eslint-disable-line @typescript-eslint/no-unused-vars
    collisionPadding, // eslint-disable-line @typescript-eslint/no-unused-vars
    sticky,
    hideWhenDetached,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    align?: 'start' | 'center' | 'end';
    side?: 'top' | 'right' | 'bottom' | 'left';
    sideOffset?: number;
    alignOffset?: number;
    avoidCollisions?: boolean;
    collisionBoundary?: Element | null | Array<Element | null>;
    collisionPadding?:
      | number
      | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>;
    sticky?: 'partial' | 'always';
    hideWhenDetached?: boolean;
  }) => (
    <div
      data-testid="popover-content"
      data-radix-content
      className={className}
      data-align={align}
      data-side={side}
      data-side-offset={sideOffset}
      data-align-offset={alignOffset}
      data-avoid-collisions={avoidCollisions}
      data-sticky={sticky}
      data-hide-when-detached={hideWhenDetached}
      {...props}
    >
      {children}
    </div>
  ),
  Anchor: ({ children, ...props }: { children?: React.ReactNode }) => (
    <div data-testid="popover-anchor" data-radix-anchor {...props}>
      {children}
    </div>
  ),
}));

/**
 * Test suite for the Popover component
 *
 * @remarks
 * Tests cover rendering, props forwarding, accessibility, and user interactions
 * for all Popover sub-components: Root, Trigger, Content, and Anchor
 */
describe('Popover', () => {
  describe('Popover (Root)', () => {
    it('should render with data-slot attribute', () => {
      render(
        <Popover>
          <div>Content</div>
        </Popover>,
      );

      const root = screen.getByTestId('popover-root');
      expect(root).toBeInTheDocument();
      expect(root).toHaveAttribute('data-slot', 'popover');
      expect(root).toHaveAttribute('data-radix-root');
    });

    it('should forward props to Radix Root', () => {
      const onOpenChange = vi.fn();

      render(
        <Popover
          open={true}
          defaultOpen={false}
          onOpenChange={onOpenChange}
          modal={true}
        >
          <div>Content</div>
        </Popover>,
      );

      const root = screen.getByTestId('popover-root');
      expect(root).toHaveAttribute('data-open', 'true');
      expect(root).toHaveAttribute('data-default-open', 'false');
      expect(root).toHaveAttribute('data-modal', 'true');
    });

    it('should render children', () => {
      render(
        <Popover>
          <div data-testid="child-content">Test Content</div>
        </Popover>,
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should handle controlled state', () => {
      const onOpenChange = vi.fn();

      render(
        <Popover open={false} onOpenChange={onOpenChange}>
          <div>Controlled Content</div>
        </Popover>,
      );

      const root = screen.getByTestId('popover-root');
      expect(root).toHaveAttribute('data-open', 'false');
    });

    it('should handle uncontrolled state with defaultOpen', () => {
      render(
        <Popover defaultOpen={true}>
          <div>Uncontrolled Content</div>
        </Popover>,
      );

      const root = screen.getByTestId('popover-root');
      expect(root).toHaveAttribute('data-default-open', 'true');
    });
  });

  describe('PopoverTrigger', () => {
    it('should render with data-slot attribute', () => {
      render(
        <Popover>
          <PopoverTrigger>Open Popover</PopoverTrigger>
        </Popover>,
      );

      const trigger = screen.getByTestId('popover-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('data-slot', 'popover-trigger');
      expect(trigger).toHaveAttribute('data-radix-trigger');
    });

    it('should render as button by default', () => {
      render(
        <Popover>
          <PopoverTrigger>Click me</PopoverTrigger>
        </Popover>,
      );

      const trigger = screen.getByRole('button', { name: 'Click me' });
      expect(trigger).toBeInTheDocument();
      expect(trigger.tagName).toBe('BUTTON');
    });

    it('should render children content', () => {
      render(
        <Popover>
          <PopoverTrigger>
            <span data-testid="trigger-icon">🔽</span>
            Open Menu
          </PopoverTrigger>
        </Popover>,
      );

      expect(screen.getByTestId('trigger-icon')).toBeInTheDocument();
      expect(screen.getByText('Open Menu')).toBeInTheDocument();
    });

    it('should support asChild prop with custom element', () => {
      render(
        <Popover>
          <PopoverTrigger asChild>
            <a href="#" data-testid="custom-trigger">
              Custom Link Trigger
            </a>
          </PopoverTrigger>
        </Popover>,
      );

      const trigger = screen.getByTestId('popover-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger.tagName).toBe('A');
      expect(trigger).toHaveAttribute('data-radix-trigger');
    });

    it('should forward props to trigger element', () => {
      render(
        <Popover>
          <PopoverTrigger
            disabled
            aria-label="Open popover menu"
            data-custom="test"
          >
            Trigger
          </PopoverTrigger>
        </Popover>,
      );

      const trigger = screen.getByTestId('popover-trigger');
      expect(trigger).toHaveAttribute('disabled');
      expect(trigger).toHaveAttribute('aria-label', 'Open popover menu');
      expect(trigger).toHaveAttribute('data-custom', 'test');
    });

    it('should handle click events', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(
        <Popover>
          <PopoverTrigger onClick={onClick}>Click me</PopoverTrigger>
        </Popover>,
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('PopoverContent', () => {
    it('should render with data-slot attribute', () => {
      render(
        <Popover>
          <PopoverContent>Content here</PopoverContent>
        </Popover>,
      );

      const content = screen.getByTestId('popover-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute('data-slot', 'popover-content');
      expect(content).toHaveAttribute('data-radix-content');
    });

    it('should render within Portal', () => {
      render(
        <Popover>
          <PopoverContent>Portal Content</PopoverContent>
        </Popover>,
      );

      const portal = screen.getByTestId('popover-portal');
      const content = screen.getByTestId('popover-content');

      expect(portal).toBeInTheDocument();
      expect(content).toBeInTheDocument();
      expect(portal).toContainElement(content);
    });

    it('should apply default styling classes', () => {
      render(
        <Popover>
          <PopoverContent>Styled Content</PopoverContent>
        </Popover>,
      );

      const content = screen.getByTestId('popover-content');

      expect(content).toHaveClass(
        'bg-popover',
        'text-popover-foreground',
        'z-50',
        'w-72',
        'rounded-md',
        'border',
        'p-4',
        'shadow-md',
        'outline-hidden',
      );
    });

    it('should apply animation classes', () => {
      render(
        <Popover>
          <PopoverContent>Animated Content</PopoverContent>
        </Popover>,
      );

      const content = screen.getByTestId('popover-content');

      expect(content).toHaveClass(
        'data-[state=open]:animate-in',
        'data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0',
        'data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95',
        'data-[state=open]:zoom-in-95',
      );
    });

    it('should apply slide-in animation classes for different sides', () => {
      render(
        <Popover>
          <PopoverContent>Slide Content</PopoverContent>
        </Popover>,
      );

      const content = screen.getByTestId('popover-content');

      expect(content).toHaveClass(
        'data-[side=bottom]:slide-in-from-top-2',
        'data-[side=left]:slide-in-from-right-2',
        'data-[side=right]:slide-in-from-left-2',
        'data-[side=top]:slide-in-from-bottom-2',
      );
    });

    it('should merge custom className with default classes', () => {
      render(
        <Popover>
          <PopoverContent className="custom-class bg-red-500">
            Custom Content
          </PopoverContent>
        </Popover>,
      );

      const content = screen.getByTestId('popover-content');
      expect(content).toHaveClass('custom-class', 'bg-red-500');
      // Should still have default classes
      expect(content).toHaveClass('z-50', 'rounded-md', 'border');
    });

    it('should use default align and sideOffset', () => {
      render(
        <Popover>
          <PopoverContent>Default Props</PopoverContent>
        </Popover>,
      );

      const content = screen.getByTestId('popover-content');
      expect(content).toHaveAttribute('data-align', 'center');
      expect(content).toHaveAttribute('data-side-offset', '4');
    });

    it('should accept custom align prop', () => {
      render(
        <Popover>
          <PopoverContent align="start">Start Aligned</PopoverContent>
        </Popover>,
      );

      const content = screen.getByTestId('popover-content');
      expect(content).toHaveAttribute('data-align', 'start');
    });

    it('should accept custom sideOffset prop', () => {
      render(
        <Popover>
          <PopoverContent sideOffset={10}>Custom Offset</PopoverContent>
        </Popover>,
      );

      const content = screen.getByTestId('popover-content');
      expect(content).toHaveAttribute('data-side-offset', '10');
    });

    it('should forward positioning props', () => {
      render(
        <Popover>
          <PopoverContent
            side="top"
            alignOffset={5}
            avoidCollisions={false}
            sticky="always"
            hideWhenDetached={true}
          >
            Positioned Content
          </PopoverContent>
        </Popover>,
      );

      const content = screen.getByTestId('popover-content');
      expect(content).toHaveAttribute('data-side', 'top');
      expect(content).toHaveAttribute('data-align-offset', '5');
      expect(content).toHaveAttribute('data-avoid-collisions', 'false');
      expect(content).toHaveAttribute('data-sticky', 'always');
      expect(content).toHaveAttribute('data-hide-when-detached', 'true');
    });

    it('should render children content', () => {
      render(
        <Popover>
          <PopoverContent>
            <h3>Popover Title</h3>
            <p>Popover description text</p>
            <button>Action Button</button>
          </PopoverContent>
        </Popover>,
      );

      expect(screen.getByText('Popover Title')).toBeInTheDocument();
      expect(screen.getByText('Popover description text')).toBeInTheDocument();

      expect(
        screen.getByRole('button', { name: 'Action Button' }),
      ).toBeInTheDocument();
    });

    it('should forward additional props', () => {
      render(
        <Popover>
          <PopoverContent
            role="dialog"
            aria-label="Settings popover"
            data-custom="test-value"
          >
            Content with props
          </PopoverContent>
        </Popover>,
      );

      const content = screen.getByTestId('popover-content');
      expect(content).toHaveAttribute('role', 'dialog');
      expect(content).toHaveAttribute('aria-label', 'Settings popover');
      expect(content).toHaveAttribute('data-custom', 'test-value');
    });
  });

  describe('PopoverAnchor', () => {
    it('should render with data-slot attribute', () => {
      render(
        <Popover>
          <PopoverAnchor>Anchor Element</PopoverAnchor>
        </Popover>,
      );

      const anchor = screen.getByTestId('popover-anchor');
      expect(anchor).toBeInTheDocument();
      expect(anchor).toHaveAttribute('data-slot', 'popover-anchor');
      expect(anchor).toHaveAttribute('data-radix-anchor');
    });

    it('should render children content', () => {
      render(
        <Popover>
          <PopoverAnchor>
            <div data-testid="anchor-content">Anchor Content</div>
          </PopoverAnchor>
        </Popover>,
      );

      expect(screen.getByTestId('anchor-content')).toBeInTheDocument();
      expect(screen.getByText('Anchor Content')).toBeInTheDocument();
    });

    it('should forward props to anchor element', () => {
      render(
        <Popover>
          <PopoverAnchor
            className="anchor-class"
            data-custom="anchor-value"
            id="popover-anchor"
          >
            Anchor with props
          </PopoverAnchor>
        </Popover>,
      );

      const anchor = screen.getByTestId('popover-anchor');
      expect(anchor).toHaveAttribute('class', 'anchor-class');
      expect(anchor).toHaveAttribute('data-custom', 'anchor-value');
      expect(anchor).toHaveAttribute('id', 'popover-anchor');
    });

    it('should render without children', () => {
      render(
        <Popover>
          <PopoverAnchor />
        </Popover>,
      );

      const anchor = screen.getByTestId('popover-anchor');
      expect(anchor).toBeInTheDocument();
      expect(anchor).toBeEmptyDOMElement();
    });
  });

  describe('Integration', () => {
    it('should render complete popover structure', () => {
      render(
        <Popover>
          <PopoverTrigger>Open Settings</PopoverTrigger>

          <PopoverAnchor>
            <div>Anchor Point</div>
          </PopoverAnchor>

          <PopoverContent>
            <h3>Settings</h3>
            <p>Configure your preferences</p>
          </PopoverContent>
        </Popover>,
      );

      expect(screen.getByTestId('popover-root')).toBeInTheDocument();
      expect(screen.getByTestId('popover-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('popover-anchor')).toBeInTheDocument();
      expect(screen.getByTestId('popover-portal')).toBeInTheDocument();
      expect(screen.getByTestId('popover-content')).toBeInTheDocument();

      expect(screen.getByText('Open Settings')).toBeInTheDocument();
      expect(screen.getByText('Anchor Point')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();

      expect(
        screen.getByText('Configure your preferences'),
      ).toBeInTheDocument();
    });

    it('should work with form elements inside content', () => {
      render(
        <Popover>
          <PopoverTrigger>Open Form</PopoverTrigger>

          <PopoverContent>
            <form>
              <label htmlFor="username">Username:</label>
              <input id="username" type="text" />
              <button type="submit">Submit</button>
            </form>
          </PopoverContent>
        </Popover>,
      );

      expect(screen.getByLabelText('Username:')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();

      expect(
        screen.getByRole('button', { name: 'Submit' }),
      ).toBeInTheDocument();
    });

    it('should handle complex content with multiple interactive elements', async () => {
      const user = userEvent.setup();
      const onButtonClick = vi.fn();

      render(
        <Popover>
          <PopoverTrigger>Open Menu</PopoverTrigger>

          <PopoverContent>
            <nav>
              <button onClick={onButtonClick}>Menu Item 1</button>
              <button>Menu Item 2</button>
              <a href="#link">Menu Link</a>
            </nav>
          </PopoverContent>
        </Popover>,
      );

      const menuItem = screen.getByRole('button', { name: 'Menu Item 1' });
      await user.click(menuItem);

      expect(onButtonClick).toHaveBeenCalledTimes(1);

      expect(
        screen.getByRole('link', { name: 'Menu Link' }),
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should support ARIA attributes on trigger', () => {
      render(
        <Popover>
          <PopoverTrigger
            aria-expanded="false"
            aria-haspopup="true"
            aria-controls="popover-content"
          >
            Accessible Trigger
          </PopoverTrigger>
        </Popover>,
      );

      const trigger = screen.getByTestId('popover-trigger');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveAttribute('aria-haspopup', 'true');
      expect(trigger).toHaveAttribute('aria-controls', 'popover-content');
    });

    it('should support ARIA attributes on content', () => {
      render(
        <Popover>
          <PopoverContent
            role="dialog"
            aria-labelledby="popover-title"
            aria-describedby="popover-description"
          >
            <h2 id="popover-title">Title</h2>
            <p id="popover-description">Description</p>
          </PopoverContent>
        </Popover>,
      );

      const content = screen.getByTestId('popover-content');
      expect(content).toHaveAttribute('role', 'dialog');
      expect(content).toHaveAttribute('aria-labelledby', 'popover-title');

      expect(content).toHaveAttribute(
        'aria-describedby',
        'popover-description',
      );
    });

    it('should support keyboard navigation props', () => {
      const onKeyDown = vi.fn();

      render(
        <Popover>
          <PopoverTrigger onKeyDown={onKeyDown}>
            Keyboard Trigger
          </PopoverTrigger>

          <PopoverContent onKeyDown={onKeyDown}>
            Keyboard Content
          </PopoverContent>
        </Popover>,
      );

      const trigger = screen.getByTestId('popover-trigger');
      const content = screen.getByTestId('popover-content');

      expect(trigger).toBeInTheDocument();
      expect(content).toBeInTheDocument();
    });
  });

  describe('cn utility integration', () => {
    it('should apply correct classes to content', () => {
      render(
        <Popover>
          <PopoverContent className="custom-class">Content</PopoverContent>
        </Popover>,
      );

      const content = screen.getByTestId('popover-content');
      expect(content).toHaveClass('custom-class');
      // Should also have default classes merged
      expect(content).toHaveClass('bg-popover', 'z-50', 'rounded-md');
    });

    it('should apply default classes when no custom className provided', () => {
      render(
        <Popover>
          <PopoverContent>Content</PopoverContent>
        </Popover>,
      );

      const content = screen.getByTestId('popover-content');

      expect(content).toHaveClass(
        'bg-popover',
        'text-popover-foreground',
        'z-50',
        'w-72',
        'rounded-md',
        'border',
        'p-4',
        'shadow-md',
      );
    });
  });
});
