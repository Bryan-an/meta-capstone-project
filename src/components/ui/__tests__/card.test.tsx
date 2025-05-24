import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from '../card';

/**
 * Test suite for the Card component family
 *
 * @remarks
 * Tests cover rendering, styling, props forwarding, composition,
 * and all card sub-components
 */
describe('Card Components', () => {
  describe('Card', () => {
    it('should render with default props', () => {
      render(<Card>Card content</Card>);

      const card = screen.getByText('Card content');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('data-slot', 'card');
    });

    it('should render as div element', () => {
      render(<Card>Card content</Card>);

      const card = screen.getByText('Card content');
      expect(card.tagName).toBe('DIV');
    });

    it('should apply default classes', () => {
      render(<Card>Card content</Card>);

      const card = screen.getByText('Card content');
      expect(card).toHaveClass('bg-card');
      expect(card).toHaveClass('text-card-foreground');
      expect(card).toHaveClass('flex');
      expect(card).toHaveClass('flex-col');
      expect(card).toHaveClass('gap-6');
      expect(card).toHaveClass('rounded-xl');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('py-6');
      expect(card).toHaveClass('shadow-sm');
    });

    it('should merge custom className with defaults', () => {
      render(<Card className="custom-class">Card content</Card>);

      const card = screen.getByText('Card content');
      expect(card).toHaveClass('bg-card');
      expect(card).toHaveClass('custom-class');
    });

    it('should forward all other props', () => {
      render(
        <Card id="test-card" role="region">
          Card content
        </Card>,
      );

      const card = screen.getByText('Card content');
      expect(card).toHaveAttribute('id', 'test-card');
      expect(card).toHaveAttribute('role', 'region');
    });

    it('should handle onClick events', () => {
      const handleClick = vi.fn();
      render(<Card onClick={handleClick}>Clickable card</Card>);

      const card = screen.getByText('Clickable card');
      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('CardHeader', () => {
    it('should render with default props', () => {
      render(<CardHeader>Header content</CardHeader>);

      const header = screen.getByText('Header content');
      expect(header).toBeInTheDocument();
      expect(header).toHaveAttribute('data-slot', 'card-header');
    });

    it('should apply default classes', () => {
      render(<CardHeader>Header content</CardHeader>);

      const header = screen.getByText('Header content');
      expect(header).toHaveClass('@container/card-header');
      expect(header).toHaveClass('grid');
      expect(header).toHaveClass('auto-rows-min');
      expect(header).toHaveClass('grid-rows-[auto_auto]');
      expect(header).toHaveClass('items-start');
      expect(header).toHaveClass('gap-1.5');
      expect(header).toHaveClass('px-6');
    });

    it('should merge custom className', () => {
      render(<CardHeader className="custom-header">Header content</CardHeader>);

      const header = screen.getByText('Header content');
      expect(header).toHaveClass('grid');
      expect(header).toHaveClass('custom-header');
    });

    it('should forward props', () => {
      render(<CardHeader id="header">Header content</CardHeader>);

      const header = screen.getByText('Header content');
      expect(header).toHaveAttribute('id', 'header');
    });
  });

  describe('CardTitle', () => {
    it('should render with default props', () => {
      render(<CardTitle>Title text</CardTitle>);

      const title = screen.getByText('Title text');
      expect(title).toBeInTheDocument();
      expect(title).toHaveAttribute('data-slot', 'card-title');
    });

    it('should apply default classes', () => {
      render(<CardTitle>Title text</CardTitle>);

      const title = screen.getByText('Title text');
      expect(title).toHaveClass('leading-none');
      expect(title).toHaveClass('font-semibold');
    });

    it('should merge custom className', () => {
      render(<CardTitle className="text-xl">Title text</CardTitle>);

      const title = screen.getByText('Title text');
      expect(title).toHaveClass('font-semibold');
      expect(title).toHaveClass('text-xl');
    });

    it('should forward props', () => {
      render(<CardTitle id="title">Title text</CardTitle>);

      const title = screen.getByText('Title text');
      expect(title).toHaveAttribute('id', 'title');
    });
  });

  describe('CardDescription', () => {
    it('should render with default props', () => {
      render(<CardDescription>Description text</CardDescription>);

      const description = screen.getByText('Description text');
      expect(description).toBeInTheDocument();
      expect(description).toHaveAttribute('data-slot', 'card-description');
    });

    it('should apply default classes', () => {
      render(<CardDescription>Description text</CardDescription>);

      const description = screen.getByText('Description text');
      expect(description).toHaveClass('text-muted-foreground');
      expect(description).toHaveClass('text-sm');
    });

    it('should merge custom className', () => {
      render(
        <CardDescription className="italic">Description text</CardDescription>,
      );

      const description = screen.getByText('Description text');
      expect(description).toHaveClass('text-muted-foreground');
      expect(description).toHaveClass('italic');
    });

    it('should forward props', () => {
      render(<CardDescription id="desc">Description text</CardDescription>);

      const description = screen.getByText('Description text');
      expect(description).toHaveAttribute('id', 'desc');
    });
  });

  describe('CardAction', () => {
    it('should render with default props', () => {
      render(<CardAction>Action content</CardAction>);

      const action = screen.getByText('Action content');
      expect(action).toBeInTheDocument();
      expect(action).toHaveAttribute('data-slot', 'card-action');
    });

    it('should apply default classes', () => {
      render(<CardAction>Action content</CardAction>);

      const action = screen.getByText('Action content');
      expect(action).toHaveClass('col-start-2');
      expect(action).toHaveClass('row-span-2');
      expect(action).toHaveClass('row-start-1');
      expect(action).toHaveClass('self-start');
      expect(action).toHaveClass('justify-self-end');
    });

    it('should merge custom className', () => {
      render(<CardAction className="p-2">Action content</CardAction>);

      const action = screen.getByText('Action content');
      expect(action).toHaveClass('col-start-2');
      expect(action).toHaveClass('p-2');
    });

    it('should forward props', () => {
      render(<CardAction id="action">Action content</CardAction>);

      const action = screen.getByText('Action content');
      expect(action).toHaveAttribute('id', 'action');
    });
  });

  describe('CardContent', () => {
    it('should render with default props', () => {
      render(<CardContent>Content text</CardContent>);

      const content = screen.getByText('Content text');
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute('data-slot', 'card-content');
    });

    it('should apply default classes', () => {
      render(<CardContent>Content text</CardContent>);

      const content = screen.getByText('Content text');
      expect(content).toHaveClass('px-6');
    });

    it('should merge custom className', () => {
      render(<CardContent className="py-4">Content text</CardContent>);

      const content = screen.getByText('Content text');
      expect(content).toHaveClass('px-6');
      expect(content).toHaveClass('py-4');
    });

    it('should forward props', () => {
      render(<CardContent id="content">Content text</CardContent>);

      const content = screen.getByText('Content text');
      expect(content).toHaveAttribute('id', 'content');
    });
  });

  describe('CardFooter', () => {
    it('should render with default props', () => {
      render(<CardFooter>Footer content</CardFooter>);

      const footer = screen.getByText('Footer content');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveAttribute('data-slot', 'card-footer');
    });

    it('should apply default classes', () => {
      render(<CardFooter>Footer content</CardFooter>);

      const footer = screen.getByText('Footer content');
      expect(footer).toHaveClass('flex');
      expect(footer).toHaveClass('items-center');
      expect(footer).toHaveClass('px-6');
      expect(footer).toHaveClass('[.border-t]:pt-6');
    });

    it('should merge custom className', () => {
      render(<CardFooter className="justify-end">Footer content</CardFooter>);

      const footer = screen.getByText('Footer content');
      expect(footer).toHaveClass('flex');
      expect(footer).toHaveClass('justify-end');
    });

    it('should forward props', () => {
      render(<CardFooter id="footer">Footer content</CardFooter>);

      const footer = screen.getByText('Footer content');
      expect(footer).toHaveAttribute('id', 'footer');
    });
  });

  describe('Component Composition', () => {
    it('should render complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>

            <CardAction>
              <button>Action</button>
            </CardAction>
          </CardHeader>

          <CardContent>
            <p>Main content goes here</p>
          </CardContent>

          <CardFooter>
            <button>Footer Button</button>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Description')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('Main content goes here')).toBeInTheDocument();
      expect(screen.getByText('Footer Button')).toBeInTheDocument();
    });

    it('should maintain proper nesting structure', () => {
      render(
        <Card data-testid="card">
          <CardHeader data-testid="header">
            <CardTitle data-testid="title">Title</CardTitle>
          </CardHeader>

          <CardContent data-testid="content">Content</CardContent>
        </Card>,
      );

      const card = screen.getByTestId('card');
      const header = screen.getByTestId('header');
      const title = screen.getByTestId('title');
      const content = screen.getByTestId('content');

      expect(card).toContainElement(header);
      expect(card).toContainElement(content);
      expect(header).toContainElement(title);
    });

    it('should work with minimal composition', () => {
      render(
        <Card>
          <CardContent>Simple card</CardContent>
        </Card>,
      );

      expect(screen.getByText('Simple card')).toBeInTheDocument();
    });

    it('should handle complex nested content', () => {
      render(
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Complex Title</CardTitle>

              <CardDescription>
                Description with <span>nested elements</span>
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <div>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
            </div>
          </CardContent>
        </Card>,
      );

      expect(screen.getByText('Complex Title')).toBeInTheDocument();
      expect(screen.getByText('nested elements')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should support ARIA attributes', () => {
      render(
        <Card role="article" aria-label="Product card">
          <CardHeader>
            <CardTitle role="heading" aria-level={2}>
              Product Name
            </CardTitle>

            <CardDescription>Product description</CardDescription>
          </CardHeader>
        </Card>,
      );

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-label', 'Product card');

      const title = screen.getByRole('heading');
      expect(title).toHaveAttribute('aria-level', '2');
    });

    it('should support semantic HTML when appropriate', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Article Title</CardTitle>
          </CardHeader>

          <CardContent>
            <p>Article content with proper semantics</p>
          </CardContent>
        </Card>,
      );

      const paragraph = screen.getByText(
        'Article content with proper semantics',
      );

      expect(paragraph.tagName).toBe('P');
    });

    it('should work with screen readers', () => {
      render(
        <Card aria-labelledby="card-title">
          <CardHeader>
            <CardTitle id="card-title">Screen Reader Friendly</CardTitle>
            <CardDescription>This card is accessible</CardDescription>
          </CardHeader>
        </Card>,
      );

      const card = screen
        .getByText('Screen Reader Friendly')
        .closest('[data-slot="card"]');

      expect(card).toHaveAttribute('aria-labelledby', 'card-title');
    });
  });

  describe('Styling Integration', () => {
    it('should work with Tailwind utility classes', () => {
      render(
        <Card className="bg-red-500 p-8">
          <CardContent className="text-white">Styled content</CardContent>
        </Card>,
      );

      const card = screen
        .getByText('Styled content')
        .closest('[data-slot="card"]');

      expect(card).toHaveClass('bg-red-500', 'p-8');

      const content = screen.getByText('Styled content');
      expect(content).toHaveClass('text-white');
    });

    it('should handle responsive classes', () => {
      render(
        <Card className="w-full md:w-1/2 lg:w-1/3">
          <CardContent>Responsive card</CardContent>
        </Card>,
      );

      const card = screen
        .getByText('Responsive card')
        .closest('[data-slot="card"]');

      expect(card).toHaveClass('w-full', 'md:w-1/2', 'lg:w-1/3');
    });

    it('should handle CSS custom properties', () => {
      render(
        <Card style={{ '--custom-prop': '10px' } as React.CSSProperties}>
          <CardContent>Custom styled</CardContent>
        </Card>,
      );

      const card = screen
        .getByText('Custom styled')
        .closest('[data-slot="card"]');

      expect(card).toHaveStyle('--custom-prop: 10px');
    });
  });

  describe('Data Attributes', () => {
    it('should have correct data-slot attributes for all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
            <CardAction>Action</CardAction>
          </CardHeader>

          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>,
      );

      expect(
        screen.getByText('Title').closest('[data-slot="card"]'),
      ).toBeInTheDocument();

      expect(
        screen.getByText('Title').closest('[data-slot="card-header"]'),
      ).toBeInTheDocument();

      expect(screen.getByText('Title')).toHaveAttribute(
        'data-slot',
        'card-title',
      );

      expect(screen.getByText('Description')).toHaveAttribute(
        'data-slot',
        'card-description',
      );

      expect(screen.getByText('Action')).toHaveAttribute(
        'data-slot',
        'card-action',
      );

      expect(screen.getByText('Content')).toHaveAttribute(
        'data-slot',
        'card-content',
      );

      expect(screen.getByText('Footer')).toHaveAttribute(
        'data-slot',
        'card-footer',
      );
    });

    it('should allow custom data attributes', () => {
      render(
        <Card data-card-type="product" data-testid="product-card">
          <CardContent>Product info</CardContent>
        </Card>,
      );

      const card = screen.getByTestId('product-card');
      expect(card).toHaveAttribute('data-card-type', 'product');
    });
  });
});

