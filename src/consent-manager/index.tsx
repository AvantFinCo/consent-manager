import React, { PureComponent } from 'react'
import ConsentManagerBuilder from '../consent-manager-builder'
import Container from './container'
import { ADVERTISING_CATEGORIES, FUNCTIONAL_CATEGORIES } from './categories'
import {
  CategoryPreferences,
  Destination,
  ConsentManagerProps,
  PreferenceDialogTemplate
} from '../types'
import { loadPreferences } from '../consent-manager-builder/preferences'

const defaultCategoryPreferences: CategoryPreferences = {
  marketingAndAnalytics: true,
  advertising: true,
  functional: true
}

const defaultPreferencesDialogTemplate: PreferenceDialogTemplate = {
  headings: {
    allowValue: 'Allow',
    categoryValue: 'Category',
    purposeValue: 'Purpose',
    toolsValue: 'Tools'
  },
  checkboxes: {
    noValue: 'No',
    yesValue: 'Yes'
  },
  actionButtons: {
    cancelValue: 'Cancel',
    saveValue: 'Save'
  },
  cancelDialogButtons: {
    cancelValue: 'Yes, Cancel',
    backValue: 'Go Back'
  },
  categories: [
    {
      key: 'functional',
      name: 'Functional',
      description:
        'To monitor the performance of our site and to enhance your browsing experience.',
      example: ''
    },
    {
      key: 'marketing',
      name: 'Marketing and Analytics',
      description:
        'To understand user behavior in order to provide you with a more relevant browsing experience or personalize the content on our site.',
      example: ''
    },
    {
      key: 'advertising',
      name: 'Advertising',
      description:
        'To personalize and measure the effectiveness of advertising on our site and other websites.',
      example:
        'For example, we may serve you a personalized ad based on the pages you visited on our site.'
    },
    {
      key: 'essential',
      name: 'Essential',
      description: 'We use browser cookies that are necessary for the site to work as intended.',
      example:
        'For example, we store your website data collection preferences so we can honor them if you return to our site. You can disable these cookies in your browser settings but if you do the site may not work as intended.'
    }
  ]
}

function shouldRequireConsent() {
  const cookieValue = loadPreferences()
  return Object.keys(cookieValue).length === 0
}

export default class ConsentManager extends PureComponent<ConsentManagerProps, {}> {
  static displayName = 'ConsentManager'

  static defaultProps = {
    otherWriteKeys: [],
    shouldRequireConsent,
    implyConsentOnInteraction: false,
    onError: undefined,
    cookieDomain: undefined,
    cookieName: undefined,
    cookieExpires: undefined,
    cookieAttributes: {},
    customCategories: undefined,
    bannerActionsBlock: ({ changePreferences }) => {
      return (
        <div className="banner-actions">
          <button type="submit" className="manage-cookies" onClick={changePreferences}>
            Manage Cookies
          </button>
        </div>
      )
    },
    bannerHideCloseButton: false,
    bannerTextColor: '#000',
    bannerSubContent: '',
    bannerBackgroundColor: '#f9f9f9',
    preferencesDialogTitle: 'Website Data Collection Preferences',
    cancelDialogTitle: 'Are you sure you want to cancel?',
    defaultDestinationBehavior: 'disable',
    preferencesDialogTemplate: defaultPreferencesDialogTemplate,
    writeKey: '',
    bannerContent: (
      <span>
        This site uses cookies and related technologies, as described in our{' '}
        <a href="/privacy-policy/" target="_blank">
          General privacy policy
        </a>
        , for purposes that may include site operation, analytics, enhanced user experience, or
        cross-contextual behavioral advertising.
      </span>
    ),
    preferencesDialogContent:
      "We use data collected by cookies and related technologies for purposes that may include site operation, analytics, enhanced user experience or cross-contextual behavior advertising. In most cases, your opt-out preference will be tracked via a cookie, which means your selection is limited to the specific device and browser you're using during this visit to our website. If you visit this website from a different device or browser, change your browser settings, or if you clear your cookies, you may need to opt out again.",
    cancelDialogContent:
      'Your preferences have not been saved. By continuing to use our website, you՚re agreeing to our General Privacy Policy.'
  }

