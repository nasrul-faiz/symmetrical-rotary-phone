import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App"
import { SharedRoutePage } from "./components/SharedRoutePage"
import { ThemeProvider } from "./components/theme-provider"
import { registerServiceWorker } from "./lib/pwa"
import { DEFAULT_APP_FONT, FONT_OPTIONS } from "./hooks/use-theme"

// ── Apply persisted display settings before first paint ──────────────────────
;(function applyStoredDisplaySettings() {
  try {
    const storedColorMode = localStorage.getItem("colorMode")
    const colorMode = storedColorMode === "light" || storedColorMode === "dark" || storedColorMode === "system"
      ? storedColorMode
      : "light"
    const resolvedColorMode = colorMode === "system"
      ? (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : colorMode
    document.documentElement.classList.toggle("dark", resolvedColorMode === "dark")
    localStorage.removeItem("eye-comfort")
    localStorage.setItem("fcalendar_color_mode", resolvedColorMode)

    const rawZoom = localStorage.getItem("app-zoom")
    const allowedZooms = new Set(["80", "85", "90", "95", "100", "105", "110", "115", "120"])
    const defaultZoom = "100"
    const zoom = rawZoom !== null && allowedZooms.has(rawZoom) ? rawZoom : defaultZoom
    const zoomRatio = Number(zoom) / 100
    document.body.style.zoom = `${zoom}%`
    document.documentElement.style.setProperty("--app-zoom", zoom)
    document.documentElement.style.setProperty("--app-zoom-ratio", String(zoomRatio))

    const handleResize = () => {
      const stored = localStorage.getItem("app-zoom")
      const nextZoom = stored !== null && allowedZooms.has(stored) ? stored : defaultZoom
      const nextRatio = Number(nextZoom) / 100
      document.body.style.zoom = `${nextZoom}%`
      document.documentElement.style.setProperty("--app-zoom", nextZoom)
      document.documentElement.style.setProperty("--app-zoom-ratio", String(nextRatio))
    }
    window.addEventListener("resize", handleResize, { passive: true })

    const storedTextSize = localStorage.getItem("text-size")
    const allowedTextSizes = new Set(["13", "14", "15", "16", "17", "18", "20"])
    const textSize = storedTextSize !== null && allowedTextSizes.has(storedTextSize)
      ? storedTextSize
      : "15"
    document.documentElement.style.setProperty("--text-size-base", `${textSize}px`)

    const storedFont = localStorage.getItem("app-font")
    const hasValidStoredFont = storedFont !== null && FONT_OPTIONS.some(f => f.id === storedFont)
    const fontId = hasValidStoredFont ? storedFont : DEFAULT_APP_FONT
    if (!hasValidStoredFont) localStorage.setItem("app-font", DEFAULT_APP_FONT)
    const fontOpt = FONT_OPTIONS.find(f => f.id === fontId)
    if (fontOpt) {
      if (fontOpt.googleId) {
        const link = document.createElement("link")
        link.rel  = "stylesheet"
        link.href = `https://fonts.googleapis.com/css2?family=${fontOpt.googleId}&display=swap`
        document.head.appendChild(link)
      }
      const defaultFont = FONT_OPTIONS.find(f => f.id === DEFAULT_APP_FONT)
      if (defaultFont?.googleId && fontOpt.googleId !== defaultFont.googleId) {
        const preload = document.createElement("link")
        preload.rel  = "stylesheet"
        preload.href = `https://fonts.googleapis.com/css2?family=${defaultFont.googleId}&display=swap`
        document.head.appendChild(preload)
      }
      document.documentElement.style.setProperty("--app-font", fontOpt.family)
      document.body.style.fontFamily = fontOpt.family
    }
  } catch { /* localStorage may be unavailable */ }
})()

const _sharedRouteMatch = window.location.pathname.match(/\/routelistpage\/([A-Za-z0-9]+)\/?$/)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true} storageKey="colorMode">
      {_sharedRouteMatch
        ? <SharedRoutePage code={_sharedRouteMatch[1]} />
        : <App />
      }
    </ThemeProvider>
  </StrictMode>
)

registerServiceWorker()
