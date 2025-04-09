// components/language-switcher.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useI18nStore } from '@/store/useI18nStore';
import { Button } from '@/components/ui/button';
import { IconLanguage } from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageSwitcher() {
  const router = useRouter();
  const { locale, setLocale } = useI18nStore();
  
  const handleLocaleChange = (newLocale: 'en' | 'de') => {
    // Update store
    setLocale(newLocale);
    
    // Navigate to the same route but with different locale
    const currentPath = window.location.pathname;
    const currentLocale = currentPath.split('/')[1];
    
    // Check if current path already has a locale
    if (['en', 'de'].includes(currentLocale)) {
      const newPath = currentPath.replace(`/${currentLocale}`, `/${newLocale}`);
      router.push(newPath);
    } else {
      router.push(`/${newLocale}${currentPath}`);
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <IconLanguage className="h-5 w-5" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleLocaleChange('en')}
          className={locale === 'en' ? 'bg-accent' : ''}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLocaleChange('de')}
          className={locale === 'de' ? 'bg-accent' : ''}
        >
          Deutsch
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}