import { atom, selector } from "recoil"
import { recoilPersist } from "recoil-persist"
import { Collection } from "constants/Collection"
// import { IOntology, ITableData, OrderDirection, QuerySnapshot } from "@commons/types"
import { userState } from "./Auth"
import { firestore } from "constants/Firebase"
import { IOntology } from "constants/Ontology"
import { ITableData, OrderDirection } from "constants/Table"

const { persistAtom } = recoilPersist()

const dashboardShowTutorialState = atom({
  key: "showTutorialState",
  default: true,
  effects: [persistAtom],
})

const dashboardStepState = atom({
  key: "dashboardStepState",
  default: {
    openedDocs: false,
    addedOntology: false,
    createdSession: false,
  },
  effects: [persistAtom],
})

const dashboardOntologyState = selector({
  key: "dashboardOntologyState",
  get: async ({ get }) => {
    const user = get(userState)

    if (!user) return []

    // const doc = await firestore
    //   .collection(Collection.User)
    //   .doc(user.uid)
    //   .collection(Collection.Ontology)
    //   .get()

    // return parseOntologies(doc)

    return [] as IOntology[]
  },
})

const dashboardOntologySelectedState = atom({
  key: "dashboardOntologySelectedState",
  default: [] as string[],
})

const dashboardOntologyOrderState = atom({
  key: "dashboardOntologyOrderState",
  default: {
    direction: "asc" as OrderDirection,
    property: "name" as keyof ITableData,
  },
})

const dashboardOntologyPageState = atom({
  key: "dashboardOntologyPageState",
  default: {
    active: 0,
    rows: 5,
  }
})

// function parseOntologies(snapshot: QuerySnapshot) {
//   const ontologies = [] as IOntology[]

//   snapshot.forEach((doc) => {
//     if (doc.exists) {
//       const data = doc.data()

//       if (data.name && data.content) {
//         ontologies.push({
//           id: doc.id,
//           name: data.name,
//           content: data.content,
//         })
//       }
//     }
//   })

//   return ontologies
// }

export {
  dashboardShowTutorialState,
  dashboardStepState,
  dashboardOntologyOrderState,
  dashboardOntologyPageState,
  dashboardOntologySelectedState,
  dashboardOntologyState,
}
