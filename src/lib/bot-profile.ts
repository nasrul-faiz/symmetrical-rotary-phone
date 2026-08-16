export type ConnectedBotProfile = {
  displayName: string
  phoneNumber: string | null
  profileImageUrl: string | null
}

type RawConnectedBotProfile = {
  displayName?: string | null
  phoneNumber?: string | null
  profileImageUrl?: string | null
}

export function normalizeConnectedBotProfile(raw: RawConnectedBotProfile | null | undefined): ConnectedBotProfile {
  const safeDisplayName = String(raw?.displayName || '').trim()
  const safePhoneNumber = String(raw?.phoneNumber || '').trim()
  const safeImageUrl = String(raw?.profileImageUrl || '').trim()

  const phoneNumber = safePhoneNumber || null
  const displayName = safeDisplayName || (phoneNumber ? `WhatsApp ${phoneNumber}` : 'WhatsApp Account')

  return {
    displayName,
    phoneNumber,
    profileImageUrl: safeImageUrl || null,
  }
}