/**
 * Integration tests for practical Card usage scenarios
 */
describe('Card Integration Examples', () => {
  it('should work as a product card', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>iPhone 15 Pro</CardTitle>
          <CardDescription>The latest iPhone with pro features</CardDescription>

          <CardAction>
            <button>♥</button>
          </CardAction>
        </CardHeader>

        <CardContent>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/product.jpg" alt="iPhone 15 Pro" />
          <p>Starting at $999</p>
        </CardContent>

        <CardFooter>
          <button>Add to Cart</button>
          <button>Learn More</button>
        </CardFooter>
      </Card>,
    );

    expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument();

    expect(
      screen.getByText('The latest iPhone with pro features'),
    ).toBeInTheDocument();

    expect(screen.getByText('Starting at $999')).toBeInTheDocument();
    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
  });

  it('should work as a user profile card', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>John Doe</CardTitle>
          <CardDescription>Software Engineer</CardDescription>
        </CardHeader>

        <CardContent>
          <div>
            <p>Email: john@example.com</p>
            <p>Location: San Francisco, CA</p>
          </div>
        </CardContent>

        <CardFooter>
          <button>Contact</button>
          <button>View Profile</button>
        </CardFooter>
      </Card>,
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();
  });

  it('should work as a notification card', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>New Message</CardTitle>

          <CardAction>
            <button>×</button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <p>You have a new message from Sarah</p>
        </CardContent>
      </Card>,
    );

    expect(screen.getByText('New Message')).toBeInTheDocument();

    expect(
      screen.getByText('You have a new message from Sarah'),
    ).toBeInTheDocument();

    expect(screen.getByText('×')).toBeInTheDocument();
  });

  it('should work with form elements', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Contact Form</CardTitle>
          <CardDescription>Send us a message</CardDescription>
        </CardHeader>

        <CardContent>
          <form>
            <input type="text" placeholder="Your name" />
            <textarea placeholder="Your message"></textarea>
          </form>
        </CardContent>

        <CardFooter>
          <button type="submit">Send Message</button>
          <button type="button">Cancel</button>
        </CardFooter>
      </Card>,
    );

    expect(screen.getByText('Contact Form')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your message')).toBeInTheDocument();
  });
});
