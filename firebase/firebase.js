import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBS7MOHsT2kyr_l3NK9v3fuVN5_ZQseKrY",
  authDomain: "whereimatchat.firebaseapp.com",
  projectId: "whereimatchat",
  storageBucket: "whereimatchat.appspot.com",
  messagingSenderId: "873678375914",
  appId: "1:873678375914:web:6469493e55059539504093",
  measurementId: "G-YCKV0BWYRR"
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}
export { firebase }






/*import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBS7MOHsT2kyr_l3NK9v3fuVN5_ZQseKrY",
  authDomain: "whereimatchat.firebaseapp.com",
  projectId: "whereimatchat",
  storageBucket: "whereimatchat.appspot.com",
  messagingSenderId: "873678375914",
  appId: "1:873678375914:web:6469493e55059539504093",
  measurementId: "G-YCKV0BWYRR"
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}
export { firebase }
*/

