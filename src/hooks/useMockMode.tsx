"use client"

import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react"

interface MockModeContextValue {
  isMockMode: boolean
  toggleMockMode: () => void
}

const MockModeContext = createContext<MockModeContextValue>({
  isMockMode: false,
  toggleMockMode: () => {},
})

/**
 * Provides a global toggle for mock-data mode.
 * When enabled, dashboard pages render with placeholder data from `src/mocks/`
 * instead of hitting Firebase or Wix APIs.
 */
export function MockModeProvider({ children }: { children: ReactNode }) {
  const [isMockMode, setIsMockMode] = useState(false)

  const value = useMemo(
    () => ({
      isMockMode,
      toggleMockMode: () => setIsMockMode((prev) => !prev),
    }),
    [isMockMode],
  )

  return (
    <MockModeContext.Provider value={value}>
      {children}
    </MockModeContext.Provider>
  )
}

export function useMockMode(): MockModeContextValue {
  return useContext(MockModeContext)
}
