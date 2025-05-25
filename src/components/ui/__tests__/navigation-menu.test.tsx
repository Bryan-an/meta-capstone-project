import React from 'react';
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
} from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from '../navigation-menu';
import { cn } from '@/lib/utils/cn';

vi.mock('@/lib/utils/cn', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

vi.mock('@radix-ui/react-navigation-menu', () => ({
  Root: vi.fn(({ children, ...props }) => (
    <div data-testid="navigation-menu-root" {...props}>
      {children}
    </div>
  )),
  List: vi.fn(({ children, ...props }) => (
    <ul data-testid="navigation-menu-list" {...props}>
      {children}
    </ul>
  )),
  Item: vi.fn(({ children, ...props }) => (
    <li data-testid="navigation-menu-item" {...props}>
      {children}
    </li>
  )),
  Trigger: vi.fn(({ children, ...props }) => (
    <button data-testid="navigation-menu-trigger" {...props}>
      {children}
    </button>
  )),
  Content: vi.fn(({ children, ...props }) => (
    <div data-testid="navigation-menu-content" {...props}>
      {children}
    </div>
  )),
  Link: vi.fn(({ children, ...props }) => (
    <a data-testid="navigation-menu-link" {...props}>
      {children}
    </a>
  )),
  Indicator: vi.fn(({ children, ...props }) => (
    <div data-testid="navigation-menu-indicator" {...props}>
      {children}
    </div>
  )),
  Viewport: vi.fn(({ children, ...props }) => (
    <div data-testid="navigation-menu-viewport" {...props}>
      {children}
    </div>
  )),
}));

vi.mock('class-variance-authority', () => ({
  cva: vi.fn((base) => () => base),
}));

vi.mock('lucide-react', () => ({
  ChevronDownIcon: vi.fn((props) => (
    <svg data-testid="chevron-down-icon" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )),
}));

describe('NavigationMenu Components', () => {
  // Store original window.location to restore later
  const originalLocation = window.location;

  beforeAll(() => {
    // Mock window.location to prevent JSDOM navigation errors
    delete (window as { location?: Location }).location;

    window.location = {
      ...originalLocation,
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
      href: 'http://localhost:3000/',
    } as unknown as string & Location;
  });

  afterAll(() => {
    window.location = originalLocation as unknown as string & Location;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('NavigationMenu', () => {
    it('should render with default props', () => {
      render(
        <NavigationMenu>
          <div>Test content</div>
        </NavigationMenu>,
      );

      const root = screen.getByTestId('navigation-menu-root');
      expect(root).toBeInTheDocument();
      expect(root).toHaveAttribute('data-slot', 'navigation-menu');
      expect(root).toHaveAttribute('data-viewport', 'true');
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should render viewport by default', () => {
      render(
        <NavigationMenu>
          <div>Content</div>
        </NavigationMenu>,
      );

      expect(
        screen.getByTestId('navigation-menu-viewport'),
      ).toBeInTheDocument();
    });

    it('should not render viewport when viewport prop is false', () => {
      render(
        <NavigationMenu viewport={false}>
          <div>Content</div>
        </NavigationMenu>,
      );

      expect(
        screen.queryByTestId('navigation-menu-viewport'),
      ).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <NavigationMenu className="custom-nav-class">
          <div>Content</div>
        </NavigationMenu>,
      );

      expect(cn).toHaveBeenCalledWith(
        'group/navigation-menu relative flex max-w-max flex-1 items-center justify-center',
        'custom-nav-class',
      );
    });

    it('should pass through additional props', () => {
      render(
        <NavigationMenu data-custom="test-value">
          <div>Content</div>
        </NavigationMenu>,
      );

      const root = screen.getByTestId('navigation-menu-root');
      expect(root).toHaveAttribute('data-custom', 'test-value');
    });

    it('should set data-viewport attribute correctly', () => {
      const { rerender } = render(
        <NavigationMenu viewport={true}>
          <div>Content</div>
        </NavigationMenu>,
      );

      expect(screen.getByTestId('navigation-menu-root')).toHaveAttribute(
        'data-viewport',
        'true',
      );

      rerender(
        <NavigationMenu viewport={false}>
          <div>Content</div>
        </NavigationMenu>,
      );

      expect(screen.getByTestId('navigation-menu-root')).toHaveAttribute(
        'data-viewport',
        'false',
      );
    });
  });

  describe('NavigationMenuList', () => {
    it('should render with default props', () => {
      render(
        <NavigationMenuList>
          <li>Item 1</li>
          <li>Item 2</li>
        </NavigationMenuList>,
      );

      const list = screen.getByTestId('navigation-menu-list');
      expect(list).toBeInTheDocument();
      expect(list).toHaveAttribute('data-slot', 'navigation-menu-list');
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <NavigationMenuList className="custom-list-class">
          <li>Item</li>
        </NavigationMenuList>,
      );

      expect(cn).toHaveBeenCalledWith(
        'group flex flex-1 list-none items-center justify-center gap-1',
        'custom-list-class',
      );
    });

    it('should pass through additional props', () => {
      render(
        <NavigationMenuList role="navigation">
          <li>Item</li>
        </NavigationMenuList>,
      );

      const list = screen.getByTestId('navigation-menu-list');
      expect(list).toHaveAttribute('role', 'navigation');
    });
  });

  describe('NavigationMenuItem', () => {
    it('should render with default props', () => {
      render(
        <NavigationMenuItem>
          <span>Menu item content</span>
        </NavigationMenuItem>,
      );

      const item = screen.getByTestId('navigation-menu-item');
      expect(item).toBeInTheDocument();
      expect(item).toHaveAttribute('data-slot', 'navigation-menu-item');
      expect(screen.getByText('Menu item content')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <NavigationMenuItem className="custom-item-class">
          <span>Content</span>
        </NavigationMenuItem>,
      );

      expect(cn).toHaveBeenCalledWith('relative', 'custom-item-class');
    });

    it('should pass through additional props', () => {
      render(
        <NavigationMenuItem data-value="menu-item">
          <span>Content</span>
        </NavigationMenuItem>,
      );

      const item = screen.getByTestId('navigation-menu-item');
      expect(item).toHaveAttribute('data-value', 'menu-item');
    });
  });

  describe('NavigationMenuTrigger', () => {
    it('should render with default props', () => {
      render(<NavigationMenuTrigger>Trigger text</NavigationMenuTrigger>);

      const trigger = screen.getByTestId('navigation-menu-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('data-slot', 'navigation-menu-trigger');
      expect(screen.getByText('Trigger text')).toBeInTheDocument();
    });

    it('should render ChevronDownIcon', () => {
      render(<NavigationMenuTrigger>Menu</NavigationMenuTrigger>);

      const icon = screen.getByTestId('chevron-down-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should apply trigger style classes', () => {
      render(
        <NavigationMenuTrigger className="custom-trigger-class">
          Menu
        </NavigationMenuTrigger>,
      );

      // Should call cn with navigationMenuTriggerStyle result and additional classes
      expect(cn).toHaveBeenCalledWith(
        expect.stringContaining('group inline-flex'),
        'group',
        'custom-trigger-class',
      );
    });

    it('should be clickable', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <NavigationMenuTrigger onClick={handleClick}>
          Click me
        </NavigationMenuTrigger>,
      );

      const trigger = screen.getByTestId('navigation-menu-trigger');
      await user.click(trigger);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should pass through additional props', () => {
      render(
        <NavigationMenuTrigger disabled>
          Disabled trigger
        </NavigationMenuTrigger>,
      );

      const trigger = screen.getByTestId('navigation-menu-trigger');
      expect(trigger).toHaveAttribute('disabled');
    });
  });

  describe('NavigationMenuContent', () => {
    it('should render with default props', () => {
      render(
        <NavigationMenuContent>
          <div>Content area</div>
        </NavigationMenuContent>,
      );

      const content = screen.getByTestId('navigation-menu-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute('data-slot', 'navigation-menu-content');
      expect(screen.getByText('Content area')).toBeInTheDocument();
    });

    it('should apply complex content classes', () => {
      render(
        <NavigationMenuContent className="custom-content-class">
          <div>Content</div>
        </NavigationMenuContent>,
      );

      expect(cn).toHaveBeenCalledWith(
        expect.stringContaining('data-[motion^=from-]:animate-in'),
        expect.stringContaining(
          'group-data-[viewport=false]/navigation-menu:bg-popover',
        ),
        'custom-content-class',
      );
    });

    it('should pass through additional props', () => {
      render(
        <NavigationMenuContent data-state="open">
          <div>Content</div>
        </NavigationMenuContent>,
      );

      const content = screen.getByTestId('navigation-menu-content');
      expect(content).toHaveAttribute('data-state', 'open');
    });
  });

  describe('NavigationMenuLink', () => {
    it('should render with default props', () => {
      render(<NavigationMenuLink href="/test">Link text</NavigationMenuLink>);

      const link = screen.getByTestId('navigation-menu-link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('data-slot', 'navigation-menu-link');
      expect(link).toHaveAttribute('href', '/test');
      expect(screen.getByText('Link text')).toBeInTheDocument();
    });

    it('should apply link classes', () => {
      render(
        <NavigationMenuLink className="custom-link-class" href="/test">
          Link
        </NavigationMenuLink>,
      );

      expect(cn).toHaveBeenCalledWith(
        expect.stringContaining('data-[active=true]:focus:bg-accent'),
        'custom-link-class',
      );
    });

    it('should be clickable', async () => {
      const user = userEvent.setup();

      const handleClick = vi.fn((e) => {
        // Prevent default navigation to avoid JSDOM errors
        e.preventDefault();
      });

      render(
        <NavigationMenuLink href="/test" onClick={handleClick}>
          Click link
        </NavigationMenuLink>,
      );

      const link = screen.getByTestId('navigation-menu-link');
      await user.click(link);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should pass through additional props', () => {
      render(
        <NavigationMenuLink href="/test" target="_blank">
          External link
        </NavigationMenuLink>,
      );

      const link = screen.getByTestId('navigation-menu-link');
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  describe('NavigationMenuIndicator', () => {
    it('should render with default props', () => {
      render(<NavigationMenuIndicator />);

      const indicator = screen.getByTestId('navigation-menu-indicator');
      expect(indicator).toBeInTheDocument();

      expect(indicator).toHaveAttribute(
        'data-slot',
        'navigation-menu-indicator',
      );
    });

    it('should render indicator arrow', () => {
      render(<NavigationMenuIndicator />);

      const indicator = screen.getByTestId('navigation-menu-indicator');
      const arrow = indicator.querySelector('div');
      expect(arrow).toBeInTheDocument();
      expect(arrow).toHaveClass('bg-border');
    });

    it('should apply indicator classes', () => {
      render(<NavigationMenuIndicator className="custom-indicator-class" />);

      expect(cn).toHaveBeenCalledWith(
        expect.stringContaining('data-[state=visible]:animate-in'),
        'custom-indicator-class',
      );
    });

    it('should pass through additional props', () => {
      render(<NavigationMenuIndicator data-state="visible" />);

      const indicator = screen.getByTestId('navigation-menu-indicator');
      expect(indicator).toHaveAttribute('data-state', 'visible');
    });
  });

  describe('NavigationMenuViewport', () => {
    it('should render with default props', () => {
      render(<NavigationMenuViewport />);

      const viewport = screen.getByTestId('navigation-menu-viewport');
      expect(viewport).toBeInTheDocument();
      expect(viewport).toHaveAttribute('data-slot', 'navigation-menu-viewport');
    });

    it('should be wrapped in a positioned div', () => {
      render(<NavigationMenuViewport />);

      const viewport = screen.getByTestId('navigation-menu-viewport');
      const wrapper = viewport.parentElement;
      expect(wrapper).toBeInTheDocument();
    });

    it('should apply viewport classes', () => {
      render(<NavigationMenuViewport className="custom-viewport-class" />);

      expect(cn).toHaveBeenCalledWith(
        expect.stringContaining('origin-top-center'),
        'custom-viewport-class',
      );
    });

    it('should pass through additional props', () => {
      render(<NavigationMenuViewport data-state="open" />);

      const viewport = screen.getByTestId('navigation-menu-viewport');
      expect(viewport).toHaveAttribute('data-state', 'open');
    });
  });

  describe('navigationMenuTriggerStyle', () => {
    it('should be a function that returns trigger styles', () => {
      expect(typeof navigationMenuTriggerStyle).toBe('function');
      const result = navigationMenuTriggerStyle();
      expect(typeof result).toBe('string');
      expect(result).toContain('group inline-flex');
    });
  });

  describe('Integration Tests', () => {
    it('should render complete navigation menu structure', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>

              <NavigationMenuContent>
                <NavigationMenuLink href="/product1">
                  Product 1
                </NavigationMenuLink>

                <NavigationMenuLink href="/product2">
                  Product 2
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink href="/about">About</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>

          <NavigationMenuIndicator />
        </NavigationMenu>,
      );

      // Check all components are rendered
      expect(screen.getByTestId('navigation-menu-root')).toBeInTheDocument();
      expect(screen.getByTestId('navigation-menu-list')).toBeInTheDocument();
      expect(screen.getAllByTestId('navigation-menu-item')).toHaveLength(2);
      expect(screen.getByTestId('navigation-menu-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('navigation-menu-content')).toBeInTheDocument();
      expect(screen.getAllByTestId('navigation-menu-link')).toHaveLength(3);

      expect(
        screen.getByTestId('navigation-menu-indicator'),
      ).toBeInTheDocument();

      expect(
        screen.getByTestId('navigation-menu-viewport'),
      ).toBeInTheDocument();

      // Check content
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
    });

    it('should handle user interactions', async () => {
      const user = userEvent.setup();
      const handleTriggerClick = vi.fn();

      const handleLinkClick = vi.fn((e) => {
        // Prevent default navigation to avoid JSDOM errors
        e.preventDefault();
      });

      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger onClick={handleTriggerClick}>
                Menu
              </NavigationMenuTrigger>

              <NavigationMenuContent>
                <NavigationMenuLink href="/link" onClick={handleLinkClick}>
                  Link
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      // Click trigger
      await user.click(screen.getByTestId('navigation-menu-trigger'));
      expect(handleTriggerClick).toHaveBeenCalledTimes(1);

      // Click link
      await user.click(screen.getByTestId('navigation-menu-link'));
      expect(handleLinkClick).toHaveBeenCalledTimes(1);
    });

    it('should work without viewport', () => {
      render(
        <NavigationMenu viewport={false}>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      expect(screen.getByTestId('navigation-menu-root')).toHaveAttribute(
        'data-viewport',
        'false',
      );

      expect(
        screen.queryByTestId('navigation-menu-viewport'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      // Check that components render as expected semantic elements through mocks
      expect(screen.getByTestId('navigation-menu-root')).toBeInTheDocument();
      expect(screen.getByTestId('navigation-menu-list')).toBeInTheDocument();
      expect(screen.getByTestId('navigation-menu-item')).toBeInTheDocument();
      expect(screen.getByTestId('navigation-menu-trigger')).toBeInTheDocument();
    });

    it('should have aria-hidden on chevron icon', () => {
      render(<NavigationMenuTrigger>Menu</NavigationMenuTrigger>);

      const icon = screen.getByTestId('chevron-down-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should support keyboard navigation through props', () => {
      const handleKeyDown = vi.fn();

      render(
        <NavigationMenuTrigger onKeyDown={handleKeyDown}>
          Menu
        </NavigationMenuTrigger>,
      );

      const trigger = screen.getByTestId('navigation-menu-trigger');
      fireEvent.keyDown(trigger, { key: 'Enter' });

      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      render(<NavigationMenu>{null}</NavigationMenu>);

      const root = screen.getByTestId('navigation-menu-root');
      expect(root).toBeInTheDocument();
    });

    it('should handle undefined className', () => {
      render(
        <NavigationMenu className={undefined}>
          <div>Content</div>
        </NavigationMenu>,
      );

      expect(cn).toHaveBeenCalledWith(
        'group/navigation-menu relative flex max-w-max flex-1 items-center justify-center',
        undefined,
      );
    });

    it('should handle multiple custom classes', () => {
      render(
        <NavigationMenuTrigger className="class1 class2 class3">
          Menu
        </NavigationMenuTrigger>,
      );

      expect(cn).toHaveBeenCalledWith(
        expect.any(String),
        'group',
        'class1 class2 class3',
      );
    });

    it('should handle boolean props correctly', () => {
      render(
        <NavigationMenu viewport={false}>
          <NavigationMenuTrigger disabled={true}>Menu</NavigationMenuTrigger>
        </NavigationMenu>,
      );

      expect(screen.getByTestId('navigation-menu-root')).toHaveAttribute(
        'data-viewport',
        'false',
      );

      expect(screen.getByTestId('navigation-menu-trigger')).toHaveAttribute(
        'disabled',
      );
    });
  });

  describe('CN Utility Integration', () => {
    it('should call cn utility for all components with classes', () => {
      render(
        <NavigationMenu className="nav-class">
          <NavigationMenuList className="list-class">
            <NavigationMenuItem className="item-class">
              <NavigationMenuTrigger className="trigger-class">
                Menu
              </NavigationMenuTrigger>

              <NavigationMenuContent className="content-class">
                <NavigationMenuLink className="link-class" href="/test">
                  Link
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>

          <NavigationMenuIndicator className="indicator-class" />
        </NavigationMenu>,
      );

      // Verify cn was called for each component - check that specific calls were made
      expect(cn).toHaveBeenCalledWith(
        expect.stringContaining('group/navigation-menu'),
        'nav-class',
      );

      expect(cn).toHaveBeenCalledWith(
        expect.stringContaining('group flex'),
        'list-class',
      );

      expect(cn).toHaveBeenCalledWith('relative', 'item-class');

      expect(cn).toHaveBeenCalledWith(
        expect.stringContaining('group inline-flex'),
        'group',
        'trigger-class',
      );

      expect(cn).toHaveBeenCalledWith(
        expect.stringContaining('data-[motion^=from-]:animate-in'),
        expect.stringContaining(
          'group-data-[viewport=false]/navigation-menu:bg-popover',
        ),
        'content-class',
      );

      expect(cn).toHaveBeenCalledWith(
        expect.stringContaining('data-[active=true]:focus:bg-accent'),
        'link-class',
      );

      expect(cn).toHaveBeenCalledWith(
        expect.stringContaining('data-[state=visible]:animate-in'),
        'indicator-class',
      );
    });
  });
});
