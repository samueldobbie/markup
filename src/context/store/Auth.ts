import { User } from "firebase/auth"
import { atom } from "recoil"

const userIdState = atom({
  key: "userIdState",
  default: "demo",
})

const userState = atom({
  key: "userState",
  default: null as User | null,
  dangerouslyAllowMutability: true,
})

export { userIdState, userState }
