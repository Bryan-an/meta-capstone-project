import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  describe,
  expect,
  it,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
} from 'vitest';
import userEvent from '@testing-library/user-event';
import { useTranslations } from 'next-intl';
import type { User } from '@supabase/supabase-js';

import { Navbar } from '../navbar';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({
    href,
    children,
    className,
    'aria-label': ariaLabel,
    'aria-current': ariaCurrent,
    onClick,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    'aria-label'?: string;
    'aria-current'?: 'page' | undefined;
    onClick?: () => void;
  }) => (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
      onClick={onClick}
      data-testid={`link-${href.replace(/\//g, '-')}`}
      {...props}
    >
      {children}
    </a>
  ),
  usePathname: vi.fn(),
}));

import { usePathname } from '@/i18n/routing';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    width,
    height,
    priority,
    className,
    style,
    ...props
  }: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    priority?: boolean;
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
      data-priority={priority}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/navigation-menu', () => ({
  NavigationMenu: (
    { children, className, ...props }: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => (
    <nav data-testid="navigation-menu" className={className} {...props}>
      {children}
    </nav>
  ),
  NavigationMenuList: (
    { children, ...props }: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => (
    <ul data-testid="navigation-menu-list" {...props}>
      {children}
    </ul>
  ),
  NavigationMenuItem: (
    { children, className, ...props }: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => (
    <li data-testid="navigation-menu-item" className={className} {...props}>
      {children}
    </li>
  ),
  navigationMenuTriggerStyle: vi.fn(() => 'nav-trigger-style'),
}));

