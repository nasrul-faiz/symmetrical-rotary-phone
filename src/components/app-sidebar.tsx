import * as React from "react"
import {
  CheckIcon, ChevronsUpDown, Cog, House, Images,
  Moon, Package, Pencil, Sun, Users, MessageCircle, Globe,
  LayoutDashboard, Layers, BellRing, type LucideIcon,
} from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading"
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useEditMode } from "@/contexts/EditModeContext"
import { useTheme } from "@/hooks/use-theme"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NavMain } from "@/components/nav-main"

type NavSubItem = {
  title: string
  url: string
  page: string
}

type NavItem = {
  title: string
  url: string
  icon: LucideIcon
  color: string
  page?: string
  items?: NavSubItem[]
}

type NavGroup = {
  label: string
  items: NavItem[]
}

/* ── Workspace switcher options ─────────────────────────────────── */
const dropdownOptions = [
  {
    id: "web",
    name: "Web",
    description: "Main web experience",
    initial: "W",
    color: "bg-sky-600",
    page: "home",
    icon: Globe,
    iconColor: "text-sky-500",
  },
  {
    id: "bot-whatsapp",
    name: "Bot WhatsApp",
    description: "WhatsApp bot controls",
    initial: "B",
    color: "bg-emerald-600",
    page: "bot-profile",
    icon: MessageCircle,
    iconColor: "text-emerald-500",
  },
]

/* ── Web navigation — grouped for collapsible dropdowns ─────────── */
const webNavGroups: NavGroup[] = [
  {
    label: "Dashboard",
    items: [
      { title: "Home", url: "#", icon: House, page: "home", color: "hsl(239 68% 68%)" },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        title: "Route & Delivery",
        url: "#",
        icon: Package,
        color: "hsl(158 46% 52%)",
        items: [
          { title: "Route List",  url: "#", page: "route-list" },
          { title: "Location",    url: "#", page: "deliveries" },
        ],
      },
      {
        title: "Team & Planning",
        url: "#",
        icon: Users,
        color: "hsl(28 70% 60%)",
        items: [
          { title: "Rooster",     url: "#", page: "rooster" },
          { title: "Plano VM",    url: "#", page: "plano-vm" },
        ],
      },
      {
        title: "Media",
        url: "#",
        icon: Images,
        color: "hsl(334 54% 68%)",
        items: [
          { title: "Site Images", url: "#", page: "gallery-site-images" },
        ],
      },
    ],
  },
  {
    label: "General",
    items: [
      { title: "Settings", url: "#", icon: Cog, page: "settings", color: "hsl(40 64% 60%)" },
    ],
  },
]

/* ── Bot navigation — grouped ────────────────────────────────────── */
const botNavGroups: NavGroup[] = [
  {
    label: "Bot",
    items: [
      { title: "Profile",   url: "#", icon: Users,          page: "bot-profile",          color: "hsl(158 46% 52%)" },
      { title: "Account",   url: "#", icon: LayoutDashboard, page: "bot-dashboard",        color: "hsl(158 46% 52%)" },
      { title: "Reminder",  url: "#", icon: BellRing,       page: "bot-reminder",         color: "hsl(27 78% 56%)" },
      {
        title: "Messages",
        url: "#",
        icon: MessageCircle,
        color: "hsl(332 70% 62%)",
        items: [
          { title: "Send Chat", url: "#", page: "bot-send-chat" },
          { title: "Schedule Chat", url: "#", page: "bot-schedule-chat" },
          { title: "Delete Massage", url: "#", page: "bot-delete-message" },
          { title: "Contact", url: "#", page: "bot-contact" },
        ],
      },
    ],
  },
  {
    label: "Commands",
    items: [
      {
        title: "Commands",
        url: "#",
        icon: Layers,
        color: "hsl(212 60% 66%)",
        items: [
          { title: "Command",        url: "#", page: "bot-command" },
          { title: "Custom Command", url: "#", page: "bot-custom-command" },
        ],
      },
      { title: "Bot Settings", url: "#", icon: Cog, page: "bot-settings", color: "hsl(40 64% 60%)" },
    ],
  },
]

