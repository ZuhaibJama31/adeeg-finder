import messaging from '@react-native-firebase/messaging';
import { apiRequest } from './api';

export async function requestNotificationPermission() {
  const authStatus = await messaging().requestPermission();

  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

export async function setupFCM() {
  const granted = await requestNotificationPermission();
  if (!granted) return;

  const token = await messaging().getToken();

  if (token) {
    console.log('FCM TOKEN:', token);
    await apiRequest('/save-token', {
      method: 'POST',
      body: { token },
    });
  }

  // If token refreshes, save the new one automatically
  messaging().onTokenRefresh(async (newToken) => {
    await apiRequest('/save-token', {
      method: 'POST',
      body: { token: newToken },
    });
  });
}