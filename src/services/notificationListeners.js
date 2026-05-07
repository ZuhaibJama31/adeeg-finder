import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';

// ── App is OPEN ─────────────────────────────────────────────────────────────
// Firebase won't show popup when app is open, so we show Alert manually
export function setupForegroundListener() {
  const unsubscribe = messaging().onMessage(async (message) => {
    const title = message.notification?.title ?? 'Notification';
    const body  = message.notification?.body  ?? '';

    Alert.alert(title, body, [
      { text: 'OK', style: 'cancel' },
    ]);
  });

  return unsubscribe; // return so App.tsx can clean it up
}

// ── App is MINIMIZED, user taps notification ────────────────────────────────
export function setupBackgroundTapListener() {
  messaging().onNotificationOpenedApp((message) => {
    console.log('Tapped from background:', message.data);
    // navigate here if you want
  });
}

// ── App was CLOSED, user taps notification ──────────────────────────────────
export async function checkInitialNotification() {
  const message = await messaging().getInitialNotification();
  if (message) {
    console.log('Tapped from killed state:', message.data);
    // navigate here if you want
  }
}