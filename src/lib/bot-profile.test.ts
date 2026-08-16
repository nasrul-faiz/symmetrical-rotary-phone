import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeConnectedBotProfile } from './bot-profile.ts'

test('prefers the connected WhatsApp display name and image over a generic number label', () => {
  const profile = normalizeConnectedBotProfile({
    displayName: 'Aisyah Rahman',
    phoneNumber: '60123456789',
    profileImageUrl: 'https://example.com/avatar.png',
  })

  assert.equal(profile.displayName, 'Aisyah Rahman')
  assert.equal(profile.phoneNumber, '60123456789')
  assert.equal(profile.profileImageUrl, 'https://example.com/avatar.png')
})

test('falls back to the connected number when display name is missing', () => {
  const profile = normalizeConnectedBotProfile({
    phoneNumber: '60123456789',
  })

  assert.equal(profile.displayName, 'WhatsApp 60123456789')
  assert.equal(profile.phoneNumber, '60123456789')
  assert.equal(profile.profileImageUrl, null)
})
