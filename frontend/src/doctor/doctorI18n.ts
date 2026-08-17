import { computed, inject, provide, type Ref } from 'vue'

export type DoctorLocale = 'ZH' | 'EN'
export type DoctorTranslationParams = Record<string, string | number | null | undefined>

const doctorLocaleKey = Symbol('doctor-locale')

export function provideDoctorLocale(locale: Ref<DoctorLocale>) {
  provide(doctorLocaleKey, locale)
}

export function translateDoctorText(
  locale: DoctorLocale,
  zh: string,
  en: string,
  params: DoctorTranslationParams = {}
): string {
  const template = locale === 'EN' ? en : zh
  return Object.entries(params).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, value == null ? '' : String(value)),
    template
  )
}

export function useDoctorI18n() {
  const injectedLocale = inject<Ref<DoctorLocale>>(doctorLocaleKey)
  if (!injectedLocale) throw new Error('Doctor locale provider is missing')
  const locale: Ref<DoctorLocale> = injectedLocale

  const isEnglish = computed(() => locale.value === 'EN')
  const languageTag = computed(() => isEnglish.value ? 'en-US' : 'zh-CN')

  function t(zh: string, en: string, params: DoctorTranslationParams = {}): string {
    return translateDoctorText(locale.value, zh, en, params)
  }

  return { locale, isEnglish, languageTag, t }
}
