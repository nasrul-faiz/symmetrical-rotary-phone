import { useEffect, useMemo, useRef, useState } from "react"
import { Plus, Trash2, WandSparkles, TerminalSquare, MessageSquareText, Save, Upload, Link2, Loader2, FileText, Pencil, Share2 } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type CommandContentType = "text" | "image" | "video" | "file"
type ButtonType = "cta_url" | "pdf_url" | "cta_copy" | "quick_reply" | "button_call" | "send_whatsapp" | "single_select"
type MediaSource = "url" | "upload"

type CommandButton = {
  id: string
  type: ButtonType
  label: string
  value: string
}

type CustomCommand = {
  id: string
  trigger: string
  title: string
  contentType: CommandContentType
  message: string
  mediaUrl: string
  fileName: string
  buttons: CommandButton[]
  createdAt: string
}

const STORAGE_KEY = "routebotti_bot_custom_commands_v1"

const CONTENT_TYPES: { value: CommandContentType; label: string; helper: string }[] = [
  { value: "text", label: "Text", helper: "Send plain text response." },
  { value: "image", label: "Image", helper: "Send image URL with optional caption." },
  { value: "video", label: "Video", helper: "Send video URL with optional caption." },
  { value: "file", label: "File", helper: "Send document/file URL with filename." },
]

const BUTTON_TYPES: { value: ButtonType; label: string; helper: string }[] = [
  { value: "cta_url", label: "CTA URL", helper: "Open website link." },
  { value: "pdf_url", label: "PDF URL", helper: "Open a PDF file link." },
  { value: "cta_copy", label: "CTA Copy", helper: "Copy coupon/code text." },
  { value: "quick_reply", label: "Quick Reply", helper: "Quick tap reply payload." },
  { value: "button_call", label: "Button Call", helper: "Call phone number." },
  { value: "send_whatsapp", label: "Send WhatsApp", helper: "Open WA chat by number." },
  { value: "single_select", label: "Single Select", helper: "Single-select option payload." },
]

function createButton(type: ButtonType = "quick_reply"): CommandButton {
  return {
    id: Math.random().toString(36).slice(2),
    type,
    label: "",
    value: "",
  }
}

function getDefaultValueHint(type: ButtonType): string {
  switch (type) {
    case "cta_url":
      return "https://example.com"
    case "pdf_url":
      return "https://example.com/file.pdf"
    case "cta_copy":
      return "PROMO2026"
    case "quick_reply":
      return "payload_key"
    case "button_call":
      return "+60123456789"
    case "send_whatsapp":
      return "60123456789"
    case "single_select":
      return "option_key"
    default:
      return ""
  }
}

