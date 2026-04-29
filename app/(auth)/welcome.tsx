import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppLogo } from "@/components/AppLogo";
import { Button } from "@/components/ui/Button";
import { useColors } from "@/hooks/useColors";

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.top,
          { paddingTop: (isWeb ? 67 : insets.top) + 24 },
        ]}
      >
        <View style={styles.logoWrap}>
          <AppLogo color="light" />
        </View>

        <View style={styles.heroWrap}>
          <Text style={styles.eyebrow}>Find Trusted</Text>
          <Text style={styles.heroTitle}>
            Local <Text style={{ color: colors.secondary }}>Services</Text>
          </Text>
          <Text style={styles.heroSub}>
            Connect with verified plumbers, electricians, cleaners and more —
            booked in seconds.
          </Text>
        </View>

        <View style={styles.bullets}>
          {[
            { icon: "shield", label: "Verified service professionals" },
            { icon: "zap", label: "Instant booking with live status" },
            { icon: "star", label: "Rated by your community" },
          ].map((b) => (
            <View key={b.label} style={styles.bulletRow}>
              <View style={styles.bulletIcon}>
                <Feather
                  name={b.icon as React.ComponentProps<typeof Feather>["name"]}
                  size={14}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.bulletText}>{b.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View
        style={[
          styles.bottomCard,
          {
            backgroundColor: colors.background,
            paddingBottom: (isWeb ? 34 : insets.bottom) + 20,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
          },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>
          Get started
        </Text>
        <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
          Create an account or sign in to book trusted help.
        </Text>

        <View style={{ gap: 12, marginTop: 24 }}>
          <Button
            label="Create account"
            icon="arrow-right"
            iconPosition="right"
            onPress={() => router.push("/(auth)/register")}
          />
          <Button
            label="I already have an account"
            variant="outline"
            onPress={() => router.push("/(auth)/login")}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logoWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroWrap: {
    marginTop: 36,
  },
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  heroTitle: {
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    fontSize: 44,
    lineHeight: 50,
    letterSpacing: -1,
  },
  heroSub: {
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 14,
    maxWidth: 320,
  },
  bullets: {
    marginTop: 30,
    gap: 12,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bulletIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  bulletText: {
    fontFamily: "Inter_500Medium",
    color: "#FFFFFF",
    fontSize: 14,
  },
  bottomCard: {
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  cardTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    letterSpacing: -0.4,
  },
  cardSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
});
