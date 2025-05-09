'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { pathnames } from '@/i18n/routing';
import { Facebook, Instagram, Twitter } from 'lucide-react';

/**
 * Footer component for the Little Lemon site.
 * Displays logo, navigation, contact info, and social links.
 */
export function Footer() {
  const t = useTranslations('Footer');

  /** Footer navigation items */
  const footerNavItems: { href: keyof typeof pathnames; labelKey: string }[] = [
    { href: '/', labelKey: 'home' },
    { href: '/about', labelKey: 'about' },
    { href: '/menu', labelKey: 'menu' },
    { href: '/reservations', labelKey: 'reservations' },
    { href: '/order-online', labelKey: 'orderOnline' },
    { href: '/login', labelKey: 'login' },
  ];

  return (
    <footer className="bg-muted/40 border-t py-12">
      <div className="px-4 md:px-8 lg:px-16">
        <div className="container mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo Column */}
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" aria-label={t('homepageLinkAriaLabel')}>
              <Image
                src="/images/little-lemon-logo-footer.webp"
                alt={t('logoAlt')}
                width={120}
                height={160}
                className="mb-4 h-auto max-w-full"
                style={{ width: 'auto' }}
              />
            </Link>
          </div>

          {/* Navigation Column */}
          <div className="text-center md:text-left">
            <h3 className="mb-4 text-lg font-semibold">{t('navTitle')}</h3>
            <nav className="flex flex-col space-y-2">
              {footerNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t(item.labelKey)}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Column */}
          <div className="text-center md:text-left">
            <h3 className="mb-4 text-lg font-semibold">{t('contactTitle')}</h3>

            <address className="text-muted-foreground flex flex-col space-y-2 not-italic">
              <span>{t('addressPlaceholder')}</span>

              <a href="tel:+1234567890" className="hover:text-foreground">
                {t('phonePlaceholder')}
              </a>

              <a
                href="mailto:info@littlelemon.com"
                className="hover:text-foreground"
              >
                {t('emailPlaceholder')}
              </a>
            </address>
          </div>

          {/* Social Media Column */}
          <div className="text-center md:text-left">
            <h3 className="mb-4 text-lg font-semibold">{t('socialTitle')}</h3>

            <div className="flex justify-center space-x-4 md:justify-start">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('socialFacebookAria')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Facebook className="h-6 w-6" />
              </a>

              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('socialInstagramAria')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="h-6 w-6" />
              </a>

              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('socialTwitterAria')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t pt-6 text-center">
        <p className="text-muted-foreground text-sm">{t('copyright')}</p>
      </div>
    </footer>
  );
}
