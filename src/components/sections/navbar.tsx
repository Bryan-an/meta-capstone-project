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
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Menu } from 'lucide-react';
import { Link, pathnames } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

/**
 * Define the type for navigation items
 */
type NavItem = {
  /** Use the keys from the imported pathnames configuration */
  href: keyof typeof pathnames;
  /** We will fetch this using t() */
  label: string;
};

/**
 * Navbar component for the Little Lemon site header.
 * Displays the logo and primary navigation links.
 *
 * @remarks
 * Uses Shadcn UI's NavigationMenu component and next-intl for localized routing.
 * Adheres to project structure and performance optimization rules.
 */
export function Navbar() {
  const t = useTranslations('Navigation');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /**
   * Define navigation items using the corrected type
   * We map the labels here using t() for clarity
   */
  const navItems: NavItem[] = [
    { href: '/', label: t('home') },
    { href: '/about', label: t('about') },
    { href: '/menu', label: t('menu') },
    { href: '/reservations', label: t('reservations') },
    { href: '/order-online', label: t('orderOnline') },
    { href: '/login', label: t('login') },
  ];

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
            className="h-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <Link href={item.href} className={navigationMenuTriggerStyle()}>
                  {item.label}
                </Link>
              </NavigationMenuItem>
            ))}
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
                  />
                </Link>

                <SheetTitle className="sr-only">
                  {t('mobileNavTitle')}
                </SheetTitle>
              </SheetHeader>

              <Separator />

              <nav className="flex flex-col space-y-2 px-4 py-2">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className="text-foreground hover:bg-accent hover:text-accent-foreground focus:ring-ring rounded-md px-3 py-2 text-base font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
