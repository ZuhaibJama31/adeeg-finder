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

function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
  if (isLoading) return;

  const inAuthGroup = segments[0] === "(auth)";
  const inTabsGroup = segments[0] === "(tabs)";

  // not logged in → ALWAYS force auth
  if (!isAuthenticated && !inAuthGroup) {
    router.replace("/(auth)/welcome");
  }

  
  if (isAuthenticated && inAuthGroup) {
    router.replace("/(tabs)");
  }
}, [isAuthenticated, isLoading, segments]);
  return (
    <Stack screenOptions={{ headerShown: false, headerBackTitle: "Back" }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
