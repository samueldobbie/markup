import { toAnnotateUrl } from "./Path"

const DEMO_DOMAINS = [
  {
    id: "9c3c3f56-d71b-404a-821e-96b93906451c",
    name: "Healthcare (Clinical Letters)",
  },
  {
    id: "1i3c3f56-d71b-404a-821e-96b93906451c",
    name: "Media (News Articles)",
  },
  {
    id: "2i3c3f56-d71b-404a-821e-96b93906451c",
    name: "Legal (Contracts)",
  },
  {
    id: "3i3c3f56-d71b-404a-821e-96b93906451c",
    name: "Finance (Financial Reports)",
  },
]

const DEMO_PATHS = DEMO_DOMAINS.map((demoDomain) => toAnnotateUrl(demoDomain.id))

export { DEMO_DOMAINS, DEMO_PATHS }
