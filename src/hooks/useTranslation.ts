import { useAppStore } from '../store/useAppStore'
import { translations, type TranslationKey } from '../i18n/translations'

export function useTranslation() {
  const language = useAppStore(s => s.language)

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key
  }

  return { t, language }
}
