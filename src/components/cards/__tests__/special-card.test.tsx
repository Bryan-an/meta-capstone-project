import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpecialCard } from '../special-card';

vi.mock('next/image', () => ({
  default: vi.fn(({ src, alt, fill, className, sizes, loading, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      data-fill={fill}
      className={className}
      data-sizes={sizes}
      data-loading={loading}
      {...props}
    />
  )),
}));

vi.mock('@/components/ui/button', () => ({
  Button: vi.fn(({ children, variant, asChild, className, ...props }) => (
    <button
      data-variant={variant}
      data-as-child={asChild}
      className={className}
      {...props}
    >
      {children}
    </button>
  )),
}));

vi.mock('@/components/ui/card', () => ({
  Card: vi.fn(({ children, className, ...props }) => (
    <div data-testid="card" className={className} {...props}>
      {children}
    </div>
  )),
  CardContent: vi.fn(({ children, className, ...props }) => (
    <div data-testid="card-content" className={className} {...props}>
      {children}
    </div>
  )),
  CardDescription: vi.fn(({ children, className, ...props }) => (
    <div data-testid="card-description" className={className} {...props}>
      {children}
    </div>
  )),
  CardFooter: vi.fn(({ children, className, ...props }) => (
    <div data-testid="card-footer" className={className} {...props}>
      {children}
    </div>
  )),
  CardHeader: vi.fn(({ children, className, ...props }) => (
    <div data-testid="card-header" className={className} {...props}>
      {children}
    </div>
  )),
  CardTitle: vi.fn(({ children, className, ...props }) => (
    <h3 data-testid="card-title" className={className} {...props}>
      {children}
    </h3>
  )),
}));

vi.mock('@/i18n/routing', () => ({
  Link: vi.fn(({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )),
}));

describe('SpecialCard', () => {
  const defaultProps = {
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with lemon herb butter',
    price: 24.99,
    imageUrl: '/images/salmon.jpg',
    orderLinkText: 'Order Online',
  };

  it('renders all content correctly with valid props', () => {
    render(<SpecialCard {...defaultProps} />);

    // Check if image is rendered with correct props
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/images/salmon.jpg');
    expect(image).toHaveAttribute('alt', 'Grilled Salmon');
    expect(image).toHaveAttribute('data-fill', 'true');

    // Check if name is displayed
    expect(screen.getByTestId('card-title')).toHaveTextContent(
      'Grilled Salmon',
    );

    // Check if description is displayed
    expect(screen.getByTestId('card-description')).toHaveTextContent(
      'Fresh Atlantic salmon with lemon herb butter',
    );

    // Check if price is formatted correctly
    expect(screen.getByText('$24.99')).toBeInTheDocument();

    // Check if order link is present
    const orderLink = screen.getByRole('link');
    expect(orderLink).toHaveAttribute('href', '/order-online');
    expect(orderLink).toHaveTextContent('Order Online');
  });

  it('renders with null imageUrl and uses fallback', () => {
    render(<SpecialCard {...defaultProps} imageUrl={null} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/images/placeholder-food.webp');
    expect(image).toHaveAttribute('alt', 'Grilled Salmon');
  });

  it('renders with null description', () => {
    render(<SpecialCard {...defaultProps} description={null} />);

    const description = screen.getByTestId('card-description');
    expect(description).toBeEmptyDOMElement();
  });

  it('handles zero price correctly', () => {
    render(<SpecialCard {...defaultProps} price={0} />);

    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('handles decimal prices correctly', () => {
    render(<SpecialCard {...defaultProps} price={15.5} />);

    expect(screen.getByText('$15.50')).toBeInTheDocument();
  });

  it('handles high prices correctly', () => {
    render(<SpecialCard {...defaultProps} price={299.99} />);

    expect(screen.getByText('$299.99')).toBeInTheDocument();
  });

  it('handles NaN price by showing "Price unavailable"', () => {
    render(<SpecialCard {...defaultProps} price={NaN} />);

    expect(screen.getByText('Price unavailable')).toBeInTheDocument();
  });

  it('displays "Price unavailable" for non-number price', () => {
    // We need to test with a non-number value to trigger the "Price unavailable" case
    // TypeScript will prevent this normally, so we use type assertion for testing
    const propsWithInvalidPrice = {
      ...defaultProps,
      price: 'invalid' as unknown as number,
    };

    render(<SpecialCard {...propsWithInvalidPrice} />);

    expect(screen.getByText('Price unavailable')).toBeInTheDocument();
  });

  it('renders correct card structure', () => {
    render(<SpecialCard {...defaultProps} />);

    // Check if main card container exists
    expect(screen.getByTestId('card')).toBeInTheDocument();

    // Check if header, content, and footer are present
    expect(screen.getByTestId('card-header')).toBeInTheDocument();
    expect(screen.getByTestId('card-content')).toBeInTheDocument();
    expect(screen.getByTestId('card-footer')).toBeInTheDocument();
  });

  it('applies correct CSS classes to card', () => {
    render(<SpecialCard {...defaultProps} />);

    const card = screen.getByTestId('card');

    expect(card).toHaveClass(
      'bg-card',
      'text-card-foreground',
      'flex',
      'flex-col',
      'overflow-hidden',
      'rounded-lg',
      'py-0',
      'shadow-md',
    );
  });

  it('renders image with correct attributes and classes', () => {
    render(<SpecialCard {...defaultProps} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('data-fill', 'true');
    expect(image).toHaveClass('object-cover');

    expect(image).toHaveAttribute(
      'data-sizes',
      '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
    );

    expect(image).toHaveAttribute('data-loading', 'lazy');
  });

  it('renders button with correct variant and styling', () => {
    render(<SpecialCard {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-variant', 'link');
    expect(button).toHaveAttribute('data-as-child', 'true');

    expect(button).toHaveClass(
      'text-primary',
      'hover:text-primary/90',
      'h-auto',
      'p-0',
      'text-lg',
      'font-semibold',
    );
  });

  it('handles empty name gracefully', () => {
    render(<SpecialCard {...defaultProps} name="" />);

    expect(screen.getByTestId('card-title')).toBeEmptyDOMElement();

    // When name is empty, alt becomes empty string which makes image presentation role
    const image = screen.getByRole('presentation');
    expect(image).toHaveAttribute('alt', '');
  });

  it('handles empty orderLinkText', () => {
    render(<SpecialCard {...defaultProps} orderLinkText="" />);

    const orderLink = screen.getByRole('link');
    expect(orderLink).toBeEmptyDOMElement();
  });

  it('handles long text content appropriately', () => {
    const longProps = {
      ...defaultProps,
      name: 'This is a very long menu item name that might wrap to multiple lines',
      description:
        'This is an extremely long description that describes the menu item in great detail, including all the ingredients, cooking methods, and presentation style that makes this dish special.',
      orderLinkText: 'Order This Amazing Dish Online Now',
    };

    render(<SpecialCard {...longProps} />);

    expect(screen.getByTestId('card-title')).toHaveTextContent(longProps.name);

    expect(screen.getByTestId('card-description')).toHaveTextContent(
      longProps.description,
    );

    expect(screen.getByRole('link')).toHaveTextContent(longProps.orderLinkText);
  });

  it('has correct accessibility attributes', () => {
    render(<SpecialCard {...defaultProps} />);

    // Image should have proper alt text
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt', 'Grilled Salmon');

    // Link should be accessible
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/order-online');
  });

  it('handles null name and imageUrl together', () => {
    const props = {
      ...defaultProps,
      name: '',
      imageUrl: null,
    };

    render(<SpecialCard {...props} />);

    // When name is empty, alt becomes empty string which makes image presentation role
    const image = screen.getByRole('presentation');
    expect(image).toHaveAttribute('src', '/images/placeholder-food.webp');
    expect(image).toHaveAttribute('alt', '');
  });

  it('renders with minimum required props', () => {
    const minimalProps = {
      name: 'Basic Dish',
      description: null,
      price: 10,
      imageUrl: null,
      orderLinkText: 'Order',
    };

    render(<SpecialCard {...minimalProps} />);

    expect(screen.getByTestId('card-title')).toHaveTextContent('Basic Dish');
    expect(screen.getByText('$10.00')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveTextContent('Order');

    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      '/images/placeholder-food.webp',
    );
  });

  it('maintains proper component structure hierarchy', () => {
    render(<SpecialCard {...defaultProps} />);

    // Check proper nesting: Card > [Image, Header, Content, Footer]
    const card = screen.getByTestId('card');
    const header = screen.getByTestId('card-header');
    const content = screen.getByTestId('card-content');
    const footer = screen.getByTestId('card-footer');

    expect(card).toContainElement(header);
    expect(card).toContainElement(content);
    expect(card).toContainElement(footer);

    // Check that title is in header
    expect(header).toContainElement(screen.getByTestId('card-title'));

    // Check that description is in content
    expect(content).toContainElement(screen.getByTestId('card-description'));

    // Check that link button is in footer
    expect(footer).toContainElement(screen.getByRole('button'));
  });
});
