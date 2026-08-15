import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MessageCircle, QrCode, RefreshCw, ShieldAlert, Wifi } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRegisterRefresh } from '@/contexts/RefreshContext'

type BotStatus = 'disabled' | 'starting' | 'qr' | 'pairing-phone' | 'pairing-code' | 'connected' | 'closed' | 'reconnecting' | 'logged-out' | 'error'

type BotStatePayload = {
  enabled: boolean
  status: BotStatus
  qr: string | null
  pairingMethod: 'qr' | 'phone' | null
  pairingPhoneNumber: string | null
  pairingCode: string | null
  updatedAt: string | null
  lastError: string | null
}

const QR_REFRESH_SECONDS = 20

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

export function BotDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState<BotStatePayload | null>(null)
  const [qrCountdownSecondsLeft, setQrCountdownSecondsLeft] = useState(QR_REFRESH_SECONDS)
  const [pairingMethod, setPairingMethod] = useState<'qr' | 'phone'>('qr')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [applyingPairing, setApplyingPairing] = useState(false)
  const [pairingMessage, setPairingMessage] = useState<string | null>(null)
  const qrValueRef = useRef<string | null>(null)

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
            const errorText = payload?.error || `Server returned ${response.status}`
            lastError = errorText
            continue
          }

          const nextState = payload.data as BotStatePayload
          setState(nextState)
          if (
            (nextState.status === 'pairing-phone' || nextState.status === 'pairing-code' || nextState.status === 'connected') &&
            (nextState.pairingMethod === 'qr' || nextState.pairingMethod === 'phone')
          ) {
            setPairingMethod(nextState.pairingMethod)
          }
          if (nextState.pairingPhoneNumber) {
            setPhoneNumber(nextState.pairingPhoneNumber)
          }
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

  const qrImageUrl = useMemo(() => {
    if (!state?.qr) return null
    return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(state.qr)}`
  }, [state?.qr])

  const isPhonePairing = state?.pairingMethod === 'phone' || state?.status === 'pairing-phone' || state?.status === 'pairing-code'
  const isConnected = state?.status === 'connected'
  const isPairingInProgress = state?.status === 'starting' || state?.status === 'qr' || state?.status === 'pairing-phone' || state?.status === 'pairing-code' || state?.status === 'reconnecting'
  const activePairingMethod = state?.pairingMethod ?? pairingMethod
  const isAlternatePairingMethod = (method: 'qr' | 'phone') => isConnected && activePairingMethod !== method
  const isPairingRequestLocked = applyingPairing || isPairingInProgress || isConnected

  const applyPairingSelection = useCallback(async () => {
    if (pairingMethod === 'phone' && !phoneNumber.trim()) {
      setPairingMessage('Sila masukkan nombor telefon sebelum teruskan.')
      return
    }

    try {
      setApplyingPairing(true)
      setPairingMessage(null)
      const endpoint = '/api/bot/pairing'
      const target = token ? `${endpoint}?token=${encodeURIComponent(token)}` : endpoint
      const response = await fetch(target, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'x-bot-dashboard-token': token } : {}),
        },
        body: JSON.stringify({
          pairingMethod,
          phoneNumber: phoneNumber.trim(),
        }),
      })

      const contentType = response.headers.get('content-type') || ''
      const payload = contentType.includes('application/json')
        ? await response.json()
        : { success: false, error: await response.text() }

      if (!response.ok || payload?.success !== true) {
        throw new Error(payload?.error || 'Gagal apply pilihan pairing')
      }

      setPairingMessage(pairingMethod === 'phone' ? 'Kaedah phone number disimpan.' : 'Kaedah QR disimpan.')
      await fetchStatus()
    } catch (err) {
      setPairingMessage(err instanceof Error ? err.message : 'Gagal apply pilihan pairing')
    } finally {
      setApplyingPairing(false)
    }
  }, [fetchStatus, pairingMethod, phoneNumber, token])

  useEffect(() => {
    const isQrMode = state?.status === 'qr' && Boolean(state?.qr) && !isPhonePairing

    if (!isQrMode) {
      qrValueRef.current = null
      setQrCountdownSecondsLeft(QR_REFRESH_SECONDS)
      return
    }

    const currentQr = state?.qr ?? null
    if (currentQr && currentQr !== qrValueRef.current) {
      qrValueRef.current = currentQr
      setQrCountdownSecondsLeft(QR_REFRESH_SECONDS)
    }

    const countdownTimer = window.setInterval(() => {
      setQrCountdownSecondsLeft((prev) => {
        if (prev <= 1) {
          return QR_REFRESH_SECONDS
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      window.clearInterval(countdownTimer)
    }
  }, [state?.status, state?.qr, isPhonePairing])

  return (
    <div className="flex flex-1 min-h-0 flex-col p-3 md:p-4 lg:p-5">
      <div className="mx-auto w-full max-w-4xl rounded-2xl border border-border bg-card/95 p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-lg font-bold text-foreground md:text-xl">
              <MessageCircle className="size-4 text-primary" />
              Account
            </h1>
            <p className="mt-1 text-[11px] text-muted-foreground md:text-xs">
              Connection state, QR pairing, and pairing code login.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${state ? statusClass(state.status) : 'text-muted-foreground border-border bg-muted/30'}`}>
              {state ? STATUS_LABEL[state.status] : 'Unknown'}
            </span>
            <Button type="button" variant="outline" size="sm" onClick={() => void fetchStatus()} className="h-8 gap-1.5 px-2.5 text-[11px]">
              <RefreshCw className="size-3.5" /> Refresh
            </Button>
          </div>
        </div>

        <div className="mt-4 inline-flex w-full gap-1 rounded-xl border border-border bg-muted/25 p-1">
          <button
            type="button"
            onClick={() => setPairingMethod('qr')}
            disabled={isAlternatePairingMethod('qr')}
            className={`flex-1 rounded-lg px-3 py-2 text-[11px] font-medium transition-all ${pairingMethod === 'qr' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            QR Code
          </button>
          <button
            type="button"
            onClick={() => setPairingMethod('phone')}
            disabled={isAlternatePairingMethod('phone')}
            className={`flex-1 rounded-lg px-3 py-2 text-[11px] font-medium transition-all ${pairingMethod === 'phone' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            Phone Number
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className={`${pairingMethod === 'qr' ? '' : 'hidden'} rounded-2xl border border-dashed border-border bg-muted/20 p-4`}>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading bot status...</p>
            ) : error ? (
              <div className="text-center">
                <ShieldAlert className="mx-auto mb-2 size-7 text-red-500" />
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">Unable to fetch bot status</p>
                <p className="mt-1 text-[11px] text-muted-foreground break-words">{error}</p>
              </div>
            ) : state?.status === 'connected' ? (
              <div className="space-y-2 text-center">
                <Wifi className="mx-auto size-7 text-emerald-600 dark:text-emerald-400" />
                <p className="text-base font-semibold">WhatsApp connected</p>
                <p className="text-[11px] text-muted-foreground">Session is active. QR code is not needed right now.</p>
              </div>
            ) : qrImageUrl && !isPhonePairing ? (
              <div className="space-y-3 text-center">
                <img src={qrImageUrl} alt="WhatsApp QR" className="mx-auto h-[220px] w-[220px] max-w-full rounded-xl bg-white p-2 shadow-sm" />
                <p className="text-[11px] text-muted-foreground">
                  Scan this QR code from WhatsApp to connect the bot. QR will refresh in {qrCountdownSecondsLeft}s.
                </p>
                <ol className="mx-auto max-w-md space-y-1 text-left text-[11px] text-muted-foreground pl-5 list-decimal">
                  <li>Open WhatsApp on your phone.</li>
                  <li>Tap Settings &gt; Linked Devices.</li>
                  <li>Tap Link a Device and scan the QR code.</li>
                </ol>
              </div>
            ) : (
              <div className="space-y-2 text-center">
                <QrCode className="mx-auto size-7 text-muted-foreground/70" />
                <p className="text-sm font-semibold">QR will appear here</p>
                <p className="text-[11px] text-muted-foreground">The QR is generated automatically when the bot needs to reconnect.</p>
              </div>
            )}
          </div>

          <div className={`${pairingMethod === 'phone' ? '' : 'hidden'} rounded-2xl border border-border bg-muted/20 p-4`}>
            <div className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="pairingPhone" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Phone Number</label>
                <Input
                  id="pairingPhone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="60123456789"
                  className="h-10 rounded-xl border-0 bg-background/80 text-[12px] shadow-inner"
                />
                <p className="text-[10px] text-muted-foreground">Enter your WhatsApp number with country code, no + or spaces.</p>
              </div>

              <Button
                type="button"
                className="h-10 w-full rounded-xl text-[11px] font-semibold"
                onClick={() => void applyPairingSelection()}
                disabled={isPairingRequestLocked}
              >
                {applyingPairing ? 'Requesting pairing code...' : 'Get Pairing Code'}
              </Button>

              {pairingMessage ? (
                <p className="text-[10px] text-muted-foreground">{pairingMessage}</p>
              ) : null}

              {(state?.status === 'pairing-code' || state?.status === 'pairing-phone') && state?.pairingCode ? (
                <div className="rounded-xl border border-border bg-background p-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Your pairing code</p>
                  <p className="mt-2 text-2xl font-bold tracking-[0.12em] text-foreground">{state.pairingCode}</p>
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    Open WhatsApp on your phone → Linked Devices → Link with phone number, then enter this code.
                  </p>
                </div>
              ) : null}

              {state?.status === 'pairing-phone' && !state.pairingCode ? (
                <div className="rounded-xl border border-border bg-background p-3 text-center text-[11px] text-muted-foreground">
                  Waiting for WhatsApp to generate your pairing code...
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Connection status</p>
          <div className="mt-2 grid gap-2 text-[11px] text-muted-foreground sm:grid-cols-2">
            <p>Enabled: {state?.enabled ? 'Yes' : 'No'}</p>
            <p>Updated: {state?.updatedAt ? new Date(state.updatedAt).toLocaleString() : '-'}</p>
            <p>Pairing method: {state?.pairingMethod === 'phone' ? 'Phone Number' : state?.pairingMethod === 'qr' ? 'QR Code' : '-'}</p>
            <p>Phone number: {state?.pairingPhoneNumber || '-'}</p>
            <p className="sm:col-span-2">Last error: {state?.lastError ?? '-'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
