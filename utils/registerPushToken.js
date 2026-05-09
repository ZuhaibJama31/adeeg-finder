// utils/registerPushToken.js
// Call this after login (or in your auth context) to save the token to the server.
//
// Usage:
//   import registerPushToken from '@/utils/registerPushToken';
//   await registerPushToken(userAuthToken);

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import axios from 'axios';   // or your api client

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'https://your-api.com';

export default async function registerPushToken(bearerToken) {
  if (!Device.isDevice) {
    console.warn('Push notifications only work on physical devices');
    return;
  }

  // ── Ask permission ──────────────────────────────────────────────────────────
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Push notification permission denied');
    return;
  }

  // ── Get token ───────────────────────────────────────────────────────────────
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
  console.log('Expo Push Token:', expoPushToken);

  // ── Android channel ─────────────────────────────────────────────────────────
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name:      'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // ── Save to server ──────────────────────────────────────────────────────────
  try {
    await axios.post(
      `${API_BASE}/api/save-expo-token`,
      { expo_token: expoPushToken },
      { headers: { Authorization: `Bearer ${bearerToken}` } }
    );
    console.log('Push token saved to server ✅');
  } catch (err) {
    console.error('Failed to save push token:', err?.response?.data ?? err.message);
  }
}
