import { useState } from "react"
import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
  onItemClick,
  onSubItemClick,
  searchQuery = "",
  currentPage,
  openItem: controlledOpenItem,
  onOpenItemChange,
  label,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    color?: string
    page?: string
    isActive?: boolean
    items?: {
      title: string
      url: string
      page?: string
    }[]
  }[]
  onItemClick?: (title: string) => void
  onSubItemClick?: (page: string) => void
  searchQuery?: string
  currentPage?: string
  openItem?: string | null
  onOpenItemChange?: (item: string | null) => void
  label?: string
}) {
  const initialOpen = items.find((i) => i.isActive && i.items?.length)?.title ?? null
  const [localOpenItem, setLocalOpenItem] = useState<string | null>(initialOpen)

  const isControlled = controlledOpenItem !== undefined
  const openItem = isControlled ? controlledOpenItem : localOpenItem
  const setOpenItem = (val: string | null) => {
    if (isControlled) onOpenItemChange?.(val)
    else setLocalOpenItem(val)
  }

  const isSearching = searchQuery.trim().length > 0

  const handleToggle = (title: string, hasChildren: boolean, page?: string) => {
    if (!hasChildren) {
      if (page) onSubItemClick?.(page)
      else onItemClick?.(title)
      return
    }
    setOpenItem(openItem === title ? null : title)
    onItemClick?.(title)
  }

  return (
    <SidebarGroup className="px-0 py-1.5">
      {label && <SidebarGroupLabel className="mb-1 h-6 px-2.5 text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/55">{label}</SidebarGroupLabel>}
      <SidebarMenu className="gap-0.5">
        {isSearching && items.length === 0 ? null : (
        items.map((item) => {
          const hasChildren = !!item.items?.length
          const isOpen = isSearching ? true : openItem === item.title
          const sectionColor = item.color ?? "hsl(var(--sidebar-primary))"
          const isActive = Boolean(item.isActive)

          return (
            <Collapsible
              key={item.title}
              asChild
              open={hasChildren ? isOpen : undefined}
              onOpenChange={hasChildren ? (open) => { if (!isSearching) setOpenItem(open ? item.title : null) } : undefined}
            >
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={item.title}
                  className={`group relative h-10 justify-start rounded-lg px-2 py-2 transition-all ${isActive ? "bg-sidebar-accent/80 text-foreground shadow-sm ring-1 ring-sidebar-border/50" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"}`}
                  onClick={() => handleToggle(item.title, hasChildren, item.page)}
                >
                  {isActive && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full" style={{ backgroundColor: sectionColor }} />}
                  <div className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${isActive ? "bg-background/70" : "bg-sidebar-accent/35 group-hover:bg-background/50"}`}>
                    <item.icon
                      className="size-[15px] shrink-0 transition-colors"
                      style={{ color: sectionColor }}
                    />
                  </div>
                  <span
                    className="flex-1 text-[11px] font-semibold leading-tight text-foreground/85"
                  >
                    {item.title}
                  </span>
                  {hasChildren && <ChevronRight className={`size-3.5 text-muted-foreground/60 transition-all ${isOpen ? "rotate-90 text-foreground" : ""}`} />}
                </SidebarMenuButton>

                {hasChildren ? (
                  <>
                    <div
                      aria-hidden={!isOpen}
                      style={{
                        display: "grid",
                        gridTemplateRows: isOpen ? "1fr" : "0fr",
                        transition: "grid-template-rows 0.28s cubic-bezier(0.25,0.1,0.25,1), opacity 0.28s cubic-bezier(0.25,0.1,0.25,1)",
                        opacity: isOpen ? 1 : 0,
                      }}
                    >
                      <div className="overflow-hidden">
                        <SidebarMenuSub
                          className={`ml-2 transition-all duration-300 ${!isOpen ? "pointer-events-none" : ""}`}
                          style={{
                            borderLeft: `2px solid color-mix(in srgb, ${sectionColor} 25%, transparent)`,
                            paddingLeft: "0.75rem",
                            marginLeft: "1.5rem",
                          }}
                        >
                          {item.items?.map((subItem) => {
                            const isActive = currentPage === subItem.page
                            return (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  className={`relative rounded-md px-2.5 py-2 text-[11px] transition-all ${isActive ? "bg-sidebar-accent/65 font-semibold text-foreground shadow-sm" : "text-muted-foreground hover:bg-sidebar-accent/55 hover:text-foreground"}`}
                                  onClick={() => {
                                    if (subItem.page) onSubItemClick?.(subItem.page)
                                  }}
                                >
                                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-sidebar-primary" />}
                                  <span className={`font-medium leading-tight ${isActive ? "font-semibold" : ""}`}>{subItem.title}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )
                          })}
                        </SidebarMenuSub>
                      </div>
                    </div>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          )
        })
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
