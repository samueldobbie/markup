import { atom } from "recoil"
import { recoilPersist } from "recoil-persist"
import { ColorScheme } from "@mantine/core"

const { persistAtom } = recoilPersist()

const themeState = atom<ColorScheme>({
  key: "themeState",
  default: "dark",
  effects: [persistAtom],
})

export { themeState }
