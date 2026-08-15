import { useEffect, useMemo, useState } from "react"
import { useTheme as useNextTheme } from "next-themes"

export type ThemeMode = "light" | "dark" | "system"
export type ResolvedColorMode = "light" | "dark"

const COLOR_MODE_OPTIONS: ThemeMode[] = ["light", "dark", "system"]

/** meta theme-color backgrounds */
const META_BG: Record<ResolvedColorMode, string> = {
  light: "#f4f7fb",
  dark:  "#0b1020",
}

const META_TILE: Record<ResolvedColorMode, string> = {
  light: "#e8eef7",
  dark:  "#131a2c",
}

const APPLE_STATUS_BAR_STYLE: Record<ResolvedColorMode, string> = {
  light: "default",
  dark:  "black",
}

export type AppFont =
  | "system"
  | "inter"
  | "poppins"
  | "roboto"
  | "nunito"
  | "plus-jakarta-sans"
  | "quicksand"
  | "figtree"
  | "barlow"
  | "ubuntu"
  | "work-sans"
  | "outfit"
  | "caveat"

export const FONT_OPTIONS: { id: AppFont; label: string; family: string; googleId?: string }[] = [
  { id: "system",            label: "Plain / Biasa",     family: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  { id: "inter",             label: "Inter",             family: "'Inter', sans-serif",             googleId: "Inter:wght@300;400;500;600;700" },
  { id: "poppins",           label: "Poppins",           family: "'Poppins', sans-serif",           googleId: "Poppins:wght@300;400;500;600;700" },
  { id: "roboto",            label: "Roboto",            family: "'Roboto', sans-serif",            googleId: "Roboto:wght@300;400;500;700" },
  { id: "nunito",            label: "Nunito",            family: "'Nunito', sans-serif",            googleId: "Nunito:wght@300;400;500;600;700" },
  { id: "plus-jakarta-sans", label: "Plus Jakarta Sans", family: "'Plus Jakarta Sans', sans-serif", googleId: "Plus+Jakarta+Sans:wght@300;400;500;600;700" },
  { id: "quicksand",         label: "Quicksand",         family: "'Quicksand', sans-serif",         googleId: "Quicksand:wght@300;400;500;600;700" },
  { id: "figtree",           label: "Figtree",           family: "'Figtree', sans-serif",           googleId: "Figtree:wght@300;400;500;600;700" },
  { id: "barlow",            label: "Barlow",            family: "'Barlow', sans-serif",            googleId: "Barlow:wght@300;400;500;600;700" },
  { id: "ubuntu",            label: "Ubuntu",            family: "'Ubuntu', sans-serif",            googleId: "Ubuntu:wght@300;400;500;700" },
  { id: "work-sans",         label: "Work Sans",         family: "'Work Sans', sans-serif",         googleId: "Work+Sans:wght@300;400;500;600;700" },
  { id: "outfit",            label: "Outfit",            family: "'Outfit', sans-serif",            googleId: "Outfit:wght@300;400;500;600;700" },
  { id: "caveat",            label: "Caveat",            family: "'Caveat', cursive",               googleId: "Caveat:wght@400;500;600;700" },
]

export const DEFAULT_APP_FONT: AppFont = "system"

function getStoredOrDefaultFont(): AppFont {
  const stored = localStorage.getItem("app-font")
  const isValid = stored !== null && FONT_OPTIONS.some(f => f.id === stored)
  if (isValid) return stored as AppFont
  localStorage.setItem("app-font", DEFAULT_APP_FONT)
  return DEFAULT_APP_FONT
}

export type AppZoom = "80" | "85" | "90" | "95" | "100" | "105" | "110" | "115" | "120"
export type TextSize = "13" | "14" | "15" | "16" | "17" | "18" | "20"

const TEXT_SIZE_OPTIONS: TextSize[] = ["13", "14", "15", "16", "17", "18", "20"]

const APP_ZOOM_OPTIONS: AppZoom[] = ["80", "85", "90", "95", "100", "105", "110", "115", "120"]

function getStoredOrDefaultTextSize(): TextSize {
  const stored = localStorage.getItem("text-size")
  if (stored !== null && TEXT_SIZE_OPTIONS.includes(stored as TextSize)) {
    return stored as TextSize
  }
  const fallback: TextSize = "15"
  localStorage.setItem("text-size", fallback)
  return fallback
}

function getStoredOrDefaultZoom(): AppZoom {
  const stored = localStorage.getItem("app-zoom")
  const defaultZoom: AppZoom = "100"

  if (stored !== null && APP_ZOOM_OPTIONS.includes(stored as AppZoom)) {
    return stored as AppZoom
  }

  localStorage.setItem("app-zoom", defaultZoom)
  return defaultZoom
}

/** Inject a Google Fonts <link> once per googleId */
const loadedFonts = new Set<string>()
function loadGoogleFont(googleId: string) {
  if (loadedFonts.has(googleId)) return
  loadedFonts.add(googleId)
  const link = document.createElement("link")
  link.rel  = "stylesheet"
  link.href = `https://fonts.googleapis.com/css2?family=${googleId}&display=swap`
  document.head.appendChild(link)
}

export function useTheme() {
  const { theme: activeTheme, setTheme: setNextTheme, resolvedTheme } = useNextTheme()
  const [appFont, setAppFont] = useState<AppFont>(() => getStoredOrDefaultFont())
  const [appZoom, setAppZoom] = useState<AppZoom>(() => getStoredOrDefaultZoom())
  const [textSize, setTextSize] = useState<TextSize>(() => getStoredOrDefaultTextSize())

  const theme: ThemeMode = useMemo(() => {
    if (activeTheme === "light" || activeTheme === "dark") return activeTheme
    return "system"
  }, [activeTheme])

  const resolvedMode: ResolvedColorMode = useMemo(
    () => (resolvedTheme === "dark" ? "dark" : "light"),
    [resolvedTheme],
  )

  const setMode = (nextMode: ThemeMode) => {
    setNextTheme(nextMode)
    try {
      localStorage.setItem("colorMode", nextMode)
    } catch {
      // localStorage may be unavailable in some environments
    }
  }

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "colorMode" || event.newValue === null) return
      if (!COLOR_MODE_OPTIONS.includes(event.newValue as ThemeMode)) return
      setNextTheme(event.newValue as ThemeMode)
    }

    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [setNextTheme])

  // Apply color mode and update PWA metadata.
  useEffect(() => {
    try {
      localStorage.setItem("fcalendar_color_mode", resolvedMode)
    } catch {
      // ignore localStorage failures
    }

    const metaColor = META_BG[resolvedMode]
    const allMetas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    if (allMetas.length === 0) {
      const meta = document.createElement("meta")
      meta.name = "theme-color"
      meta.setAttribute("content", metaColor)
      document.head.appendChild(meta)
    } else {
      allMetas.forEach(meta => meta.setAttribute("content", metaColor))
    }

    const tileColor = META_TILE[resolvedMode]
    document.querySelectorAll<HTMLMetaElement>('meta[name="msapplication-TileColor"]').forEach(meta => {
      meta.setAttribute("content", tileColor)
    })

    const statusBar = document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-status-bar-style"]')
    if (statusBar) {
      statusBar.setAttribute("content", APPLE_STATUS_BAR_STYLE[resolvedMode])
    }
  }, [resolvedMode])

  // Apply font
  useEffect(() => {
    const opt = FONT_OPTIONS.find(f => f.id === appFont)
    if (!opt) return
    if (opt.googleId) loadGoogleFont(opt.googleId)
    document.documentElement.style.setProperty("--app-font", opt.family)
    document.body.style.fontFamily = opt.family
    localStorage.setItem("app-font", appFont)
  }, [appFont])

  // Apply zoom via CSS variable only — actual zoom applied to <main> in App.tsx
  // so sidebar (fixed/floating) is never affected by CSS zoom scaling
  useEffect(() => {
    document.body.style.zoom = ""
    document.documentElement.style.setProperty("--app-zoom", appZoom)
    document.documentElement.style.setProperty("--app-zoom-ratio", String(Number(appZoom) / 100))
    localStorage.setItem("app-zoom", appZoom)
  }, [appZoom])

  // Apply text size via CSS custom property as single source of truth
  useEffect(() => {
    document.documentElement.style.setProperty("--text-size-base", `${textSize}px`)
    localStorage.setItem("text-size", textSize)
  }, [textSize])

  // App language is fixed to English
  useEffect(() => {
    document.documentElement.setAttribute("lang", "en")
  }, [])

  const toggleMode = () => {
    if (theme === "dark") {
      setMode("light")
    } else if (theme === "light") {
      setMode("dark")
    } else {
      setMode(resolvedMode === "dark" ? "light" : "dark")
    }
  }

  // Backward-compat aliases
  const setTheme = setMode
  const toggleTheme = toggleMode

  return {
    mode: theme,
    setMode,
    toggleMode,
    resolvedMode,
    isDark: resolvedMode === "dark",
    isSystemMode: theme === "system",
    theme,
    setTheme,
    toggleTheme,
    appFont,
    setAppFont,
    appZoom,
    setAppZoom,
    textSize,
    setTextSize,
  }
}
