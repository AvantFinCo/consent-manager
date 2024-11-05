import React from 'react'
import ReactDOM from 'react-dom'
import inEU from '@segment/in-eu'
import inRegions from '@segment/in-regions'
import { ConsentManager, openConsentManager, doNotTrack } from '.'
import { ConsentManagerProps, WindowWithConsentManagerConfig, ConsentManagerInput } from './types'
import * as preferences from './consent-manager-builder/preferences'

export const version = process.env.VERSION
export { openConsentManager, doNotTrack, inEU, preferences }

let props: Partial<ConsentManagerInput> = {}
let containerRef: string | undefined

const localWindow = window as WindowWithConsentManagerConfig

if (localWindow.consentManagerConfig && typeof localWindow.consentManagerConfig === 'function') {
  props = localWindow.consentManagerConfig({
    React,
    version,
    openConsentManager,
    doNotTrack,
    inEU,
    preferences,
    inRegions
  })
  containerRef = props.container
} else {
  throw new Error(`window.consentManagerConfig should be a function`)
}

if (!containerRef) {
  throw new Error('ConsentManager: container is required')
}

const container = document.querySelector(containerRef)
if (!container) {
  throw new Error('ConsentManager: container not found')
}

ReactDOM.render(<ConsentManager {...(props as ConsentManagerProps)} />, container)
