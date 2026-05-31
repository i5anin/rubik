/**
 * Keeps document <title>, <html lang> and the social-preview meta tags in sync
 * with the active language.
 *
 * The static tags in index.html cover crawlers that don't run JS and the
 * initial paint; this composable updates them reactively when the user
 * toggles RU ⇄ EN so the visible title and shared links always match.
 */

import { watchEffect } from 'vue'
import { lang, t } from '../i18n'

/** Create or update a <meta> tag, keyed by name or property attribute. */
function setMeta(key: string, content: string, attr: 'name' | 'property' = 'name'): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (el === null) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function useDocumentMeta(): void {
  watchEffect(() => {
    const title = t('meta.title')
    const description = t('meta.description')

    document.documentElement.lang = lang.value
    document.title = title

    setMeta('description', description)
    setMeta('og:title', title, 'property')
    setMeta('og:description', description, 'property')
    setMeta('og:locale', lang.value === 'ru' ? 'ru_RU' : 'en_US', 'property')
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)
  })
}
