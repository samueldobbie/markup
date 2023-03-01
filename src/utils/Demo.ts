import { toAnnotateUrl } from "./Path"

const DEMO_DOMAINS = [
  {
    id: "9c3c3f56-d71b-404a-821e-96b93906451c",
    name: "Healthcare",
    description: "A set of notional clinical letters",
  },
  {
    id: "f73f221c-f93e-417a-94df-50071dca8397",
    name: "Media",
    description: "Real news articles from The Guardian",
  },
  {
    id: "8c0a99a7-d8a2-4f99-8b04-206c6e4e26cc",
    name: "Legal",
    description: "A set of contracts",
  },
  {
    id: "1add93ce-dc9e-4acb-9ab8-e7bf3866aba9",
    name: "Finance",
    description: "A set of financial documents",
  },
]

const DEMO_IDS = DEMO_DOMAINS.map((demoDomain) => demoDomain.id)
const DEMO_PATHS = DEMO_IDS.map((demoId) => toAnnotateUrl(demoId))

export { DEMO_DOMAINS, DEMO_IDS, DEMO_PATHS }
