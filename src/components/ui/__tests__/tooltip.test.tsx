import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '../tooltip';

vi.mock('@/lib/utils/cn', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

vi.mock('@radix-ui/react-tooltip', () => ({
  Provider: ({
    children,
    delayDuration,
    skipDelayDuration,
    disableHoverableContent,
    ...props
  }: {
    children: React.ReactNode;
    delayDuration?: number;
    skipDelayDuration?: number;
    disableHoverableContent?: boolean;
  }) => (
    <div
      data-testid="tooltip-provider"
      data-radix-provider
      data-delay-duration={delayDuration}
      data-skip-delay-duration={skipDelayDuration}
      data-disable-hoverable-content={disableHoverableContent}
      {...props}
    >
      {children}
    </div>
  ),
  Root: ({
    children,
    open,
    defaultOpen,
    onOpenChange, // eslint-disable-line @typescript-eslint/no-unused-vars
    delayDuration,
    disableHoverableContent,
    ...props
  }: {
    children: React.ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    delayDuration?: number;
    disableHoverableContent?: boolean;
  }) => (
    <div
      data-testid="tooltip-root"
      data-radix-root
      data-open={open}
      data-default-open={defaultOpen}
      data-delay-duration={delayDuration}
      data-disable-hoverable-content={disableHoverableContent}
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
          'data-testid': 'tooltip-trigger',
          'data-radix-trigger': true,
        },
      );
    }

    return (
      <button data-testid="tooltip-trigger" data-radix-trigger {...props}>
        {children}
      </button>
    );
  },
  Portal: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-portal" data-radix-portal {...props}>
      {children}
    </div>
  ),
  Content: ({
    children,
    className,
    side,
    sideOffset,
    align,
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
    side?: 'top' | 'right' | 'bottom' | 'left';
    sideOffset?: number;
    align?: 'start' | 'center' | 'end';
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
      data-testid="tooltip-content"
      data-radix-content
      className={className}
      data-side={side}
      data-side-offset={sideOffset}
      data-align={align}
      data-align-offset={alignOffset}
      data-avoid-collisions={avoidCollisions}
      data-sticky={sticky}
      data-hide-when-detached={hideWhenDetached}
      {...props}
    >
      {children}
    </div>
  ),
  Arrow: ({ className, ...props }: { className?: string }) => (
    <div
      data-testid="tooltip-arrow"
      data-radix-arrow
      className={className}
      {...props}
    />
  ),
}));

/**
 * Test suite for the Tooltip component
 *
 * @remarks
 * Tests cover rendering, props forwarding, accessibility, styling, and user interactions
 * for all Tooltip sub-components: Provider, Root, Trigger, Content, and Arrow
 */
