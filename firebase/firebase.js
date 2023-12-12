import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'

const firebaseConfig = {
  apiKey: "",
  authDomain: ".com",
  projectId: "",
  storageBucket: ".appspot.com",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}
export { firebase }




