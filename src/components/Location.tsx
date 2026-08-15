import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { AlertCircle, AlertTriangle, Search, X, Check, Info, Navigation2, Eye, EyeOff, ArrowUpDown, Filter, Columns3, Route, MapPinned, RotateCcw, ChevronRight, ChevronDownIcon } from "lucide-react"
import { toast } from "sonner"
import { cn, parseSmartQuery, isDeliveryActive } from "@/lib/utils"
import { LoadingSpinner } from "@/components/ui/loading"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { DeliveryMap } from "@/components/DeliveryMap"
import { getRouteColorPalette } from "@/lib/route-colors"
import { RowInfoModal } from "@/components/RowInfoModal"
import { useEditMode } from "@/contexts/EditModeContext"
import { useRoadDistances } from "@/hooks/use-road-distances"
import { useRegisterRefresh } from "@/contexts/RefreshContext"
import { optimizeRouteOrder } from "@/lib/route-optimizer"

// ─── Example: Using .env variables ─────────────────────────────────────────────
// Access environment variables like this:
// const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
// Example: const mapsUrl = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}`
// Make sure to add VITE_ prefix for client-side variables in .env file

// ─── Types ────────────────────────────────────────────────────────────────────
interface DeliveryPoint {
  code: string
  name: string
  delivery: "Daily" | "Weekday" | "Alt 1" | "Alt 2" | string
  latitude: number
  longitude: number
  descriptions: { key: string; value: string }[]
  qrCodeImageUrl?: string
  qrCodeDestinationUrl?: string
}

interface Route {
  id: string
  name: string
  code: string
  shift: string
  deliveryPoints: DeliveryPoint[]
  updatedAt?: string
  color?: string | null
}

interface FlatPoint extends DeliveryPoint {
  routeId: string
  routeName: string
  routeCode: string
  routeShift: string
  markerColor?: string
  routeLabel?: string
  _rowIndex: number
  _dupCode: boolean
  _dupName: boolean
}

type SortKey = "code" | "name" | "delivery" | "route"
type SortDir = "asc" | "desc"
type KmMode = "direct" | "step"

interface SavedRowOrder {
  id: string
  label: string
  order: string[]  // array of point.code in order
}

const DEFAULT_MAP_CENTER = { lat: 3.06955, lng: 101.5469179 }

