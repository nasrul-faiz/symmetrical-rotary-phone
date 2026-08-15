import { Sun, Moon, Smartphone } from "lucide-react"
import { useTheme } from "@/hooks/use-theme"

export function ThemeToggle() {
  const { theme, resolvedMode, toggleTheme } = useTheme()
  const isDark = resolvedMode === "dark"
  const isAuto = theme === "system"
  const label = isAuto ? `Auto (${isDark ? "Dark" : "Light"})` : (isDark ? "Dark" : "Light")

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      className="ml-2 inline-flex h-9 items-center gap-2 rounded-full border border-border/70 bg-gradient-to-b from-background/95 to-muted/60 px-3 text-xs font-medium text-muted-foreground shadow-[0_10px_24px_rgba(15,23,42,0.08)] ring-1 ring-white/40 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:text-foreground hover:shadow-[0_18px_36px_rgba(15,23,42,0.14)] dark:ring-white/5 dark:hover:shadow-[0_18px_40px_rgba(0,0,0,0.34)]"
    >
      <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
        {isAuto ? <Smartphone className="size-3.5" /> : isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
      </span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

export default ThemeToggle
