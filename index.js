import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// 🔴 MUST be here — handles notifications when app is fully closed
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Background notification:', remoteMessage);
  // OS shows the popup automatically, nothing else needed here
});

AppRegistry.registerComponent(appName, () => App);