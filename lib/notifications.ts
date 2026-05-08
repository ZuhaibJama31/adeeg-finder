import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { savePushToken } from './api';

// Configure notification handler for foreground messages
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner:true,
    shouldShowList:true
  }),
});

// Register for push notifications and send token to backend
export async function setupNotifications() {
  try {
    // Request permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token permission');
      return;
    }

    // Get Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PROJECT_ID,
    });

    console.log('Expo Push Token:', tokenData.data);

    // Save token to backend for ALL authenticated users
    try {
      await savePushToken(tokenData.data);
      console.log('Push token saved successfully');
    } catch (error) {
      console.warn('Failed to save push token to server:', error);
    }

    // Android notification channel setup
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // Handle notifications received while app is in foreground
    const receivedSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
    });

    // Handle notification taps
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('Notification tapped:', data);
      
      if (data?.type === 'new_booking') {
        console.log('Should navigate to booking:', data.booking_id);
      }
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  } catch (error) {
    console.error('Failed to setup notifications:', error);
  }
}