vi.mock('@/components/ui/sheet', () => ({
  Sheet: (
    { children, open, onOpenChange, ...props }: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => (
    <div
      data-testid="sheet"
      data-open={open}
      data-on-open-change={!!onOpenChange}
      {...props}
    >
      {children}
    </div>
  ),
  SheetTrigger: (
    { children, asChild, ...props }: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => (
    <div data-testid="sheet-trigger" data-as-child={asChild} {...props}>
      {children}
    </div>
  ),
  SheetContent: (
    { children, side, className, ...props }: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => (
    <div
      data-testid="sheet-content"
      data-side={side}
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
  SheetHeader: (
    { children, className, ...props }: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => (
    <div data-testid="sheet-header" className={className} {...props}>
      {children}
    </div>
  ),
  SheetTitle: (
    { children, className, ...props }: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => (
    <h2 data-testid="sheet-title" className={className} {...props}>
      {children}
    </h2>
  ),
  SheetDescription: (
    { children, className, ...props }: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => (
    <p data-testid="sheet-description" className={className} {...props}>
      {children}
    </p>
  ),
  SheetClose: (
    { children, asChild, ...props }: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => (
    <div data-testid="sheet-close" data-as-child={asChild} {...props}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: (
    {
      children,
      variant,
      size,
      className,
      onClick,
      'aria-label': ariaLabel,
      ...props
    }: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => (
    <button
      data-testid="button"
      data-variant={variant}
      data-size={size}
      className={className}
      onClick={onClick}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/separator', () => ({
  Separator: (
    { className, ...props }: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => <hr data-testid="separator" className={className} {...props} />,
}));

vi.mock('lucide-react', () => ({
  Menu: ({ className, ...props }: { className?: string }) => (
    <svg
      data-testid="menu-icon"
      className={className}
      {...props}
      role="img"
      aria-label="Menu"
    >
      <title>Menu</title>
    </svg>
  ),
  LogOut: ({ className, ...props }: { className?: string }) => (
    <svg
      data-testid="logout-icon"
      className={className}
      {...props}
      role="img"
      aria-label="Logout"
    >
      <title>Logout</title>
    </svg>
  ),
}));

vi.mock('@/app/auth/actions', () => ({
  signOut: vi.fn(),
}));

vi.mock('@/components/ui/language-changer', () => ({
  LanguageChanger: () => (
    <div data-testid="language-changer">Language Changer</div>
  ),
}));

vi.mock('@/lib/utils/cn', () => ({
  cn: (...classes: (string | undefined | null | boolean)[]) =>
    classes.filter(Boolean).join(' '),
}));

const mockUseTranslations = vi.mocked(useTranslations);
const mockUsePathname = vi.mocked(usePathname);

// Mock window.location to prevent JSDOM navigation errors
const originalLocation = window.location;

/**
 * Test suite for the Navbar component
 *
 * @remarks
 * Tests cover rendering, translations, accessibility, navigation, authentication states,
 * mobile menu, language switching, and edge cases for the client-side navbar component.
 */
describe('Navbar', () => {
  beforeAll(() => {
    // Mock window.location to prevent JSDOM navigation errors
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

    // Mock usePathname to return home path by default
    mockUsePathname.mockReturnValue('/');

    // Setup default translation mocks
    const mockNavigationTranslations = ((key: string) => {
      const translations: Record<string, string> = {
        home: 'Home',
        about: 'About',
        menu: 'Menu',
        reservations: 'Reservations',
        orderOnline: 'Order Online',
        account: 'My Account',
        login: 'Login',
        logoAlt: 'Little Lemon Logo',
        homepageLinkAriaLabel: 'Go to Little Lemon homepage',
        mobileNavTitle: 'Navigation Menu',
        mobileNavDescription: 'Main navigation links for the website.',
        openMenuAriaLabel: 'Open menu',
      };

      return translations[key] || key;
    }) as unknown;

    const mockAuthTranslations = ((key: string) => {
      const translations: Record<string, string> = {
        signOutButtonText: 'Logout',
      };

      return translations[key] || key;
    }) as unknown;

    mockUseTranslations.mockImplementation((namespace?: string) => {
      if (namespace === 'Navigation') {
        return mockNavigationTranslations as ReturnType<typeof useTranslations>;
      }

      if (namespace === 'AuthActions') {
        return mockAuthTranslations as ReturnType<typeof useTranslations>;
      }

      return ((key: string) => key) as unknown as ReturnType<
        typeof useTranslations
      >;
    });
  });

  describe('Basic Rendering', () => {
    it('should render the navbar with correct structure', () => {
      render(<Navbar user={null} />);

      // Check header element
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();

      expect(header).toHaveClass(
        'border-border/40',
        'bg-background/95',
        'supports-[backdrop-filter]:bg-background/60',
        'sticky',
        'top-0',
        'z-50',
        'w-full',
        'border-b',
        'px-4',
        'backdrop-blur',
        'md:px-6',
      );

      // Check container structure
      const container = header.querySelector('.container');
      expect(container).toBeInTheDocument();

      expect(container).toHaveClass(
        'container',
        'mx-auto',
        'flex',
        'h-16',
        'max-w-6xl',
        'items-center',
        'justify-between',
      );
    });

    it('should render logo with correct attributes', () => {
      render(<Navbar user={null} />);

      const logoLinks = screen.getAllByTestId('link--');

      const desktopLogoLink = logoLinks.find(
        (link) =>
          link.getAttribute('aria-label') === 'Go to Little Lemon homepage',
      );

      expect(desktopLogoLink).toBeInTheDocument();
      expect(desktopLogoLink).toHaveAttribute('href', '/');

      expect(desktopLogoLink).toHaveAttribute(
        'aria-label',
        'Go to Little Lemon homepage',
      );

      const logoImages = screen.getAllByAltText('Little Lemon Logo');
      const desktopLogo = logoImages[0]; // First one is desktop
      expect(desktopLogo).toBeInTheDocument();

      expect(desktopLogo).toHaveAttribute(
        'src',
        '/images/little-lemon-logo.webp',
      );

      expect(desktopLogo).toHaveAttribute('width', '180');
      expect(desktopLogo).toHaveAttribute('height', '40');
      expect(desktopLogo).toHaveAttribute('data-priority', 'true');
      expect(desktopLogo).toHaveClass('h-auto', 'max-w-full');
    });

    it('should render desktop navigation menu', () => {
      render(<Navbar user={null} />);

      const desktopNav = screen.getByTestId('navigation-menu');
      expect(desktopNav).toBeInTheDocument();
      expect(desktopNav).toHaveClass('hidden', 'md:flex');

      const navList = screen.getByTestId('navigation-menu-list');
      expect(navList).toBeInTheDocument();
    });

    it('should render mobile menu trigger', () => {
      render(<Navbar user={null} />);

      const mobileMenuContainer = screen.getByTestId('sheet');
      expect(mobileMenuContainer).toBeInTheDocument();

      const menuButton = screen.getByRole('button', { name: 'Open menu' });
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveAttribute('aria-label', 'Open menu');

      const menuIcon = screen.getByTestId('menu-icon');
      expect(menuIcon).toBeInTheDocument();
    });
  });

  describe('Navigation Links - Unauthenticated User', () => {
    it('should render correct navigation links for unauthenticated user', () => {
      render(<Navbar user={null} />);

      // Should show public links (both desktop and mobile versions exist)
      expect(screen.getAllByTestId('link--')).toHaveLength(4); // 2 logo links + 2 home nav links
      expect(screen.getAllByTestId('link--about')).toHaveLength(2); // About (desktop + mobile)
      expect(screen.getAllByTestId('link--menu')).toHaveLength(2); // Menu (desktop + mobile)
      expect(screen.getAllByTestId('link--reservations')).toHaveLength(2); // Reservations (desktop + mobile)
      expect(screen.getAllByTestId('link--order-online')).toHaveLength(2); // Order Online (desktop + mobile)
      expect(screen.getAllByTestId('link--login')).toHaveLength(2); // Login (desktop + mobile)

      // Should not show authenticated-only links
      expect(screen.queryByTestId('link--account')).not.toBeInTheDocument();

      // Should not show logout button
      expect(screen.queryByTestId('logout-icon')).not.toBeInTheDocument();
    });

    it('should have correct link text for unauthenticated user', () => {
      render(<Navbar user={null} />);

      // Check that navigation text exists by checking specific navigation links
      expect(screen.getAllByTestId('link--')).toHaveLength(4); // 2 logo + 2 home nav
      expect(screen.getAllByTestId('link--about')).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByTestId('link--menu')).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByTestId('link--reservations')).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByTestId('link--order-online')).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByTestId('link--login')).toHaveLength(2); // Desktop + mobile

      // Verify text content exists in the document
      expect(document.body.textContent).toContain('Home');
      expect(document.body.textContent).toContain('About');
      expect(document.body.textContent).toContain('Menu');
      expect(document.body.textContent).toContain('Reservations');
      expect(document.body.textContent).toContain('Order Online');
      expect(document.body.textContent).toContain('Login');
    });
  });

  describe('Navigation Links - Authenticated User', () => {
    const mockUser: User = {
      id: 'test-user-id',
      email: 'test@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      app_metadata: {},
      user_metadata: {},
    };

    it('should render correct navigation links for authenticated user', () => {
      render(<Navbar user={mockUser} />);

      // Should show public links (multiple elements for desktop + mobile)
      expect(screen.getAllByTestId('link--')).toHaveLength(4); // 2 logo links + 2 home nav links
      expect(screen.getAllByTestId('link--about')).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByTestId('link--menu')).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByTestId('link--reservations')).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByTestId('link--order-online')).toHaveLength(2); // Desktop + mobile

      // Should show authenticated-only links
      expect(screen.getAllByTestId('link--account')).toHaveLength(2); // Desktop + mobile

      // Should not show login link
      expect(screen.queryByTestId('link--login')).not.toBeInTheDocument();

      // Should show logout button
      expect(screen.getAllByTestId('logout-icon')).toHaveLength(2); // Desktop + mobile
    });

    it('should have correct link text for authenticated user', () => {
      render(<Navbar user={mockUser} />);

      // Check that navigation links exist with correct counts
      expect(screen.getAllByTestId('link--')).toHaveLength(4); // 2 logo + 2 home nav
      expect(screen.getAllByTestId('link--about')).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByTestId('link--menu')).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByTestId('link--reservations')).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByTestId('link--order-online')).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByTestId('link--account')).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByTestId('logout-icon')).toHaveLength(2); // Desktop + mobile

      // Verify text content exists in the document
      expect(document.body.textContent).toContain('Home');
      expect(document.body.textContent).toContain('About');
      expect(document.body.textContent).toContain('Menu');
      expect(document.body.textContent).toContain('Reservations');
      expect(document.body.textContent).toContain('Order Online');
      expect(document.body.textContent).toContain('My Account');
      expect(document.body.textContent).toContain('Logout');
    });
  });

  describe('Active Link Highlighting', () => {
    it('should highlight home link when on home page', () => {
      mockUsePathname.mockReturnValue('/');
      render(<Navbar user={null} />);

      const homeLinks = screen.getAllByTestId('link--');

      // Find the navigation home link (not logo link) - it should have aria-current
      const homeNavLink = homeLinks.find(
        (link) =>
          link.getAttribute('aria-current') === 'page' &&
          link.textContent === 'Home',
      );

      expect(homeNavLink).toHaveAttribute('aria-current', 'page');
    });

    it('should highlight about link when on about page', () => {
      mockUsePathname.mockReturnValue('/about');
      render(<Navbar user={null} />);

      const aboutLinks = screen.getAllByTestId('link--about');
      expect(aboutLinks[0]).toHaveAttribute('aria-current', 'page'); // Desktop link
    });

    it('should highlight reservations link when on reservations subpage', () => {
      mockUsePathname.mockReturnValue('/reservations/new');
      render(<Navbar user={null} />);

      const reservationsLinks = screen.getAllByTestId('link--reservations');
      expect(reservationsLinks[0]).toHaveAttribute('aria-current', 'page'); // Desktop link
    });

    it('should not highlight home link when on other pages', () => {
      mockUsePathname.mockReturnValue('/about');
      render(<Navbar user={null} />);

      const homeLinks = screen.getAllByTestId('link--');
      // Find the navigation home link (not logo link)
      const homeNavLink = homeLinks.find((link) => link.textContent === 'Home');
      expect(homeNavLink).not.toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Mobile Menu', () => {
    it('should render mobile menu content', () => {
      render(<Navbar user={null} />);

      // Check sheet content
      const sheetContent = screen.getByTestId('sheet-content');
      expect(sheetContent).toBeInTheDocument();
      expect(sheetContent).toHaveAttribute('data-side', 'right');
      expect(sheetContent).toHaveClass('w-[300px]', 'sm:w-[400px]');

      // Check sheet header
      const sheetHeader = screen.getByTestId('sheet-header');
      expect(sheetHeader).toBeInTheDocument();
      expect(sheetHeader).toHaveClass('text-left');

      // Check sheet title and description (screen reader only)
      const sheetTitle = screen.getByTestId('sheet-title');
      expect(sheetTitle).toBeInTheDocument();
      expect(sheetTitle).toHaveClass('sr-only');
      expect(sheetTitle).toHaveTextContent('Navigation Menu');

      const sheetDescription = screen.getByTestId('sheet-description');
      expect(sheetDescription).toBeInTheDocument();
      expect(sheetDescription).toHaveClass('sr-only');

      expect(sheetDescription).toHaveTextContent(
        'Main navigation links for the website.',
      );
    });

    it('should render mobile logo in sheet header', () => {
      render(<Navbar user={null} />);

      // Find the mobile logo (second logo image)
      const logoImages = screen.getAllByAltText('Little Lemon Logo');
      expect(logoImages).toHaveLength(2); // Desktop and mobile

      const mobileLogo = logoImages[1];
      expect(mobileLogo).toHaveAttribute('width', '150');
      expect(mobileLogo).toHaveAttribute('height', '33');
      expect(mobileLogo).toHaveAttribute('data-priority', 'false');
    });

    it('should render separators in mobile menu', () => {
      render(<Navbar user={null} />);

      const separators = screen.getAllByTestId('separator');
      expect(separators).toHaveLength(2); // One after header, one before language changer
    });

    it('should render language changer in mobile menu', () => {
      render(<Navbar user={null} />);

      const languageChangers = screen.getAllByTestId('language-changer');
      expect(languageChangers).toHaveLength(2); // Desktop and mobile
    });
  });

  describe('User Interactions', () => {
    it('should handle mobile menu toggle', async () => {
      const user = userEvent.setup();
      render(<Navbar user={null} />);

      const menuButton = screen.getByRole('button', { name: 'Open menu' });

      // Add event listener to prevent default navigation behavior
      menuButton.addEventListener('click', (e) => e.preventDefault());

      await user.click(menuButton);

      // Menu button should be clickable (no errors thrown)
      expect(menuButton).toBeInTheDocument();
    });

    it('should handle logout button click for authenticated user', async () => {
      const { signOut } = await import('@/app/auth/actions');
      const mockSignOut = vi.mocked(signOut);

      const user = userEvent.setup();

      const mockUser: User = {
        id: 'test-user-id',
        email: 'test@example.com',
        aud: 'authenticated',
        role: 'authenticated',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
      };

      render(<Navbar user={mockUser} />);

      const logoutButtons = screen.getAllByText('Logout');
      const desktopLogoutButton = logoutButtons[0]; // First one is desktop

      await user.click(desktopLogoutButton);

      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    it('should handle navigation link clicks', async () => {
      const user = userEvent.setup();
      render(<Navbar user={null} />);

      const aboutLinks = screen.getAllByTestId('link--about');
      const aboutLink = aboutLinks[0]; // Use desktop link

      // Add event listener to prevent default navigation behavior
      aboutLink.addEventListener('click', (e) => e.preventDefault());

      await user.click(aboutLink);

      expect(aboutLink).toHaveAttribute('href', '/about');
    });
  });

  describe('Translation Integration', () => {
    it('should call useTranslations with correct namespaces', () => {
      render(<Navbar user={null} />);

      expect(mockUseTranslations).toHaveBeenCalledWith('Navigation');
      expect(mockUseTranslations).toHaveBeenCalledWith('AuthActions');
    });

    it('should handle different translation values', () => {
      const mockNavigationTranslations = ((key: string) => {
        const translations: Record<string, string> = {
          home: 'Inicio',
          about: 'Acerca de',
          menu: 'Menú',
          reservations: 'Reservaciones',
          orderOnline: 'Pedir en línea',
          account: 'Mi Cuenta',
          login: 'Iniciar Sesión',
          logoAlt: 'Logo de Little Lemon',
          homepageLinkAriaLabel: 'Ir a la página principal de Little Lemon',
          mobileNavTitle: 'Menú de Navegación',
          mobileNavDescription:
            'Enlaces principales de navegación del sitio web.',
          openMenuAriaLabel: 'Abrir menú',
        };

        return translations[key] || key;
      }) as unknown;

      const mockAuthTranslations = ((key: string) => {
        const translations: Record<string, string> = {
          signOutButtonText: 'Cerrar Sesión',
        };

        return translations[key] || key;
      }) as unknown;

      mockUseTranslations.mockImplementation((namespace?: string) => {
        if (namespace === 'Navigation') {
          return mockNavigationTranslations as ReturnType<
            typeof useTranslations
          >;
        }

        if (namespace === 'AuthActions') {
          return mockAuthTranslations as ReturnType<typeof useTranslations>;
        }

        return ((key: string) => key) as unknown as ReturnType<
          typeof useTranslations
        >;
      });

      const mockUser: User = {
        id: 'test-user-id',
        email: 'test@example.com',
        aud: 'authenticated',
        role: 'authenticated',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
      };

      render(<Navbar user={mockUser} />);

      expect(screen.getAllByText('Inicio')).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByText('Acerca de')).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByText('Menú')).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByText('Reservaciones')).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByText('Pedir en línea')).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByText('Mi Cuenta')).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByText('Cerrar Sesión')).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByAltText('Logo de Little Lemon')).toHaveLength(2); // Desktop + mobile
    });

    it('should handle missing translation keys gracefully', () => {
      const mockTranslationFunction = ((key: string) => {
        return key; // Return key as fallback
      }) as unknown;

      mockUseTranslations.mockReturnValue(
        mockTranslationFunction as ReturnType<typeof useTranslations>,
      );

      render(<Navbar user={null} />);

      expect(screen.getAllByText('home')).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByText('about')).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByText('menu')).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByText('reservations')).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByText('orderOnline')).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByText('login')).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByAltText('logoAlt')).toHaveLength(2); // Desktop + mobile
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<Navbar user={null} />);

      // Check header landmark
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();

      // Check navigation
      const nav = screen.getByTestId('navigation-menu');
      expect(nav).toBeInTheDocument();

      // Check logo link
      const logoLinks = screen.getAllByRole('link', {
        name: 'Go to Little Lemon homepage',
      });

      expect(logoLinks).toHaveLength(2); // Desktop + mobile
      expect(logoLinks[0]).toBeInTheDocument();

      // Check menu button
      const menuButton = screen.getByRole('button', { name: 'Open menu' });
      expect(menuButton).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(<Navbar user={null} />);

      // Check logo link aria-label
      const logoLinks = screen.getAllByTestId('link--');
      const logoLink = logoLinks[0]; // Use desktop link

      expect(logoLink).toHaveAttribute(
        'aria-label',
        'Go to Little Lemon homepage',
      );

      // Check menu button aria-label
      const menuButton = screen.getByRole('button', { name: 'Open menu' });
      expect(menuButton).toHaveAttribute('aria-label', 'Open menu');

      // Check active link aria-current
      mockUsePathname.mockReturnValue('/about');
      const { rerender } = render(<Navbar user={null} />);
      rerender(<Navbar user={null} />);
      const aboutLinks = screen.getAllByTestId('link--about');

      const aboutNavLink = aboutLinks.find(
        (link) => link.getAttribute('aria-current') === 'page',
      );

      expect(aboutNavLink).toHaveAttribute('aria-current', 'page');
    });

    it('should have descriptive alt text for logo', () => {
      render(<Navbar user={null} />);

      const logoImages = screen.getAllByAltText('Little Lemon Logo');
      expect(logoImages).toHaveLength(2); // Desktop and mobile

      logoImages.forEach((logo) => {
        expect(logo).toHaveAttribute('alt', 'Little Lemon Logo');
      });
    });

    it('should have screen reader only content for mobile menu', () => {
      render(<Navbar user={null} />);

      const sheetTitle = screen.getByTestId('sheet-title');
      expect(sheetTitle).toHaveClass('sr-only');

      const sheetDescription = screen.getByTestId('sheet-description');
      expect(sheetDescription).toHaveClass('sr-only');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive classes for header', () => {
      render(<Navbar user={null} />);

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('px-4', 'md:px-6');

      const container = header.querySelector('.container');
      expect(container).toHaveClass('h-16', 'max-w-6xl');
    });

    it('should hide desktop navigation on mobile', () => {
      render(<Navbar user={null} />);

      const desktopNav = screen.getByTestId('navigation-menu');
      expect(desktopNav).toHaveClass('hidden', 'md:flex');
    });

    it('should show mobile menu trigger only on mobile', () => {
      render(<Navbar user={null} />);

      const mobileContainer = screen.getByTestId('sheet').parentElement;
      expect(mobileContainer).toHaveClass('md:hidden');
    });

    it('should have responsive mobile sheet width', () => {
      render(<Navbar user={null} />);

      const sheetContent = screen.getByTestId('sheet-content');
      expect(sheetContent).toHaveClass('w-[300px]', 'sm:w-[400px]');
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should apply correct header styling', () => {
      render(<Navbar user={null} />);

      const header = screen.getByRole('banner');

      expect(header).toHaveClass(
        'border-border/40',
        'bg-background/95',
        'supports-[backdrop-filter]:bg-background/60',
        'sticky',
        'top-0',
        'z-50',
        'w-full',
        'border-b',
        'px-4',
        'backdrop-blur',
        'md:px-6',
      );
    });

    it('should apply correct container styling', () => {
      render(<Navbar user={null} />);

      const container = screen.getByRole('banner').querySelector('.container');

      expect(container).toHaveClass(
        'container',
        'mx-auto',
        'flex',
        'h-16',
        'max-w-6xl',
        'items-center',
        'justify-between',
      );
    });

    it('should apply correct logo styling', () => {
      render(<Navbar user={null} />);

      const logoImages = screen.getAllByAltText('Little Lemon Logo');
      const desktopLogo = logoImages[0];

      expect(desktopLogo).toHaveClass('h-auto', 'max-w-full');
      expect(desktopLogo).toHaveStyle({ width: 'auto' });
    });
  });

  describe('State Management', () => {
    it('should manage mobile menu open state', () => {
      render(<Navbar user={null} />);

      const sheet = screen.getByTestId('sheet');
      expect(sheet).toHaveAttribute('data-on-open-change', 'true');
    });

    it('should handle pathname changes for active link highlighting', () => {
      // Initially on home
      mockUsePathname.mockReturnValue('/');
      const { rerender } = render(<Navbar user={null} />);

      const homeLinks = screen.getAllByTestId('link--');

      const homeNavLink = homeLinks.find(
        (link) =>
          link.getAttribute('aria-current') === 'page' &&
          link.textContent === 'Home',
      );

      expect(homeNavLink).toHaveAttribute('aria-current', 'page');

      // Navigate to about
      mockUsePathname.mockReturnValue('/about');
      rerender(<Navbar user={null} />);

      const aboutLinks = screen.getAllByTestId('link--about');

      const aboutNavLink = aboutLinks.find(
        (link) => link.getAttribute('aria-current') === 'page',
      );

      expect(aboutNavLink).toHaveAttribute('aria-current', 'page');

      const updatedHomeLinks = screen.getAllByTestId('link--');

      const updatedHomeNavLink = updatedHomeLinks.find(
        (link) => link.textContent === 'Home',
      );

      expect(updatedHomeNavLink).not.toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null user gracefully', () => {
      render(<Navbar user={null} />);

      expect(screen.getAllByTestId('link--login')).toHaveLength(2); // Desktop + mobile
      expect(screen.queryByTestId('link--account')).not.toBeInTheDocument();
      expect(screen.queryByTestId('logout-icon')).not.toBeInTheDocument();
    });

    it('should handle undefined user gracefully', () => {
      render(<Navbar user={undefined as unknown as User | null} />);

      expect(screen.getAllByTestId('link--login')).toHaveLength(2); // Desktop + mobile
      expect(screen.queryByTestId('link--account')).not.toBeInTheDocument();
      expect(screen.queryByTestId('logout-icon')).not.toBeInTheDocument();
    });

    it('should handle empty pathname', () => {
      mockUsePathname.mockReturnValue('' as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      render(<Navbar user={null} />);

      // Should not crash and should render normally
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should handle very long pathnames', () => {
      const longPath = '/very/long/path/that/goes/on/and/on/and/on';
      mockUsePathname.mockReturnValue(longPath as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      render(<Navbar user={null} />);

      // Should not crash and should render normally
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should handle special characters in pathname', () => {
      mockUsePathname.mockReturnValue('/special-chars-!@#$%^&*()' as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      render(<Navbar user={null} />);

      // Should not crash and should render normally
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });

  describe('Performance Considerations', () => {
    it('should use priority loading for logo', () => {
      render(<Navbar user={null} />);

      const logoImages = screen.getAllByAltText('Little Lemon Logo');
      const desktopLogo = logoImages[0];

      expect(desktopLogo).toHaveAttribute('data-priority', 'true');
    });

    it('should not use priority loading for mobile logo', () => {
      render(<Navbar user={null} />);

      const logoImages = screen.getAllByAltText('Little Lemon Logo');
      const mobileLogo = logoImages[1];

      expect(mobileLogo).toHaveAttribute('data-priority', 'false');
    });

    it('should render language changer components efficiently', () => {
      render(<Navbar user={null} />);

      const languageChangers = screen.getAllByTestId('language-changer');
      expect(languageChangers).toHaveLength(2); // Desktop and mobile versions
    });
  });

  describe('Component Integration', () => {
    it('should integrate with NavigationMenu components', () => {
      render(<Navbar user={null} />);

      expect(screen.getByTestId('navigation-menu')).toBeInTheDocument();
      expect(screen.getByTestId('navigation-menu-list')).toBeInTheDocument();
      expect(screen.getAllByTestId('navigation-menu-item')).toHaveLength(13); // Desktop: 6 nav items + language changer, Mobile: 6 nav items
    });

    it('should integrate with Sheet components', () => {
      render(<Navbar user={null} />);

      expect(screen.getByTestId('sheet')).toBeInTheDocument();
      expect(screen.getByTestId('sheet-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
      expect(screen.getByTestId('sheet-header')).toBeInTheDocument();
      expect(screen.getByTestId('sheet-title')).toBeInTheDocument();
      expect(screen.getByTestId('sheet-description')).toBeInTheDocument();
    });

    it('should integrate with Button components', () => {
      render(<Navbar user={null} />);

      const buttons = screen.getAllByTestId('button');
      expect(buttons.length).toBeGreaterThan(0);

      // Menu button
      const menuButton = screen.getByRole('button', { name: 'Open menu' });
      expect(menuButton).toHaveAttribute('data-variant', 'ghost');
      expect(menuButton).toHaveAttribute('data-size', 'icon');
    });

    it('should integrate with LanguageChanger component', () => {
      render(<Navbar user={null} />);

      const languageChangers = screen.getAllByTestId('language-changer');
      expect(languageChangers).toHaveLength(2);
    });
  });

  describe('Authentication State Changes', () => {
    it('should update navigation when user logs in', () => {
      const { rerender } = render(<Navbar user={null} />);

      // Initially unauthenticated
      expect(screen.getAllByTestId('link--login')).toHaveLength(2); // Desktop + mobile
      expect(screen.queryByTestId('link--account')).not.toBeInTheDocument();

      // User logs in
      const mockUser: User = {
        id: 'test-user-id',
        email: 'test@example.com',
        aud: 'authenticated',
        role: 'authenticated',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
      };

      rerender(<Navbar user={mockUser} />);

      expect(screen.queryByTestId('link--login')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('link--account')).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByTestId('logout-icon')).toHaveLength(2); // Desktop + mobile
    });

    it('should update navigation when user logs out', () => {
      const mockUser: User = {
        id: 'test-user-id',
        email: 'test@example.com',
        aud: 'authenticated',
        role: 'authenticated',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
      };

      const { rerender } = render(<Navbar user={mockUser} />);

      // Initially authenticated
      expect(screen.queryByTestId('link--login')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('link--account')).toHaveLength(2); // Desktop + mobile

      // User logs out
      rerender(<Navbar user={null} />);

      expect(screen.getAllByTestId('link--login')).toHaveLength(2); // Desktop + mobile
      expect(screen.queryByTestId('link--account')).not.toBeInTheDocument();
      expect(screen.queryByTestId('logout-icon')).not.toBeInTheDocument();
    });
  });
});
