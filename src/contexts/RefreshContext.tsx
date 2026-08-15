import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react"

type RefreshHandler = () => void | Promise<void>

interface RefreshContextValue {
  register: (handler: RefreshHandler | null) => () => void
  trigger: () => Promise<void>
  isRefreshing: boolean
  hasHandler: boolean
}

const RefreshContext = createContext<RefreshContextValue | null>(null)

export function RefreshProvider({ children }: { children: ReactNode }) {
  const handlerRef = useRef<RefreshHandler | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasHandler, setHasHandler] = useState(false)

  const register = useCallback((handler: RefreshHandler | null) => {
    handlerRef.current = handler
    setHasHandler(handler !== null)
    return () => {
      if (handlerRef.current === handler) {
        handlerRef.current = null
        setHasHandler(false)
      }
    }
  }, [])

  const trigger = useCallback(async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    try {
      const handler = handlerRef.current
      if (handler) {
        await handler()
      } else {
        // Fallback: keep the user on the current page and let the active view decide how to refresh.
        await new Promise(resolve => setTimeout(resolve, 150))
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("fcalendar:soft-refresh"))
        }
      }
    } finally {
      setIsRefreshing(false)
    }
  }, [isRefreshing])

  return (
    <RefreshContext.Provider value={{ register, trigger, isRefreshing, hasHandler }}>
      {children}
    </RefreshContext.Provider>
  )
}

export function useRefresh(): RefreshContextValue {
  const ctx = useContext(RefreshContext)
  if (!ctx) {
    throw new Error("useRefresh must be used within RefreshProvider")
  }
  return ctx
}

/**
 * Register a page-level refresh handler. The handler is unregistered automatically
 * when the component unmounts. Use a stable callback (wrap in useCallback if needed).
 */
export function useRegisterRefresh(handler: RefreshHandler | null): void {
  const ctx = useContext(RefreshContext)
  useEffect(() => {
    if (!ctx) return
    if (!handler) return
    return ctx.register(handler)
  }, [ctx, handler])
}
