'use client';

import { useRouter, usePathname } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * A client component that allows the user to change the application language.
 *
 * It uses `useRouter` and `usePathname` from `next-intl`'s navigation utilities
 * to switch locales while preserving the current path.
 * The current locale is obtained using `useLocale` from `next-intl`.
 * It renders a styled Select component from shadcn/ui.
 */
export function LanguageChanger() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const t = useTranslations('LocaleSwitcher');

  const handleChange = (newLocale: string) => {
    router.push(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="language-select" className="sr-only">
        {t('changeLanguageLabel')}
      </Label>

      <Select
        value={currentLocale}
        onValueChange={handleChange}
        name="language-select"
        aria-label={t('changeLanguageLabel')}
      >
        <SelectTrigger className="w-auto min-w-[120px] border-0 bg-transparent shadow-none focus:ring-0 focus:ring-offset-0">
          <Globe className="h-4 w-4" />
          <SelectValue placeholder={t('changeLanguageLabel')} />
        </SelectTrigger>

        <SelectContent align="end">
          <SelectItem value="en">{t('english')}</SelectItem>
          <SelectItem value="es">{t('spanish')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