function formatKm(km: number): string {
  const rounded = Math.round(km * 10) / 10
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)} Km`
}

// ─── Route optimisation helpers ───────────────────────────────────────────────
function nearestNeighborSort(points: FlatPoint[], start = DEFAULT_MAP_CENTER): FlatPoint[] {
  return optimizeRouteOrder(points, start)
}

// ─── Column definitions ───────────────────────────────────────────────────────
const ALL_COLUMNS = [
  { key: "no",       label: "#",             description: "Row number" },
  { key: "route",    label: "Route",         description: "Route name" },
  { key: "code",     label: "Code",          description: "Location code" },
  { key: "name",     label: "Name",          description: "Delivery point name" },
  { key: "delivery", label: "Delivery",      description: "Delivery schedule" },
  { key: "km",       label: "KM",            description: "Distance from start point" },
  { key: "action",   label: "Action",        description: "Open row information" },
] as const
type ColumnKey = typeof ALL_COLUMNS[number]["key"]

const DEFAULT_VISIBLE_COLUMNS: ColumnKey[] = ["no", "code", "name", "delivery", "action"]

// ─── Delivery option definitions ─────────────────────────────────────────────
interface DeliveryItem {
  value: string
  label: string
  fullLabel?: string
  description: string
  color: string   // Tailwind bg class for the badge
  textColor: string
}

const DELIVERY_ITEMS: DeliveryItem[] = [
  {
    value: "Daily",
    label: "Daily",
    description: "Delivery everyday",
    color: "bg-emerald-100 dark:bg-emerald-900/40",
    textColor: "text-emerald-700 dark:text-emerald-300",
  },
  {
    value: "Alt 1",
    label: "Alt 1",
    description: "Delivery on odd dates (1, 3, 5…)",
    color: "bg-violet-100 dark:bg-violet-900/40",
    textColor: "text-violet-700 dark:text-violet-300",
  },
  {
    value: "Alt 2",
    label: "Alt 2",
    description: "Delivery on even dates (2, 4, 6…)",
    color: "bg-fuchsia-100 dark:bg-fuchsia-900/40",
    textColor: "text-fuchsia-700 dark:text-fuchsia-300",
  },
  {
    value: "Weekday",
    label: "WD",
    fullLabel: "Weekday",
    description: "Sun – Thu",
    color: "bg-sky-100 dark:bg-sky-900/40",
    textColor: "text-sky-700 dark:text-sky-300",
  },
  {
    value: "Weekday 2",
    label: "WE",
    fullLabel: "Weekend",
    description: "Mon – Fri",
    color: "bg-blue-100 dark:bg-blue-900/40",
    textColor: "text-blue-700 dark:text-blue-300",
  },
  {
    value: "Weekday 3",
    label: "WA",
    fullLabel: "Weekday Alt",
    description: "Sun, Tue & Thu only",
    color: "bg-indigo-100 dark:bg-indigo-900/40",
    textColor: "text-indigo-700 dark:text-indigo-300",
  },
]

const DELIVERY_MAP = new Map(DELIVERY_ITEMS.map(d => [d.value, d]))

// ─── Main Component ───────────────────────────────────────────────────────────
export function DeliveryTableDialog() {
  const { registerSaveHandler, setHasUnsavedChanges } = useEditMode()
  const [routes, setRoutes]   = useState<Route[]>([])
  const [routeColorPalette, setRouteColorPalette] = useState<string[]>(getRouteColorPalette)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [activeActionPoint, setActiveActionPoint] = useState<FlatPoint | null>(null)

  // Pending edits: key = `${routeId}::${rowIndex}`, value = new delivery string
  const [pendingEdits, setPendingEdits] = useState<Map<string, string>>(new Map())
  const [isSaving, setIsSaving]         = useState(false)
  const [saveError, setSaveError]       = useState<string | null>(null)

  // Background change detection
  const dataFingerprintRef = useRef<string>("")
  const changeToastIdRef   = useRef<string | number | null>(null)

  // Search & Filter
  const [search, setSearch]                     = useState("")
  const [filterRoutes, setFilterRoutes]         = useState<Set<string>>(new Set())
  const [filterDeliveries, setFilterDeliveries] = useState<Set<string>>(new Set())
  const [settingsOpen, setSettingsOpen]         = useState(false)
  const [settingsView, setSettingsView]         = useState<"route-filter" | "delivery-filter" | "column-customize" | "sort" | "km-settings">("route-filter")
  const [isOptimized, setIsOptimized]           = useState(false)
  const [openKmTooltip, setOpenKmTooltip]       = useState<string | null>(null)
  const [openDeliveryTooltip, setOpenDeliveryTooltip] = useState<string | null>(null)
  const [visibleColumns, setVisibleColumns]     = useState<Set<ColumnKey>>(new Set(DEFAULT_VISIBLE_COLUMNS))
  const [kmMode, setKmMode]                     = useState<KmMode>("direct")
  const [kmStartPoint, setKmStartPoint]         = useState<{ lat: number; lng: number }>(DEFAULT_MAP_CENTER)
  const [draftKmStartPoint, setDraftKmStartPoint] = useState<{ lat: number; lng: number }>(DEFAULT_MAP_CENTER)
  const [isLocatingKmStartPoint, setIsLocatingKmStartPoint] = useState(false)

  const toggleColumn = (key: ColumnKey) => {
    setVisibleColumns(prev => {
      if (prev.size === 1 && prev.has(key)) return prev // keep at least one
      const s = new Set(prev)
      if (s.has(key)) s.delete(key)
      else s.add(key)
      return s
    })
  }

  // Sort — default: code asc
  const [sortKey, setSortKey] = useState<SortKey>("code")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [customSortOrders, setCustomSortOrders] = useState<SavedRowOrder[]>([])
  const [activeCustomSort, setActiveCustomSort] = useState<SavedRowOrder | null>(null)
  const prevFilterRoutesRef = useRef<Set<string>>(new Set())

  // Load saved row orders when exactly one route is filtered
  useEffect(() => {
    prevFilterRoutesRef.current = filterRoutes
    // Reset custom sort whenever filter changes
    setActiveCustomSort(null)
    if (filterRoutes.size === 1) {
      const [routeId] = filterRoutes
      try {
        const stored = localStorage.getItem(`fcalendar_my_sorts_${routeId}`)
        const parsed = stored ? JSON.parse(stored) : []
        setCustomSortOrders(Array.isArray(parsed) ? parsed : [])
      } catch {
        setCustomSortOrders([])
      }
    } else {
      setCustomSortOrders([])
    }
  }, [filterRoutes])


  const buildFingerprint = (data: Route[]) =>
    data.map(r => `${r.id}:${r.updatedAt ?? ""}`).sort().join("|")

  const applyKmSettings = useCallback((mode: KmMode, startPoint: { lat: number; lng: number }) => {
    setKmMode(mode)
    setKmStartPoint({ ...startPoint })
    setDraftKmStartPoint({ ...startPoint })
  }, [])

  const useCurrentLocationForKmStartPoint = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      toast.error("Geolocation is not supported on this device.")
      return
    }

    setIsLocatingKmStartPoint(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6))
        const lng = Number(position.coords.longitude.toFixed(6))
        const nextPoint = { lat, lng }
        setDraftKmStartPoint(nextPoint)
        setKmStartPoint(nextPoint)
        setIsLocatingKmStartPoint(false)
        toast.success("Current location applied to the KM start point.")
      },
      (error) => {
        let description = "Please allow location access and try again."
        if (error.code === error.PERMISSION_DENIED) description = "Location permission was denied by your browser."
        if (error.code === error.POSITION_UNAVAILABLE) description = "Location information is unavailable right now."
        if (error.code === error.TIMEOUT) description = "Location request timed out. Please retry."

        setIsLocatingKmStartPoint(false)
        toast.error("Unable to fetch current location.", { description })
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000,
      }
    )
  }, [])

  const fetchRoutes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/routes")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const data: Route[] = json.data ?? json ?? []
      setRoutes(data)
      setPendingEdits(new Map())
      dataFingerprintRef.current = buildFingerprint(data)
      if (changeToastIdRef.current !== null) {
        toast.dismiss(changeToastIdRef.current)
        changeToastIdRef.current = null
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const handler = () => setRouteColorPalette(getRouteColorPalette())
    window.addEventListener('fcalendar_route_colors_changed', handler)
    return () => window.removeEventListener('fcalendar_route_colors_changed', handler)
  }, [])

  useEffect(() => { fetchRoutes() }, [fetchRoutes])
  useRegisterRefresh(fetchRoutes)

  // ── Background polling for remote changes ────────────────────────────────
  useEffect(() => {
    const POLL_INTERVAL = 30_000
    let abortController: AbortController | null = null

    const id = setInterval(async () => {
      abortController = new AbortController()
      try {
        const res = await fetch("/api/routes", { signal: abortController.signal })
        if (!res.ok) return
        const json = await res.json()
        const data: Route[] = json.data ?? json ?? []
        const newFp = buildFingerprint(data)
        if (dataFingerprintRef.current && newFp !== dataFingerprintRef.current) {
          if (changeToastIdRef.current !== null) toast.dismiss(changeToastIdRef.current)
          changeToastIdRef.current = toast.info("Location data updated", {
            description: "New changes are available from another session.",
            duration: Infinity,
            action: {
              label: "Refresh",
              onClick: () => { fetchRoutes() },
            },
          })
        }
      } catch {
        // silent — polling errors are non-critical
      }
    }, POLL_INTERVAL)

    return () => {
      clearInterval(id)
      abortController?.abort()
    }
  }, [fetchRoutes])

  // ── Pending-edit helpers ─────────────────────────────────────────────────
  const pointKey = (pt: FlatPoint) => `${pt.routeId}::${pt._rowIndex}`

  const effectiveDelivery = (pt: FlatPoint) =>
    pendingEdits.get(pointKey(pt)) ?? pt.delivery

  const saveChanges = useCallback(async () => {
    if (pendingEdits.size === 0 || isSaving) return
    setIsSaving(true)
    setSaveError(null)
    try {
      const updatedRoutes = routes.map(route => ({
        ...route,
        deliveryPoints: (route.deliveryPoints ?? []).map((pt, i) => {
          const key = `${route.id}::${i}`
          return pendingEdits.has(key) ? { ...pt, delivery: pendingEdits.get(key)! } : pt
        }),
      }))
      const res = await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routes: updatedRoutes }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setRoutes(updatedRoutes)
      dataFingerprintRef.current = buildFingerprint(updatedRoutes)
      setPendingEdits(new Map())
      setHasUnsavedChanges(false)
      toast.success("Changes saved", {
        description: `${pendingEdits.size} delivery schedule${pendingEdits.size !== 1 ? "s" : ""} updated.`,
        duration: 3000,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save"
      setSaveError(msg)
      toast.error("Failed to save", { description: msg, duration: 4000 })
    } finally {
      setIsSaving(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingEdits, isSaving, routes])

  // Register with global EditMode save
  useEffect(() => {
    if (pendingEdits.size === 0) return
    const unregister = registerSaveHandler(saveChanges)
    return unregister
  }, [pendingEdits.size, saveChanges, registerSaveHandler])

  // Notify context when pending edits change
  useEffect(() => {
    setHasUnsavedChanges(pendingEdits.size > 0)
  }, [pendingEdits.size, setHasUnsavedChanges])

  // ── Flatten all points + detect duplicates ───────────────────────────────
  const { flat, dupCodeCount, dupNameCount } = useMemo(() => {
    const all: FlatPoint[] = []
    routes.forEach((route, routeIndex) => {
      const routeColor = (route.color?.trim()) || routeColorPalette[routeIndex % routeColorPalette.length] || "#6b7280"
      ;(route.deliveryPoints ?? []).forEach((pt, i) => {
        all.push({ ...pt, routeId: route.id, routeName: route.name, routeCode: route.code, routeShift: route.shift ?? "", markerColor: routeColor, routeLabel: `${route.name} (${route.code})`, _rowIndex: i, _dupCode: false, _dupName: false })
      })
    })
    const codeCounts: Record<string, number> = {}
    const nameCounts: Record<string, number> = {}
    all.forEach(p => {
      codeCounts[p.code.trim().toLowerCase()] = (codeCounts[p.code.trim().toLowerCase()] ?? 0) + 1
      nameCounts[p.name.trim().toLowerCase()] = (nameCounts[p.name.trim().toLowerCase()] ?? 0) + 1
    })
    let dupCodeCount = 0
    let dupNameCount = 0
    all.forEach(p => {
      p._dupCode = codeCounts[p.code.trim().toLowerCase()] > 1
      p._dupName = nameCounts[p.name.trim().toLowerCase()] > 1
      if (p._dupCode) dupCodeCount++
      if (p._dupName) dupNameCount++
    })
    return { flat: all, dupCodeCount, dupNameCount }
  }, [routes, routeColorPalette])

  // ── Unique options for filters ─────────────────────────────────────────
  const routeOptions = useMemo(() =>
    [...new Map(routes.map(r => [r.id, `${r.name} (${r.code})`])).entries()],
  [routes])
  const deliveryOptions = useMemo(() => {
    const known = DELIVERY_ITEMS.map(d => d.value)
    const extra = flat.map(p => p.delivery).filter(v => !DELIVERY_MAP.has(v))
    return [...known, ...new Set(extra)]
  }, [flat])

  // ── Filter + Sort ──────────────────────────────────────────────────────
  const displayed = useMemo(() => {
    let list = flat
    if (search.trim()) {
      const { nameQuery, shiftFilter } = parseSmartQuery(search)
      const q = nameQuery.toLowerCase()
      if (q) {
        list = list.filter(p =>
          p.code.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.routeName.toLowerCase().includes(q) ||
          p.routeCode.toLowerCase().includes(q) ||
          p.delivery.toLowerCase().includes(q)
        )
      }
      if (shiftFilter) {
        list = list.filter(p => p.routeShift.toUpperCase() === shiftFilter)
      }
    }
    if (filterRoutes.size > 0)     list = list.filter(p => filterRoutes.has(p.routeId))
    if (filterDeliveries.size > 0) list = list.filter(p => filterDeliveries.has(p.delivery))

    if (activeCustomSort) {
      const orderIndex = new Map(activeCustomSort.order.map((code, idx) => [code, idx]))
      const sorted = [...list].sort((a, b) => {
        const ai = orderIndex.get(a.code)
        const bi = orderIndex.get(b.code)
        if (ai == null && bi == null) return a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: "base" })
        if (ai == null) return 1
        if (bi == null) return -1
        if (ai !== bi) return ai - bi
        return a._rowIndex - b._rowIndex
      })
      return isOptimized ? nearestNeighborSort(sorted) : sorted
    }

    const sorted = [...list].sort((a, b) => {
      let av = "", bv = ""
      if (sortKey === "code")     { av = a.code;      bv = b.code }
      if (sortKey === "name")     { av = a.name;      bv = b.name }
      if (sortKey === "delivery") { av = a.delivery;  bv = b.delivery }
      if (sortKey === "route")    { av = a.routeName; bv = b.routeName }
      const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: "base" })
      return sortDir === "asc" ? cmp : -cmp
    })
    return isOptimized ? nearestNeighborSort(sorted) : sorted
  }, [flat, search, filterRoutes, filterDeliveries, sortKey, sortDir, activeCustomSort, isOptimized])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("asc") }
  }

  const totalPoints = flat.length
  const locationRoadDistances = useRoadDistances(
    kmStartPoint,
    displayed,
    kmMode === "step" ? "step" : "direct",
  )
  const pointDistanceDetails = useMemo(() => {
    const details = new Map<string, { value: string; tooltip: string }>()
    displayed.forEach((pt, i) => {
      const hasCoordinates = pt.latitude !== 0 || pt.longitude !== 0
      if (!hasCoordinates) return
      const value = locationRoadDistances.segments[i]
      const displayValue = kmMode === "step"
        ? (locationRoadDistances.cumulative[i] ?? value)
        : value
      if (displayValue === null || displayValue === undefined) return
      const formattedValue = formatKm(displayValue)
      const tooltipText = kmMode === "step"
        ? (i === 0
          ? `QL Kitchen → ${pt.name || pt.code}: ${formattedValue}`
          : `${displayed[i - 1].name || displayed[i - 1].code} → ${pt.name || pt.code}: ${formattedValue}`)
        : `QL Kitchen → ${pt.name || pt.code}: ${formattedValue}`
      details.set(pointKey(pt), { value: formattedValue, tooltip: tooltipText })
    })
    return details
  }, [displayed, kmMode, locationRoadDistances])

  const [showMap, setShowMap] = useState(false)
  const [showTable, setShowTable] = useState(true)
  const [mapResizeToken, setMapResizeToken] = useState(0)
  const [focusPoint, setFocusPoint] = useState<{ lat: number; lng: number } | null>(null)
  const [focusToken, setFocusToken] = useState(0)
  const [selectedMapPoints, setSelectedMapPoints] = useState<Set<string>>(new Set())

  const focusOnMap = useCallback((pt: FlatPoint) => {
    if (!pt.latitude || !pt.longitude) {
      toast.error("Location ini tiada koordinat peta")
      return
    }
    setShowMap(true)
    setFocusPoint({ lat: pt.latitude, lng: pt.longitude })
    setFocusToken(t => t + 1)
    setSelectedMapPoints(prev => {
      const next = new Set(prev)
      next.add(pt.code)
      return next
    })
  }, [])

  useEffect(() => {
    if (showMap) setMapResizeToken(token => token + 1)
  }, [showMap])

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden rounded-xl border border-border/60 shadow-sm bg-background">

      {/* ── Stats Bar ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b bg-card shrink-0">
        {!loading && !error && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-muted/70 border border-border/50">
              <MapPinned className="size-3 text-muted-foreground/70" />
              <span className="text-[11px] font-semibold tabular-nums text-foreground/80">
                {displayed.length}<span className="text-muted-foreground/60 font-normal">/{totalPoints}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-muted/70 border border-border/50">
              <Route className="size-3 text-muted-foreground/70" />
              <span className="text-[11px] font-semibold tabular-nums text-foreground/80">
                {routes.length}<span className="text-muted-foreground/60 font-normal"> routes</span>
              </span>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1.5 flex-wrap">
          {!loading && !error && dupCodeCount > 0 && (
            <span className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/60">
              <AlertTriangle className="size-3" />{dupCodeCount} dup code
            </span>
          )}
          {!loading && !error && dupNameCount > 0 && (
            <span className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[10px] font-semibold bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700/60">
              <AlertTriangle className="size-3" />{dupNameCount} dup name
            </span>
          )}
          {isOptimized && (
            <span className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[10px] font-semibold bg-blue-600 text-white border border-blue-700/40 shadow-sm shadow-blue-500/20">
              <Navigation2 className="size-2.5" />Optimised
            </span>
          )}
          {saveError && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-destructive">
              <AlertCircle className="size-3.5" />{saveError}
            </span>
          )}
        </div>
      </div>

      {/* ── Search Bar ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 border-b bg-muted/20 shrink-0">
        <InputGroup className="flex-1 min-w-[140px] bg-background/60 border-border/70 focus-within:border-primary/50">
          <InputGroupAddon align="inline-start" className="pr-1.5">
            <Search className="size-3.5 text-muted-foreground/60" />
          </InputGroupAddon>

          <InputGroupInput
            placeholder="Search code, name, route... (e.g. KL am)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-9 text-[12px]"
          />

          {search && (
            <InputGroupAddon align="inline-end" className="pr-1">
              <InputGroupButton
                variant="ghost"
                size="icon-xs"
                aria-label="Clear search"
                onClick={() => setSearch("")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </InputGroupButton>
            </InputGroupAddon>
          )}

          {/* ── Settings dropdown ── */}
          <InputGroupAddon align="inline-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <InputGroupButton
                  variant="ghost"
                  className={cn(
                    "pr-1.5 text-xs",
                    (filterRoutes.size > 0 || filterDeliveries.size > 0) && "text-primary"
                  )}
                >
                  <span className="font-medium">View</span>
                  {(filterRoutes.size + filterDeliveries.size) > 0 && (
                    <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-primary/15 text-primary text-[9px] font-bold">
                      {filterRoutes.size + filterDeliveries.size}
                    </span>
                  )}
                  <ChevronDownIcon className="size-3" />
                </InputGroupButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-52 p-1" sideOffset={6}>
            {/* Filter group */}
            <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-2 pb-1 pt-1.5">
              Filters
            </DropdownMenuLabel>

            <DropdownMenuItem
              className="flex items-center gap-2.5 px-2 py-2 rounded-md cursor-pointer"
              onClick={() => { setSettingsView("route-filter"); setSettingsOpen(true) }}
            >
              <div className="flex h-6 w-6 items-center justify-center shrink-0">
                <Route className="w-3.5 h-3.5 text-sky-500" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium">Route Filter</span>
              </div>
              {filterRoutes.size > 0 && (
                <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 text-[9px] font-bold shrink-0">
                  {filterRoutes.size}
                </span>
              )}
              <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
            </DropdownMenuItem>

            <DropdownMenuItem
              className="flex items-center gap-2.5 px-2 py-2 rounded-md cursor-pointer"
              onClick={() => { setSettingsView("delivery-filter"); setSettingsOpen(true) }}
            >
              <div className="flex h-6 w-6 items-center justify-center shrink-0">
                <Filter className="w-3.5 h-3.5 text-violet-500" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium">Delivery Filter</span>
              </div>
              {filterDeliveries.size > 0 && (
                <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400 text-[9px] font-bold shrink-0">
                  {filterDeliveries.size}
                </span>
              )}
              <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1" />

            {/* View group */}
            <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-2 pb-1 pt-0.5">
              View
            </DropdownMenuLabel>

            <DropdownMenuItem
              className="flex items-center gap-2.5 px-2 py-2 rounded-md cursor-pointer"
              onClick={() => {
                if (showMap && !showTable) return
                setShowMap((prev) => !prev)
              }}
            >
              <div className="flex h-6 w-6 items-center justify-center shrink-0">
                {showMap
                  ? <Eye className="w-3.5 h-3.5 text-sky-500" />
                  : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
              </div>
              <span className="text-xs font-medium flex-1">Show Map</span>
              {showMap && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
            </DropdownMenuItem>

            <DropdownMenuItem
              className="flex items-center gap-2.5 px-2 py-2 rounded-md cursor-pointer"
              onClick={() => {
                if (showTable && !showMap) return
                setShowTable((prev) => !prev)
              }}
            >
              <div className="flex h-6 w-6 items-center justify-center shrink-0">
                {showTable
                  ? <Eye className="w-3.5 h-3.5 text-emerald-500" />
                  : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
              </div>
              <span className="text-xs font-medium flex-1">Show Table</span>
              {showTable && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1" />

            <DropdownMenuItem
              className="flex items-center gap-2.5 px-2 py-2 rounded-md cursor-pointer"
              onClick={() => { setSettingsView("column-customize"); setSettingsOpen(true) }}
            >
              <div className="flex h-6 w-6 items-center justify-center shrink-0">
                <Columns3 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <span className="text-xs font-medium flex-1">Columns</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
            </DropdownMenuItem>

            <DropdownMenuItem
              className="flex items-center gap-2.5 px-2 py-2 rounded-md cursor-pointer"
              onClick={() => { setSettingsView("sort"); setSettingsOpen(true) }}
            >
              <div className="flex h-6 w-6 items-center justify-center shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <span className="text-xs font-medium flex-1">Sort</span>
              {isOptimized && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                  <Navigation2 className="w-2.5 h-2.5" />OPT
                </span>
              )}
              <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
            </DropdownMenuItem>

            <DropdownMenuItem
              className="flex items-center gap-2.5 px-2 py-2 rounded-md cursor-pointer"
              onClick={() => { setSettingsView("km-settings"); setSettingsOpen(true) }}
            >
              <div className="flex h-6 w-6 items-center justify-center shrink-0">
                <MapPinned className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <span className="text-xs font-medium flex-1">KM Settings</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1" />

            {/* Reset group */}
            <DropdownMenuItem
              className="flex items-center gap-2.5 px-2 py-2 rounded-md cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => {
                setFilterRoutes(new Set())
                setFilterDeliveries(new Set())
                setVisibleColumns(new Set(DEFAULT_VISIBLE_COLUMNS))
              }}
            >
              <div className="flex h-6 w-6 items-center justify-center shrink-0">
                <RotateCcw className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium flex-1">Reset Filters</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="flex items-center gap-2.5 px-2 py-2 rounded-md cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSortKey("code")
                setSortDir("asc")
                setActiveCustomSort(null)
                setIsOptimized(false)
              }}
            >
              <div className="flex h-6 w-6 items-center justify-center shrink-0">
                <RotateCcw className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium flex-1">Reset Sort</span>
            </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </InputGroupAddon>
        </InputGroup>
      </div>

      {/* ── Active Filters Row ──────────────────────────────────────── */}
      {(filterRoutes.size > 0 || filterDeliveries.size > 0) && (
        <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 border-b bg-primary/[0.025] shrink-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 shrink-0">Active:</span>
          {[...filterRoutes].map(id => {
            const label = routeOptions.find(([rid]) => rid === id)?.[1] ?? id
            return (
              <span key={id} className="inline-flex items-center gap-1 h-5 pl-2 pr-1 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 text-[10px] font-medium border border-sky-500/25">
                {label}
                <button onClick={() => setFilterRoutes(prev => { const s = new Set(prev); s.delete(id); return s })} className="rounded-full hover:bg-sky-500/20 p-0.5 transition-colors">
                  <X className="size-2.5" />
                </button>
              </span>
            )
          })}
          {[...filterDeliveries].map(d => {
            const item = DELIVERY_MAP.get(d)
            return (
              <span key={d} className="inline-flex items-center gap-1 h-5 pl-2 pr-1 rounded-full bg-violet-500/10 text-violet-700 dark:text-violet-300 text-[10px] font-medium border border-violet-500/25">
                {item ? item.label : d}
                <button onClick={() => setFilterDeliveries(prev => { const s = new Set(prev); s.delete(d); return s })} className="rounded-full hover:bg-violet-500/20 p-0.5 transition-colors">
                  <X className="size-2.5" />
                </button>
              </span>
            )
          })}
          <button
            onClick={() => { setFilterRoutes(new Set()); setFilterDeliveries(new Set()) }}
            className="ml-auto text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >Clear all</button>
        </div>
      )}

      {showMap && (
        <div className="px-4 py-3 border-b shrink-0">
          <div className="h-[360px] overflow-hidden rounded-2xl border border-border/60 shadow-md bg-card ring-1 ring-border/20">
            <DeliveryMap
              deliveryPoints={displayed}
              scrollZoom={true}
              showPolyline={false}
              markerStyle="pin"
              mapStyle="osm"
              startPoint={DEFAULT_MAP_CENTER}
              includeStartInBounds={false}
              refitToken={displayed.length}
              resizeToken={mapResizeToken}
              focusPoint={focusPoint}
              focusToken={focusToken}
              visiblePointCodes={selectedMapPoints}
            />
          </div>
        </div>
      )}


      {activeActionPoint && (
        <RowInfoModal
          open={!!activeActionPoint}
          onOpenChange={(open) => { if (!open) setActiveActionPoint(null) }}
          point={activeActionPoint}
          isEditMode={false}
        />
      )}

      {/* ── Loading ──────────────────────────────────────────────────── */}
      {loading && !flat.length && (
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <LoadingSpinner size={28} className="text-primary/50" />
            <span className="text-sm font-medium">Loading routes…</span>
          </div>
        </div>
      )}

      {/* ── Error ────────────────────────────────────────────────────── */}
      {error && !loading && (
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="size-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Failed to load</p>
              <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Table — fills remaining height, scrolls inside ── */}
      {showTable && (!loading || flat.length > 0) && !error && (() => {
        const tbodyKey = `${search}|${[...filterRoutes].sort().join(',')}|${[...filterDeliveries].sort().join(',')}|${sortKey}|${sortDir}|${showMap ? 1 : 0}`

        return (
        <div
          className="flex-1 overflow-auto min-h-0 rounded-lg border border-border/70 bg-background shadow-[0_1px_0_0_hsl(var(--border))]"
          style={{ animation: 'loc-table-fade 0.3s ease-out both' }}
        >
          <table className="border-collapse text-center text-xs leading-4 whitespace-normal min-w-max w-full">
            <thead className="sticky top-0 z-10 bg-background/96 backdrop-blur-[1px] border-b border-border/70">
              <tr className="border-b border-border/70">
                {showMap && (
                <th className="px-2 py-2 text-center w-8 align-middle">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => {
                      if (selectedMapPoints.size === displayed.length && displayed.length > 0)
                        setSelectedMapPoints(new Set())
                      else
                        setSelectedMapPoints(new Set(displayed.map(p => p.code)))
                    }}
                    title="Toggle all on map"
                  >
                    {selectedMapPoints.size === displayed.length && displayed.length > 0 ? (
                      <EyeOff className="size-3.5" />
                    ) : (
                      <Eye className="size-3.5" />
                    )}
                  </button>
                </th>
                )}
                {visibleColumns.has("no") && (
                  <th className="px-3 py-2 text-center w-10 align-middle">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">#</span>
                  </th>
                )}
                {visibleColumns.has("route") && (
                  <th className="px-3 py-2 text-center align-middle">
                    <button type="button" onClick={() => handleSort("route")} className="inline-flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 hover:text-muted-foreground transition-colors">
                      Route
                    </button>
                  </th>
                )}
                {visibleColumns.has("code") && (
                  <th className="px-3 py-2 text-center align-middle">
                    <button type="button" onClick={() => handleSort("code")} className="inline-flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 hover:text-muted-foreground transition-colors">
                      Code
                    </button>
                  </th>
                )}
                {visibleColumns.has("name") && (
                  <th className="px-3 py-2 text-center align-middle">
                    <button type="button" onClick={() => handleSort("name")} className="inline-flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 hover:text-muted-foreground transition-colors">
                      Name
                    </button>
                  </th>
                )}
                {visibleColumns.has("delivery") && (
                  <th className="px-3 py-2 text-center align-middle">
                    <button type="button" onClick={() => handleSort("delivery")} className="inline-flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 hover:text-muted-foreground transition-colors">
                      Delivery
                    </button>
                  </th>
                )}
                {visibleColumns.has("km") && (
                  <th className="px-3 py-2 text-center align-middle">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">KM</span>
                  </th>
                )}
                {visibleColumns.has("action") && (
                  <th className="px-2 py-2 text-center w-12 align-middle">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Info</span>
                  </th>
                )}
              </tr>
            </thead>

            <tbody key={tbodyKey}>
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.size + (showMap ? 1 : 0)}>
                    <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
                      <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center">
                        <Search className="size-6 opacity-30" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold">No results found</p>
                        <p className="text-xs text-muted-foreground/60 mt-0.5">Try adjusting your search or filters</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                displayed.map((pt, idx) => {
                  const isDup = pt._dupCode || pt._dupName
                  return (
                  <tr
                    key={`${pt.routeId}-${pt.code}-${idx}`}
                    style={{
                      animation: 'loc-row-in 0.22s ease-out both',
                      animationDelay: `${Math.min(idx * 14, 280)}ms`,
                    }}
                    className={cn(
                      "group/row border-b border-border/30 transition-colors duration-100",
                      isDup
                        ? "bg-amber-50/40 dark:bg-amber-950/15 hover:bg-amber-50/70 dark:hover:bg-amber-900/20"
                        : "hover:bg-primary/[0.035]"
                    )}
                  >
                    {/* Map eye toggle */}
                    {showMap && (
                    <td className="px-2 py-2 text-center w-8 align-middle">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center text-muted-foreground/40 hover:text-foreground transition-colors"
                        onClick={() => {
                          setSelectedMapPoints(prev => {
                            const next = new Set(prev)
                            if (next.has(pt.code)) next.delete(pt.code)
                            else next.add(pt.code)
                            return next
                          })
                        }}
                      >
                        {selectedMapPoints.has(pt.code)
                          ? <Eye className="size-3.5 text-emerald-500" />
                          : <EyeOff className="size-3.5" />}
                      </button>
                    </td>
                    )}

                    {/* Row number */}
                    {visibleColumns.has("no") && (
                      <td className="px-3 py-2 text-center w-10 align-middle">
                        <span className="text-[10px] tabular-nums font-semibold text-muted-foreground/70">{idx + 1}</span>
                      </td>
                    )}

                    {/* Route — colored dot + name */}
                    {visibleColumns.has("route") && (
                      <td className="px-3 py-2 text-center align-middle">
                        <div className="inline-flex items-center justify-center gap-1.5 mx-auto">
                          <span
                            className="shrink-0 w-2 h-2 rounded-full ring-1 ring-black/10"
                            style={{ background: pt.markerColor ?? "#6b7280" }}
                          />
                          <span className="text-[10px] text-foreground/75 font-medium truncate max-w-[110px]">{pt.routeName}</span>
                        </div>
                      </td>
                    )}

                    {/* Code */}
                    {visibleColumns.has("code") && (
                      <td className="px-3 py-2 text-center align-middle">
                        <div className="inline-flex items-center justify-center gap-1 mx-auto">
                          <span className={cn(
                            "inline-block text-[10px] font-mono font-semibold tracking-tight",
                            pt._dupCode
                              ? "text-amber-700 dark:text-amber-300"
                              : "text-foreground/85"
                          )}>
                            {pt.code}
                          </span>
                          {pt._dupCode && (
                            <AlertTriangle className="size-3 text-amber-500 shrink-0" />
                          )}
                        </div>
                      </td>
                    )}

                    {/* Name — clickable, focuses map */}
                    {visibleColumns.has("name") && (
                      <td className="px-3 py-2 text-center align-middle">
                        <div className="inline-flex items-center justify-center gap-1 min-w-0 mx-auto">
                          <button
                            type="button"
                            onClick={() => focusOnMap(pt)}
                            className={cn(
                              "text-[10px] hover:text-primary hover:underline transition-colors truncate max-w-[200px] text-left",
                              pt._dupName
                                ? "text-rose-600 dark:text-rose-400 font-semibold"
                                : "text-foreground/85 font-medium"
                            )}
                          >
                            {pt.name}
                          </button>
                          {pt._dupName && (
                            <AlertTriangle className="size-3 text-rose-500 shrink-0" />
                          )}
                        </div>
                      </td>
                    )}

                    {/* Delivery — plain text without badge */}
                    {visibleColumns.has("delivery") && (
                      <td className="px-3 py-2 text-center align-middle">
                        {(() => {
                          const ed = effectiveDelivery(pt)
                          const item = DELIVERY_MAP.get(ed)
                          if (!item) {
                            return <span className="inline-block text-[10px] text-foreground/70">{ed}</span>
                          }

                          return (
                            <TooltipProvider delayDuration={100}>
                              <Tooltip
                                open={openDeliveryTooltip === pt.code}
                                onOpenChange={(open) => setOpenDeliveryTooltip(open ? pt.code : null)}
                              >
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    className="text-[10px] font-medium text-foreground/75 hover:text-primary transition-colors cursor-help"
                                    aria-label={`${item.fullLabel ?? item.label} delivery schedule`}
                                    onClick={() => setOpenDeliveryTooltip(prev => prev === pt.code ? null : pt.code)}
                                  >
                                    {item.label}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-[220px] text-center text-[11px] z-[9999]">
                                  <div className="font-semibold">{item.fullLabel ?? item.label}</div>
                                  <div className="text-[11px] text-black dark:text-white">{item.description}</div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )
                        })()}
                      </td>
                    )}

                    {/* KM */}
                    {visibleColumns.has("km") && (
                      <td className="px-3 py-2 text-center align-middle">
                        {(() => {
                          const distanceInfo = pointDistanceDetails.get(pointKey(pt))
                          return distanceInfo ? (
                            <TooltipProvider delayDuration={100}>
                              <Tooltip
                                open={openKmTooltip === pt.code}
                                onOpenChange={(open) => setOpenKmTooltip(open ? pt.code : null)}
                              >
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    className="text-[10px] font-semibold cursor-help tabular-nums text-muted-foreground/80 hover:text-primary transition-colors"
                                    onClick={() => setOpenKmTooltip(prev => prev === pt.code ? null : pt.code)}
                                  >
                                    {distanceInfo.value}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-[220px] text-center text-[11px] z-[9999]">
                                  {distanceInfo.tooltip}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <span className="text-muted-foreground/30 text-[10px]">—</span>
                          )
                        })()}
                      </td>
                    )}

                    {/* Action */}
                    {visibleColumns.has("action") && (
                      <td className="px-2 py-2 text-center align-middle">
                        <button
                          type="button"
                          className={cn(
                            "inline-flex size-6 items-center justify-center rounded-lg transition-all hover:scale-110",
                            isDeliveryActive(pt.delivery)
                              ? "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                              : "text-rose-500 dark:text-rose-400 hover:bg-rose-500/10"
                          )}
                          aria-label={`View info for ${pt.name}`}
                          onClick={() => setActiveActionPoint(pt)}
                        >
                          <Info className="size-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
        )
      })()}

      {/* ── Settings Modal ──────────────────────────────────────────── */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="w-[92vw] max-w-sm rounded-2xl p-0 gap-0 overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b border-border shrink-0">
            <DialogHeader className="text-center items-center">
              <DialogTitle className="text-sm font-bold">
                {settingsView === "route-filter"
                  ? "Route Filter"
                  : settingsView === "delivery-filter"
                  ? "Delivery Filter"
                  : settingsView === "column-customize"
                  ? "Column Customize"
                  : settingsView === "km-settings"
                  ? "KM Settings"
                  : "Sort"}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="overflow-y-auto max-h-96 px-5 py-4 space-y-4">
            <div className="mb-2 text-xs text-muted-foreground">
              {settingsView === "route-filter"
                ? "Choose which routes should display in the location table."
                : settingsView === "delivery-filter"
                ? "Choose which delivery statuses should display in the location table."
                : settingsView === "column-customize"
                ? "Pick which columns are visible in the location table."
                : settingsView === "km-settings"
                ? "Choose how KM values are calculated and where the distance starts from."
                : "Choose the sort ordering for location rows."}
            </div>
            {settingsView === "route-filter" && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Route Filters</p>
                  <button
                    type="button"
                    onClick={() => setFilterRoutes(new Set())}
                    className="text-[11px] font-semibold text-primary hover:text-primary/80"
                  >
                    Clear all
                  </button>
                </div>
                <div className="grid gap-2">
                  {routeOptions.map(([id, label]) => {
                    const active = filterRoutes.has(id)
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setFilterRoutes(prev => {
                          const next = new Set(prev)
                          if (next.has(id)) next.delete(id)
                          else next.add(id)
                          return next
                        })}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-xs text-left transition-colors",
                          active ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/50 hover:bg-card hover:shadow-sm"
                        )}
                      >
                        <span className={cn(
                          "flex shrink-0 items-center justify-center w-4 h-4 rounded border transition-colors",
                          active ? "bg-primary border-primary" : "border-muted-foreground/40"
                        )}>
                          {active && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                        </span>
                        <span className="font-medium truncate">{label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {settingsView === "delivery-filter" && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Delivery Filters</p>
                  <button
                    type="button"
                    onClick={() => setFilterDeliveries(new Set())}
                    className="text-[11px] font-semibold text-primary hover:text-primary/80"
                  >
                    Clear all
                  </button>
                </div>
                <div className="grid gap-2">
                  {deliveryOptions.map(d => {
                    const item = DELIVERY_MAP.get(d)
                    const active = filterDeliveries.has(d)
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setFilterDeliveries(prev => {
                          const next = new Set(prev)
                          if (next.has(d)) next.delete(d)
                          else next.add(d)
                          return next
                        })}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-xs text-left transition-colors",
                          active ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/50 hover:bg-card hover:shadow-sm"
                        )}
                      >
                        <span className={cn(
                          "flex shrink-0 items-center justify-center w-4 h-4 rounded border transition-colors",
                          active ? "bg-primary border-primary" : "border-muted-foreground/40"
                        )}>
                          {active && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{item ? item.label : d}</div>
                          {item && <div className="text-[10px] text-muted-foreground truncate">{item.description}</div>}
                        </div>
                        {item && (
                          <span className={cn("shrink-0 inline-flex h-5 px-2 rounded-full items-center text-[10px] font-semibold", item.color, item.textColor)}>
                            {item.label}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {settingsView === "km-settings" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground">KM Calculation</p>
                  <button
                    type="button"
                    onClick={() => applyKmSettings("direct", DEFAULT_MAP_CENTER)}
                    className="text-[11px] font-semibold text-primary hover:text-primary/80"
                  >
                    Reset
                  </button>
                </div>

                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => applyKmSettings("direct", draftKmStartPoint)}
                    className={cn(
                      "w-full flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-xs transition-colors",
                      kmMode === "direct" ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/50 hover:bg-card hover:shadow-sm"
                    )}
                  >
                    <span className="font-medium">Starting Point</span>
                    <span className="text-[10px] text-muted-foreground">Distance from start</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyKmSettings("step", draftKmStartPoint)}
                    className={cn(
                      "w-full flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-xs transition-colors",
                      kmMode === "step" ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/50 hover:bg-card hover:shadow-sm"
                    )}
                  >
                    <span className="font-medium">Step by Step</span>
                    <span className="text-[10px] text-muted-foreground">Cumulative route distance</span>
                  </button>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Starting Point</p>
                    <span className="text-[10px] text-muted-foreground">{kmStartPoint.lat.toFixed(4)}, {kmStartPoint.lng.toFixed(4)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-muted-foreground">Latitude</label>
                      <Input
                        type="number"
                        step="0.000001"
                        value={draftKmStartPoint.lat}
                        onChange={(e) => setDraftKmStartPoint(prev => ({ ...prev, lat: Number(e.target.value) }))}
                        onBlur={() => setKmStartPoint({ ...draftKmStartPoint })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-muted-foreground">Longitude</label>
                      <Input
                        type="number"
                        step="0.000001"
                        value={draftKmStartPoint.lng}
                        onChange={(e) => setDraftKmStartPoint(prev => ({ ...prev, lng: Number(e.target.value) }))}
                        onBlur={() => setKmStartPoint({ ...draftKmStartPoint })}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button type="button" size="sm" onClick={useCurrentLocationForKmStartPoint} disabled={isLocatingKmStartPoint}>
                      {isLocatingKmStartPoint ? "Detecting..." : "Use My Current Location"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => applyKmSettings(kmMode, DEFAULT_MAP_CENTER)}
                    >
                      Use Default Point
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {settingsView === "sort" && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Sort</p>
                  <button
                    type="button"
                    onClick={() => { setSortKey("code"); setSortDir("asc"); setActiveCustomSort(null); setIsOptimized(false) }}
                    className="text-[11px] font-semibold text-primary hover:text-primary/80"
                  >
                    Reset
                  </button>
                </div>
                <div className="grid gap-2">
                  {([
                    { key: "code" as SortKey, label: "Code" },
                    { key: "name" as SortKey, label: "Name" },
                    { key: "route" as SortKey, label: "Route" },
                    { key: "delivery" as SortKey, label: "Delivery" },
                  ]).map(({ key, label }) => {
                    const active = !activeCustomSort && sortKey === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => { handleSort(key); setActiveCustomSort(null) }}
                        className={cn(
                          "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border text-xs transition-colors",
                          active ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/50 hover:bg-card hover:shadow-sm text-foreground"
                        )}
                      >
                        <span className="font-medium">{label}</span>
                        {active ? (
                          <span className="text-[10px] text-muted-foreground">{sortDir === "asc" ? "↑ Asc" : "↓ Desc"}</span>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setIsOptimized(v => !v)}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-xs transition-colors",
                    isOptimized ? "border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300" : "border-border bg-muted/50 hover:bg-card hover:shadow-sm text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Navigation2 className="w-3 h-3" />
                    Optimise Route
                  </span>
                  {isOptimized && <Check className="w-3 h-3" />}
                </button>
                {customSortOrders.length > 0 && (
                  <div className="space-y-2.5 border-t border-border pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-foreground">My Sort List</p>
                    <div className="grid gap-2">
                      {customSortOrders.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setActiveCustomSort(s)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs transition-colors",
                            activeCustomSort?.id === s.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/50 hover:bg-card hover:shadow-sm text-foreground"
                          )}
                        >
                          <span className="truncate">{s.label}</span>
                          {activeCustomSort?.id === s.id && <Check className="w-3 h-3 text-primary" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {settingsView === "column-customize" && (
              <div className="space-y-2.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Visible Columns</p>
                <div className="space-y-2">
                  {ALL_COLUMNS.map(col => {
                    const visible = visibleColumns.has(col.key)
                    return (
                      <button
                        key={col.key}
                        onClick={() => toggleColumn(col.key)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-xs text-left transition-colors",
                          visible ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted/40 text-muted-foreground"
                        )}
                      >
                        <span className={cn("flex shrink-0 items-center justify-center w-4 h-4 rounded border", visible ? "bg-primary border-primary" : "border-muted-foreground/40")}>
                          {visible && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{col.label}</span>
                          <span className="ml-2 text-[10px] text-muted-foreground/60">{col.description}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
                <div className="space-y-2.5 border-t border-border pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Column Preset</p>
                  <button
                    onClick={() => setVisibleColumns(new Set(DEFAULT_VISIBLE_COLUMNS))}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/15 transition-colors"
                  >
                    <RotateCcw className="size-3" />
                    Reset to default columns
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="px-5 py-3 border-t border-border flex justify-end gap-2 shrink-0">
            <Button size="sm" variant="outline" onClick={() => setSettingsOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}

