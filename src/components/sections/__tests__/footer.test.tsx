import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { useTranslations } from 'next-intl';

import { Footer } from '../footer';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    width,
    height,
    className,
    style,
    ...props
  }: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    style?: React.CSSProperties;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      {...props}
    />
  ),
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({
    href,
    children,
    className,
    'aria-label': ariaLabel,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    'aria-label'?: string;
  }) => {
    // Create unique testid based on href and whether it has aria-label (logo link)
    const testId = ariaLabel
      ? `logo-link-${href.replace(/\//g, '-')}`
      : `nav-link-${href.replace(/\//g, '-')}`;

    return (
      <a
        href={href}
        className={className}
        aria-label={ariaLabel}
        data-testid={testId}
        {...props}
      >
        {children}
      </a>
    );
  },
}));

vi.mock('lucide-react', () => ({
  Facebook: ({ className, ...props }: { className?: string }) => (
    <svg
      data-testid="facebook-icon"
      className={className}
      {...props}
      role="img"
      aria-label="Facebook"
    >
      <title>Facebook</title>
    </svg>
  ),
  Instagram: ({ className, ...props }: { className?: string }) => (
    <svg
      data-testid="instagram-icon"
      className={className}
      {...props}
      role="img"
      aria-label="Instagram"
    >
      <title>Instagram</title>
    </svg>
  ),
  Twitter: ({ className, ...props }: { className?: string }) => (
    <svg
      data-testid="twitter-icon"
      className={className}
      {...props}
      role="img"
      aria-label="Twitter"
    >
      <title>Twitter</title>
    </svg>
  ),
}));

const mockUseTranslations = vi.mocked(useTranslations);

// Mock window.location to prevent JSDOM navigation errors
const originalLocation = window.location;

/**
 * Test suite for the Footer component
 *
 * @remarks
 * Tests cover rendering, translations, navigation, accessibility, social links,
 * and edge cases for the client-side footer component.
 */
