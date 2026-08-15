import { useCallback, useEffect, useMemo, useState } from "react"
import { BellRing, CalendarClock, Pencil, Plus, Save, Trash2, PhoneCall } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { mergeReminderTargetChats } from "@/components/bot-reminder-utils"

type ReminderItem = {
  id: string
  name: string
  date: string
  time: string
  earlyDays: number[]
  sentOffsets?: number[]
  targetChats?: string[]
  createdAt?: string
  updatedAt?: string
}

type ReminderDraft = {
  name: string
  date: string
  time: string
  earlyDays: string
  targetChats: string
}

const EMPTY_DRAFT: ReminderDraft = {
  name: "",
  date: "",
  time: "00:00",
  earlyDays: "10",
  targetChats: "",
}

function normalizeEarlyDaysInput(value: string): number[] {
  const output: number[] = []
  const parts = String(value || "").split(/[\s,]+/)
  for (const part of parts) {
    const num = Number(part)
    if (!Number.isFinite(num)) continue
    const normalized = Math.max(0, Math.floor(num))
    if (!output.includes(normalized)) output.push(normalized)
  }
  if (output.length === 0) return [10]
  return output.sort((a, b) => b - a)
}

function formatDate(date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return date
  const [year, month, day] = date.split("-")
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const monthLabel = monthNames[Number(month) - 1] || month
  return `${Number(day)} ${monthLabel} ${year}`
}

