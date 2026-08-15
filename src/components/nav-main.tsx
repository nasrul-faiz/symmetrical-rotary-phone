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
    <SidebarGroup className="py-1">
      {label && <SidebarGroupLabel className="mb-1 px-2 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</SidebarGroupLabel>}
      <SidebarMenu className="gap-1">
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
                  className={`group relative h-10 justify-start rounded-lg px-2.5 py-2 transition-colors ${isActive ? "bg-muted/80 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]" : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground"}`}
                  onClick={() => handleToggle(item.title, hasChildren, item.page)}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-md">
                    <item.icon
                      className="size-[14px] shrink-0 transition-colors"
                      style={{ color: sectionColor }}
                    />
                  </div>
                  <span
                    className={`flex-1 text-[11px] font-medium leading-tight ${isActive ? "text-foreground/90" : "text-foreground/90"}`}
                  >
                    {item.title}
                  </span>
                  {hasChildren && <ChevronRight className={`size-3.5 transition-all ${isOpen ? "rotate-90" : ""}`} />}
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
                                  className={`relative rounded-md px-2.5 py-2 text-[11px] transition-colors ${isActive ? "bg-muted/80 font-semibold shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]" : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground"}`}
                                  onClick={() => {
                                    if (subItem.page) onSubItemClick?.(subItem.page)
                                  }}
                                >
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
