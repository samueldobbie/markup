import "firebase/auth"
import "firebase/firestore"

import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
})

const auth = getAuth(app)
const firestore = getFirestore(app)

// const hostname = window.location.hostname

// if (hostname === "localhost" || hostname === "0.0.0.0") {
//   auth.useEmulator(`http://${hostname}:7005`)
//   db.useEmulator(hostname, 7010)
// }

export { auth, firestore }
