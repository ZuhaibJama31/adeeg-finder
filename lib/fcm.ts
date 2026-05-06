import messaging from "@react-native-firebase/messaging";
import { apiRequest } from "./api";

// 🔐 Request permission
export async function requestNotificationPermission() {
  const authStatus = await messaging().requestPermission();

  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  return enabled;
}

// 📲 Get FCM token
export async function getFCMToken() {
  const token = await messaging().getToken();
  return token;
}

// 💾 Send token to Laravel
export async function saveTokenToServer(token: string) {
  await apiRequest("/save-token", {
    method: "POST",
    body: { token },
  });
}

// 🚀 MAIN SETUP FUNCTION
export async function setupFCM() {
  const permission = await requestNotificationPermission();

  if (!permission) return;

  const token = await getFCMToken();

  if (token) {
    console.log("FCM TOKEN:", token);
    await saveTokenToServer(token);
  }
}