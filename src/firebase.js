import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
 
const firebaseConfig = {
  apiKey: "AIzaSyADKKs6MQBXdjXlEcvWHk-tRAF_gYyA9YY",
  authDomain: "adeeg-finder-app.firebaseapp.com",
  projectId: "adeeg-finder-app",
  storageBucket: "adeeg-finder-app.appspot.com",
  messagingSenderId: "426832202827",
  appId: "1:426832202827:web:595d8cb63d2f19250511ce",
};
 
const app = initializeApp(firebaseConfig);
 
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
 