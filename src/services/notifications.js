import messaging from '@react-native-firebase/messaging';

// Request permission
export async function requestPermission() {
  const authStatus = await messaging().requestPermission();

  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Permission granted');
  }
}

// Get FCM token
export async function getFCMToken() {
  await requestPermission();

  const token = await messaging().getToken();
  console.log('FCM TOKEN:', token);

  return token;
}