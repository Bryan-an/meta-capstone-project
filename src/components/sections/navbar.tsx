'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Menu, LogOut } from 'lucide-react';
import { Link, pathnames } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { type User } from '@supabase/supabase-js';
import { signOut } from '@/app/auth/actions';

/**
 * Define the type for navigation items
 */
type NavItemLink = {
  /** Use the keys from the imported pathnames configuration */
  href: keyof typeof pathnames;
  /** We will fetch this using t() */
  label: string;
  /** Optional: Only show if user is authenticated */
  auth?: boolean;
  /** Optional: Only show if user is NOT authenticated */
  noAuth?: boolean;
  /** Optional: Action to perform on click, e.g., logout */
  action?: () => Promise<void>;
};

/** Props for the Navbar component */
interface NavbarProps {
  user: User | null;
}

/**
 * Navbar component for the Little Lemon site header.
 * Displays the logo and primary navigation links.
 * Conditionally renders auth-related links (Login, Logout, Account).
 *
 * @remarks
 * Uses Shadcn UI's NavigationMenu component and next-intl for localized routing.
 * Adheres to project structure and performance optimization rules.
 */
export function Navbar({ user }: NavbarProps) {
  const t = useTranslations('Navigation');
  const tAuth = useTranslations('AuthActions');
  const currentLocale = useLocale();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut(currentLocale);
    setIsMobileMenuOpen(false);
  };

  const navItems: NavItemLink[] = [
    { href: '/', label: t('home') },
    { href: '/about', label: t('about') },
    { href: '/menu', label: t('menu') },
    { href: '/reservations', label: t('reservations') },
    { href: '/order-online', label: t('orderOnline') },
    { href: '/account', label: t('account'), auth: true },
    { href: '/login', label: t('login'), noAuth: true },
  ];

  const createNavLink = (item: NavItemLink, isMobile: boolean = false) => {
    if ((item.auth && !user) || (item.noAuth && user)) {
      return null;
    }

    return (
      <NavigationMenuItem key={item.href} className="list-none">
        {isMobile ? (
          <SheetClose asChild>
            <Link
              href={item.href}
              className="text-foreground hover:bg-accent hover:text-accent-foreground focus:ring-ring rounded-md px-3 py-2 text-base font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          </SheetClose>
        ) : (
          <Link href={item.href} className={navigationMenuTriggerStyle()}>
            {item.label}
          </Link>
        )}
      </NavigationMenuItem>
    );
  };

  const createLogoutButton = (isMobile: boolean = false) => {
    if (!user) return null;

    const buttonContent = (
      <>
        <LogOut className="h-4 w-4" />
        {tAuth('signOutButtonText')}
      </>
    );

    if (isMobile) {
      return (
        <SheetClose asChild>
          <Button
            variant="ghost"
            className="text-foreground hover:bg-accent hover:text-accent-foreground focus:ring-ring w-full justify-start rounded-md px-3 py-2 text-base font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
            onClick={handleSignOut}
          >
            {buttonContent}
          </Button>
        </SheetClose>
      );
    }

    return (
      <NavigationMenuItem>
        <Button
          variant="ghost"
          className={navigationMenuTriggerStyle()}
          onClick={handleSignOut}
        >
          {buttonContent}
        </Button>
      </NavigationMenuItem>
    );
  };

  return (
    <header className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b px-4 backdrop-blur md:px-6">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between">
        {/* Logo */}
        <Link href="/" aria-label={t('homepageLinkAriaLabel')}>
          <Image
            src="/images/little-lemon-logo.webp"
            alt={t('logoAlt')}
            width={180}
            height={40}
            priority
            className="h-auto max-w-full"
            style={{ width: 'auto' }}
          />
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navItems.map((item) => createNavLink(item, false))}
            {createLogoutButton(false)}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Navigation Trigger & Sheet */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('openMenuAriaLabel')}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader className="text-left">
                <Link
                  href="/"
                  aria-label={t('homepageLinkAriaLabel')}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block"
                >
                  <Image
                    src="/images/little-lemon-logo.webp"
                    alt={t('logoAlt')}
                    width={150}
                    height={33}
                    priority={false}
                    className="h-auto"
                    style={{ width: 'auto' }}
                  />
                </Link>

                <SheetTitle className="sr-only">
                  {t('mobileNavTitle')}
                </SheetTitle>

                <SheetDescription className="sr-only">
                  {t('mobileNavDescription')}
                </SheetDescription>
              </SheetHeader>

              <Separator />

              <nav className="flex flex-col space-y-4 px-4 py-2">
                {navItems.map((item) => createNavLink(item, true))}
                {createLogoutButton(true)}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