function getActiveDropdownOption(currentPage: string | undefined) {
  if (!currentPage) return dropdownOptions[0]
  if (["bot-dashboard", "bot-profile", "bot-reminder", "bot-send-chat", "bot-schedule-chat", "bot-delete-message", "bot-contact", "bot-command", "bot-custom-command", "bot-settings"].includes(currentPage)) return dropdownOptions[1]
  return dropdownOptions[0]
}

export function AppSidebar({
  onNavigate,
  currentPage,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  onNavigate?: (page: string) => void
  currentPage?: string
}) {
  const { setOpenMobile } = useSidebar()
  const { isEditMode, setIsEditMode, hasUnsavedChanges, saveChanges, isSaving, discardChanges } = useEditMode()
  const { mode, resolvedMode, toggleMode } = useTheme()
  const isDark = resolvedMode === "dark"
  const modeLabel = mode === "dark" ? "Dark Mode" : "Light Mode"
  const [unsavedDialogOpen, setUnsavedDialogOpen] = React.useState(false)
  const [isEditModeTransitioning, setIsEditModeTransitioning] = React.useState(false)
  const [openNavItem, setOpenNavItem] = React.useState<string | null>(null)
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = React.useState(false)

  const navigate = React.useCallback(
    (page: string) => { onNavigate?.(page); setOpenMobile(false) },
    [onNavigate, setOpenMobile]
  )

  const applyEditModeChange = (next: boolean) => {
    setIsEditModeTransitioning(true)
    window.setTimeout(() => { setIsEditMode(next); setIsEditModeTransitioning(false) }, 260)
  }

  const handleEditModeToggle = () => {
    if (isEditModeTransitioning) return
    if (isEditMode && hasUnsavedChanges) setUnsavedDialogOpen(true)
    else applyEditModeChange(!isEditMode)
  }

  const activeDropdownOption = getActiveDropdownOption(currentPage)
  const isBotWhatsappView = activeDropdownOption.id === "bot-whatsapp"
  const navGroups = isBotWhatsappView ? botNavGroups : webNavGroups

  return (
    <>
      {isWorkspaceDropdownOpen && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-40 bg-background/10 backdrop-blur-[2px] transition-all duration-150"
        />
      )}

      <Sidebar variant="floating" {...props}>

        {/* ── Header — workspace switcher ───────────────────── */}
        <SidebarHeader className="border-b border-sidebar-border/60 bg-gradient-to-b from-sidebar-accent/45 to-sidebar/70 p-2.5 pb-3">
          <SidebarMenu className="gap-0">
            <SidebarMenuItem>
              <DropdownMenu open={isWorkspaceDropdownOpen} onOpenChange={setIsWorkspaceDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="group/ws h-14 rounded-xl border border-sidebar-border/70 bg-sidebar/75 px-2.5 shadow-sm transition-all hover:border-sidebar-border hover:bg-sidebar-accent/75 hover:shadow-md"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${activeDropdownOption.color} text-white text-[13px] font-bold shrink-0 shadow-sm ring-4 ring-background/20`}>
                      {activeDropdownOption.initial}
                    </div>
                    <div className="flex flex-col leading-tight min-w-0">
                      <span className="truncate text-[13px] font-semibold tracking-[-0.01em]">{activeDropdownOption.name}</span>
                      <span className="truncate text-[11px] text-muted-foreground">{activeDropdownOption.description}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 shrink-0 text-muted-foreground/60 transition-transform group-data-[state=open]/ws:rotate-180" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[var(--radix-dropdown-menu-trigger-width)] rounded-xl border border-border/70 bg-popover p-1 shadow-md"
                  align="start"
                  sideOffset={6}
                >
                  <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-2 pt-2 pb-1">
                    Workspace
                  </DropdownMenuLabel>

                  {dropdownOptions.map((item) => {
                    const isActive = item.id === activeDropdownOption.id
                    return (
                      <DropdownMenuItem
                        key={item.id}
                        className="gap-2.5 mx-1 my-0.5 rounded-lg"
                        onSelect={() => navigate(item.page)}
                      >
                        <div className={`flex h-7 w-7 items-center justify-center rounded-md ${item.color} text-white text-xs font-bold shrink-0 shadow-sm`}>
                          {item.initial}
                        </div>
                        <div className="flex flex-col leading-tight min-w-0">
                          <span className="text-sm font-medium">{item.name}</span>
                          <span className="text-[11px] text-muted-foreground">{item.description}</span>
                        </div>
                        {isActive && (
                          <CheckIcon className="ml-auto size-3.5 shrink-0 text-primary" />
                        )}
                      </DropdownMenuItem>
                    )
                  })}

                  <DropdownMenuSeparator className="mx-1 my-1.5" />

                  <DropdownMenuItem
                    className="gap-2.5 mx-1 my-0.5 rounded-lg"
                    disabled={isEditModeTransitioning}
                    onSelect={handleEditModeToggle}
                  >
                    {isEditModeTransitioning
                      ? <LoadingSpinner size={14} className="shrink-0 ml-0.5" />
                      : <Pencil className={`size-4 shrink-0 ${isEditMode ? "text-emerald-500" : "text-muted-foreground"}`} />}
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-medium">
                        {isEditModeTransitioning ? "Switching…" : isEditMode ? "Turn Off Edit Mode" : "Turn On Edit Mode"}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {isEditMode ? "Exit editing" : "Enable in-page editing"}
                      </span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="mx-1 my-1.5" />

                  <div className="px-3 py-1.5 pb-2">
                    <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
                      Switch between Web and Bot WhatsApp workspace.
                    </p>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* ── Content — collapsible nav groups ─────────────── */}
        <SidebarContent className="gap-0 bg-sidebar/80 px-1.5 py-2">
          {navGroups.map((group) => (
            <NavMain
              key={group.label}
              label={group.label}
              items={group.items.map((item) => ({
                ...item,
                isActive: currentPage === item.page ||
                  item.items?.some((sub) => currentPage === sub.page),
              }))}
              currentPage={currentPage}
              openItem={openNavItem}
              onOpenItemChange={setOpenNavItem}
              onSubItemClick={navigate}
              onItemClick={(title) => {
                // flat items (no children) — find page and navigate
                for (const g of navGroups) {
                  const found = g.items.find((i) => i.title === title && !i.items?.length)
                  if (found && found.page) { navigate(found.page); return }
                }
              }}
            />
          ))}
        </SidebarContent>

        {/* ── Footer — theme toggle ─────────────────────────── */}
        <SidebarFooter className="border-t border-sidebar-border/60 bg-sidebar/80 pt-2.5">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={toggleMode}
                className="h-10 justify-start rounded-xl border border-sidebar-border/60 bg-sidebar-accent/35 px-3 transition-all hover:border-sidebar-border hover:bg-sidebar-accent/75"
              >
                {isDark
                  ? <Moon className="size-4 text-indigo-400" />
                  : <Sun className="size-4 text-amber-500" />}
                <span className="text-sm font-medium">{modeLabel}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <p className="text-center text-[10px] font-semibold text-muted-foreground/50 pb-0.5 tracking-wide">
            Dbrutals v1.0.0
          </p>
        </SidebarFooter>
      </Sidebar>

      {/* ── Unsaved changes dialog ───────────────────────── */}
      <Dialog open={unsavedDialogOpen} onOpenChange={setUnsavedDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. What would you like to do before turning off Edit Mode?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => { discardChanges(); setUnsavedDialogOpen(false); setIsEditMode(false) }}>
              Discard Changes
            </Button>
            <Button onClick={async () => { await saveChanges(); setUnsavedDialogOpen(false); setIsEditMode(false) }} disabled={isSaving}>
              {isSaving ? "Saving…" : "Save & Turn Off"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