describe('Tooltip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TooltipProvider', () => {
    it('should render with data-slot attribute', () => {
      render(
        <TooltipProvider>
          <div>Content</div>
        </TooltipProvider>,
      );

      const provider = screen.getByTestId('tooltip-provider');
      expect(provider).toBeInTheDocument();
      expect(provider).toHaveAttribute('data-slot', 'tooltip-provider');
      expect(provider).toHaveAttribute('data-radix-provider');
    });

    it('should apply default delayDuration of 0', () => {
      render(
        <TooltipProvider>
          <div>Content</div>
        </TooltipProvider>,
      );

      const provider = screen.getByTestId('tooltip-provider');
      expect(provider).toHaveAttribute('data-delay-duration', '0');
    });

    it('should accept custom delayDuration', () => {
      render(
        <TooltipProvider delayDuration={500}>
          <div>Content</div>
        </TooltipProvider>,
      );

      const provider = screen.getByTestId('tooltip-provider');
      expect(provider).toHaveAttribute('data-delay-duration', '500');
    });

    it('should forward all props to Radix Provider', () => {
      render(
        <TooltipProvider
          delayDuration={300}
          skipDelayDuration={200}
          disableHoverableContent={true}
        >
          <div>Content</div>
        </TooltipProvider>,
      );

      const provider = screen.getByTestId('tooltip-provider');
      expect(provider).toHaveAttribute('data-delay-duration', '300');
      expect(provider).toHaveAttribute('data-skip-delay-duration', '200');

      expect(provider).toHaveAttribute(
        'data-disable-hoverable-content',
        'true',
      );
    });

    it('should render children', () => {
      render(
        <TooltipProvider>
          <div data-testid="child-content">Test Content</div>
        </TooltipProvider>,
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('Tooltip (Root)', () => {
    it('should render with TooltipProvider wrapper', () => {
      render(
        <Tooltip>
          <div>Content</div>
        </Tooltip>,
      );

      const provider = screen.getByTestId('tooltip-provider');
      const root = screen.getByTestId('tooltip-root');

      expect(provider).toBeInTheDocument();
      expect(root).toBeInTheDocument();
      expect(root).toHaveAttribute('data-slot', 'tooltip');
      expect(root).toHaveAttribute('data-radix-root');
    });

    it('should forward props to Radix Root', () => {
      const onOpenChange = vi.fn();

      render(
        <Tooltip
          open={true}
          defaultOpen={false}
          onOpenChange={onOpenChange}
          delayDuration={400}
          disableHoverableContent={true}
        >
          <div>Content</div>
        </Tooltip>,
      );

      const root = screen.getByTestId('tooltip-root');
      expect(root).toHaveAttribute('data-open', 'true');
      expect(root).toHaveAttribute('data-default-open', 'false');
      expect(root).toHaveAttribute('data-delay-duration', '400');
      expect(root).toHaveAttribute('data-disable-hoverable-content', 'true');
    });

    it('should render children', () => {
      render(
        <Tooltip>
          <div data-testid="child-content">Test Content</div>
        </Tooltip>,
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should handle controlled state', () => {
      const onOpenChange = vi.fn();

      render(
        <Tooltip open={false} onOpenChange={onOpenChange}>
          <div>Controlled Content</div>
        </Tooltip>,
      );

      const root = screen.getByTestId('tooltip-root');
      expect(root).toHaveAttribute('data-open', 'false');
    });

    it('should handle uncontrolled state with defaultOpen', () => {
      render(
        <Tooltip defaultOpen={true}>
          <div>Uncontrolled Content</div>
        </Tooltip>,
      );

      const root = screen.getByTestId('tooltip-root');
      expect(root).toHaveAttribute('data-default-open', 'true');
    });
  });

  describe('TooltipTrigger', () => {
    it('should render with data-slot attribute', () => {
      render(<TooltipTrigger>Hover me</TooltipTrigger>);

      const trigger = screen.getByTestId('tooltip-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('data-slot', 'tooltip-trigger');
      expect(trigger).toHaveAttribute('data-radix-trigger');
    });

    it('should render as button by default', () => {
      render(<TooltipTrigger>Hover me</TooltipTrigger>);

      const trigger = screen.getByTestId('tooltip-trigger');
      expect(trigger.tagName).toBe('BUTTON');
      expect(trigger).toHaveTextContent('Hover me');
    });

    it('should support asChild prop with custom element', () => {
      render(
        <TooltipTrigger asChild>
          <span data-testid="custom-trigger">Custom trigger</span>
        </TooltipTrigger>,
      );

      const trigger = screen.getByTestId('tooltip-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger.tagName).toBe('SPAN');
      expect(trigger).toHaveAttribute('data-radix-trigger');
      expect(trigger).toHaveTextContent('Custom trigger');
    });

    it('should forward props to trigger element', () => {
      render(
        <TooltipTrigger
          disabled
          aria-label="Tooltip trigger"
          data-custom="value"
        >
          Trigger
        </TooltipTrigger>,
      );

      const trigger = screen.getByTestId('tooltip-trigger');
      expect(trigger).toHaveAttribute('disabled');
      expect(trigger).toHaveAttribute('aria-label', 'Tooltip trigger');
      expect(trigger).toHaveAttribute('data-custom', 'value');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();

      render(<TooltipTrigger>Focusable trigger</TooltipTrigger>);

      const trigger = screen.getByTestId('tooltip-trigger');

      await user.tab();
      expect(trigger).toHaveFocus();

      await user.keyboard('{Enter}');
    });

    it('should handle click events', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <TooltipTrigger onClick={handleClick}>
          Clickable trigger
        </TooltipTrigger>,
      );

      const trigger = screen.getByTestId('tooltip-trigger');
      await user.click(trigger);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('TooltipContent', () => {
    it('should render with Portal wrapper', () => {
      render(<TooltipContent>Tooltip content</TooltipContent>);

      const portal = screen.getByTestId('tooltip-portal');
      const content = screen.getByTestId('tooltip-content');

      expect(portal).toBeInTheDocument();
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute('data-slot', 'tooltip-content');
      expect(content).toHaveAttribute('data-radix-content');
    });

    it('should apply default styling classes', () => {
      render(<TooltipContent>Tooltip content</TooltipContent>);

      const content = screen.getByTestId('tooltip-content');

      expect(content).toHaveClass(
        'bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance',
      );
    });

    it('should merge custom className with defaults', () => {
      render(
        <TooltipContent className="custom-tooltip">
          Tooltip content
        </TooltipContent>,
      );

      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveClass('bg-primary');
      expect(content).toHaveClass('custom-tooltip');
    });

    it('should apply default sideOffset of 0', () => {
      render(<TooltipContent>Tooltip content</TooltipContent>);

      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveAttribute('data-side-offset', '0');
    });

    it('should accept custom sideOffset', () => {
      render(<TooltipContent sideOffset={10}>Tooltip content</TooltipContent>);

      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveAttribute('data-side-offset', '10');
    });

    it('should forward positioning props to Radix Content', () => {
      render(
        <TooltipContent
          side="top"
          align="start"
          alignOffset={5}
          avoidCollisions={false}
          sticky="always"
          hideWhenDetached={true}
        >
          Positioned content
        </TooltipContent>,
      );

      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveAttribute('data-side', 'top');
      expect(content).toHaveAttribute('data-align', 'start');
      expect(content).toHaveAttribute('data-align-offset', '5');
      expect(content).toHaveAttribute('data-avoid-collisions', 'false');
      expect(content).toHaveAttribute('data-sticky', 'always');
      expect(content).toHaveAttribute('data-hide-when-detached', 'true');
    });

    it('should render children content', () => {
      render(
        <TooltipContent>
          <span data-testid="tooltip-text">Helpful information</span>
        </TooltipContent>,
      );

      expect(screen.getByTestId('tooltip-text')).toBeInTheDocument();
      expect(screen.getByText('Helpful information')).toBeInTheDocument();
    });

    it('should include arrow element', () => {
      render(<TooltipContent>Content with arrow</TooltipContent>);

      const arrow = screen.getByTestId('tooltip-arrow');
      expect(arrow).toBeInTheDocument();

      expect(arrow).toHaveClass(
        'bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]',
      );
    });

    it('should handle complex content', () => {
      render(
        <TooltipContent>
          <div>
            <strong>Title</strong>
            <p>Description with more details</p>
            <button>Action</button>
          </div>
        </TooltipContent>,
      );

      expect(screen.getByText('Title')).toBeInTheDocument();

      expect(
        screen.getByText('Description with more details'),
      ).toBeInTheDocument();

      expect(
        screen.getByRole('button', { name: 'Action' }),
      ).toBeInTheDocument();
    });

    it('should support accessibility attributes', () => {
      render(
        <TooltipContent
          role="tooltip"
          aria-label="Additional information"
          id="tooltip-1"
        >
          Accessible content
        </TooltipContent>,
      );

      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveAttribute('role', 'tooltip');
      expect(content).toHaveAttribute('aria-label', 'Additional information');
      expect(content).toHaveAttribute('id', 'tooltip-1');
    });
  });

  describe('Complete Tooltip Integration', () => {
    it('should render complete tooltip with all components', () => {
      render(
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Helpful tooltip</TooltipContent>
        </Tooltip>,
      );

      expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-root')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-portal')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-arrow')).toBeInTheDocument();
    });

    it('should handle focus interactions', async () => {
      const user = userEvent.setup();

      render(
        <Tooltip>
          <TooltipTrigger>Focus trigger</TooltipTrigger>
          <TooltipContent>Tooltip appears on focus</TooltipContent>
        </Tooltip>,
      );

      const trigger = screen.getByTestId('tooltip-trigger');

      await user.tab();
      expect(trigger).toHaveFocus();

      await user.tab();
      expect(trigger).not.toHaveFocus();
    });

    it('should work with controlled state', () => {
      const onOpenChange = vi.fn();

      render(
        <Tooltip open={true} onOpenChange={onOpenChange}>
          <TooltipTrigger>Controlled trigger</TooltipTrigger>
          <TooltipContent>Controlled tooltip</TooltipContent>
        </Tooltip>,
      );

      const root = screen.getByTestId('tooltip-root');
      expect(root).toHaveAttribute('data-open', 'true');
    });

    it('should support custom positioning', () => {
      render(
        <Tooltip>
          <TooltipTrigger>Positioned trigger</TooltipTrigger>

          <TooltipContent side="bottom" align="end" sideOffset={15}>
            Bottom-end positioned tooltip
          </TooltipContent>
        </Tooltip>,
      );

      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveAttribute('data-side', 'bottom');
      expect(content).toHaveAttribute('data-align', 'end');
      expect(content).toHaveAttribute('data-side-offset', '15');
    });

    it('should handle multiple tooltips', () => {
      render(
        <div>
          <Tooltip>
            <TooltipTrigger>First trigger</TooltipTrigger>
            <TooltipContent>First tooltip</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>Second trigger</TooltipTrigger>
            <TooltipContent>Second tooltip</TooltipContent>
          </Tooltip>
        </div>,
      );

      const triggers = screen.getAllByTestId('tooltip-trigger');
      const contents = screen.getAllByTestId('tooltip-content');

      expect(triggers).toHaveLength(2);
      expect(contents).toHaveLength(2);
      expect(triggers[0]).toHaveTextContent('First trigger');
      expect(triggers[1]).toHaveTextContent('Second trigger');
      expect(contents[0]).toHaveTextContent('First tooltip');
      expect(contents[1]).toHaveTextContent('Second tooltip');
    });
  });

  describe('Accessibility', () => {
    it('should support ARIA attributes on trigger', () => {
      render(
        <Tooltip>
          <TooltipTrigger
            aria-describedby="tooltip-content"
            aria-expanded="false"
          >
            Accessible trigger
          </TooltipTrigger>

          <TooltipContent id="tooltip-content">
            Accessible tooltip content
          </TooltipContent>
        </Tooltip>,
      );

      const trigger = screen.getByTestId('tooltip-trigger');
      expect(trigger).toHaveAttribute('aria-describedby', 'tooltip-content');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should support role attribute on content', () => {
      render(
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>

          <TooltipContent role="tooltip">
            Tooltip with explicit role
          </TooltipContent>
        </Tooltip>,
      );

      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveAttribute('role', 'tooltip');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <button>Before</button>

          <Tooltip>
            <TooltipTrigger>Tooltip trigger</TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>

          <button>After</button>
        </div>,
      );

      const beforeButton = screen.getByText('Before');
      const trigger = screen.getByTestId('tooltip-trigger');
      const afterButton = screen.getByText('After');

      // Tab through elements
      await user.tab();
      expect(beforeButton).toHaveFocus();

      await user.tab();
      expect(trigger).toHaveFocus();

      await user.tab();
      expect(afterButton).toHaveFocus();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined className gracefully', () => {
      render(
        <TooltipContent className={undefined}>
          Content with undefined className
        </TooltipContent>,
      );

      const content = screen.getByTestId('tooltip-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('bg-primary'); // Should still have default classes
    });

    it('should handle null className gracefully', () => {
      render(
        <TooltipContent className={null as unknown as string}>
          Content with null className
        </TooltipContent>,
      );

      const content = screen.getByTestId('tooltip-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('bg-primary');
    });

    it('should handle empty string className', () => {
      render(
        <TooltipContent className="">
          Content with empty className
        </TooltipContent>,
      );

      const content = screen.getByTestId('tooltip-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('bg-primary');
    });

    it('should handle missing children gracefully', () => {
      render(<TooltipContent />);

      const content = screen.getByTestId('tooltip-content');
      expect(content).toBeInTheDocument();
      // Content should only contain the arrow element when no children are provided
      const arrow = screen.getByTestId('tooltip-arrow');
      expect(arrow).toBeInTheDocument();
    });

    it('should handle complex nested content', () => {
      render(
        <TooltipContent>
          <div>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="test.jpg" alt="Test image" />
            <a href="#test">Link</a>
          </div>
        </TooltipContent>,
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByAltText('Test image')).toBeInTheDocument();
      expect(screen.getByText('Link')).toBeInTheDocument();
    });

    it('should handle very long content', () => {
      const longContent = 'A'.repeat(1000);

      render(<TooltipContent>{longContent}</TooltipContent>);

      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveTextContent(longContent);
      expect(content).toHaveClass('text-balance'); // Should handle text balancing
    });

    it('should handle special characters in content', () => {
      const specialContent = '!@#$%^&*()_+-=[]{}|;:,.<>?`~"\'\\';

      render(<TooltipContent>{specialContent}</TooltipContent>);

      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveTextContent(specialContent);
    });

    it('should handle unicode characters', () => {
      const unicodeContent = '🚀 Hello 世界 🌍 Emoji test 🎉';

      render(<TooltipContent>{unicodeContent}</TooltipContent>);

      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveTextContent(unicodeContent);
    });
  });

  describe('Performance and Optimization', () => {
    it('should not re-render unnecessarily with same props', () => {
      const { rerender } = render(
        <TooltipContent sideOffset={5}>Same content</TooltipContent>,
      );

      const content = screen.getByTestId('tooltip-content');
      const initialElement = content;

      rerender(<TooltipContent sideOffset={5}>Same content</TooltipContent>);

      const afterRerender = screen.getByTestId('tooltip-content');
      expect(afterRerender).toBe(initialElement);
    });

    it('should handle rapid hover events efficiently', async () => {
      const user = userEvent.setup();

      render(
        <Tooltip>
          <TooltipTrigger>Rapid hover trigger</TooltipTrigger>
          <TooltipContent>Rapid hover content</TooltipContent>
        </Tooltip>,
      );

      const trigger = screen.getByTestId('tooltip-trigger');

      // Simulate rapid hover/unhover
      for (let i = 0; i < 5; i++) {
        await user.hover(trigger);
        await user.unhover(trigger);
      }

      // Should not cause any errors
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('Data Attributes', () => {
    it('should have correct data-slot attributes', () => {
      render(
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>,
      );

      expect(screen.getByTestId('tooltip-provider')).toHaveAttribute(
        'data-slot',
        'tooltip-provider',
      );

      expect(screen.getByTestId('tooltip-root')).toHaveAttribute(
        'data-slot',
        'tooltip',
      );

      expect(screen.getByTestId('tooltip-trigger')).toHaveAttribute(
        'data-slot',
        'tooltip-trigger',
      );

      expect(screen.getByTestId('tooltip-content')).toHaveAttribute(
        'data-slot',
        'tooltip-content',
      );
    });

    it('should support custom data attributes', () => {
      render(
        <Tooltip>
          <TooltipTrigger data-testid="custom-trigger" data-custom="trigger">
            Custom trigger
          </TooltipTrigger>

          <TooltipContent data-testid="custom-content" data-custom="content">
            Custom content
          </TooltipContent>
        </Tooltip>,
      );

      expect(screen.getByTestId('custom-trigger')).toHaveAttribute(
        'data-custom',
        'trigger',
      );

      expect(screen.getByTestId('custom-content')).toHaveAttribute(
        'data-custom',
        'content',
      );
    });
  });

  describe('Standalone TooltipProvider Usage', () => {
    it('should work as standalone provider for multiple tooltips', () => {
      render(
        <TooltipProvider delayDuration={100}>
          <div>
            <Tooltip>
              <TooltipTrigger>First</TooltipTrigger>
              <TooltipContent>First tooltip</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger>Second</TooltipTrigger>
              <TooltipContent>Second tooltip</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>,
      );

      // Should have one provider wrapping multiple tooltips
      const providers = screen.getAllByTestId('tooltip-provider');
      expect(providers).toHaveLength(3); // 1 standalone + 2 from Tooltip components

      const triggers = screen.getAllByTestId('tooltip-trigger');
      expect(triggers).toHaveLength(2);
    });
  });
});
