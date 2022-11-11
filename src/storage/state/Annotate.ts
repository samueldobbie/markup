import { atom } from "recoil"
import { WorkspaceAnnotation } from "storage/database"

const documentIndexState = atom({
  key: "documentIndexState",
  default: 0,
})

const activeEntityState = atom({
  key: "activeEntityState",
  default: "",
})

const entityColoursState = atom<Record<string, string>>({
  key: "entityColoursState",
  default: {},
})

const populatedAttributeState = atom<Record<string, string[]>>({
  key: "populatedAttributeState",
  default: {},
})

const annotationsState = atom<WorkspaceAnnotation[][]>({
  key: "annotationsState",
  default: [],
})

// const annotationState = selector({
//   key: "annotationState",
//   get: async ({ get }) => {
//     const userId = get(userIdState)
//     const sessionId = get(sessionIdState)

//     if (!userId || !sessionId) {
//       return {} as IAnnotationMap
//     }

//     const annotations = {} as IAnnotationMap

//     const documentSnapshot = await db
//       .collection(Collection.User)
//       .doc(userId)
//       .collection(Collection.Session)
//       .doc(sessionId)
//       .collection(Collection.Document)
//       .get()

//     for (const doc of documentSnapshot.docs) {
//       if (doc.exists) {
//         const documentAnnotations = [] as IAnnotation[]
        
//         await doc
//           .ref
//           .collection(Collection.Annotation)
//           .get()
//           .then((annotationSnapshot) => {

//             for (const annotation of annotationSnapshot.docs) {
//               if (annotation.exists) {
//                 const data = annotation.data()

//                 documentAnnotations.push({
//                   id: annotation.id,
//                   entity: data.entity,
//                   selection: data.selection,
//                   startIndex: data.startIndex,
//                   endIndex: data.endIndex,
//                   attributes: data.attributes,
//                 })
//               }
//             }

//             return documentAnnotations
//           })
//           .catch((error) => showErrorToast(error.message))

//         annotations[doc.id] = documentAnnotations
//       }
//     }

//     return annotations
//   }
// })

export {
  documentIndexState,
  activeEntityState,
  entityColoursState,
  populatedAttributeState,
  annotationsState,
}
