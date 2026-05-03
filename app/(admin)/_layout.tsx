import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";

import { AdminNotificationBanner } from "@/components/AdminNotificationBanner";
import { useColors } from "@/hooks/useColors";
import { useNewBookingNotifications } from "@/hooks/useNewBookingNotifications";

function AdminNotificationLayer() {
  const { alerts, dismiss } = useNewBookingNotifications();
  if (alerts.length === 0) return null;
  const latest = alerts[0];
  return (
    <AdminNotificationBanner
      key={latest.id}
      booking={latest.booking}
      onDismiss={() => dismiss(latest.id)}
    />
  );
}

export default function AdminTabLayout() {
  const colors      = useColors();
  const colorScheme = useColorScheme();
  const isDark      = colorScheme === "dark";
  const isIOS       = Platform.OS === "ios";
  const isWeb       = Platform.OS === "web";

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor:   colors.primary,
          tabBarInactiveTintColor: colors.mutedForeground,
          headerShown: false,
          tabBarLabelStyle: {
            fontFamily: "Inter_600SemiBold",
            fontSize: 10,
            letterSpacing: 0.2,
          },
          tabBarStyle: {
            position: "absolute",
            backgroundColor: isIOS ? "transparent" : colors.card,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            elevation: 0,
            ...(isWeb ? { height: 84, paddingTop: 8 } : {}),
          },
          tabBarBackground: () =>
            isIOS ? (
              <BlurView
                intensity={100}
                tint={isDark ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
              />
            ) : isWeb ? (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: colors.card },
                ]}
              />
            ) : null,
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color, focused }) =>
              isIOS ? (
                <SymbolView
                  name={focused ? "chart.bar.fill" : "chart.bar"}
                  tintColor={color}
                  size={22}
                />
              ) : (
                <Feather name="bar-chart-2" size={21} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="users"
          options={{
            title: "Users",
            tabBarIcon: ({ color, focused }) =>
              isIOS ? (
                <SymbolView
                  name={focused ? "person.2.fill" : "person.2"}
                  tintColor={color}
                  size={22}
                />
              ) : (
                <Feather name="users" size={21} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="categories"
          options={{
            title: "Categories",
            tabBarIcon: ({ color, focused }) =>
              isIOS ? (
                <SymbolView
                  name={
                    focused ? "square.grid.2x2.fill" : "square.grid.2x2"
                  }
                  tintColor={color}
                  size={22}
                />
              ) : (
                <Feather name="grid" size={21} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: "Bookings",
            tabBarIcon: ({ color, focused }) =>
              isIOS ? (
                <SymbolView
                  name={
                    focused ? "calendar.badge.clock" : "calendar"
                  }
                  tintColor={color}
                  size={22}
                />
              ) : (
                <Feather name="calendar" size={21} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, focused }) =>
              isIOS ? (
                <SymbolView
                  name={focused ? "gearshape.fill" : "gearshape"}
                  tintColor={color}
                  size={22}
                />
              ) : (
                <Feather name="settings" size={21} color={color} />
              ),
          }}
        />
      </Tabs>

      {/* Notification banners float above all tabs */}
      <AdminNotificationLayer />
    </View>
  );
}
