import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { savePushToken } from './api';
import { router } from 'expo-router';

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
export async function setupNotifications() {
  try {
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

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PROJECT_ID,
    });

    console.log('Expo Push Token:', tokenData.data);

    try {
      await savePushToken(tokenData.data);
      console.log('Push token saved successfully');
    } catch (error) {
      console.warn('Failed to save push token to server:', error);
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // Foreground — notification arrives while app is open
    const receivedSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('📩 Notification received in foreground:', notification);
    });

    // Tap — user taps the notification
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('👆 Notification tapped:', data);
      handleNavigate(data);
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };

  } catch (error) {
    console.error('Failed to setup notifications:', error);
  }
}

function handleNavigate(data: Record<string, any>) {
  switch (data?.type) {
    case 'new_client':
      router.push('/(admin)/users');
      break;

    case 'new_booking':
      router.push({
        pathname: '/booking/new',  
        params: { id: data.booking_id },
      });
      break;

    case 'booking_status':
      router.push(
        {
          pathname: '/booking/[id]',
          params:{id: data.booking_id}
        }
      );
      break;

    default:
      break;
  }
}