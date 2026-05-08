import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { apiRequest } from './api';

// Configure notification handler for foreground messages
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, 
    shouldShowList: true,
  }),
});

// Register for push notifications and send token to backend
export async function setupNotifications(authToken: string) {
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

    // Get Expo token
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PROJECT_ID, // Add this to your .env
    });

    console.log('Expo Push Token:', token.data);

    // Send token to backend - ONLY for admin users
    await apiRequest('/push-token', {
      method: 'POST',
      body: { token: token.data },
      auth: true,
      headers: { Authorization: `Bearer ${authToken}` }
    });

    // Android channel setup
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // Add notification listener
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      // Handle navigation based on notification data
      if (data?.type === 'new_booking') {
        // Navigate to bookings screen
        console.log('Navigate to booking:', data.booking_id);
      }
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  } catch (error) {
    console.error('Failed to setup notifications:', error);
  }
}