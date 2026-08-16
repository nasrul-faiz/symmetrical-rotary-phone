import { useCallback, useEffect, useMemo, useState } from 'react'
import { MessageCircle, RefreshCw, UserRound, Phone, Activity, Link2, CircleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRegisterRefresh } from '@/contexts/RefreshContext'
import { normalizeConnectedBotProfile } from '@/lib/bot-profile'

type BotStatus = 'disabled' | 'starting' | 'qr' | 'pairing-phone' | 'pairing-code' | 'connected' | 'closed' | 'reconnecting' | 'logged-out' | 'error'

type BotStatePayload = {
  enabled: boolean
  status: BotStatus
  qr: string | null
  pairingMethod: 'qr' | 'phone' | null
  pairingPhoneNumber: string | null
  connectedPhoneNumber: string | null
  displayName: string | null
  profileImageUrl: string | null
  pairingCode: string | null
  updatedAt: string | null
  lastError: string | null
}

const STATUS_LABEL: Record<BotStatus, string> = {
  disabled: 'Disabled',
  starting: 'Starting',
  qr: 'Waiting QR Scan',
  'pairing-phone': 'Pairing Phone',
  'pairing-code': 'Pairing Code Ready',
  connected: 'Connected',
  closed: 'Connection Closed',
  reconnecting: 'Reconnecting',
  'logged-out': 'Logged Out',
  error: 'Error',
}

function statusClass(status: BotStatus): string {
  if (status === 'connected') return 'text-emerald-600 dark:text-emerald-400'
  if (status === 'error' || status === 'logged-out') return 'text-red-600 dark:text-red-400'
  return 'text-amber-600 dark:text-amber-400'
}

