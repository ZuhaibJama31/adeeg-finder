import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
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

type SettingsItem = {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
};

function SettingsGroup({
  title,
  items,
}: {
  title: string;
  items: SettingsItem[];
}) {
  const colors = useColors();
  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={[styles.groupTitle, { color: colors.mutedForeground }]}
      >
        {title}
      </Text>
      <Card padded={false}>
        {items.map((item, idx) => (
          <Pressable
            key={item.label}
            onPress={item.onPress}
            style={({ pressed }) => [
              styles.row,
              {
                borderBottomColor: colors.border,
                borderBottomWidth: idx === items.length - 1 ? 0 : 1,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.rowIcon,
                {
                  backgroundColor: item.danger ? "#FEE2E2" : colors.accent,
                },
              ]}
            >
              <Feather
                name={item.icon}
                size={16}
                color={item.danger ? "#DC2626" : colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.rowLabel,
                  {
                    color: item.danger
                      ? colors.destructive
                      : colors.foreground,
                  },
                ]}
              >
                {item.label}
              </Text>
              {item.subtitle ? (
                <Text
                  style={[
                    styles.rowSubtitle,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {item.subtitle}
                </Text>
              ) : null}
            </View>
            <Feather
              name="chevron-right"
              size={18}
              color={colors.mutedForeground}
            />
          </Pressable>
        ))}
      </Card>
    </View>
  );
}

export default function AdminSettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { user, logout } = useAuth();

  const handleLogout = () => {
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
            { paddingTop: (isWeb ? 67 : insets.top) + 14 },
          ]}
        >
          <Text style={styles.eyebrow}>Admin</Text>
          <Text style={styles.title}>Settings</Text>

          <View style={styles.profileCard}>
            <Avatar name={user?.name} size={52} />
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>
                {user?.name ?? "Admin"}
              </Text>
              <Text style={styles.profilePhone}>
                {user?.phone ?? ""}
              </Text>
              <View style={styles.adminPill}>
                <Feather name="shield" size={10} color="#FFFFFF" />
                <Text style={styles.adminPillText}>Administrator</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <SettingsGroup
            title="PLATFORM"
            items={[
              {
                icon: "bar-chart-2",
                label: "Analytics",
                subtitle: "View detailed metrics",
                onPress: () => {},
              },
              {
                icon: "bell",
                label: "Notifications",
                subtitle: "Push & email alerts",
                onPress: () => {},
              },
              {
                icon: "globe",
                label: "API Status",
                subtitle: "Monitor backend health",
                onPress: () => {},
              },
            ]}
          />

          <SettingsGroup
            title="ACCOUNT"
            items={[
              {
                icon: "shield",
                label: "Account & Security",
                onPress: () => router.push("/settings/account"),
              },
              {
                icon: "help-circle",
                label: "Help & Support",
                onPress: () => router.push("/settings/help"),
              },
              {
                icon: "info",
                label: "About AdeegFinder",
                onPress: () => router.push("/settings/about"),
              },
            ]}
          />

          <View style={{ marginTop: 4, marginBottom: 8 }}>
            <Card
              style={[styles.versionCard, { borderColor: colors.border }]}
            >
              <Text
                style={[styles.versionLabel, { color: colors.mutedForeground }]}
              >
                Version
              </Text>
              <Text style={[styles.versionValue, { color: colors.foreground }]}>
                AdeegFinder 1.0.0
              </Text>
            </Card>
          </View>

          <Button
            label="Sign out"
            variant="outline"
            icon="log-out"
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    fontSize: 26,
    letterSpacing: -0.6,
    marginTop: 2,
    marginBottom: 16,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 18,
    padding: 16,
  },
  profileName: {
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    fontSize: 17,
  },
  profilePhone: {
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginTop: 2,
  },
  adminPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  adminPillText: {
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    fontSize: 10,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  groupTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  rowSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 1,
  },
  versionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  versionLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  versionValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
});
