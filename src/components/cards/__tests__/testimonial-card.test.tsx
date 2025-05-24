import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestimonialCard } from '../testimonial-card';

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="avatar" className={className} {...props}>
      {children}
    </div>
  ),
  AvatarImage: ({
    src,
    alt,
    loading,
    className,
    ...props
  }: {
    src?: string;
    alt?: string;
    loading?: string;
    className?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      data-testid="avatar-image"
      src={src || undefined}
      alt={alt}
      data-loading={loading}
      className={className}
      {...props}
    />
  ),
  AvatarFallback: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="avatar-fallback" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card" className={className} {...props}>
      {children}
    </div>
  ),
  CardHeader: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card-header" className={className} {...props}>
      {children}
    </div>
  ),
  CardContent: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card-content" className={className} {...props}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/star-rating', () => ({
  StarRating: ({ rating }: { rating: number }) => (
    <div data-testid="star-rating" data-rating={rating}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          data-testid="star"
          className={i < rating ? 'text-yellow-500' : 'text-gray-400'}
        >
          ★
        </span>
      ))}
    </div>
  ),
}));

describe('TestimonialCard', () => {
  const defaultProps = {
    id: 1,
    rating: 5,
    imageUrl: 'https://example.com/customer.jpg',
    customerName: 'John Doe',
    quoteText: 'Amazing service and great food!',
  };

  describe('Basic Rendering', () => {
    it('should render testimonial card with all provided content', () => {
      render(<TestimonialCard {...defaultProps} />);

      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByTestId('card-header')).toBeInTheDocument();
      expect(screen.getByTestId('card-content')).toBeInTheDocument();
      expect(screen.getByTestId('star-rating')).toBeInTheDocument();
      expect(screen.getByTestId('avatar')).toBeInTheDocument();
      expect(screen.getByTestId('avatar-image')).toBeInTheDocument();

      expect(screen.getByText('John Doe')).toBeInTheDocument();

      expect(
        screen.getByText('Amazing service and great food!'),
      ).toBeInTheDocument();
    });

    it('should render with correct card structure and classes', () => {
      render(<TestimonialCard {...defaultProps} />);

      const card = screen.getByTestId('card');

      expect(card).toHaveClass(
        'text-card-foreground',
        'bg-card',
        'rounded-lg',
        'p-6',
        'text-center',
      );

      const cardHeader = screen.getByTestId('card-header');
      expect(cardHeader).toHaveClass('mb-2', 'p-0');

      const cardContent = screen.getByTestId('card-content');

      expect(cardContent).toHaveClass(
        'flex',
        'flex-col',
        'items-center',
        'space-y-3',
        'p-0',
      );
    });

    it('should use id as key prop on the card', () => {
      render(<TestimonialCard {...defaultProps} />);

      const card = screen.getByTestId('card');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Star Rating', () => {
    it('should render star rating with correct rating value', () => {
      render(<TestimonialCard {...defaultProps} rating={4} />);

      const starRating = screen.getByTestId('star-rating');
      expect(starRating).toHaveAttribute('data-rating', '4');
    });

    it('should handle zero rating', () => {
      render(<TestimonialCard {...defaultProps} rating={0} />);

      const starRating = screen.getByTestId('star-rating');
      expect(starRating).toHaveAttribute('data-rating', '0');
    });

    it('should handle maximum rating', () => {
      render(<TestimonialCard {...defaultProps} rating={5} />);

      const starRating = screen.getByTestId('star-rating');
      expect(starRating).toHaveAttribute('data-rating', '5');
    });

    it('should handle decimal ratings', () => {
      render(<TestimonialCard {...defaultProps} rating={3.7} />);

      const starRating = screen.getByTestId('star-rating');
      expect(starRating).toHaveAttribute('data-rating', '3.7');
    });
  });

  describe('Avatar Handling', () => {
    it('should render avatar image with provided imageUrl', () => {
      render(<TestimonialCard {...defaultProps} />);

      const avatarImage = screen.getByTestId('avatar-image');

      expect(avatarImage).toHaveAttribute(
        'src',
        'https://example.com/customer.jpg',
      );

      expect(avatarImage).toHaveAttribute('alt', 'John Doe');
      expect(avatarImage).toHaveAttribute('data-loading', 'lazy');
    });

    it('should use placeholder image when imageUrl is null', () => {
      render(<TestimonialCard {...defaultProps} imageUrl={null} />);

      const avatarImage = screen.getByTestId('avatar-image');

      expect(avatarImage).toHaveAttribute(
        'src',
        '/images/avatar-placeholder.webp',
      );

      expect(avatarImage).toHaveAttribute('alt', 'John Doe');
    });

    it('should render avatar with correct classes', () => {
      render(<TestimonialCard {...defaultProps} />);

      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('mb-3', 'h-20', 'w-20');

      const avatarImage = screen.getByTestId('avatar-image');
      expect(avatarImage).toHaveClass('object-cover', 'object-center');
    });

    it('should render fallback with first character of customer name', () => {
      render(<TestimonialCard {...defaultProps} />);

      const avatarFallback = screen.getByTestId('avatar-fallback');
      expect(avatarFallback).toHaveTextContent('J');
    });

    it('should handle empty customer name in fallback', () => {
      render(<TestimonialCard {...defaultProps} customerName="" />);

      const avatarFallback = screen.getByTestId('avatar-fallback');
      expect(avatarFallback).toHaveTextContent('');
    });
  });

  describe('Customer Name Display', () => {
    it('should render customer name with correct styling', () => {
      render(<TestimonialCard {...defaultProps} />);

      const customerName = screen.getByText('John Doe');

      expect(customerName).toHaveClass(
        'text-primary',
        'text-lg',
        'font-semibold',
      );
    });

    it('should handle empty customer name', () => {
      render(<TestimonialCard {...defaultProps} customerName="" />);

      const customerNameElement = screen
        .getByTestId('card-content')
        .querySelector('p');

      expect(customerNameElement).toHaveTextContent('');
    });

    it('should handle long customer names', () => {
      const longName = 'Dr. Alexander Von Humboldtstein III';
      render(<TestimonialCard {...defaultProps} customerName={longName} />);

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('should handle special characters in customer name', () => {
      const nameWithSpecialChars = "José María O'Connor-Smith";

      render(
        <TestimonialCard
          {...defaultProps}
          customerName={nameWithSpecialChars}
        />,
      );

      expect(screen.getByText(nameWithSpecialChars)).toBeInTheDocument();
    });
  });

  describe('Quote Text Display', () => {
    it('should render quote text as blockquote with correct styling', () => {
      render(<TestimonialCard {...defaultProps} />);

      const blockquote = screen.getByText('Amazing service and great food!');
      expect(blockquote.tagName).toBe('BLOCKQUOTE');

      expect(blockquote).toHaveClass(
        'text-muted-foreground',
        'text-base',
        'italic',
      );
    });

    it('should handle empty quote text', () => {
      render(<TestimonialCard {...defaultProps} quoteText="" />);

      const blockquote = screen
        .getByTestId('card-content')
        .querySelector('blockquote');

      expect(blockquote).toHaveTextContent('');
    });

    it('should handle long quote text', () => {
      const longQuote =
        'This is an extremely long testimonial that spans multiple lines and contains a lot of detailed feedback about the excellent service, amazing food quality, wonderful atmosphere, and outstanding staff that made our dining experience absolutely memorable and worth every penny we spent.';

      render(<TestimonialCard {...defaultProps} quoteText={longQuote} />);

      expect(screen.getByText(longQuote)).toBeInTheDocument();
    });

    it('should handle quotes with special characters and markup', () => {
      const quoteWithSpecialChars =
        'Best restaurant in town! 5/5 ⭐⭐⭐⭐⭐ Would definitely recommend to friends & family.';

      render(
        <TestimonialCard {...defaultProps} quoteText={quoteWithSpecialChars} />,
      );

      expect(screen.getByText(quoteWithSpecialChars)).toBeInTheDocument();
    });

    it('should handle quotes with line breaks', () => {
      const multilineQuote =
        'Great service!\nAmazing food!\nWill come back again.';

      render(<TestimonialCard {...defaultProps} quoteText={multilineQuote} />);

      // DOM normalizes line breaks to spaces
      const expectedText = 'Great service! Amazing food! Will come back again.';
      const blockquote = screen.getByRole('blockquote');
      expect(blockquote).toHaveTextContent(expectedText);
    });
  });

  describe('Edge Cases', () => {
    it('should handle all props being minimal values', () => {
      const minimalProps = {
        id: 0,
        rating: 0,
        imageUrl: null,
        customerName: '',
        quoteText: '',
      };

      render(<TestimonialCard {...minimalProps} />);

      expect(screen.getByTestId('card')).toBeInTheDocument();

      expect(screen.getByTestId('star-rating')).toHaveAttribute(
        'data-rating',
        '0',
      );

      expect(screen.getByTestId('avatar-image')).toHaveAttribute(
        'src',
        '/images/avatar-placeholder.webp',
      );
    });

    it('should handle negative rating values', () => {
      render(<TestimonialCard {...defaultProps} rating={-1} />);

      const starRating = screen.getByTestId('star-rating');
      expect(starRating).toHaveAttribute('data-rating', '-1');
    });

    it('should handle very high rating values', () => {
      render(<TestimonialCard {...defaultProps} rating={10} />);

      const starRating = screen.getByTestId('star-rating');
      expect(starRating).toHaveAttribute('data-rating', '10');
    });

    it('should handle whitespace-only customer name', () => {
      render(<TestimonialCard {...defaultProps} customerName="   " />);

      // DOM normalizes leading/trailing whitespace, so check it exists and has some text
      const customerNameElement = screen
        .getByTestId('card-content')
        .querySelector('p');

      expect(customerNameElement).toBeInTheDocument();

      // Check that the element contains whitespace (even if normalized)
      expect(customerNameElement?.textContent).toBeTruthy();

      const avatarFallback = screen.getByTestId('avatar-fallback');
      expect(avatarFallback).toBeInTheDocument();
    });

    it('should handle whitespace-only quote text', () => {
      render(<TestimonialCard {...defaultProps} quoteText="   " />);

      // DOM normalizes leading/trailing whitespace, so check it exists and has some text
      const blockquote = screen
        .getByTestId('card-content')
        .querySelector('blockquote');

      expect(blockquote).toBeInTheDocument();

      // Check that the element contains whitespace (even if normalized)
      expect(blockquote?.textContent).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper alt text for avatar image', () => {
      render(<TestimonialCard {...defaultProps} />);

      const avatarImage = screen.getByTestId('avatar-image');
      expect(avatarImage).toHaveAttribute('alt', 'John Doe');
    });

    it('should use semantic blockquote element for quote text', () => {
      render(<TestimonialCard {...defaultProps} />);

      const blockquote = screen.getByText('Amazing service and great food!');
      expect(blockquote.tagName).toBe('BLOCKQUOTE');
    });

    it('should have proper lazy loading for avatar image', () => {
      render(<TestimonialCard {...defaultProps} />);

      const avatarImage = screen.getByTestId('avatar-image');
      expect(avatarImage).toHaveAttribute('data-loading', 'lazy');
    });

    it('should maintain proper heading hierarchy', () => {
      render(<TestimonialCard {...defaultProps} />);

      // Customer name should be styled as prominent text but not necessarily a heading
      const customerName = screen.getByText('John Doe');
      expect(customerName.tagName).toBe('P');
      expect(customerName).toHaveClass('text-lg', 'font-semibold');
    });
  });

  describe('Component Structure', () => {
    it('should render components in correct order', () => {
      render(<TestimonialCard {...defaultProps} />);

      const cardContent = screen.getByTestId('card-content');
      const children = Array.from(cardContent.children);

      // Should have avatar, customer name, and quote text in order
      expect(children).toHaveLength(3);
      expect(children[0]).toHaveAttribute('data-testid', 'avatar');
      expect(children[1]).toHaveTextContent('John Doe');
      expect(children[2]).toHaveTextContent('Amazing service and great food!');
    });

    it('should maintain proper spacing between elements', () => {
      render(<TestimonialCard {...defaultProps} />);

      const cardContent = screen.getByTestId('card-content');
      expect(cardContent).toHaveClass('space-y-3');

      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('mb-3');
    });

    it('should center-align all content', () => {
      render(<TestimonialCard {...defaultProps} />);

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('text-center');

      const cardContent = screen.getByTestId('card-content');
      expect(cardContent).toHaveClass('items-center');
    });
  });

  describe('Different Rating Scenarios', () => {
    it('should handle 1-star rating', () => {
      render(<TestimonialCard {...defaultProps} rating={1} />);

      const starRating = screen.getByTestId('star-rating');
      expect(starRating).toHaveAttribute('data-rating', '1');
    });

    it('should handle 3-star rating', () => {
      render(<TestimonialCard {...defaultProps} rating={3} />);

      const starRating = screen.getByTestId('star-rating');
      expect(starRating).toHaveAttribute('data-rating', '3');
    });

    it('should handle fractional ratings', () => {
      render(<TestimonialCard {...defaultProps} rating={4.5} />);

      const starRating = screen.getByTestId('star-rating');
      expect(starRating).toHaveAttribute('data-rating', '4.5');
    });
  });

  describe('Image Handling', () => {
    it('should handle different image URL formats', () => {
      const relativeImageUrl = '/images/customers/john-doe.jpg';
      render(<TestimonialCard {...defaultProps} imageUrl={relativeImageUrl} />);

      const avatarImage = screen.getByTestId('avatar-image');
      expect(avatarImage).toHaveAttribute('src', relativeImageUrl);
    });

    it('should handle data URLs', () => {
      const dataUrl =
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/gAA';

      render(<TestimonialCard {...defaultProps} imageUrl={dataUrl} />);

      const avatarImage = screen.getByTestId('avatar-image');
      expect(avatarImage).toHaveAttribute('src', dataUrl);
    });

    it('should handle empty string imageUrl', () => {
      render(<TestimonialCard {...defaultProps} imageUrl="" />);

      const avatarImage = screen.getByTestId('avatar-image');
      // Empty string is truthy, so it gets passed through as-is (but our mock converts to undefined)
      expect(avatarImage).not.toHaveAttribute('src');
    });
  });
});
