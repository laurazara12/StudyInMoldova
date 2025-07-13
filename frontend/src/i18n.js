import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importă traducerile pentru pagina About
import aboutRO from './views/about/locales/ro/about.json';
import aboutEN from './views/about/locales/en/about.json';
import aboutFR from './views/about/locales/fr/about.json';
import aboutDE from './views/about/locales/de/about.json';
import aboutRU from './views/about/locales/ru/about.json';

// Importă traducerile pentru pagina About
import ctaRO from './views/landing/locales/ro/cta.json';
import ctaEN from './views/landing/locales/en/cta.json';
import ctaFR from './views/landing/locales/fr/cta.json';
import ctaDE from './views/landing/locales/de/cta.json';
import ctaRU from './views/landing/locales/ru/cta.json';

import landingRO from './views/landing/locales/ro/landing.json';
import landingEN from './views/landing/locales/en/landing.json';
import landingFR from './views/landing/locales/fr/landing.json';
import landingDE from './views/landing/locales/de/landing.json';
import landingRU from './views/landing/locales/ru/landing.json';

// Importă traducerile pentru pagina Universities
import universitiesRO from './views/universities/locales/ro.json';
import universitiesEN from './views/universities/locales/en.json';
import universitiesFR from './views/universities/locales/fr.json';
import universitiesDE from './views/universities/locales/de.json';
import universitiesRU from './views/universities/locales/ru.json';

// Importă traducerile pentru pagina Terms
import termsRO from './views/terms/locales/ro.json';
import termsEN from './views/terms/locales/en.json';
import termsFR from './views/terms/locales/fr.json';
import termsDE from './views/terms/locales/de.json';
import termsRU from './views/terms/locales/ru.json';

// Importă traducerile pentru pagina Privacy
import privacyRO from './views/privacy/locales/ro.json';
import privacyEN from './views/privacy/locales/en.json';
import privacyFR from './views/privacy/locales/fr.json';
import privacyDE from './views/privacy/locales/de.json';
import privacyRU from './views/privacy/locales/ru.json';

// Importă traducerile pentru pagina Living in Moldova
import livingInMoldovaRO from './views/living-in-moldova/locales/ro.json';
import livingInMoldovaEN from './views/living-in-moldova/locales/en.json';
import livingInMoldovaFR from './views/living-in-moldova/locales/fr.json';
import livingInMoldovaDE from './views/living-in-moldova/locales/de.json';
import livingInMoldovaRU from './views/living-in-moldova/locales/ru.json';

// Importă traducerile pentru pagina Documents
import documentsRO from './views/documents/locales/ro/documents.json';
import documentsEN from './views/documents/locales/en/documents.json';
import documentsFR from './views/documents/locales/fr/documents.json';
import documentsDE from './views/documents/locales/de/documents.json';
import documentsRU from './views/documents/locales/ru/documents.json';

// Configurare resurse pentru traduceri
const resources = {
  ro: {
    about: aboutRO,
    universities: universitiesRO,
    terms: termsRO,
    privacy: privacyRO,
    livingInMoldova: livingInMoldovaRO,
    cta: ctaRO,
    landing: landingRO,
    documents: documentsRO
  },
  en: {
    about: aboutEN,
    universities: universitiesEN,
    terms: termsEN,
    privacy: privacyEN,
    livingInMoldova: livingInMoldovaEN,
    cta: ctaEN,
    landing: landingEN,
    documents: documentsEN
  },
  de: {
    about: aboutDE,
    universities: universitiesDE,
    terms: termsDE,
    privacy: privacyDE,
    livingInMoldova: livingInMoldovaDE,
    cta: ctaDE,
    landing: landingDE,
    documents: documentsDE
  },
  ru: {
    about: aboutRU,
    universities: universitiesRU,
    terms: termsRU,
    privacy: privacyRU,
    livingInMoldova: livingInMoldovaRU,
    cta: ctaRU,
    landing: landingRU,
    documents: documentsRU
  },
  fr: {
    about: aboutFR,
    universities: universitiesFR,
    terms: termsFR,
    privacy: privacyFR,
    livingInMoldova: livingInMoldovaFR,
    cta: ctaFR,
    landing: landingFR,
    documents: documentsFR
  }
};

// Configurare i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false
    },
    ns: ['about', 'universities','landing', 'terms', 'privacy', 'livingInMoldova', 'cta', 'documents'],
    defaultNS: 'about',
    react: {
      useSuspense: false
    }
  });

export default i18n; 