  render() {
    const {
      writeKey,
      otherWriteKeys,
      shouldRequireConsent,
      implyConsentOnInteraction,
      cookieDomain,
      cookieName,
      cookieExpires,
      cookieAttributes,
      bannerContent,
      bannerActionsBlock,
      bannerSubContent,
      bannerTextColor,
      bannerBackgroundColor,
      bannerHideCloseButton,
      bannerAsModal,
      preferencesDialogTitle,
      preferencesDialogContent,
      cancelDialogTitle,
      cancelDialogContent,
      customCategories,
      defaultDestinationBehavior,
      cdnHost,
      preferencesDialogTemplate,
      onError
    } = this.props

    return (
      <ConsentManagerBuilder
        onError={onError}
        writeKey={writeKey}
        otherWriteKeys={otherWriteKeys}
        shouldRequireConsent={shouldRequireConsent}
        cookieDomain={cookieDomain}
        cookieName={cookieName}
        cookieExpires={cookieExpires}
        cookieAttributes={cookieAttributes}
        initialPreferences={this.getInitialPreferences()}
        mapCustomPreferences={this.handleMapCustomPreferences}
        customCategories={customCategories}
        defaultDestinationBehavior={defaultDestinationBehavior}
        cdnHost={cdnHost}
      >
        {({
          destinations,
          customCategories,
          newDestinations,
          preferences,
          isConsentRequired,
          setPreferences,
          resetPreferences,
          saveConsent,
          havePreferencesChanged,
          workspaceAddedNewDestinations
        }) => {
          return (
            <Container
              customCategories={customCategories}
              destinations={destinations}
              newDestinations={newDestinations}
              preferences={preferences}
              isConsentRequired={isConsentRequired}
              setPreferences={setPreferences}
              resetPreferences={resetPreferences}
              saveConsent={saveConsent}
              closeBehavior={this.props.closeBehavior ?? 'accept'}
              implyConsentOnInteraction={
                implyConsentOnInteraction ?? ConsentManager.defaultProps.implyConsentOnInteraction
              }
              bannerContent={bannerContent ?? ConsentManager.defaultProps.bannerContent}
              bannerSubContent={bannerSubContent}
              bannerActionsBlock={bannerActionsBlock}
              bannerHideCloseButton={bannerHideCloseButton}
              bannerTextColor={bannerTextColor || ConsentManager.defaultProps.bannerTextColor}
              bannerBackgroundColor={
                bannerBackgroundColor ?? ConsentManager.defaultProps.bannerBackgroundColor
              }
              bannerAsModal={bannerAsModal}
              preferencesDialogTitle={preferencesDialogTitle}
              preferencesDialogContent={
                preferencesDialogContent ?? ConsentManager.defaultProps.preferencesDialogContent
              }
              cancelDialogTitle={cancelDialogTitle}
              cancelDialogContent={cancelDialogContent}
              havePreferencesChanged={havePreferencesChanged}
              defaultDestinationBehavior={defaultDestinationBehavior}
              workspaceAddedNewDestinations={workspaceAddedNewDestinations}
              preferencesDialogTemplate={
                preferencesDialogTemplate
                  ? this.mergeTemplates(preferencesDialogTemplate, defaultPreferencesDialogTemplate)
                  : ConsentManager.defaultProps.preferencesDialogTemplate
              }
            />
          )
        }}
      </ConsentManagerBuilder>
    )
  }

  mergeTemplates = (
    newProps: PreferenceDialogTemplate,
    defaultPreferencesDialogTemplate: PreferenceDialogTemplate
  ): PreferenceDialogTemplate => {
    const headingsMerge = {
      ...defaultPreferencesDialogTemplate.headings,
      ...newProps.headings
    }
    const checkboxesMerge = {
      ...defaultPreferencesDialogTemplate.checkboxes,
      ...newProps.checkboxes
    }
    const actionButtonsMerge = {
      ...defaultPreferencesDialogTemplate.actionButtons,
      ...newProps.actionButtons
    }
    const cancelDialogButtonsMerge = {
      ...defaultPreferencesDialogTemplate.cancelDialogButtons,
      ...newProps.cancelDialogButtons
    }
    const categoriesMerge = defaultPreferencesDialogTemplate?.categories!.map(category => ({
      ...category,
      ...newProps?.categories?.find(c => c.key === category.key)
    }))
    return {
      headings: headingsMerge,
      checkboxes: checkboxesMerge,
      actionButtons: actionButtonsMerge,
      cancelDialogButtons: cancelDialogButtonsMerge,
      categories: categoriesMerge
    }
  }

  getInitialPreferences = () => {
    const { initialPreferences, customCategories } = this.props
    if (initialPreferences) {
      return initialPreferences
    }

    if (!customCategories) {
      return defaultCategoryPreferences
    }

    const initialCustomPreferences = {}
    Object.keys(customCategories).forEach(category => {
      initialCustomPreferences[category] = null
    })

    return initialCustomPreferences
  }

  handleMapCustomPreferences = (destinations: Destination[], preferences: CategoryPreferences) => {
    const { customCategories } = this.props
    const destinationPreferences = {}
    const customPreferences = {}

    if (customCategories) {
      for (const preferenceName of Object.keys(customCategories)) {
        const value = preferences[preferenceName]
        if (typeof value === 'boolean' || typeof value === 'string') {
          customPreferences[preferenceName] = value
        } else {
          customPreferences[preferenceName] = true
        }
      }

      destinations.forEach(destination => {
        // Mark custom categories
        Object.entries(customCategories).forEach(([categoryName, { integrations }]) => {
          const consentAlreadySetToFalse = destinationPreferences[destination.id] === false
          const shouldSetConsent = integrations.includes(destination.id)
          if (shouldSetConsent && !consentAlreadySetToFalse) {
            destinationPreferences[destination.id] = customPreferences[categoryName]
          }
        })
      })

      return { destinationPreferences, customPreferences }
    }

    // Default unset preferences to true (for implicit consent)
    for (const preferenceName of Object.keys(preferences)) {
      const value = preferences[preferenceName]
      if (typeof value === 'boolean') {
        customPreferences[preferenceName] = value
      } else {
        customPreferences[preferenceName] = true
      }
    }

    const customPrefs = customPreferences as CategoryPreferences

    for (const destination of destinations) {
      // Mark advertising destinations
      if (
        ADVERTISING_CATEGORIES.find(c => c === destination.category) &&
        destinationPreferences[destination.id] !== false
      ) {
        destinationPreferences[destination.id] = customPrefs.advertising
      }

      // Mark function destinations
      if (
        FUNCTIONAL_CATEGORIES.find(c => c === destination.category) &&
        destinationPreferences[destination.id] !== false
      ) {
        destinationPreferences[destination.id] = customPrefs.functional
      }

      // Fallback to marketing
      if (!(destination.id in destinationPreferences)) {
        destinationPreferences[destination.id] = customPrefs.marketingAndAnalytics
      }
    }

    return { destinationPreferences, customPreferences }
  }
}
