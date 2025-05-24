import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Avatar, AvatarImage, AvatarFallback } from '../avatar';

vi.mock('@/lib/utils/cn', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

vi.mock('@radix-ui/react-avatar', () => ({
  Root: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      data-testid="avatar-root"
      data-radix-avatar-root
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
  Image: ({
    className,
    src,
    alt,
    onLoadingStatusChange,
    ...props
  }: {
    className?: string;
    src?: string;
    alt?: string;
    onLoadingStatusChange?: (
      status: 'idle' | 'loading' | 'loaded' | 'error',
    ) => void;
  }) => {
    // Simulate image loading behavior
    React.useEffect(() => {
      if (src && onLoadingStatusChange) {
        if (src.includes('error')) {
          onLoadingStatusChange('error');
        } else {
          onLoadingStatusChange('loaded');
        }
      }
    }, [src, onLoadingStatusChange]);

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        data-testid="avatar-image"
        data-radix-avatar-image
        className={className}
        src={src}
        alt={alt}
        {...props}
      />
    );
  },
  Fallback: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      data-testid="avatar-fallback"
      data-radix-avatar-fallback
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
}));

describe('Avatar Components', () => {
  describe('Avatar (Root)', () => {
    it('should render with default classes and data-slot', () => {
      render(<Avatar>Avatar content</Avatar>);

      const avatar = screen.getByTestId('avatar-root');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('data-slot', 'avatar');
      expect(avatar).toHaveAttribute('data-radix-avatar-root');

      expect(avatar).toHaveClass(
        'relative',
        'flex',
        'size-8',
        'shrink-0',
        'overflow-hidden',
        'rounded-full',
      );

      expect(avatar).toHaveTextContent('Avatar content');
      expect(avatar.tagName).toBe('DIV');
    });

    it('should merge custom className with default classes', () => {
      render(<Avatar className="custom-avatar">Test avatar</Avatar>);

      const avatar = screen.getByTestId('avatar-root');
      expect(avatar).toHaveClass('custom-avatar');
      expect(avatar).toHaveClass('relative', 'flex', 'size-8', 'rounded-full');
    });

    it('should forward all props correctly', () => {
      const handleClick = vi.fn();

      render(
        <Avatar
          id="test-avatar"
          data-testid="custom-avatar"
          onClick={handleClick}
          role="img"
          aria-label="User avatar"
        >
          Avatar content
        </Avatar>,
      );

      const avatar = screen.getByTestId('custom-avatar');
      expect(avatar).toHaveAttribute('id', 'test-avatar');
      expect(avatar).toHaveAttribute('data-testid', 'custom-avatar');
      expect(avatar).toHaveAttribute('role', 'img');
      expect(avatar).toHaveAttribute('aria-label', 'User avatar');
    });

    it('should handle children correctly', () => {
      render(
        <Avatar>
          <span>Child 1</span>
          <span>Child 2</span>
        </Avatar>,
      );

      const avatar = screen.getByTestId('avatar-root');
      expect(avatar).toContainElement(screen.getByText('Child 1'));
      expect(avatar).toContainElement(screen.getByText('Child 2'));
    });

    it('should handle empty content', () => {
      render(<Avatar />);

      const avatar = screen.getByTestId('avatar-root');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toBeEmptyDOMElement();
    });

    it('should support interaction events', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const handleMouseEnter = vi.fn();

      render(
        <Avatar onClick={handleClick} onMouseEnter={handleMouseEnter}>
          Clickable avatar
        </Avatar>,
      );

      const avatar = screen.getByTestId('avatar-root');

      await user.click(avatar);
      expect(handleClick).toHaveBeenCalledOnce();

      await user.hover(avatar);
      expect(handleMouseEnter).toHaveBeenCalledOnce();
    });
  });

  describe('AvatarImage', () => {
    it('should render with default classes and data-slot', () => {
      render(<AvatarImage src="/test-image.jpg" alt="Test image" />);

      const image = screen.getByTestId('avatar-image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('data-slot', 'avatar-image');
      expect(image).toHaveAttribute('data-radix-avatar-image');
      expect(image).toHaveClass('aspect-square', 'size-full');
      expect(image).toHaveAttribute('src', '/test-image.jpg');
      expect(image).toHaveAttribute('alt', 'Test image');
      expect(image.tagName).toBe('IMG');
    });

    it('should merge custom className with default classes', () => {
      render(
        <AvatarImage
          src="/test.jpg"
          alt="Test"
          className="custom-image-class"
        />,
      );

      const image = screen.getByTestId('avatar-image');
      expect(image).toHaveClass('custom-image-class');
      expect(image).toHaveClass('aspect-square', 'size-full');
    });

    it('should forward image-specific props correctly', () => {
      const handleLoad = vi.fn();
      const handleError = vi.fn();

      render(
        <AvatarImage
          src="/test-image.jpg"
          alt="Test image"
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          crossOrigin="anonymous"
        />,
      );

      const image = screen.getByTestId('avatar-image');
      expect(image).toHaveAttribute('src', '/test-image.jpg');
      expect(image).toHaveAttribute('alt', 'Test image');
      expect(image).toHaveAttribute('loading', 'lazy');
      expect(image).toHaveAttribute('crossorigin', 'anonymous');
    });

    it('should handle missing src gracefully', () => {
      render(<AvatarImage alt="Missing image" />);

      const image = screen.getByTestId('avatar-image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('alt', 'Missing image');
      expect(image).not.toHaveAttribute('src');
    });

    it('should handle loading status changes', () => {
      const handleLoadingStatusChange = vi.fn();

      render(
        <AvatarImage
          src="/test-image.jpg"
          alt="Test"
          onLoadingStatusChange={handleLoadingStatusChange}
        />,
      );

      expect(handleLoadingStatusChange).toHaveBeenCalledWith('loaded');
    });

    it('should handle error status', () => {
      const handleLoadingStatusChange = vi.fn();

      render(
        <AvatarImage
          src="/error-image.jpg"
          alt="Error test"
          onLoadingStatusChange={handleLoadingStatusChange}
        />,
      );

      expect(handleLoadingStatusChange).toHaveBeenCalledWith('error');
    });
  });

  describe('AvatarFallback', () => {
    it('should render with default classes and data-slot', () => {
      render(<AvatarFallback>JD</AvatarFallback>);

      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toBeInTheDocument();
      expect(fallback).toHaveAttribute('data-slot', 'avatar-fallback');
      expect(fallback).toHaveAttribute('data-radix-avatar-fallback');

      expect(fallback).toHaveClass(
        'bg-muted',
        'flex',
        'size-full',
        'items-center',
        'justify-center',
        'rounded-full',
      );

      expect(fallback).toHaveTextContent('JD');
      expect(fallback.tagName).toBe('DIV');
    });

    it('should merge custom className with default classes', () => {
      render(<AvatarFallback className="custom-fallback">AB</AvatarFallback>);

      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toHaveClass('custom-fallback');
      expect(fallback).toHaveClass('bg-muted', 'flex', 'items-center');
    });

    it('should forward props correctly', () => {
      render(
        <AvatarFallback id="fallback-id" role="img" aria-label="User initials">
          UV
        </AvatarFallback>,
      );

      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toHaveAttribute('id', 'fallback-id');
      expect(fallback).toHaveAttribute('role', 'img');
      expect(fallback).toHaveAttribute('aria-label', 'User initials');
    });

    it('should handle complex children', () => {
      render(
        <AvatarFallback>
          <span className="text-lg font-bold">JD</span>
        </AvatarFallback>,
      );

      const fallback = screen.getByTestId('avatar-fallback');
      const childSpan = screen.getByText('JD');
      expect(fallback).toContainElement(childSpan);
      expect(childSpan).toHaveClass('text-lg', 'font-bold');
    });

    it('should handle icon children', () => {
      const UserIcon = () => (
        <svg data-testid="user-icon">
          <circle />
        </svg>
      );

      render(
        <AvatarFallback>
          <UserIcon />
        </AvatarFallback>,
      );

      const fallback = screen.getByTestId('avatar-fallback');
      const icon = screen.getByTestId('user-icon');
      expect(fallback).toContainElement(icon);
    });

    it('should handle empty content', () => {
      render(<AvatarFallback />);

      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toBeInTheDocument();
      expect(fallback).toBeEmptyDOMElement();
    });
  });

  describe('Complete Avatar Integration', () => {
    it('should render a complete avatar with image and fallback', () => {
      render(
        <Avatar>
          <AvatarImage src="/user.jpg" alt="John Doe" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      );

      const avatar = screen.getByTestId('avatar-root');
      const image = screen.getByTestId('avatar-image');
      const fallback = screen.getByTestId('avatar-fallback');

      expect(avatar).toBeInTheDocument();
      expect(image).toBeInTheDocument();
      expect(fallback).toBeInTheDocument();

      expect(avatar).toContainElement(image);
      expect(avatar).toContainElement(fallback);

      expect(image).toHaveAttribute('src', '/user.jpg');
      expect(image).toHaveAttribute('alt', 'John Doe');
      expect(fallback).toHaveTextContent('JD');
    });

    it('should render avatar with only image', () => {
      render(
        <Avatar>
          <AvatarImage src="/profile.jpg" alt="Profile picture" />
        </Avatar>,
      );

      const avatar = screen.getByTestId('avatar-root');
      const image = screen.getByTestId('avatar-image');

      expect(avatar).toContainElement(image);
      expect(screen.queryByTestId('avatar-fallback')).not.toBeInTheDocument();
    });

    it('should render avatar with only fallback', () => {
      render(
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>,
      );

      const avatar = screen.getByTestId('avatar-root');
      const fallback = screen.getByTestId('avatar-fallback');

      expect(avatar).toContainElement(fallback);
      expect(screen.queryByTestId('avatar-image')).not.toBeInTheDocument();
    });

    it('should handle custom styling on all components', () => {
      render(
        <Avatar className="custom-avatar-size">
          <AvatarImage
            src="/test.jpg"
            alt="Test"
            className="custom-image-filter"
          />

          <AvatarFallback className="custom-fallback-color">TU</AvatarFallback>
        </Avatar>,
      );

      const avatar = screen.getByTestId('avatar-root');
      const image = screen.getByTestId('avatar-image');
      const fallback = screen.getByTestId('avatar-fallback');

      expect(avatar).toHaveClass('custom-avatar-size');
      expect(image).toHaveClass('custom-image-filter');
      expect(fallback).toHaveClass('custom-fallback-color');
    });

    it('should maintain proper semantic structure', () => {
      render(
        <Avatar role="img" aria-label="User avatar">
          <AvatarImage src="/user.jpg" alt="User profile picture" />
          <AvatarFallback aria-label="User initials">JD</AvatarFallback>
        </Avatar>,
      );

      const avatar = screen.getByTestId('avatar-root');
      const image = screen.getByTestId('avatar-image');
      const fallback = screen.getByTestId('avatar-fallback');

      expect(avatar).toHaveAttribute('role', 'img');
      expect(avatar).toHaveAttribute('aria-label', 'User avatar');
      expect(image).toHaveAttribute('alt', 'User profile picture');
      expect(fallback).toHaveAttribute('aria-label', 'User initials');
    });

    it('should support nested complex content', () => {
      render(
        <Avatar>
          <AvatarImage src="/profile.jpg" alt="Profile" />

          <AvatarFallback>
            <div className="flex flex-col items-center">
              <span className="text-xs">JS</span>
              <span className="text-xs opacity-50">+</span>
            </div>
          </AvatarFallback>
        </Avatar>,
      );

      const avatar = screen.getByTestId('avatar-root');
      expect(avatar).toContainElement(screen.getByText('JS'));
      expect(avatar).toContainElement(screen.getByText('+'));
    });
  });

  describe('Radix UI Integration', () => {
    it('should properly wrap Radix UI primitives', () => {
      render(
        <Avatar>
          <AvatarImage src="/test.jpg" alt="Test" />
          <AvatarFallback>TU</AvatarFallback>
        </Avatar>,
      );

      // Check that Radix UI data attributes are present
      expect(screen.getByTestId('avatar-root')).toHaveAttribute(
        'data-radix-avatar-root',
      );

      expect(screen.getByTestId('avatar-image')).toHaveAttribute(
        'data-radix-avatar-image',
      );

      expect(screen.getByTestId('avatar-fallback')).toHaveAttribute(
        'data-radix-avatar-fallback',
      );

      // Check that our data-slot attributes are also present
      expect(screen.getByTestId('avatar-root')).toHaveAttribute(
        'data-slot',
        'avatar',
      );

      expect(screen.getByTestId('avatar-image')).toHaveAttribute(
        'data-slot',
        'avatar-image',
      );

      expect(screen.getByTestId('avatar-fallback')).toHaveAttribute(
        'data-slot',
        'avatar-fallback',
      );
    });

    it('should handle image loading states correctly', async () => {
      const handleLoadingStatusChange = vi.fn();

      const { rerender } = render(
        <Avatar>
          <AvatarImage
            src="/loading-image.jpg"
            alt="Loading test"
            onLoadingStatusChange={handleLoadingStatusChange}
          />
          <AvatarFallback>LT</AvatarFallback>
        </Avatar>,
      );

      expect(handleLoadingStatusChange).toHaveBeenCalledWith('loaded');

      // Test error state
      rerender(
        <Avatar>
          <AvatarImage
            src="/error-image.jpg"
            alt="Error test"
            onLoadingStatusChange={handleLoadingStatusChange}
          />
          <AvatarFallback>ET</AvatarFallback>
        </Avatar>,
      );

      expect(handleLoadingStatusChange).toHaveBeenCalledWith('error');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined className gracefully', () => {
      render(
        <Avatar className={undefined}>
          <AvatarImage className={undefined} src="/test.jpg" alt="Test" />
          <AvatarFallback className={undefined}>TU</AvatarFallback>
        </Avatar>,
      );

      expect(screen.getByTestId('avatar-root')).toBeInTheDocument();
      expect(screen.getByTestId('avatar-image')).toBeInTheDocument();
      expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
    });

    it('should handle null className gracefully', () => {
      render(
        <Avatar className={null as unknown as string}>
          <AvatarFallback>TU</AvatarFallback>
        </Avatar>,
      );

      const avatar = screen.getByTestId('avatar-root');
      expect(avatar).toBeInTheDocument();
    });

    it('should handle multiple className values', () => {
      render(
        <Avatar className="class1 class2 class3">
          <AvatarFallback className="fallback1 fallback2">MC</AvatarFallback>
        </Avatar>,
      );

      const avatar = screen.getByTestId('avatar-root');
      const fallback = screen.getByTestId('avatar-fallback');

      expect(avatar).toHaveClass('class1', 'class2', 'class3');
      expect(fallback).toHaveClass('fallback1', 'fallback2');
    });

    it('should handle special characters in content', () => {
      render(
        <Avatar>
          <AvatarFallback>🧑‍💻</AvatarFallback>
        </Avatar>,
      );

      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toHaveTextContent('🧑‍💻');
    });

    it('should handle very long fallback text', () => {
      const longText =
        'This is a very long text that should be handled gracefully';

      render(
        <Avatar>
          <AvatarFallback>{longText}</AvatarFallback>
        </Avatar>,
      );

      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toHaveTextContent(longText);
    });

    it('should handle missing alt text on image', () => {
      render(
        <Avatar>
          <AvatarImage src="/test.jpg" />
        </Avatar>,
      );

      const image = screen.getByTestId('avatar-image');
      expect(image).toBeInTheDocument();
      expect(image).not.toHaveAttribute('alt');
    });

    it('should handle empty src on image', () => {
      render(
        <Avatar>
          <AvatarImage src="" alt="Empty src" />
        </Avatar>,
      );

      const image = screen.getByTestId('avatar-image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('alt', 'Empty src');
    });
  });

  describe('Accessibility', () => {
    it('should support screen reader accessibility', () => {
      render(
        <Avatar role="img" aria-label="User profile picture">
          <AvatarImage src="/user.jpg" alt="John Doe profile picture" />
          <AvatarFallback aria-label="John Doe initials">JD</AvatarFallback>
        </Avatar>,
      );

      const avatar = screen.getByTestId('avatar-root');
      expect(avatar).toHaveAttribute('role', 'img');
      expect(avatar).toHaveAttribute('aria-label', 'User profile picture');

      const image = screen.getByAltText('John Doe profile picture');
      expect(image).toBeInTheDocument();

      const fallback = screen.getByLabelText('John Doe initials');
      expect(fallback).toBeInTheDocument();
    });

    it('should support keyboard navigation when interactive', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <Avatar
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleClick();
            }
          }}
        >
          <AvatarFallback>KN</AvatarFallback>
        </Avatar>,
      );

      const avatar = screen.getByTestId('avatar-root');

      await user.tab();
      expect(avatar).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('should maintain focus management', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <button>Before</button>
          <Avatar tabIndex={0}>
            <AvatarFallback>FM</AvatarFallback>
          </Avatar>
          <button>After</button>
        </div>,
      );

      const beforeButton = screen.getByText('Before');
      const avatar = screen.getByTestId('avatar-root');
      const afterButton = screen.getByText('After');

      await user.click(beforeButton);
      expect(beforeButton).toHaveFocus();

      await user.tab();
      expect(avatar).toHaveFocus();

      await user.tab();
      expect(afterButton).toHaveFocus();
    });
  });
});
