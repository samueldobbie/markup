import ThemeMode from "constants/Theme"
import { atom, selector } from "recoil"
import { recoilPersist } from "recoil-persist"

const { persistAtom } = recoilPersist()

const themeModeState = atom({
  key: "themeModeState",
  default: ThemeMode.Light,
  effects_UNSTABLE: [persistAtom],
})

const themeModeSelector = selector({
  key: "themeModeSelector",
  get: ({ get }) => get(themeModeState),
  set: ({ get, set }) => {
    const currentValue = get(themeModeState)

    const updatedThemeMode = currentValue == ThemeMode.Light
      ? ThemeMode.Dark
      : ThemeMode.Light

    set(themeModeState, updatedThemeMode)
  }
})

export { themeModeSelector, themeModeState }
