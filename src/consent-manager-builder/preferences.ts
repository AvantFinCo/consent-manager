// TODO: remove duplicate cookie library from bundle
import cookies, { CookieAttributes } from 'js-cookie'
import topDomain from '@segment/top-domain'
import { Preferences, CategoryPreferences } from '../types'
import { EventEmitter } from 'events'

const DEFAULT_COOKIE_NAME = 'tracking-preferences'
const COOKIE_DEFAULT_EXPIRES = 365

export interface PreferencesManager {
  loadPreferences(cookieName?: string): Preferences
  onPreferencesSaved(listener: (prefs: Preferences) => void): void
  savePreferences(prefs: SavePreferences): void
}

// TODO: harden against invalid cookies
// TODO: harden against different versions of cookies
export function loadPreferences(cookieName?: string): Preferences {
  const preferences = cookies.getJSON(cookieName || DEFAULT_COOKIE_NAME)

  if (!preferences) {
    return {}
  }

  return {
    destinationPreferences: preferences.destinations as CategoryPreferences,
    customPreferences: preferences.custom as CategoryPreferences
  }
}

type SavePreferences = Preferences & {
  cookieDomain?: string
  cookieName?: string
  cookieExpires?: number
  cookieAttributes?: CookieAttributes
}

const emitter = new EventEmitter()

/**
 * Subscribes to consent preferences changing over time and returns
 * a cleanup function that can be invoked to remove the instantiated listener.
 *
 * @param listener a function to be invoked when ConsentPreferences are saved
 */
export function onPreferencesSaved(listener: (prefs: Preferences) => void) {
  emitter.on('preferencesSaved', listener)
  return () => emitter.off('preferencesSaved', listener)
}
type CookieConsentChoices = [string, string[], string?, (() => void)?][]

interface WindowWithCookiesList extends Window {
  cookieConsentChoices?: CookieConsentChoices | undefined
}

function shouldRemoveCookie(preference: string, preferences: Preferences): boolean {
  switch (preference) {
    case 'advertising':
      return preferences.customPreferences?.advertising === false
    case 'functional':
      return preferences.customPreferences?.functional === false
    case 'marketingAndAnalytics':
      return preferences.customPreferences?.marketingAndAnalytics === false
    default:
      return false
  }
}

export function deleteCookiesOnPreferencesChange(preferences: Preferences, initial = false) {
  const wd = window as WindowWithCookiesList

  if (!wd.cookieConsentChoices) {
    return
  }
  const cookiesNames = Object.keys(cookies.get())
  wd.cookieConsentChoices.forEach(([preference, names, domain, callback]) => {
    if (!preference || !names) {
      return
    }

    if (!domain) {
      domain = topDomain(window.location.href)
    }
    let shouldReload = false
    names.forEach(name => {
      let cookiesRemoved = 0
      const matchingNames = cookiesNames.filter(cookieName => cookieName.startsWith(name))
      matchingNames.forEach(cookieName => {
        if (shouldRemoveCookie(preference, preferences)) {
          cookies.remove(cookieName, { domain })
          shouldReload = true
          cookiesRemoved++
        }
      })
      if (callback && cookiesRemoved > 0) {
        callback()
      }
    })
    if (shouldReload && !initial) {
      window.location.reload()
    }
  })
}

function matchDestinationsToCurrentCookieValue(preferences: CategoryPreferences | undefined) {
  return {
    'Facebook Pixel': preferences?.advertising,
    'Google AdWords New': preferences?.advertising,
    Heap: preferences?.marketingAndAnalytics
  }
}

export function savePreferences({
  destinationPreferences,
  customPreferences,
  cookieDomain,
  cookieName,
  cookieExpires,
  cookieAttributes = {}
}: SavePreferences) {
  const domain = cookieDomain || topDomain(window.location.href)
  const expires = cookieExpires || COOKIE_DEFAULT_EXPIRES
  const value = {
    version: 1,
    destinations: matchDestinationsToCurrentCookieValue(customPreferences),
    custom: customPreferences
  }

  cookies.set(cookieName || DEFAULT_COOKIE_NAME, value, {
    expires,
    domain,
    ...cookieAttributes
  })

  deleteCookiesOnPreferencesChange({ destinationPreferences, customPreferences })

  emitter.emit('preferencesSaved', {
    destinationPreferences,
    customPreferences
  })
}
