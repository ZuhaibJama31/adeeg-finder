import messaging from "@react-native-firebase/messaging";

// Handles notifications when app is closed or in background
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log("Background notification:", remoteMessage);
});