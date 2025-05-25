import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '../select';

vi.mock('@/lib/utils/cn', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

vi.mock('lucide-react', () => ({
  CheckIcon: ({ className, ...props }: { className?: string }) => (
    <svg data-testid="check-icon" className={className} {...props}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  ChevronDownIcon: ({ className, ...props }: { className?: string }) => (
    <svg data-testid="chevron-down-icon" className={className} {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  ChevronUpIcon: ({ className, ...props }: { className?: string }) => (
    <svg data-testid="chevron-up-icon" className={className} {...props}>
      <path d="M18 15l-6-6-6 6" />
    </svg>
  ),
}));

// Create a context to simulate Radix UI's internal disabled state management
const MockSelectContext = React.createContext<{ disabled?: boolean }>({});

vi.mock('@radix-ui/react-select', () => ({
  Root: ({
    children,
    open,
    defaultOpen,
    value,
    defaultValue,
    onValueChange, // eslint-disable-line @typescript-eslint/no-unused-vars
    onOpenChange, // eslint-disable-line @typescript-eslint/no-unused-vars
    dir, // eslint-disable-line @typescript-eslint/no-unused-vars
    name, // eslint-disable-line @typescript-eslint/no-unused-vars
    disabled,
    required, // eslint-disable-line @typescript-eslint/no-unused-vars
    ...props
  }: {
    children: React.ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    onOpenChange?: (open: boolean) => void;
    dir?: 'ltr' | 'rtl';
    name?: string;
    disabled?: boolean;
    required?: boolean;
  }) => (
    <MockSelectContext.Provider value={{ disabled }}>
      <div
        data-testid="select-root"
        data-radix-root
        data-open={open}
        data-default-open={defaultOpen}
        data-value={value}
        data-default-value={defaultValue}
        data-disabled={disabled}
        {...props}
      >
        {children}
      </div>
    </MockSelectContext.Provider>
  ),
  Group: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="select-group" data-radix-group {...props}>
      {children}
    </div>
  ),
  Value: ({
    children,
    placeholder,
    ...props
  }: {
    children?: React.ReactNode;
    placeholder?: string;
  }) => (
    <span
      data-testid="select-value"
      data-radix-value
      data-placeholder={placeholder}
      {...props}
    >
      {children}
    </span>
  ),
  Trigger: React.forwardRef<
    HTMLButtonElement,
    {
      children: React.ReactNode;
      className?: string;
      disabled?: boolean;
      asChild?: boolean;
    }
  >(function SelectTriggerMock(
    { children, className, disabled, asChild, ...props }, // eslint-disable-line @typescript-eslint/no-unused-vars
    ref,
  ) {
    const context = React.useContext(MockSelectContext);
    const isDisabled = disabled || context.disabled;

    return (
      <button
        ref={ref}
        data-testid="select-trigger"
        data-radix-trigger
        className={className}
        disabled={isDisabled}
        {...props}
      >
        {children}
      </button>
    );
  }),
  Portal: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="select-portal" data-radix-portal {...props}>
      {children}
    </div>
  ),
  Content: ({
    children,
    className,
    position,
    side, // eslint-disable-line @typescript-eslint/no-unused-vars
    sideOffset, // eslint-disable-line @typescript-eslint/no-unused-vars
    align, // eslint-disable-line @typescript-eslint/no-unused-vars
    alignOffset, // eslint-disable-line @typescript-eslint/no-unused-vars
    avoidCollisions, // eslint-disable-line @typescript-eslint/no-unused-vars
    collisionBoundary, // eslint-disable-line @typescript-eslint/no-unused-vars
    collisionPadding, // eslint-disable-line @typescript-eslint/no-unused-vars
    sticky, // eslint-disable-line @typescript-eslint/no-unused-vars
    hideWhenDetached, // eslint-disable-line @typescript-eslint/no-unused-vars
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    position?: 'item-aligned' | 'popper';
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
      data-testid="select-content"
      data-radix-content
      className={className}
      data-position={position}
      {...props}
    >
      {children}
    </div>
  ),
  Viewport: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      data-testid="select-viewport"
      data-radix-viewport
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
  Label: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      data-testid="select-label"
      data-radix-label
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
  Item: ({
    children,
    className,
    value,
    disabled,
    textValue, // eslint-disable-line @typescript-eslint/no-unused-vars
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    value: string;
    disabled?: boolean;
    textValue?: string;
  }) => (
    <div
      data-testid="select-item"
      data-radix-item
      className={className}
      data-value={value}
      data-disabled={disabled}
      // eslint-disable-next-line jsx-a11y/role-has-required-aria-props
      role="option"
      {...props}
    >
      {children}
    </div>
  ),
  ItemText: ({ children, ...props }: { children: React.ReactNode }) => (
    <span data-testid="select-item-text" data-radix-item-text {...props}>
      {children}
    </span>
  ),
  ItemIndicator: ({ children, ...props }: { children?: React.ReactNode }) => (
    <span
      data-testid="select-item-indicator"
      data-radix-item-indicator
      {...props}
    >
      {children}
    </span>
  ),
  Separator: ({ className, ...props }: { className?: string }) => (
    <div
      data-testid="select-separator"
      data-radix-separator
      className={className}
      {...props}
    />
  ),
  ScrollUpButton: ({ className, ...props }: { className?: string }) => (
    <div
      data-testid="select-scroll-up-button"
      data-radix-scroll-up-button
      className={className}
      {...props}
    />
  ),
  ScrollDownButton: ({ className, ...props }: { className?: string }) => (
    <div
      data-testid="select-scroll-down-button"
      data-radix-scroll-down-button
      className={className}
      {...props}
    />
  ),
  Icon: ({
    children,
    asChild, // eslint-disable-line @typescript-eslint/no-unused-vars
    ...props
  }: {
    children?: React.ReactNode;
    asChild?: boolean;
  }) => (
    <span data-testid="select-icon" data-radix-icon {...props}>
      {children}
    </span>
  ),
}));

/**
 * Test suite for the Select component
 *
 * @remarks
 * Tests cover rendering, props forwarding, accessibility, and user interactions
 * for all Select sub-components following best practices for testing Select components
 * as outlined in React Testing Library documentation
 */
describe('Select', () => {
  describe('Select (Root)', () => {
    it('should render with data-slot attribute', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </Select>,
      );

      const root = screen.getByTestId('select-root');
      expect(root).toBeInTheDocument();
      expect(root).toHaveAttribute('data-slot', 'select');
      expect(root).toHaveAttribute('data-radix-root');
    });

    it('should forward props to Radix Root', () => {
      const onValueChange = vi.fn();
      const onOpenChange = vi.fn();

      render(
        <Select
          open={true}
          defaultOpen={false}
          value="test-value"
          defaultValue="default-value"
          onValueChange={onValueChange}
          onOpenChange={onOpenChange}
          disabled={true}
          required={true}
          name="test-select"
          dir="rtl"
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </Select>,
      );

      const root = screen.getByTestId('select-root');
      expect(root).toHaveAttribute('data-open', 'true');
      expect(root).toHaveAttribute('data-default-open', 'false');
      expect(root).toHaveAttribute('data-value', 'test-value');
      expect(root).toHaveAttribute('data-default-value', 'default-value');
      expect(root).toHaveAttribute('data-disabled', 'true');
    });

    it('should render children', () => {
      render(
        <Select>
          <SelectTrigger data-testid="child-trigger">
            <SelectValue />
          </SelectTrigger>
        </Select>,
      );

      expect(screen.getByTestId('child-trigger')).toBeInTheDocument();
    });
  });

  describe('SelectGroup', () => {
    it('should render with data-slot attribute', () => {
      render(
        <SelectGroup>
          <SelectLabel>Group Label</SelectLabel>
        </SelectGroup>,
      );

      const group = screen.getByTestId('select-group');
      expect(group).toBeInTheDocument();
      expect(group).toHaveAttribute('data-slot', 'select-group');
      expect(group).toHaveAttribute('data-radix-group');
    });

    it('should render children content', () => {
      render(
        <SelectGroup>
          <SelectLabel>Test Group</SelectLabel>
          <div data-testid="group-content">Group Content</div>
        </SelectGroup>,
      );

      expect(screen.getByText('Test Group')).toBeInTheDocument();
      expect(screen.getByTestId('group-content')).toBeInTheDocument();
    });

    it('should forward props', () => {
      render(
        <SelectGroup className="custom-group" data-custom="test">
          <SelectLabel>Group</SelectLabel>
        </SelectGroup>,
      );

      const group = screen.getByTestId('select-group');
      expect(group).toHaveAttribute('class', 'custom-group');
      expect(group).toHaveAttribute('data-custom', 'test');
    });
  });

  describe('SelectValue', () => {
    it('should render with data-slot attribute', () => {
      render(<SelectValue />);

      const value = screen.getByTestId('select-value');
      expect(value).toBeInTheDocument();
      expect(value).toHaveAttribute('data-slot', 'select-value');
      expect(value).toHaveAttribute('data-radix-value');
    });

    it('should render with placeholder', () => {
      render(<SelectValue placeholder="Select an option..." />);

      const value = screen.getByTestId('select-value');
      expect(value).toHaveAttribute('data-placeholder', 'Select an option...');
    });

    it('should render children content', () => {
      render(<SelectValue>Current Value</SelectValue>);

      expect(screen.getByText('Current Value')).toBeInTheDocument();
    });

    it('should forward props', () => {
      render(
        <SelectValue className="custom-value" data-custom="test">
          Value
        </SelectValue>,
      );

      const value = screen.getByTestId('select-value');
      expect(value).toHaveAttribute('class', 'custom-value');
      expect(value).toHaveAttribute('data-custom', 'test');
    });
  });

  describe('SelectTrigger', () => {
    it('should render with data-slot attribute', () => {
      render(
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>,
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('data-slot', 'select-trigger');
      expect(trigger).toHaveAttribute('data-radix-trigger');
    });

    it('should render as button element', () => {
      render(
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>,
      );

      const trigger = screen.getByRole('button');
      expect(trigger).toBeInTheDocument();
      expect(trigger.tagName).toBe('BUTTON');
    });

    it('should apply default styling classes', () => {
      render(
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>,
      );

      const trigger = screen.getByTestId('select-trigger');

      expect(trigger).toHaveClass(
        'border-input',
        'focus-visible:border-ring',
        'flex',
        'w-fit',
        'items-center',
        'justify-between',
        'gap-2',
        'rounded-md',
        'border',
        'bg-transparent',
        'px-3',
        'py-2',
        'text-sm',
        'shadow-xs',
      );
    });

    it('should apply default size classes', () => {
      render(
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>,
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('data-size', 'default');
      expect(trigger).toHaveClass('data-[size=default]:h-9');
    });

    it('should apply small size classes', () => {
      render(
        <SelectTrigger size="sm">
          <SelectValue />
        </SelectTrigger>,
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('data-size', 'sm');
      expect(trigger).toHaveClass('data-[size=sm]:h-8');
    });

    it('should merge custom className with default classes', () => {
      render(
        <SelectTrigger className="custom-class bg-red-500">
          <SelectValue />
        </SelectTrigger>,
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass('custom-class', 'bg-red-500');
      // Should still have default classes
      expect(trigger).toHaveClass('flex', 'rounded-md', 'border');
    });

    it('should render chevron down icon', () => {
      render(
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>,
      );

      const icon = screen.getByTestId('chevron-down-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('size-4', 'opacity-50');
    });

    it('should render children content', () => {
      render(
        <SelectTrigger>
          <SelectValue placeholder="Choose option" />
          <span data-testid="custom-content">Custom</span>
        </SelectTrigger>,
      );

      expect(screen.getByTestId('select-value')).toBeInTheDocument();
      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    });

    it('should handle disabled state', () => {
      render(
        <SelectTrigger disabled>
          <SelectValue />
        </SelectTrigger>,
      );

      const trigger = screen.getByRole('button');
      expect(trigger).toBeDisabled();
    });

    it('should forward props', () => {
      render(
        <SelectTrigger
          aria-label="Select option"
          data-custom="test"
          id="select-trigger"
        >
          <SelectValue />
        </SelectTrigger>,
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('aria-label', 'Select option');
      expect(trigger).toHaveAttribute('data-custom', 'test');
      expect(trigger).toHaveAttribute('id', 'select-trigger');
    });

    it('should handle click events', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(
        <SelectTrigger onClick={onClick}>
          <SelectValue />
        </SelectTrigger>,
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('SelectContent', () => {
    it('should render with data-slot attribute', () => {
      render(
        <SelectContent>
          <SelectItem value="item1">Item 1</SelectItem>
        </SelectContent>,
      );

      const content = screen.getByTestId('select-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute('data-slot', 'select-content');
      expect(content).toHaveAttribute('data-radix-content');
    });

    it('should render within Portal', () => {
      render(
        <SelectContent>
          <SelectItem value="item1">Item 1</SelectItem>
        </SelectContent>,
      );

      const portal = screen.getByTestId('select-portal');
      const content = screen.getByTestId('select-content');

      expect(portal).toBeInTheDocument();
      expect(content).toBeInTheDocument();
      expect(portal).toContainElement(content);
    });

    it('should apply default styling classes', () => {
      render(
        <SelectContent>
          <SelectItem value="item1">Item 1</SelectItem>
        </SelectContent>,
      );

      const content = screen.getByTestId('select-content');

      expect(content).toHaveClass(
        'bg-popover',
        'text-popover-foreground',
        'relative',
        'z-50',
        'min-w-[8rem]',
        'overflow-x-hidden',
        'overflow-y-auto',
        'rounded-md',
        'border',
        'shadow-md',
      );
    });

    it('should apply animation classes', () => {
      render(
        <SelectContent>
          <SelectItem value="item1">Item 1</SelectItem>
        </SelectContent>,
      );

      const content = screen.getByTestId('select-content');

      expect(content).toHaveClass(
        'data-[state=open]:animate-in',
        'data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0',
        'data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95',
        'data-[state=open]:zoom-in-95',
      );
    });

    it('should use default position', () => {
      render(
        <SelectContent>
          <SelectItem value="item1">Item 1</SelectItem>
        </SelectContent>,
      );

      const content = screen.getByTestId('select-content');
      expect(content).toHaveAttribute('data-position', 'popper');
    });

    it('should accept custom position', () => {
      render(
        <SelectContent position="item-aligned">
          <SelectItem value="item1">Item 1</SelectItem>
        </SelectContent>,
      );

      const content = screen.getByTestId('select-content');
      expect(content).toHaveAttribute('data-position', 'item-aligned');
    });

    it('should apply popper-specific classes when position is popper', () => {
      render(
        <SelectContent position="popper">
          <SelectItem value="item1">Item 1</SelectItem>
        </SelectContent>,
      );

      const content = screen.getByTestId('select-content');

      expect(content).toHaveClass(
        'data-[side=bottom]:translate-y-1',
        'data-[side=left]:-translate-x-1',
        'data-[side=right]:translate-x-1',
        'data-[side=top]:-translate-y-1',
      );
    });

    it('should render viewport with correct classes', () => {
      render(
        <SelectContent>
          <SelectItem value="item1">Item 1</SelectItem>
        </SelectContent>,
      );

      const viewport = screen.getByTestId('select-viewport');
      expect(viewport).toBeInTheDocument();
      expect(viewport).toHaveClass('p-1');
    });

    it('should render scroll buttons', () => {
      render(
        <SelectContent>
          <SelectItem value="item1">Item 1</SelectItem>
        </SelectContent>,
      );

      expect(screen.getByTestId('select-scroll-up-button')).toBeInTheDocument();

      expect(
        screen.getByTestId('select-scroll-down-button'),
      ).toBeInTheDocument();
    });

    it('should render children content', () => {
      render(
        <SelectContent>
          <SelectItem value="item1">Item 1</SelectItem>
          <SelectItem value="item2">Item 2</SelectItem>
        </SelectContent>,
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('should merge custom className with default classes', () => {
      render(
        <SelectContent className="custom-class bg-red-500">
          <SelectItem value="item1">Item 1</SelectItem>
        </SelectContent>,
      );

      const content = screen.getByTestId('select-content');
      expect(content).toHaveClass('custom-class', 'bg-red-500');
      // Should still have default classes
      expect(content).toHaveClass('z-50', 'rounded-md', 'border');
    });
  });

  describe('SelectLabel', () => {
    it('should render with data-slot attribute', () => {
      render(<SelectLabel>Label Text</SelectLabel>);

      const label = screen.getByTestId('select-label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute('data-slot', 'select-label');
      expect(label).toHaveAttribute('data-radix-label');
    });

    it('should apply default styling classes', () => {
      render(<SelectLabel>Label Text</SelectLabel>);

      const label = screen.getByTestId('select-label');

      expect(label).toHaveClass(
        'text-muted-foreground',
        'px-2',
        'py-1.5',
        'text-xs',
      );
    });

    it('should render children content', () => {
      render(<SelectLabel>Category Label</SelectLabel>);

      expect(screen.getByText('Category Label')).toBeInTheDocument();
    });

    it('should merge custom className with default classes', () => {
      render(<SelectLabel className="custom-label">Label</SelectLabel>);

      const label = screen.getByTestId('select-label');
      expect(label).toHaveClass('custom-label');
      // Should still have default classes
      expect(label).toHaveClass('text-muted-foreground', 'px-2', 'py-1.5');
    });

    it('should forward props', () => {
      render(
        <SelectLabel id="label-id" data-custom="test">
          Label
        </SelectLabel>,
      );

      const label = screen.getByTestId('select-label');
      expect(label).toHaveAttribute('id', 'label-id');
      expect(label).toHaveAttribute('data-custom', 'test');
    });
  });

  describe('SelectItem', () => {
    it('should render with data-slot attribute', () => {
      render(<SelectItem value="test">Item Text</SelectItem>);

      const item = screen.getByTestId('select-item');
      expect(item).toBeInTheDocument();
      expect(item).toHaveAttribute('data-slot', 'select-item');
      expect(item).toHaveAttribute('data-radix-item');
    });

    it('should apply default styling classes', () => {
      render(<SelectItem value="test">Item Text</SelectItem>);

      const item = screen.getByTestId('select-item');

      expect(item).toHaveClass(
        'focus:bg-accent',
        'focus:text-accent-foreground',
        'relative',
        'flex',
        'w-full',
        'cursor-default',
        'items-center',
        'gap-2',
        'rounded-sm',
        'py-1.5',
        'pr-8',
        'pl-2',
        'text-sm',
        'outline-hidden',
        'select-none',
      );
    });

    it('should have correct role attribute', () => {
      render(<SelectItem value="test">Item Text</SelectItem>);

      const item = screen.getByRole('option');
      expect(item).toBeInTheDocument();
    });

    it('should render with value attribute', () => {
      render(<SelectItem value="test-value">Item Text</SelectItem>);

      const item = screen.getByTestId('select-item');
      expect(item).toHaveAttribute('data-value', 'test-value');
    });

    it('should handle disabled state', () => {
      render(
        <SelectItem value="test" disabled>
          Disabled Item
        </SelectItem>,
      );

      const item = screen.getByTestId('select-item');
      expect(item).toHaveAttribute('data-disabled', 'true');

      expect(item).toHaveClass(
        'data-[disabled]:pointer-events-none',
        'data-[disabled]:opacity-50',
      );
    });

    it('should render check icon indicator', () => {
      render(<SelectItem value="test">Item Text</SelectItem>);

      const indicator = screen.getByTestId('select-item-indicator');
      const checkIcon = screen.getByTestId('check-icon');

      expect(indicator).toBeInTheDocument();
      expect(checkIcon).toBeInTheDocument();
      expect(checkIcon).toHaveClass('size-4');
    });

    it('should render item text', () => {
      render(<SelectItem value="test">Item Content</SelectItem>);

      const itemText = screen.getByTestId('select-item-text');
      expect(itemText).toBeInTheDocument();
      expect(screen.getByText('Item Content')).toBeInTheDocument();
    });

    it('should merge custom className with default classes', () => {
      render(
        <SelectItem value="test" className="custom-item">
          Item
        </SelectItem>,
      );

      const item = screen.getByTestId('select-item');
      expect(item).toHaveClass('custom-item');
      // Should still have default classes
      expect(item).toHaveClass('flex', 'w-full', 'cursor-default');
    });

    it('should forward props', () => {
      render(
        <SelectItem
          value="test"
          textValue="Custom text value"
          data-custom="test"
        >
          Item
        </SelectItem>,
      );

      const item = screen.getByTestId('select-item');
      expect(item).toHaveAttribute('data-custom', 'test');
    });
  });

  describe('SelectSeparator', () => {
    it('should render with data-slot attribute', () => {
      render(<SelectSeparator />);

      const separator = screen.getByTestId('select-separator');
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveAttribute('data-slot', 'select-separator');
      expect(separator).toHaveAttribute('data-radix-separator');
    });

    it('should apply default styling classes', () => {
      render(<SelectSeparator />);

      const separator = screen.getByTestId('select-separator');

      expect(separator).toHaveClass(
        'bg-border',
        'pointer-events-none',
        '-mx-1',
        'my-1',
        'h-px',
      );
    });

    it('should merge custom className with default classes', () => {
      render(<SelectSeparator className="custom-separator" />);

      const separator = screen.getByTestId('select-separator');
      expect(separator).toHaveClass('custom-separator');
      // Should still have default classes
      expect(separator).toHaveClass('bg-border', 'pointer-events-none');
    });

    it('should forward props', () => {
      render(<SelectSeparator data-custom="test" id="separator-id" />);

      const separator = screen.getByTestId('select-separator');
      expect(separator).toHaveAttribute('data-custom', 'test');
      expect(separator).toHaveAttribute('id', 'separator-id');
    });
  });

  describe('SelectScrollUpButton', () => {
    it('should render with data-slot attribute', () => {
      render(<SelectScrollUpButton />);

      const button = screen.getByTestId('select-scroll-up-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('data-slot', 'select-scroll-up-button');
      expect(button).toHaveAttribute('data-radix-scroll-up-button');
    });

    it('should apply default styling classes', () => {
      render(<SelectScrollUpButton />);

      const button = screen.getByTestId('select-scroll-up-button');

      expect(button).toHaveClass(
        'flex',
        'cursor-default',
        'items-center',
        'justify-center',
        'py-1',
      );
    });

    it('should render chevron up icon', () => {
      render(<SelectScrollUpButton />);

      const icon = screen.getByTestId('chevron-up-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('size-4');
    });

    it('should merge custom className with default classes', () => {
      render(<SelectScrollUpButton className="custom-scroll-up" />);

      const button = screen.getByTestId('select-scroll-up-button');
      expect(button).toHaveClass('custom-scroll-up');
      // Should still have default classes
      expect(button).toHaveClass('flex', 'cursor-default');
    });

    it('should forward props', () => {
      render(<SelectScrollUpButton data-custom="test" id="scroll-up-id" />);

      const button = screen.getByTestId('select-scroll-up-button');
      expect(button).toHaveAttribute('data-custom', 'test');
      expect(button).toHaveAttribute('id', 'scroll-up-id');
    });
  });

  describe('SelectScrollDownButton', () => {
    it('should render with data-slot attribute', () => {
      render(<SelectScrollDownButton />);

      const button = screen.getByTestId('select-scroll-down-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('data-slot', 'select-scroll-down-button');
      expect(button).toHaveAttribute('data-radix-scroll-down-button');
    });

    it('should apply default styling classes', () => {
      render(<SelectScrollDownButton />);

      const button = screen.getByTestId('select-scroll-down-button');

      expect(button).toHaveClass(
        'flex',
        'cursor-default',
        'items-center',
        'justify-center',
        'py-1',
      );
    });

    it('should render chevron down icon', () => {
      render(<SelectScrollDownButton />);

      const icon = screen.getByTestId('chevron-down-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('size-4');
    });

    it('should merge custom className with default classes', () => {
      render(<SelectScrollDownButton className="custom-scroll-down" />);

      const button = screen.getByTestId('select-scroll-down-button');
      expect(button).toHaveClass('custom-scroll-down');
      // Should still have default classes
      expect(button).toHaveClass('flex', 'cursor-default');
    });

    it('should forward props', () => {
      render(<SelectScrollDownButton data-custom="test" id="scroll-down-id" />);

      const button = screen.getByTestId('select-scroll-down-button');
      expect(button).toHaveAttribute('data-custom', 'test');
      expect(button).toHaveAttribute('id', 'scroll-down-id');
    });
  });

  describe('Integration', () => {
    it('should render complete select structure', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option..." />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectSeparator />
              <SelectItem value="orange">Orange</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByTestId('select-root')).toBeInTheDocument();
      expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('select-value')).toBeInTheDocument();
      expect(screen.getByTestId('select-portal')).toBeInTheDocument();
      expect(screen.getByTestId('select-content')).toBeInTheDocument();
      expect(screen.getByTestId('select-group')).toBeInTheDocument();
      expect(screen.getByTestId('select-label')).toBeInTheDocument();
      expect(screen.getAllByTestId('select-item')).toHaveLength(3);
      expect(screen.getByTestId('select-separator')).toBeInTheDocument();

      expect(screen.getByText('Fruits')).toBeInTheDocument();
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
      expect(screen.getByText('Orange')).toBeInTheDocument();
    });

    it('should work with controlled value', () => {
      const onValueChange = vi.fn();

      render(
        <Select value="apple" onValueChange={onValueChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
          </SelectContent>
        </Select>,
      );

      const root = screen.getByTestId('select-root');
      expect(root).toHaveAttribute('data-value', 'apple');
    });

    it('should work with default value', () => {
      render(
        <Select defaultValue="banana">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
          </SelectContent>
        </Select>,
      );

      const root = screen.getByTestId('select-root');
      expect(root).toHaveAttribute('data-default-value', 'banana');
    });

    it('should handle disabled state', () => {
      render(
        <Select disabled>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
          </SelectContent>
        </Select>,
      );

      const root = screen.getByTestId('select-root');
      const trigger = screen.getByRole('button');

      expect(root).toHaveAttribute('data-disabled', 'true');
      expect(trigger).toBeDisabled();
    });

    it('should handle complex nested structure', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Choose category..." />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">🍎 Apple</SelectItem>
              <SelectItem value="banana">🍌 Banana</SelectItem>
            </SelectGroup>

            <SelectSeparator />

            <SelectGroup>
              <SelectLabel>Vegetables</SelectLabel>
              <SelectItem value="carrot">🥕 Carrot</SelectItem>

              <SelectItem value="broccoli" disabled>
                🥦 Broccoli (Out of stock)
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>,
      );

      expect(screen.getAllByTestId('select-group')).toHaveLength(2);
      expect(screen.getAllByTestId('select-label')).toHaveLength(2);
      expect(screen.getAllByTestId('select-item')).toHaveLength(4);
      expect(screen.getByTestId('select-separator')).toBeInTheDocument();

      expect(screen.getByText('Fruits')).toBeInTheDocument();
      expect(screen.getByText('Vegetables')).toBeInTheDocument();
      expect(screen.getByText('🍎 Apple')).toBeInTheDocument();

      expect(
        screen.getByText('🥦 Broccoli (Out of stock)'),
      ).toBeInTheDocument();

      // Check disabled item
      const disabledItem = screen
        .getByText('🥦 Broccoli (Out of stock)')
        .closest('[data-testid="select-item"]');

      expect(disabledItem).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('Accessibility', () => {
    it('should support ARIA attributes on trigger', () => {
      render(
        <Select>
          <SelectTrigger
            aria-label="Select fruit"
            aria-describedby="fruit-description"
          >
            <SelectValue />
          </SelectTrigger>
        </Select>,
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('aria-label', 'Select fruit');
      expect(trigger).toHaveAttribute('aria-describedby', 'fruit-description');
    });

    it('should support ARIA attributes on content', () => {
      render(
        <SelectContent aria-label="Fruit options" role="listbox">
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>,
      );

      const content = screen.getByTestId('select-content');
      expect(content).toHaveAttribute('aria-label', 'Fruit options');
      expect(content).toHaveAttribute('role', 'listbox');
    });

    it('should have proper role attributes on items', () => {
      render(
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectContent>,
      );

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(2);
      expect(options[0]).toHaveAttribute('data-value', 'apple');
      expect(options[1]).toHaveAttribute('data-value', 'banana');
    });

    it('should support keyboard navigation props', () => {
      const onKeyDown = vi.fn();

      render(
        <Select>
          <SelectTrigger onKeyDown={onKeyDown}>
            <SelectValue />
          </SelectTrigger>
        </Select>,
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toBeInTheDocument();
    });

    it('should handle form integration', () => {
      render(
        <form data-testid="test-form">
          <Select name="fruit" required>
            <SelectTrigger>
              <SelectValue placeholder="Select fruit" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
            </SelectContent>
          </Select>
        </form>,
      );

      const form = screen.getByTestId('test-form');
      const root = screen.getByTestId('select-root');

      expect(form).toContainElement(root);
    });
  });

  describe('cn utility integration', () => {
    it('should apply correct classes to trigger', () => {
      render(
        <SelectTrigger className="custom-trigger">
          <SelectValue />
        </SelectTrigger>,
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass('custom-trigger');
      // Should also have default classes merged
      expect(trigger).toHaveClass('flex', 'rounded-md', 'border');
    });

    it('should apply correct classes to content', () => {
      render(
        <SelectContent className="custom-content">
          <SelectItem value="test">Test</SelectItem>
        </SelectContent>,
      );

      const content = screen.getByTestId('select-content');
      expect(content).toHaveClass('custom-content');
      // Should also have default classes merged
      expect(content).toHaveClass('bg-popover', 'z-50', 'rounded-md');
    });

    it('should apply correct classes to items', () => {
      render(
        <SelectItem value="test" className="custom-item">
          Test Item
        </SelectItem>,
      );

      const item = screen.getByTestId('select-item');
      expect(item).toHaveClass('custom-item');
      // Should also have default classes merged
      expect(item).toHaveClass('flex', 'w-full', 'cursor-default');
    });
  });
});
