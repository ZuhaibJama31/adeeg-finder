import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import messaging from "@react-native-firebase/messaging";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/* ---------------- AUTH ROUTING ---------------- */

function AuthGate() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inAdminGroup = segments[0] === "(admin)";
    const inTabsGroup = segments[0] === "(tabs)";

    const isAdmin = user?.role === "admin";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/welcome");
      return;
    }

    if (isAuthenticated) {
      if (inAuthGroup) {
        router.replace(isAdmin ? "/(admin)/dashboard" : "/(tabs)");
        return;
      }

      if (isAdmin && inTabsGroup) {
        router.replace("/(admin)/dashboard");
        return;
      }

      if (!isAdmin && inAdminGroup) {
        router.replace("/(tabs)");
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />

      <Stack.Screen
        name="category/[id]"
        options={{ headerShown: true, title: "Category" }}
      />
      <Stack.Screen
        name="worker/[id]"
        options={{ headerShown: true, title: "Service Worker" }}
      />
      <Stack.Screen
        name="booking/new"
        options={{ headerShown: true, title: "Book a Service" }}
      />
      <Stack.Screen
        name="booking/[id]"
        options={{ headerShown: true, title: "Booking" }}
      />
      <Stack.Screen
        name="settings/account"
        options={{ headerShown: true, title: "Account & Security" }}
      />
      <Stack.Screen
        name="settings/help"
        options={{ headerShown: true, title: "Help & Support" }}
      />
      <Stack.Screen
        name="settings/about"
        options={{ headerShown: true, title: "About AdeegFinder" }}
      />
    </Stack>
  );
}

/* ---------------- ROOT LAYOUT ---------------- */

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  /* ---------------- FIREBASE FOREGROUND NOTIFICATIONS ---------------- */

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log("📩 Foreground Notification:", remoteMessage);

      alert(
        remoteMessage.notification?.title +
          "\n" +
          remoteMessage.notification?.body
      );
    });

    return unsubscribe;
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AuthProvider>
                <AuthGate />
              </AuthProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}