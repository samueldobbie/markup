import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { MantineColorScheme } from "@mantine/core"

interface ThemeStore {
  colorScheme: MantineColorScheme
  setColorScheme: (colorScheme: MantineColorScheme) => void
  toggleColorScheme: (value?: MantineColorScheme) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      colorScheme: "dark",
      setColorScheme: (colorScheme) => set({ colorScheme }),
      toggleColorScheme: (value) =>
        set({
          colorScheme: value ?? (get().colorScheme === "dark" ? "light" : "dark"),
        }),
    }),
    { name: "markup-theme" },
  ),
)
