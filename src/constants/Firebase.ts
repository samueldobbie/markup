import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { initializeApp } from "firebase/app"

const app = initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
})

const auth = getAuth(app)
const firestore = getFirestore(app)

export { auth, firestore }