function loadCommands(): CustomCommand[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CustomCommand[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function normalizeCommandFromApi(item: Record<string, unknown>): CustomCommand {
  return {
    id: String(item.id ?? ""),
    trigger: String(item.trigger ?? ""),
    title: String(item.title ?? ""),
    contentType: (String(item.contentType ?? item.content_type ?? "text") as CommandContentType),
    message: String(item.message ?? ""),
    mediaUrl: String(item.mediaUrl ?? item.media_url ?? ""),
    fileName: String(item.fileName ?? item.file_name ?? ""),
    buttons: Array.isArray(item.buttons)
      ? item.buttons.map((button: Record<string, unknown>, index: number) => ({
          id: String(button.id ?? `button-${index}`),
          type: String(button.type ?? "quick_reply") as ButtonType,
          label: String(button.label ?? ""),
          value: String(button.value ?? ""),
        }))
      : [],
    createdAt: String(item.createdAt ?? item.created_at ?? new Date().toISOString()),
  }
}

export function BotCustomCommand({ isSharedView = false }: { isSharedView?: boolean }) {
  const uploadInputRef = useRef<HTMLInputElement | null>(null)
  const [commands, setCommands] = useState<CustomCommand[]>(() => loadCommands())
  const [trigger, setTrigger] = useState("")
  const [title, setTitle] = useState("")
  const [contentType, setContentType] = useState<CommandContentType>("text")
  const [message, setMessage] = useState("")
  const [mediaSource, setMediaSource] = useState<MediaSource>("url")
  const [mediaUrl, setMediaUrl] = useState("")
  const [uploadedMediaDataUrl, setUploadedMediaDataUrl] = useState("")
  const [uploadedFileName, setUploadedFileName] = useState("")
  const [isReadingUpload, setIsReadingUpload] = useState(false)
  const [fileName, setFileName] = useState("")
  const [buttons, setButtons] = useState<CommandButton[]>([])
  const [editingCommandId, setEditingCommandId] = useState<string | null>(null)
  const [editingCreatedAt, setEditingCreatedAt] = useState<string | null>(null)
  const [pendingDeleteCommand, setPendingDeleteCommand] = useState<CustomCommand | null>(null)

  const selectedType = useMemo(
    () => CONTENT_TYPES.find((item) => item.value === contentType),
    [contentType],
  )

  const sharedCommandId = useMemo(() => {
    if (!isSharedView) return null
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""))
    return hashParams.get("id")
  }, [isSharedView])

  const visibleCommands = useMemo(() => {
    if (!isSharedView) return commands
    if (!sharedCommandId) return []
    return commands.filter((item) => item.id === sharedCommandId)
  }, [commands, isSharedView, sharedCommandId])

  const persist = (next: CustomCommand[]) => {
    setCommands(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  useEffect(() => {
    const syncCommands = async () => {
      try {
        const response = await fetch("/api/custom-commands")
        const payload = await response.json()
        if (!response.ok || !payload?.success || !Array.isArray(payload.data)) return

        const next = payload.data.map((item: Record<string, unknown>) => normalizeCommandFromApi(item))
        persist(next)
      } catch {
        // Fallback to local storage data already loaded.
      }
    }

    void syncCommands()
  }, [])

  const addButton = () => {
    setButtons((prev) => [...prev, createButton()])
  }

  const updateButton = (id: string, patch: Partial<CommandButton>) => {
    setButtons((prev) => prev.map((button) => (button.id === id ? { ...button, ...patch } : button)))
  }

  const removeButton = (id: string) => {
    setButtons((prev) => prev.filter((button) => button.id !== id))
  }

  const resetForm = () => {
    setEditingCommandId(null)
    setEditingCreatedAt(null)
    setTrigger("")
    setTitle("")
    setContentType("text")
    setMessage("")
    setMediaSource("url")
    setMediaUrl("")
    setUploadedMediaDataUrl("")
    setUploadedFileName("")
    setIsReadingUpload(false)
    setFileName("")
    setButtons([])
    if (uploadInputRef.current) uploadInputRef.current.value = ""
  }

  const startEditCommand = (command: CustomCommand) => {
    setEditingCommandId(command.id)
    setEditingCreatedAt(command.createdAt)
    setTrigger(command.trigger)
    setTitle(command.title)
    setContentType(command.contentType)
    setMessage(command.message)

    const isUploadedSource = command.mediaUrl.startsWith("data:")
    setMediaSource(isUploadedSource ? "upload" : "url")
    setMediaUrl(isUploadedSource ? "" : command.mediaUrl)
    setUploadedMediaDataUrl(isUploadedSource ? command.mediaUrl : "")
    setUploadedFileName(command.fileName || "")
    setFileName(command.fileName || "")
    setIsReadingUpload(false)
    setButtons(command.buttons.map((button) => ({ ...button })))

    if (uploadInputRef.current) uploadInputRef.current.value = ""
  }

  const getUploadAccept = (type: CommandContentType): string => {
    if (type === "image") return "image/*"
    if (type === "video") return "video/*"
    if (type === "file") return ".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,.rar,.ppt,.pptx,.json,.xml,.apk"
    return "*/*"
  }

  const handleUploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const sizeMb = file.size / (1024 * 1024)
    if (sizeMb > 5) {
      toast.error("Maksimum upload 5MB untuk simpanan lokal")
      if (uploadInputRef.current) uploadInputRef.current.value = ""
      return
    }

    setIsReadingUpload(true)
    const reader = new FileReader()
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result
      if (typeof result !== "string") {
        setIsReadingUpload(false)
        toast.error("Gagal membaca fail upload")
        return
      }

      setUploadedMediaDataUrl(result)
      setUploadedFileName(file.name)
      setMediaUrl("")
      if (contentType === "file") setFileName(file.name)
      setIsReadingUpload(false)
      toast.success("Upload berjaya")
    }

    reader.onerror = () => {
      setIsReadingUpload(false)
      toast.error("Gagal membaca fail upload")
    }

    reader.readAsDataURL(file)
  }

  const validate = (): string | null => {
    if (!trigger.trim()) return "Trigger command wajib diisi"
    if (!title.trim()) return "Title command wajib diisi"
    if (!message.trim() && contentType === "text") return "Isi message text terlebih dahulu"
    if (contentType === "image" || contentType === "video" || contentType === "file") {
      const hasUrl = mediaSource === "url" && Boolean(mediaUrl.trim())
      const hasUpload = mediaSource === "upload" && Boolean(uploadedMediaDataUrl.trim())
      if (!hasUrl && !hasUpload) return "Media wajib diisi melalui URL atau upload"
    }
    if (contentType === "file" && !fileName.trim() && !uploadedFileName.trim()) return "File name wajib diisi untuk tipe file"

    const missingButtonField = buttons.find((button) => !button.label.trim() || !button.value.trim())
    if (missingButtonField) return "Semua button mesti ada label dan value"
    return null
  }

  const saveCommand = async () => {
    const error = validate()
    if (error) {
      toast.error(error)
      return
    }

    const resolvedMediaUrl = mediaSource === "upload" ? uploadedMediaDataUrl.trim() : mediaUrl.trim()
    const resolvedFileName = contentType === "file" ? (fileName.trim() || uploadedFileName.trim()) : ""

    const payload: CustomCommand = {
      id: editingCommandId ?? Math.random().toString(36).slice(2),
      trigger: trigger.trim(),
      title: title.trim(),
      contentType,
      message: message.trim(),
      mediaUrl: resolvedMediaUrl,
      fileName: resolvedFileName,
      buttons,
      createdAt: editingCreatedAt ?? new Date().toISOString(),
    }

    const next = editingCommandId
      ? commands.map((item) => (item.id === editingCommandId ? payload : item))
      : [payload, ...commands]
    persist(next)

    try {
      const response = await fetch("/api/custom-commands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          contentType: payload.contentType,
          mediaUrl: payload.mediaUrl,
          fileName: payload.fileName,
          buttons: payload.buttons,
          createdAt: payload.createdAt,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to persist to server")
      }

      toast.success(editingCommandId ? "Custom command dikemaskini" : "Custom command disimpan")
      resetForm()
    } catch {
      toast.error("Disimpan lokal, tetapi gagal sinkron ke server")
      resetForm()
    }
  }

  const deleteCommand = async (id: string) => {
    if (editingCommandId === id) {
      resetForm()
    }

    const next = commands.filter((item) => item.id !== id)
    persist(next)

    try {
      const response = await fetch(`/api/custom-commands?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete from server")
      }

      toast.success("Custom command dipadam")
    } catch {
      toast.error("Gagal padam dari server, tetapi data lokal dikemaskini")
    }
  }

  const requestDeleteCommand = (command: CustomCommand) => {
    setPendingDeleteCommand(command)
  }

  const confirmDeleteCommand = async () => {
    if (!pendingDeleteCommand) return
    const commandId = pendingDeleteCommand.id
    setPendingDeleteCommand(null)
    await deleteCommand(commandId)
  }

  const getShareUrl = (id: string) => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "")
    return `${window.location.origin}${base}/#page=bot-custom-command&shared=bot-custom-command&id=${encodeURIComponent(id)}`
  }

  const copyShareLink = async (command: CustomCommand) => {
    try {
      await navigator.clipboard.writeText(getShareUrl(command.id))
      toast.success(`Share link untuk ${command.trigger} berjaya disalin`)
    } catch {
      toast.error("Gagal salin share link")
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.08),_transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]">
      <div className={`mx-auto flex w-full flex-col gap-4 p-4 md:p-6 lg:p-8 ${isSharedView ? "max-w-3xl" : "max-w-6xl"}`}>
        <div className="rounded-3xl border border-border/70 bg-card/90 p-4 shadow-sm md:p-6">
          <h1 className="text-lg md:text-xl font-bold flex items-center gap-2">
            <WandSparkles className="size-5 text-primary" />
            {isSharedView ? "Custom Command Share View" : "Custom Command Builder"}
          </h1>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground">
            {isSharedView
              ? "Paparan khas untuk satu custom command dengan tindakan edit dan delete."
              : "Buat command sendiri untuk respon text, image, video, atau file. Anda juga boleh tambah interactive button."}
          </p>
        </div>

        <div className={`grid gap-4 ${isSharedView ? "" : "xl:grid-cols-[minmax(0,1fr)_370px]"}`}>
          {(!isSharedView || editingCommandId) && (
          <div className="rounded-2xl border border-border/70 bg-card p-4 md:p-5 flex flex-col gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Command Trigger</label>
                <Input value={trigger} onChange={(event) => setTrigger(event.target.value)} placeholder=".promo" className="placeholder:text-muted-foreground/60" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Command Title</label>
                <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Promo Hari Ini" className="placeholder:text-muted-foreground/60" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Content Type</label>
              <div className="grid gap-2 sm:grid-cols-2">
                {CONTENT_TYPES.map((type) => {
                  const isActive = contentType === type.value
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        setContentType(type.value)
                        setMediaSource("url")
                        setMediaUrl("")
                        setUploadedMediaDataUrl("")
                        setUploadedFileName("")
                        if (uploadInputRef.current) uploadInputRef.current.value = ""
                      }}
                      className={`rounded-xl border px-3 py-2 text-left transition ${isActive ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/40"}`}
                    >
                      <p className="text-xs font-semibold">{type.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{type.helper}</p>
                    </button>
                  )
                })}
              </div>
              <p className="text-[11px] text-muted-foreground">Selected: {selectedType?.label}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Message / Caption</label>
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Isi mesej respon command"
                className="min-h-[120px] text-xs placeholder:text-muted-foreground/60"
              />
            </div>

            {(contentType === "image" || contentType === "video" || contentType === "file") && (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Media Source</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant={mediaSource === "url" ? "default" : "outline"} onClick={() => setMediaSource("url")} className="gap-1.5">
                      <Link2 className="size-3.5" /> URL
                    </Button>
                    <Button type="button" variant={mediaSource === "upload" ? "default" : "outline"} onClick={() => setMediaSource("upload")} className="gap-1.5">
                      <Upload className="size-3.5" /> Upload File
                    </Button>
                  </div>
                </div>

                {mediaSource === "url" ? (
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Media / File URL</label>
                    <Input
                      value={mediaUrl}
                      onChange={(event) => setMediaUrl(event.target.value)}
                      placeholder="https://cdn.example.com/media.jpg"
                      className="placeholder:text-muted-foreground/60"
                    />
                  </div>
                ) : (
                  <div className="space-y-2 md:col-span-2">
                    <input
                      ref={uploadInputRef}
                      type="file"
                      accept={getUploadAccept(contentType)}
                      className="hidden"
                      onChange={handleUploadFile}
                    />
                    <button
                      type="button"
                      className="w-full rounded-xl border border-dashed border-border bg-background/80 px-3 py-5 text-center hover:border-primary/40 transition"
                      onClick={() => uploadInputRef.current?.click()}
                    >
                      <Upload className="size-5 mx-auto text-primary/80" />
                      <p className="mt-2 text-xs font-semibold">Click untuk upload {contentType}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">Maksimum 5MB (disimpan lokal dalam browser)</p>
                    </button>

                    {isReadingUpload && (
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <Loader2 className="size-3.5 animate-spin" /> Reading upload...
                      </div>
                    )}

                    {uploadedMediaDataUrl && !isReadingUpload && (
                      <div className="rounded-lg border border-border/70 bg-card p-2">
                        <p className="text-[11px] text-muted-foreground mb-2">Uploaded: {uploadedFileName || "file"}</p>
                        {contentType === "image" && (
                          <img src={uploadedMediaDataUrl} alt="upload-preview" className="w-full max-h-52 object-cover rounded-md" />
                        )}
                        {contentType === "video" && (
                          <video src={uploadedMediaDataUrl} controls className="w-full max-h-56 rounded-md bg-black" />
                        )}
                        {contentType === "file" && (
                          <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-2">
                            <FileText className="size-4 text-primary/80" />
                            <p className="text-[11px] truncate">{uploadedFileName || "uploaded-file"}</p>
                          </div>
                        )}
                        <div className="mt-2 flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setUploadedMediaDataUrl("")
                              setUploadedFileName("")
                              if (uploadInputRef.current) uploadInputRef.current.value = ""
                            }}
                          >
                            Clear Upload
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {contentType === "file" && (
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">File Name</label>
                    <Input
                      value={fileName}
                      onChange={(event) => setFileName(event.target.value)}
                      placeholder="brochure.pdf"
                      className="placeholder:text-muted-foreground/60"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="rounded-xl border border-border/70 bg-background/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold">Interactive Buttons</p>
                  <p className="text-[11px] text-muted-foreground">Supported: cta_url, pdf_url, cta_copy, quick_reply, button_call, send_whatsapp, single_select</p>
                </div>
                <Button type="button" variant="outline" size="sm" className="gap-1" onClick={addButton}>
                  <Plus className="size-3.5" /> Add Button
                </Button>
              </div>

              <div className="mt-3 space-y-2">
                {buttons.length === 0 && (
                  <p className="text-[11px] text-muted-foreground">Belum ada button ditambah.</p>
                )}
                {buttons.map((button) => (
                  <div key={button.id} className="grid gap-2 rounded-lg border border-border bg-card p-2 md:grid-cols-[160px_minmax(0,1fr)_minmax(0,1fr)_auto]">
                    <select
                      className="h-9 rounded-md border border-input bg-transparent px-2 text-[11px]"
                      value={button.type}
                      onChange={(event) => updateButton(button.id, { type: event.target.value as ButtonType, value: getDefaultValueHint(event.target.value as ButtonType) })}
                    >
                      {BUTTON_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.value}
                        </option>
                      ))}
                    </select>
                    <Input
                      value={button.label}
                      onChange={(event) => updateButton(button.id, { label: event.target.value })}
                      placeholder="Button label"
                    />
                    <Input
                      value={button.value}
                      onChange={(event) => updateButton(button.id, { value: event.target.value })}
                      placeholder={getDefaultValueHint(button.type)}
                    />
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeButton(button.id)}>
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                    <p className="md:col-span-4 text-[10px] text-muted-foreground">{BUTTON_TYPES.find((item) => item.value === button.type)?.helper}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              {editingCommandId && (
                <Button type="button" variant="outline" onClick={resetForm}>Cancel Edit</Button>
              )}
              <Button type="button" variant="outline" onClick={resetForm}>Reset</Button>
              <Button type="button" className="gap-1.5" onClick={saveCommand}>
                <Save className="size-4" /> {editingCommandId ? "Update Command" : "Save Command"}
              </Button>
            </div>
          </div>
          )}

          <div className="rounded-2xl border border-border/70 bg-card p-4 md:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{isSharedView ? "Shared Command" : "Saved Commands"}</p>
              <span className="text-[11px] text-muted-foreground">{visibleCommands.length} item</span>
            </div>

            <div className="space-y-2 overflow-auto max-h-[620px] pr-1">
              {visibleCommands.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">
                  {isSharedView
                    ? "Custom command untuk link ini tidak dijumpai dalam simpanan semasa."
                    : "Tiada custom command lagi. Simpan command pertama anda."}
                </p>
              ) : (
                visibleCommands.map((item) => (
                  <div key={item.id} className="rounded-xl border border-border/70 bg-background/70 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold flex items-center gap-1.5">
                          <TerminalSquare className="size-3.5 text-primary/80" />
                          {item.trigger}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{item.title}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!isSharedView && (
                          <Button type="button" variant="ghost" size="icon-xs" onClick={() => copyShareLink(item)}>
                            <Share2 className="size-3.5 text-sky-600" />
                          </Button>
                        )}
                        <Button type="button" variant="ghost" size="icon-xs" onClick={() => startEditCommand(item)}>
                          <Pencil className="size-3.5 text-amber-500" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon-xs" onClick={() => requestDeleteCommand(item)}>
                          <Trash2 className="size-3.5 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-2 rounded-lg border border-border/70 bg-card/50 p-2">
                      <p className="text-[11px] text-muted-foreground">Type: {item.contentType}</p>
                      {item.mediaUrl && (
                        <p className="mt-1 text-[11px] text-muted-foreground break-all">
                          Source: {item.mediaUrl.startsWith("data:") ? "Uploaded file (local)" : item.mediaUrl}
                        </p>
                      )}
                      {item.contentType === "image" && item.mediaUrl.startsWith("data:") && (
                        <img src={item.mediaUrl} alt="saved-image" className="mt-2 w-full max-h-32 object-cover rounded-md" />
                      )}
                      {item.contentType === "video" && item.mediaUrl.startsWith("data:") && (
                        <video src={item.mediaUrl} controls className="mt-2 w-full max-h-40 rounded-md bg-black" />
                      )}
                      {item.contentType === "file" && item.mediaUrl.startsWith("data:") && (
                        <div className="mt-2 inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px]">
                          <FileText className="size-3" /> Uploaded file ready
                        </div>
                      )}
                      {item.fileName && <p className="mt-1 text-[11px] text-muted-foreground">File: {item.fileName}</p>}
                      <p className="mt-1 text-[11px] leading-5 text-foreground/90">{item.message || "(No text message)"}</p>
                    </div>

                    <div className="mt-2 space-y-1">
                      {item.buttons.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground">No interactive button</p>
                      ) : (
                        item.buttons.map((button) => (
                          <div key={button.id} className="rounded-md border border-border/70 bg-card px-2 py-1.5 text-[10px] flex items-center justify-between gap-2">
                            <p className="truncate">
                              <MessageSquareText className="size-3 inline mr-1" />
                              {button.type} • {button.label}
                            </p>
                            <span className="text-muted-foreground truncate max-w-[140px]">{button.value}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <AlertDialog open={Boolean(pendingDeleteCommand)} onOpenChange={(open) => { if (!open) setPendingDeleteCommand(null) }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete custom command?</AlertDialogTitle>
              <AlertDialogDescription>
                {pendingDeleteCommand
                  ? `Command ${pendingDeleteCommand.trigger} akan dipadam. Tindakan ini tidak boleh dibatalkan.`
                  : "Tindakan ini tidak boleh dibatalkan."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmDeleteCommand}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