describe('Footer', () => {
  beforeAll(() => {
    // Mock window.location to prevent JSDOM navigation errors with tel: and mailto: links
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).location;

    window.location = Object.defineProperties({} as Location, {
      ...Object.getOwnPropertyDescriptors(originalLocation),
      assign: {
        configurable: true,
        value: vi.fn(),
      },
      replace: {
        configurable: true,
        value: vi.fn(),
      },
      reload: {
        configurable: true,
        value: vi.fn(),
      },
    }) as unknown as string & Location;
  });

  afterAll(() => {
    window.location = originalLocation as unknown as string & Location;
  });

  beforeEach(() => {
    vi.clearAllMocks();

    const mockTranslationFunction = ((key: string) => {
      const translations: Record<string, string> = {
        navTitle: 'Navigation',
        contactTitle: 'Contact Us',
        socialTitle: 'Follow Us',
        addressPlaceholder: '123 Lemon Grove, Chicago, IL',
        phonePlaceholder: '(555) 123-4567',
        emailPlaceholder: 'contact@littlelemon.com',
        socialFacebookAria: 'Visit our Facebook page',
        socialInstagramAria: 'Visit our Instagram profile',
        socialTwitterAria: 'Visit our Twitter profile',
        copyright: '© 2025 Little Lemon. All rights reserved.',
        home: 'Home',
        about: 'About',
        menu: 'Menu',
        reservations: 'Reservations',
        orderOnline: 'Order Online',
        login: 'Login',
        logoAlt: 'Little Lemon Logo',
        homepageLinkAriaLabel: 'Go to Little Lemon homepage',
      };

      return translations[key] || key;
    }) as unknown;

    mockUseTranslations.mockReturnValue(
      mockTranslationFunction as ReturnType<typeof useTranslations>,
    );
  });

  describe('Basic Rendering', () => {
    it('should render the footer with correct structure', () => {
      render(<Footer />);

      // Check main footer element
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('bg-muted/40', 'border-t', 'py-12');

      // Check main container structure
      const container = footer.querySelector('.container');
      expect(container).toBeInTheDocument();

      expect(container).toHaveClass(
        'mx-auto',
        'grid',
        'max-w-6xl',
        'grid-cols-1',
        'gap-8',
        'md:grid-cols-4',
      );
    });

    it('should render all four main sections', () => {
      render(<Footer />);

      // Check section headings
      expect(screen.getByText('Navigation')).toBeInTheDocument();
      expect(screen.getByText('Contact Us')).toBeInTheDocument();
      expect(screen.getByText('Follow Us')).toBeInTheDocument();

      // Logo section doesn't have a heading but should have the logo
      expect(screen.getByAltText('Little Lemon Logo')).toBeInTheDocument();
    });

    it('should render copyright section', () => {
      render(<Footer />);

      const copyright = screen.getByText(
        '© 2025 Little Lemon. All rights reserved.',
      );

      expect(copyright).toBeInTheDocument();
      expect(copyright).toHaveClass('text-muted-foreground', 'text-sm');

      const copyrightContainer = copyright.closest('div');

      expect(copyrightContainer).toHaveClass(
        'mt-8',
        'border-t',
        'pt-6',
        'text-center',
      );
    });
  });

  describe('Logo Section', () => {
    it('should render logo with correct attributes', () => {
      render(<Footer />);

      const logo = screen.getByAltText('Little Lemon Logo');
      expect(logo).toBeInTheDocument();

      expect(logo).toHaveAttribute(
        'src',
        '/images/little-lemon-logo-footer.webp',
      );

      expect(logo).toHaveAttribute('width', '120');
      expect(logo).toHaveAttribute('height', '160');
      expect(logo).toHaveClass('mb-4', 'h-auto', 'max-w-full');
      expect(logo).toHaveStyle({ width: 'auto' });
    });

    it('should wrap logo in homepage link with aria-label', () => {
      render(<Footer />);

      const logoLink = screen.getByTestId('logo-link--');
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute('href', '/');

      expect(logoLink).toHaveAttribute(
        'aria-label',
        'Go to Little Lemon homepage',
      );

      const logo = screen.getByAltText('Little Lemon Logo');
      expect(logoLink).toContainElement(logo);
    });

    it('should have correct logo column styling', () => {
      render(<Footer />);

      const logoContainer = screen
        .getByAltText('Little Lemon Logo')
        .closest('div');

      expect(logoContainer).toHaveClass(
        'flex',
        'flex-col',
        'items-center',
        'md:items-start',
      );
    });
  });

  describe('Navigation Section', () => {
    it('should render navigation title', () => {
      render(<Footer />);

      const navTitle = screen.getByText('Navigation');
      expect(navTitle).toBeInTheDocument();
      expect(navTitle.tagName).toBe('H3');
      expect(navTitle).toHaveClass('mb-4', 'text-lg', 'font-semibold');
    });

    it('should render all navigation links', () => {
      render(<Footer />);

      const expectedLinks = [
        { href: '/', text: 'Home' },
        { href: '/about', text: 'About' },
        { href: '/menu', text: 'Menu' },
        { href: '/reservations', text: 'Reservations' },
        { href: '/order-online', text: 'Order Online' },
        { href: '/login', text: 'Login' },
      ];

      expectedLinks.forEach(({ href, text }) => {
        const link = screen.getByText(text);
        expect(link).toBeInTheDocument();
        expect(link.closest('a')).toHaveAttribute('href', href);

        expect(link.closest('a')).toHaveClass(
          'text-muted-foreground',
          'hover:text-foreground',
        );
      });
    });

    it('should have correct navigation structure', () => {
      render(<Footer />);

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveClass('flex', 'flex-col', 'space-y-2');

      const navContainer = nav.closest('div');
      expect(navContainer).toHaveClass('text-center', 'md:text-left');
    });

    it('should render navigation links in correct order', () => {
      render(<Footer />);

      const navLinks = screen.getAllByRole('link').filter(
        (link) => link.getAttribute('data-testid')?.startsWith('nav-link-'), // Only navigation links
      );

      const expectedOrder = [
        'Home',
        'About',
        'Menu',
        'Reservations',
        'Order Online',
        'Login',
      ];

      expectedOrder.forEach((text, index) => {
        expect(navLinks[index]).toHaveTextContent(text);
      });
    });
  });

  describe('Contact Section', () => {
    it('should render contact title', () => {
      render(<Footer />);

      const contactTitle = screen.getByText('Contact Us');
      expect(contactTitle).toBeInTheDocument();
      expect(contactTitle.tagName).toBe('H3');
      expect(contactTitle).toHaveClass('mb-4', 'text-lg', 'font-semibold');
    });

    it('should render address information', () => {
      render(<Footer />);

      const address = screen.getByText('123 Lemon Grove, Chicago, IL');
      expect(address).toBeInTheDocument();
      expect(address.tagName).toBe('SPAN');
    });

    it('should render phone link with correct attributes', () => {
      render(<Footer />);

      const phoneLink = screen.getByText('(555) 123-4567');
      expect(phoneLink).toBeInTheDocument();
      expect(phoneLink.tagName).toBe('A');
      expect(phoneLink).toHaveAttribute('href', 'tel:+1234567890');
      expect(phoneLink).toHaveClass('hover:text-foreground');
    });

    it('should render email link with correct attributes', () => {
      render(<Footer />);

      const emailLink = screen.getByText('contact@littlelemon.com');
      expect(emailLink).toBeInTheDocument();
      expect(emailLink.tagName).toBe('A');
      expect(emailLink).toHaveAttribute('href', 'mailto:info@littlelemon.com');
      expect(emailLink).toHaveClass('hover:text-foreground');
    });

    it('should have correct address element structure', () => {
      render(<Footer />);

      const address = screen
        .getByText('123 Lemon Grove, Chicago, IL')
        .closest('address');

      expect(address).toBeInTheDocument();

      expect(address).toHaveClass(
        'text-muted-foreground',
        'flex',
        'flex-col',
        'space-y-2',
        'not-italic',
      );

      const contactContainer = address?.closest('div');
      expect(contactContainer).toHaveClass('text-center', 'md:text-left');
    });
  });

  describe('Social Media Section', () => {
    it('should render social media title', () => {
      render(<Footer />);

      const socialTitle = screen.getByText('Follow Us');
      expect(socialTitle).toBeInTheDocument();
      expect(socialTitle.tagName).toBe('H3');
      expect(socialTitle).toHaveClass('mb-4', 'text-lg', 'font-semibold');
    });

    it('should render all social media links', () => {
      render(<Footer />);

      const facebookLink = screen.getByLabelText('Visit our Facebook page');

      const instagramLink = screen.getByLabelText(
        'Visit our Instagram profile',
      );

      const twitterLink = screen.getByLabelText('Visit our Twitter profile');

      expect(facebookLink).toBeInTheDocument();
      expect(instagramLink).toBeInTheDocument();
      expect(twitterLink).toBeInTheDocument();

      [facebookLink, instagramLink, twitterLink].forEach((link) => {
        expect(link).toHaveAttribute('href', '#');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');

        expect(link).toHaveClass(
          'text-muted-foreground',
          'hover:text-foreground',
          'transition-colors',
        );
      });
    });

    it('should render social media icons', () => {
      render(<Footer />);

      const facebookIcon = screen.getByTestId('facebook-icon');
      const instagramIcon = screen.getByTestId('instagram-icon');
      const twitterIcon = screen.getByTestId('twitter-icon');

      expect(facebookIcon).toBeInTheDocument();
      expect(instagramIcon).toBeInTheDocument();
      expect(twitterIcon).toBeInTheDocument();

      [facebookIcon, instagramIcon, twitterIcon].forEach((icon) => {
        expect(icon).toHaveClass('h-6', 'w-6');
      });
    });

    it('should have correct social media container structure', () => {
      render(<Footer />);

      const socialContainer = screen.getByText('Follow Us').closest('div');
      expect(socialContainer).toHaveClass('text-center', 'md:text-left');

      const iconsContainer = screen.getByTestId('facebook-icon').closest('div');

      expect(iconsContainer).toHaveClass(
        'flex',
        'justify-center',
        'space-x-4',
        'md:justify-start',
      );
    });
  });

  describe('Translation Integration', () => {
    it('should call useTranslations with Footer namespace', () => {
      render(<Footer />);
      expect(mockUseTranslations).toHaveBeenCalledWith('Footer');
      expect(mockUseTranslations).toHaveBeenCalledTimes(1);
    });

    it('should use translated text for all content', () => {
      render(<Footer />);

      // Section titles
      expect(screen.getByText('Navigation')).toBeInTheDocument();
      expect(screen.getByText('Contact Us')).toBeInTheDocument();
      expect(screen.getByText('Follow Us')).toBeInTheDocument();

      // Navigation links
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Menu')).toBeInTheDocument();
      expect(screen.getByText('Reservations')).toBeInTheDocument();
      expect(screen.getByText('Order Online')).toBeInTheDocument();
      expect(screen.getByText('Login')).toBeInTheDocument();

      // Contact information
      expect(
        screen.getByText('123 Lemon Grove, Chicago, IL'),
      ).toBeInTheDocument();

      expect(screen.getByText('(555) 123-4567')).toBeInTheDocument();
      expect(screen.getByText('contact@littlelemon.com')).toBeInTheDocument();

      // Copyright
      expect(
        screen.getByText('© 2025 Little Lemon. All rights reserved.'),
      ).toBeInTheDocument();

      // Aria labels
      expect(
        screen.getByLabelText('Go to Little Lemon homepage'),
      ).toBeInTheDocument();

      expect(
        screen.getByLabelText('Visit our Facebook page'),
      ).toBeInTheDocument();

      expect(
        screen.getByLabelText('Visit our Instagram profile'),
      ).toBeInTheDocument();

      expect(
        screen.getByLabelText('Visit our Twitter profile'),
      ).toBeInTheDocument();
    });

    it('should handle different translation values', () => {
      const mockTranslationFunction = ((key: string) => {
        const translations: Record<string, string> = {
          navTitle: 'Navegación',
          contactTitle: 'Contáctanos',
          socialTitle: 'Síguenos',
          home: 'Inicio',
          about: 'Acerca de',
          menu: 'Menú',
          reservations: 'Reservaciones',
          orderOnline: 'Pedir en línea',
          login: 'Iniciar sesión',
          copyright: '© 2025 Pequeño Limón. Todos los derechos reservados.',
          logoAlt: 'Logo de Pequeño Limón',
          homepageLinkAriaLabel: 'Ir a la página principal de Pequeño Limón',
        };

        return translations[key] || key;
      }) as unknown;

      mockUseTranslations.mockReturnValue(
        mockTranslationFunction as ReturnType<typeof useTranslations>,
      );

      render(<Footer />);

      expect(screen.getByText('Navegación')).toBeInTheDocument();
      expect(screen.getByText('Contáctanos')).toBeInTheDocument();
      expect(screen.getByText('Síguenos')).toBeInTheDocument();
      expect(screen.getByText('Inicio')).toBeInTheDocument();
      expect(screen.getByText('Acerca de')).toBeInTheDocument();
      expect(screen.getByText('Menú')).toBeInTheDocument();
      expect(screen.getByText('Reservaciones')).toBeInTheDocument();
      expect(screen.getByText('Pedir en línea')).toBeInTheDocument();
      expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();

      expect(
        screen.getByText(
          '© 2025 Pequeño Limón. Todos los derechos reservados.',
        ),
      ).toBeInTheDocument();

      expect(screen.getByAltText('Logo de Pequeño Limón')).toBeInTheDocument();

      expect(
        screen.getByLabelText('Ir a la página principal de Pequeño Limón'),
      ).toBeInTheDocument();
    });

    it('should handle missing translation keys gracefully', () => {
      const mockTranslationFunction = ((key: string) => {
        const translations: Record<string, string> = {
          navTitle: 'Navigation',
          // Missing other keys
        };

        return translations[key] || key; // Return key as fallback
      }) as unknown;

      mockUseTranslations.mockReturnValue(
        mockTranslationFunction as ReturnType<typeof useTranslations>,
      );

      render(<Footer />);

      expect(screen.getByText('Navigation')).toBeInTheDocument();
      expect(screen.getByText('contactTitle')).toBeInTheDocument(); // Fallback key
      expect(screen.getByText('socialTitle')).toBeInTheDocument(); // Fallback key
      expect(screen.getByText('home')).toBeInTheDocument(); // Fallback key
      expect(screen.getByAltText('logoAlt')).toBeInTheDocument(); // Fallback key
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<Footer />);

      // Check main footer element
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();

      // Check headings
      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings).toHaveLength(3);

      // Check navigation
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('should have descriptive aria-labels for links', () => {
      render(<Footer />);

      expect(
        screen.getByLabelText('Go to Little Lemon homepage'),
      ).toBeInTheDocument();

      expect(
        screen.getByLabelText('Visit our Facebook page'),
      ).toBeInTheDocument();

      expect(
        screen.getByLabelText('Visit our Instagram profile'),
      ).toBeInTheDocument();

      expect(
        screen.getByLabelText('Visit our Twitter profile'),
      ).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<Footer />);

      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings).toHaveLength(3);

      const headingTexts = headings.map((h) => h.textContent);
      expect(headingTexts).toContain('Navigation');
      expect(headingTexts).toContain('Contact Us');
      expect(headingTexts).toContain('Follow Us');
    });

    it('should have proper contact information structure', () => {
      render(<Footer />);

      const address = screen
        .getByText('123 Lemon Grove, Chicago, IL')
        .closest('address');

      expect(address).toBeInTheDocument();
      expect(address).toHaveClass('not-italic');
    });

    it('should have external links with security attributes', () => {
      render(<Footer />);

      const externalLinks = [
        screen.getByLabelText('Visit our Facebook page'),
        screen.getByLabelText('Visit our Instagram profile'),
        screen.getByLabelText('Visit our Twitter profile'),
      ];

      externalLinks.forEach((link) => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('should have proper icon accessibility', () => {
      render(<Footer />);

      const facebookIcon = screen.getByTestId('facebook-icon');
      const instagramIcon = screen.getByTestId('instagram-icon');
      const twitterIcon = screen.getByTestId('twitter-icon');

      expect(facebookIcon).toHaveAttribute('role', 'img');
      expect(instagramIcon).toHaveAttribute('role', 'img');
      expect(twitterIcon).toHaveAttribute('role', 'img');

      expect(facebookIcon).toHaveAttribute('aria-label', 'Facebook');
      expect(instagramIcon).toHaveAttribute('aria-label', 'Instagram');
      expect(twitterIcon).toHaveAttribute('aria-label', 'Twitter');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid layout', () => {
      render(<Footer />);

      const container = screen
        .getByRole('contentinfo')
        .querySelector('.container');

      expect(container).toHaveClass(
        'grid',
        'grid-cols-1',
        'gap-8',
        'md:grid-cols-4',
      );
    });

    it('should have responsive padding', () => {
      render(<Footer />);

      const paddingContainer = screen
        .getByRole('contentinfo')
        .querySelector('div');

      expect(paddingContainer).toHaveClass('px-4', 'md:px-8', 'lg:px-16');
    });

    it('should have responsive text alignment', () => {
      render(<Footer />);

      // Navigation section
      const navContainer = screen.getByText('Navigation').closest('div');
      expect(navContainer).toHaveClass('text-center', 'md:text-left');

      // Contact section
      const contactContainer = screen.getByText('Contact Us').closest('div');
      expect(contactContainer).toHaveClass('text-center', 'md:text-left');

      // Social section
      const socialContainer = screen.getByText('Follow Us').closest('div');
      expect(socialContainer).toHaveClass('text-center', 'md:text-left');
    });

    it('should have responsive logo alignment', () => {
      render(<Footer />);

      const logoContainer = screen
        .getByAltText('Little Lemon Logo')
        .closest('div');

      expect(logoContainer).toHaveClass(
        'flex',
        'flex-col',
        'items-center',
        'md:items-start',
      );
    });

    it('should have responsive social media layout', () => {
      render(<Footer />);

      const socialIconsContainer = screen
        .getByTestId('facebook-icon')
        .closest('div');

      expect(socialIconsContainer).toHaveClass(
        'flex',
        'justify-center',
        'space-x-4',
        'md:justify-start',
      );
    });
  });

  describe('User Interactions', () => {
    it('should handle navigation link clicks', async () => {
      const user = userEvent.setup();
      render(<Footer />);

      const homeLink = screen.getByText('Home');
      await user.click(homeLink);

      // Link should be clickable (no errors thrown)
      expect(homeLink.closest('a')).toHaveAttribute('href', '/');
    });

    it('should handle logo link clicks', async () => {
      const user = userEvent.setup();
      render(<Footer />);

      const logoLink = screen.getByLabelText('Go to Little Lemon homepage');
      await user.click(logoLink);

      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('should handle contact link clicks', async () => {
      const user = userEvent.setup();
      render(<Footer />);

      const phoneLink = screen.getByText('(555) 123-4567');
      const emailLink = screen.getByText('contact@littlelemon.com');

      // Add event listeners to prevent default navigation behavior
      phoneLink.addEventListener('click', (e) => e.preventDefault());
      emailLink.addEventListener('click', (e) => e.preventDefault());

      await user.click(phoneLink);
      await user.click(emailLink);

      expect(phoneLink).toHaveAttribute('href', 'tel:+1234567890');
      expect(emailLink).toHaveAttribute('href', 'mailto:info@littlelemon.com');
    });

    it('should handle social media link clicks', async () => {
      const user = userEvent.setup();
      render(<Footer />);

      const facebookLink = screen.getByLabelText('Visit our Facebook page');

      const instagramLink = screen.getByLabelText(
        'Visit our Instagram profile',
      );

      const twitterLink = screen.getByLabelText('Visit our Twitter profile');

      await user.click(facebookLink);
      await user.click(instagramLink);
      await user.click(twitterLink);

      // All should be clickable with correct attributes
      expect(facebookLink).toHaveAttribute('href', '#');
      expect(instagramLink).toHaveAttribute('href', '#');
      expect(twitterLink).toHaveAttribute('href', '#');
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should apply correct footer styling', () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('bg-muted/40', 'border-t', 'py-12');
    });

    it('should apply correct container styling', () => {
      render(<Footer />);

      const container = screen
        .getByRole('contentinfo')
        .querySelector('.container');

      expect(container).toHaveClass(
        'container',
        'mx-auto',
        'grid',
        'max-w-6xl',
        'grid-cols-1',
        'gap-8',
        'md:grid-cols-4',
      );
    });

    it('should apply correct heading styling', () => {
      render(<Footer />);

      const headings = screen.getAllByRole('heading', { level: 3 });

      headings.forEach((heading) => {
        expect(heading).toHaveClass('mb-4', 'text-lg', 'font-semibold');
      });
    });

    it('should apply correct navigation styling', () => {
      render(<Footer />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('flex', 'flex-col', 'space-y-2');

      const navLinks = screen
        .getAllByRole('link')
        .filter(
          (link) =>
            link.getAttribute('data-testid')?.startsWith('link-') &&
            link.getAttribute('data-testid') !== 'link--',
        );

      navLinks.forEach((link) => {
        expect(link).toHaveClass(
          'text-muted-foreground',
          'hover:text-foreground',
        );
      });
    });

    it('should apply correct contact styling', () => {
      render(<Footer />);

      const address = screen
        .getByText('123 Lemon Grove, Chicago, IL')
        .closest('address');

      expect(address).toHaveClass(
        'text-muted-foreground',
        'flex',
        'flex-col',
        'space-y-2',
        'not-italic',
      );

      const phoneLink = screen.getByText('(555) 123-4567');
      const emailLink = screen.getByText('contact@littlelemon.com');

      expect(phoneLink).toHaveClass('hover:text-foreground');
      expect(emailLink).toHaveClass('hover:text-foreground');
    });

    it('should apply correct social media styling', () => {
      render(<Footer />);

      const socialLinks = [
        screen.getByLabelText('Visit our Facebook page'),
        screen.getByLabelText('Visit our Instagram profile'),
        screen.getByLabelText('Visit our Twitter profile'),
      ];

      socialLinks.forEach((link) => {
        expect(link).toHaveClass(
          'text-muted-foreground',
          'hover:text-foreground',
          'transition-colors',
        );
      });

      const icons = [
        screen.getByTestId('facebook-icon'),
        screen.getByTestId('instagram-icon'),
        screen.getByTestId('twitter-icon'),
      ];

      icons.forEach((icon) => {
        expect(icon).toHaveClass('h-6', 'w-6');
      });
    });

    it('should apply correct copyright styling', () => {
      render(<Footer />);

      const copyright = screen.getByText(
        '© 2025 Little Lemon. All rights reserved.',
      );

      expect(copyright).toHaveClass('text-muted-foreground', 'text-sm');

      const copyrightContainer = copyright.closest('div');

      expect(copyrightContainer).toHaveClass(
        'mt-8',
        'border-t',
        'pt-6',
        'text-center',
      );
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty translation values', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mockTranslationFunction = ((key: string) => {
        return ''; // Return empty string for all keys
      }) as unknown;

      mockUseTranslations.mockReturnValue(
        mockTranslationFunction as ReturnType<typeof useTranslations>,
      );

      render(<Footer />);

      // Should still render structure even with empty content
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should handle very long translation content', () => {
      const longText = 'A'.repeat(100);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mockTranslationFunction = ((key: string) => {
        return longText;
      }) as unknown;

      mockUseTranslations.mockReturnValue(
        mockTranslationFunction as ReturnType<typeof useTranslations>,
      );

      render(<Footer />);

      // Should handle long content gracefully
      const headings = screen.getAllByRole('heading', { level: 3 });

      headings.forEach((heading) => {
        expect(heading).toHaveTextContent(longText);
      });
    });

    it('should handle special characters in translations', () => {
      const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?`~"\'\\';

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mockTranslationFunction = ((key: string) => {
        return specialText;
      }) as unknown;

      mockUseTranslations.mockReturnValue(
        mockTranslationFunction as ReturnType<typeof useTranslations>,
      );

      render(<Footer />);

      const headings = screen.getAllByRole('heading', { level: 3 });

      headings.forEach((heading) => {
        expect(heading).toHaveTextContent(specialText);
      });
    });

    it('should handle unicode characters in translations', () => {
      const unicodeText = '🍋 Petit Citron 🇫🇷';

      const mockTranslationFunction = ((key: string) => {
        if (key === 'navTitle') return `${unicodeText} Navigation`;
        if (key === 'contactTitle') return `${unicodeText} Contact`;
        if (key === 'socialTitle') return `${unicodeText} Social`;
        return key;
      }) as unknown;

      mockUseTranslations.mockReturnValue(
        mockTranslationFunction as ReturnType<typeof useTranslations>,
      );

      render(<Footer />);

      expect(
        screen.getByText('🍋 Petit Citron 🇫🇷 Navigation'),
      ).toBeInTheDocument();

      expect(
        screen.getByText('🍋 Petit Citron 🇫🇷 Contact'),
      ).toBeInTheDocument();

      expect(screen.getByText('🍋 Petit Citron 🇫🇷 Social')).toBeInTheDocument();
    });
  });

  describe('Performance Considerations', () => {
    it('should call useTranslations only once', () => {
      render(<Footer />);
      expect(mockUseTranslations).toHaveBeenCalledTimes(1);
    });

    it('should render navigation items efficiently', () => {
      render(<Footer />);

      // Should render exactly 6 navigation links
      const navLinks = screen
        .getAllByRole('link')
        .filter((link) =>
          link.getAttribute('data-testid')?.startsWith('nav-link-'),
        );

      expect(navLinks).toHaveLength(6);
    });

    it('should use semantic HTML elements', () => {
      render(<Footer />);

      // Should use proper semantic elements
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
      expect(screen.getByRole('navigation')).toBeInTheDocument(); // nav
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3); // h3

      expect(
        screen.getByText('123 Lemon Grove, Chicago, IL').closest('address'),
      ).toBeInTheDocument(); // address
    });
  });

  describe('Client Component Behavior', () => {
    it('should be a client component', () => {
      // Footer uses useTranslations hook, so it must be a client component
      render(<Footer />);
      expect(mockUseTranslations).toHaveBeenCalled();
    });

    it('should handle client-side rendering', () => {
      const { container } = render(<Footer />);
      expect(container.firstChild).toBeDefined();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('should work with different locale contexts', () => {
      // Reset mock for this test
      vi.clearAllMocks();

      const mockTranslationFunction = ((key: string) => {
        const translations: Record<string, string> = {
          navTitle: 'Navegación',
          contactTitle: 'Contacto',
          socialTitle: 'Redes Sociales',
          home: 'Inicio',
          about: 'Acerca de',
          copyright: '© 2025 Pequeño Limón. Todos los derechos reservados.',
        };

        return translations[key] || key;
      }) as unknown;

      mockUseTranslations.mockReturnValue(
        mockTranslationFunction as ReturnType<typeof useTranslations>,
      );

      render(<Footer />);

      expect(screen.getByText('Navegación')).toBeInTheDocument();
      expect(screen.getByText('Contacto')).toBeInTheDocument();
      expect(screen.getByText('Redes Sociales')).toBeInTheDocument();
      expect(screen.getByText('Inicio')).toBeInTheDocument();
      expect(screen.getByText('Acerca de')).toBeInTheDocument();

      expect(
        screen.getByText(
          '© 2025 Pequeño Limón. Todos los derechos reservados.',
        ),
      ).toBeInTheDocument();
    });
  });
});
