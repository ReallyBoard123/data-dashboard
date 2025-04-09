// store/useI18nStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Locale = 'en' | 'de';

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => {
        set({ locale });
      },
    }),
    {
      name: 'time-series-i18n-storage',
    }
  )
);