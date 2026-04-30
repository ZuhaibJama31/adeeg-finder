// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyADKKs6MQBXdjXlEcvWHk-tRAF_gYyA9YY",
  authDomain: "adeeg-finder-app.firebaseapp.com",
  projectId: "adeeg-finder-app",
  storageBucket: "adeeg-finder-app.firebasestorage.app",
  messagingSenderId: "426832202827",
  appId: "1:426832202827:web:595d8cb63d2f19250511ce",
  measurementId: "G-HDN5CBPRWD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);