export function BotProfile() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState<BotStatePayload | null>(null)
  const token = useMemo(() => {
    const value = new URLSearchParams(window.location.search).get('token')
    return value?.trim() || ''
  }, [])

  const fetchStatus = useCallback(async () => {
    const endpoints = ['/bot/status', '/api/bot-status']
    let lastError = 'Failed to fetch bot status'

    try {
      setError(null)
      for (const endpoint of endpoints) {
        const target = token ? `${endpoint}?token=${encodeURIComponent(token)}` : endpoint
        try {
          const response = await fetch(target, {
            headers: token ? { 'x-bot-dashboard-token': token } : undefined,
          })
          const contentType = response.headers.get('content-type') || ''
          const payload = contentType.includes('application/json')
            ? await response.json()
            : { success: false, error: await response.text() }

          if (!response.ok || !payload?.success || !payload?.data) {
            lastError = payload?.error || `Server returned ${response.status}`
            continue
          }

          setState(payload.data as BotStatePayload)
          setError(null)
          return
        } catch (err) {
          lastError = err instanceof Error ? err.message : 'Failed to fetch bot status'
        }
      }
      setError(lastError)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch bot status'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useRegisterRefresh(fetchStatus)

  useEffect(() => {
    void fetchStatus()
    const timer = window.setInterval(() => {
      void fetchStatus()
    }, 1500)
    return () => window.clearInterval(timer)
  }, [fetchStatus])

  const connectedPhone = state?.connectedPhoneNumber || state?.pairingPhoneNumber || '-'
  const profile = normalizeConnectedBotProfile({
    displayName: state?.displayName,
    phoneNumber: connectedPhone === '-' ? null : connectedPhone,
    profileImageUrl: state?.profileImageUrl,
  })
  const displayName = profile.displayName
  const aboutText = state?.enabled
    ? 'Manage your bot profile, account settings, and command behavior.'
    : 'Bot is disabled. Enable WhatsApp bot and connect to continue.'
  const isOnline = state?.status === 'connected'
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('') || 'WA'
  const avatarTone = isOnline
    ? 'from-emerald-500 via-emerald-500 to-emerald-700 dark:from-emerald-400 dark:via-emerald-500 dark:to-emerald-700'
    : 'from-slate-300 via-slate-400 to-slate-500 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900'

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3 p-3 md:p-4 lg:p-5">
      <div className="rounded-2xl border border-border/70 bg-card/90 p-3 md:p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:gap-0 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="text-base md:text-lg font-bold flex items-center gap-2">
              <MessageCircle className="size-4.5 text-primary" />
              Profile
            </h1>
            <p className="mt-1 text-[11px] md:text-xs text-muted-foreground">
              View WhatsApp connection details and the currently linked number.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => void fetchStatus()} className="gap-1.5 shrink-0 h-8 px-2.5 text-[11px]">
            <RefreshCw className="size-3.5" /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-3">
        <article className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
          <div className="rounded-xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-background px-4 py-5 md:px-5 md:py-6">
            <div className="flex items-center gap-4">
              <div className={`relative h-16 w-16 shrink-0 rounded-full border border-border/60 bg-gradient-to-br ${avatarTone} shadow-sm ring-4 ring-background flex items-center justify-center overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10" />
                {profile.profileImageUrl ? (
                  <img src={profile.profileImageUrl} alt={displayName} className="relative h-full w-full object-cover" />
                ) : (
                  <span className="relative text-lg font-bold text-white drop-shadow-sm">{initials}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-lg md:text-xl font-bold leading-tight truncate">{displayName}</p>
                <p className="mt-1 text-xs text-muted-foreground max-w-[58ch]">{aboutText}</p>
                <div className={`mt-2 inline-flex items-center gap-2 text-xs font-semibold ${isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  <span className={`size-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  WhatsApp {isOnline ? 'connected' : 'offline'}
                </div>
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
          <p className="text-sm font-semibold">Profile Summary</p>
          <p className="text-[11px] text-muted-foreground mt-1">Quick glance for connected WhatsApp account.</p>

          <div className="mt-3 divide-y divide-border/60 rounded-xl border border-border/60 bg-background/70 text-sm">
            <div className="flex items-center justify-between gap-2 px-3 py-2.5">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground"><UserRound className="size-3.5" /> Display Name</span>
              <strong className="text-foreground">{displayName}</strong>
            </div>
            <div className="flex items-center justify-between gap-2 px-3 py-2.5">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Phone className="size-3.5" /> Phone Number</span>
              <strong className="text-foreground">{connectedPhone}</strong>
            </div>
            <div className="flex items-center justify-between gap-2 px-3 py-2.5">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Activity className="size-3.5" /> Connection</span>
              <strong className={state ? statusClass(state.status) : 'text-muted-foreground'}>{state ? STATUS_LABEL[state.status] : 'Unknown'}</strong>
            </div>
            <div className="flex items-center justify-between gap-2 px-3 py-2.5">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Link2 className="size-3.5" /> Pairing Method</span>
              <strong className="text-foreground">{state?.pairingMethod ? (state.pairingMethod === 'phone' ? 'Phone number' : 'QR code') : '-'}</strong>
            </div>
          </div>
        </article>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
        <div className="grid gap-3">
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-3 text-sm text-muted-foreground">
            <p className="font-semibold text-[11px] uppercase tracking-[0.18em]">Notes</p>
            <p className="mt-2">This page follows profile home style and summarizes the connected account. Use Account page for QR and pairing actions.</p>
          </div>

          <div className="rounded-xl border border-border bg-background px-4 py-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.18em]">Last Updated</p>
            <p className="mt-1 text-sm text-foreground">{state?.updatedAt ? new Date(state.updatedAt).toLocaleString() : '-'}</p>
          </div>

          {state?.lastError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p className="font-semibold inline-flex items-center gap-1.5"><CircleAlert className="size-4" /> Last Error</p>
              <p className="mt-1 text-[11px]">{state.lastError}</p>
            </div>
          ) : null}

          {loading ? (
            <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <RefreshCw className="size-4 animate-spin" />
              </span>
              Loading current status...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p className="font-semibold">Unable to load profile</p>
              <p className="mt-1 text-[11px]">{error}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
