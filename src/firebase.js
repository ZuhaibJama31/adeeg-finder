
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyADKKs6MQBXdjXlEcvWHk-tRAF_gYyA9YY",
  authDomain: "adeeg-finder-app.firebaseapp.com",
  projectId: "adeeg-finder-app",
  storageBucket: "adeeg-finder-app.appspot.com",
  messagingSenderId: "426832202827",
  appId: "1:426832202827:web:595d8cb63d2f19250511ce",
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

export const auth = getAuth(app);