export function BotReminder() {
  const [items, setItems] = useState<ReminderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [draft, setDraft] = useState<ReminderDraft>(EMPTY_DRAFT)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [connectedNumber, setConnectedNumber] = useState<string>("")

  const token = useMemo(() => {
    const value = new URLSearchParams(window.location.search).get("token")
    return value?.trim() || ""
  }, [])

  const fetchConnectedNumber = useCallback(async () => {
    try {
      const endpoints = ["/bot/status", "/api/bot-status"]
      for (const endpoint of endpoints) {
        const target = token ? `${endpoint}?token=${encodeURIComponent(token)}` : endpoint
        const response = await fetch(target, {
          headers: token ? { "x-bot-dashboard-token": token } : undefined,
        })
        const contentType = response.headers.get("content-type") || ""
        const payload = contentType.includes("application/json")
          ? await response.json()
          : { success: false, error: await response.text() }

        if (!response.ok || !payload?.success || !payload?.data) continue

        const nextNumber = String(payload.data?.pairingPhoneNumber || payload.data?.connectedPhone || "").trim()
        if (nextNumber) {
          setConnectedNumber(nextNumber)
          setDraft((prev) => ({ ...prev, targetChats: mergeReminderTargetChats(prev.targetChats, nextNumber) }))
        }
        return
      }
    } catch {
      // Ignore and keep current form value.
    }
  }, [token])

  const requestWithFallback = useCallback(async (method: "GET" | "POST" | "PUT" | "DELETE", path: string, body?: unknown) => {
    const endpoints = [path.replace("/api", ""), path.startsWith("/api") ? path : `/api${path}`]
    let lastError = "Request failed"

    for (const endpoint of endpoints) {
      const target = token ? `${endpoint}?token=${encodeURIComponent(token)}` : endpoint
      try {
        const response = await fetch(target, {
          method,
          headers: {
            ...(token ? { "x-bot-dashboard-token": token } : {}),
            ...(method !== "GET" ? { "Content-Type": "application/json" } : {}),
          },
          body: method !== "GET" && body !== undefined ? JSON.stringify(body) : undefined,
        })

        const contentType = response.headers.get("content-type") || ""
        const payload = contentType.includes("application/json")
          ? await response.json()
          : { success: false, error: await response.text() }

        if (!response.ok || payload?.success !== true) {
          lastError = payload?.error || `Server returned ${response.status}`
          continue
        }

        return payload
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Request failed"
      }
    }

    throw new Error(lastError)
  }, [token])

  const loadReminders = useCallback(async () => {
    try {
      setError(null)
      const payload = await requestWithFallback("GET", "/bot/reminders")
      const data = Array.isArray(payload?.data) ? payload.data : []
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal load reminder list")
    } finally {
      setLoading(false)
    }
  }, [requestWithFallback])

  useEffect(() => {
    void loadReminders()
    void fetchConnectedNumber()
    const timer = window.setInterval(() => {
      void loadReminders()
      void fetchConnectedNumber()
    }, 10000)
    return () => window.clearInterval(timer)
  }, [loadReminders, fetchConnectedNumber])

  const resetForm = () => {
    setDraft(EMPTY_DRAFT)
    setEditingId(null)
    setModalOpen(false)
  }

  const openCreateModal = () => {
    setError(null)
    setEditingId(null)
    setDraft(EMPTY_DRAFT)
    setModalOpen(true)
  }

  const startEdit = (item: ReminderItem) => {
    setError(null)
    setEditingId(item.id)
    setDraft({
      name: item.name,
      date: item.date,
      time: item.time,
      earlyDays: item.earlyDays.join(", "),
      targetChats: Array.isArray(item.targetChats) ? item.targetChats.join(", ") : "",
    })
    setModalOpen(true)
  }

  const applyConnectedNumber = () => {
    if (!connectedNumber) return
    setDraft((prev) => ({ ...prev, targetChats: mergeReminderTargetChats(prev.targetChats, connectedNumber) }))
    setSuccess(`Nombor WhatsApp ${connectedNumber} ditambah ke target chats.`)
  }

  const saveReminder = async () => {
    const name = draft.name.trim()
    if (!name || !draft.date || !draft.time) {
      setError("Isi Name, Date dan Time dahulu.")
      return
    }

    const payload = {
      name,
      date: draft.date,
      time: draft.time,
      earlyDays: normalizeEarlyDaysInput(draft.earlyDays),
      targetChats: draft.targetChats,
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      if (editingId) {
        await requestWithFallback("PUT", `/bot/reminders/${editingId}`, payload)
        setSuccess("Reminder berjaya dikemaskini.")
      } else {
        await requestWithFallback("POST", "/bot/reminders", payload)
        setSuccess("Reminder berjaya ditambah.")
      }

      resetForm()
      await loadReminders()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal simpan reminder")
    } finally {
      setSaving(false)
    }
  }

  const deleteReminder = async (id: string) => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      await requestWithFallback("DELETE", `/bot/reminders/${id}`)
      if (editingId === id) resetForm()
      setSuccess("Reminder berjaya dipadam.")
      await loadReminders()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal delete reminder")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4 p-4 md:p-6">
      <div className="rounded-2xl border border-border/70 bg-card/90 p-4 md:p-5 shadow-sm">
        <h1 className="text-lg md:text-xl font-bold flex items-center gap-2">
          <BellRing className="size-5 text-primary" />
          Reminder
        </h1>
        <p className="mt-1 text-xs md:text-sm text-muted-foreground">
          Create bot reminder by Name + Date/Time + early days offset (contoh: 10, 5).
        </p>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/90 p-4 md:p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Saved List</p>
          <Button type="button" size="sm" className="gap-1.5" onClick={openCreateModal} disabled={saving}>
            <Plus className="size-3.5" /> Create
          </Button>
        </div>

        {success ? <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">{success}</p> : null}
        {error ? <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p> : null}

        {loading ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading reminder list...</p>
        ) : items.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Belum ada reminder.</p>
        ) : (
          <div className="mt-3 grid gap-3">
            {items.map((item) => {
              const sent = Array.isArray(item.sentOffsets) ? item.sentOffsets : []
              const pending = item.earlyDays.filter((d) => !sent.includes(d))
              return (
                <div key={item.id} className="rounded-xl border border-border/70 bg-background/70 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 inline-flex items-center gap-1.5">
                        <CalendarClock className="size-3.5" />
                        {formatDate(item.date)} {item.time}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Early days: {item.earlyDays.join(", ")} | Pending: {pending.length > 0 ? pending.join(", ") : "none"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(item)} disabled={saving}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-red-600" onClick={() => void deleteReminder(item.id)} disabled={saving}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) resetForm(); else setModalOpen(true) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Reminder" : "Create Reminder"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground">Name</label>
              <Input
                value={draft.name}
                onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Contoh: Bitagen"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Early days (comma)</label>
              <Input
                value={draft.earlyDays}
                onChange={(e) => setDraft((prev) => ({ ...prev, earlyDays: e.target.value }))}
                placeholder="Contoh: 10,5"
                className="mt-1"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Example: 10,5 = bot akan hantar reminder 10 hari awal dan 5 hari awal sebelum tarikh event.
              </p>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Date</label>
              <Input
                type="date"
                value={draft.date}
                onChange={(e) => setDraft((prev) => ({ ...prev, date: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Time</label>
              <Input
                type="time"
                value={draft.time}
                onChange={(e) => setDraft((prev) => ({ ...prev, time: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-[11px] text-muted-foreground">Target chats (optional, comma JID/number)</label>
                {connectedNumber ? (
                  <Button type="button" size="sm" variant="outline" className="h-7 gap-1.5 px-2 text-[10px]" onClick={applyConnectedNumber}>
                    <PhoneCall className="size-3.5" /> Add {connectedNumber}
                  </Button>
                ) : null}
              </div>
              <Input
                value={draft.targetChats}
                onChange={(e) => setDraft((prev) => ({ ...prev, targetChats: e.target.value }))}
                placeholder="Contoh: 60123456789,1203630xxxx@g.us"
                className="mt-1"
              />
              {connectedNumber ? (
                <p className="mt-1 text-[11px] text-muted-foreground">Connected number: {connectedNumber}</p>
              ) : null}
            </div>
          </div>

          {error ? <p className="text-xs text-red-600 dark:text-red-400">{error}</p> : null}

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button type="button" size="sm" variant="outline" onClick={resetForm} disabled={saving}>Cancel</Button>
            <Button type="button" size="sm" className="gap-1.5" onClick={() => void saveReminder()} disabled={saving}>
              {editingId ? <Save className="size-3.5" /> : <Plus className="size-3.5" />} {editingId ? "Update" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
