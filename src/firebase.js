import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

export const firebaseConfig = {
  
  apiKey: "AIzaSyADKKs6MQBXdjXlEcvWHk-tRAF_gYyA9YY",
  authDomain: "adeeg-finder-app.firebaseapp.com",
  projectId: "adeeg-finder-app",
  storageBucket: "adeeg-finder-app.firebasestorage.app",
  messagingSenderId: "426832202827",
  appId: "1:426832202827:web:595d8cb63d2f19250511ce",
  measurementId: "G-HDN5CBPRWD",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Only for web (safe check)
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;

export { app };