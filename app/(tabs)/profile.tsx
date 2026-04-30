import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { apiRequest } from "@/lib/api";
import { asArray } from "@/lib/format";
import type { Booking } from "@/lib/types";

function unwrap(value: Booking[] | { data?: Booking[] } | null | undefined): Booking[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return asArray(value.data);
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { user, logout } = useAuth();

  const bookingsQuery = useQuery({
    queryKey: ["bookings"],
    queryFn: () =>
      apiRequest<Booking[] | { data?: Booking[] }>("/bookings"),
  });

  const bookings = useMemo(() => unwrap(bookingsQuery.data), [bookingsQuery.data]);

  const isWorker = user?.role === "worker";

  const stats = useMemo(() => {
    if (isWorker) {
      const completed = bookings.filter((b) => b.status === "completed");
      const earnings = completed.reduce(
        (sum, b) => sum + (b.agreed_price ?? 0),
        0,
      );
      return [
        { label: "Active", value: bookings.filter((b) => ["pending", "accepted", "in_progress"].includes(b.status)).length },
        { label: "Completed", value: completed.length },
        { label: "Earned", value: `$${earnings.toFixed(0)}` },
      ];
    }
    return [
      { label: "Total", value: bookings.length },
      {
        label: "Active",
        value: bookings.filter((b) =>
          ["pending", "accepted", "in_progress"].includes(b.status),
        ).length,
      },
      {
        label: "Completed",
        value: bookings.filter((b) => b.status === "completed").length,
      },
    ];
  }, [bookings, isWorker]);

  const onLogout = () => {
    const doLogout = async () => {
      await logout();
      router.replace("/(auth)/welcome");
    };
    if (Platform.OS === "web") {
      doLogout();
      return;
    }
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: doLogout },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{
          paddingBottom: (isWeb ? 100 : 96) + 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={[
            styles.header,
            {
              paddingTop: (isWeb ? 67 : insets.top) + 14,
            },
          ]}
        >
          <View style={styles.profileRow}>
  
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{user?.name ?? "Guest"}</Text>
              <View style={styles.roleRow}>
                <View style={[styles.roleBadge]}>
                  <Feather
                    name={isWorker ? "briefcase" : "user"}
                    size={11}
                    color="#FFFFFF"
                  />
                  <Text style={styles.roleText}>
                    {isWorker ? " Worker" : "Client"}
                  </Text>
                </View>
                {user?.city ? (
                  <View style={styles.metaRow}>
                    <Feather name="map-pin" size={11} color="rgba(255,255,255,0.85)" />
                    <Text style={styles.metaText}>{user.city}</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.metaRow}>
                <Feather name="phone" size={11} color="rgba(255,255,255,0.85)" />
                <Text style={styles.metaText}>{user?.phone ?? "—"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            {stats.map((s) => (
              <View key={s.label} style={styles.statCard}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {isWorker && (
            <Card style={{ marginBottom: 16 }}>
              <View style={styles.earningsHeader}>
                <View>
                  <Text
                    style={[styles.earningsLabel, { color: colors.mutedForeground }]}
                  >
                    Total earnings
                  </Text>
                  <Text style={[styles.earningsValue, { color: colors.foreground }]}>
                    $
                    {bookings
                      .filter((b) => b.status === "completed")
                      .reduce((s, b) => s + (b.agreed_price ?? 0), 0)
                      .toFixed(2)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.earningsIcon,
                    { backgroundColor: colors.accent },
                  ]}
                >
                  <Feather name="trending-up" size={20} color={colors.primary} />
                </View>
              </View>
              <Text
                style={[
                  styles.earningsHint,
                  { color: colors.mutedForeground },
                ]}
              >
                {bookings.filter((b) => b.status === "completed").length} jobs
                completed.
              </Text>
            </Card>
          )}

          <SettingsList
            items={[
              {
                icon: "calendar",
                label: "My bookings",
                onPress: () => router.push("/(tabs)/bookings"),
              },
              {
                icon: "shield",
                label: "Account & security",
                onPress: () => router.replace("/settings/account"),
              },
              {
                icon: "bell",
                label: "Notifications",
                onPress: () => {},
              },
              {
                icon: "help-circle",
                label: "Help & support",
                onPress: () => router.push("/settings/help"),
              },
              {
                icon: "info",
                label: "About AdeegFinder",
                onPress: () => router.push("/settings/about"),
              },
            ]}
          />

          <View style={{ marginTop: 24 }}>
            <Button
              label="Sign out"
              variant="outline"
              icon="log-out"
              onPress={onLogout}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function SettingsList({
  items,
}: {
  items: {
    icon: React.ComponentProps<typeof Feather>["name"];
    label: string;
    onPress?: () => void;
  }[];
}) {
  const colors = useColors();
  return (
    <Card padded={false}>
      {items.map((item, idx) => (
        <Pressable
          key={item.label}
          onPress={item.onPress}
          style={({ pressed }) => [
            styles.settingsRow,
            {
              borderBottomColor: colors.border,
              borderBottomWidth: idx === items.length - 1 ? 0 : 1,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <View
            style={[styles.settingsIcon, { backgroundColor: colors.accent }]}
          >
            <Feather name={item.icon} size={16} color={colors.primary} />
          </View>
          <Text
            style={[styles.settingsLabel, { color: colors.foreground }]}
          >
            {item.label}
          </Text>
          <Feather
            name="chevron-right"
            size={18}
            color={colors.mutedForeground}
          />
        </Pressable>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  profileRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  name: {
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    fontSize: 22,
    letterSpacing: -0.4,
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  roleText: {
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },
  metaText: {
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },
  statCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "flex-start",
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    fontSize: 22,
    letterSpacing: -0.4,
  },
  statLabel: {
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginTop: 4,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  earningsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  earningsLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  earningsValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 30,
    letterSpacing: -0.8,
    marginTop: 4,
  },
  earningsHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 10,
  },
  earningsIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsLabel: {
    flex: 1,
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
});
