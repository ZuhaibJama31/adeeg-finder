import { Feather } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppLogo } from "@/components/AppLogo";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { ApiError } from "@/lib/api";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { login } = useAuth();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (submitting) return;
    setError(null);

    if (!phone.trim() || !password) {
      setError("Enter your phone number and password.");
      return;
    } 

    setSubmitting(true);
    try {
      await login({ phone: phone.trim(), password });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not sign you in. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: (isWeb ? 67 : insets.top) + 8,
            paddingBottom: (isWeb ? 34 : insets.bottom) + 24,
          },
        ]}
        bottomOffset={32}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <Pressable
           onPress={() => router.replace("/(auth)/welcome")}
            hitSlop={12}
            style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <AppLogo variant="mark" />
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>
          Welcome back
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Sign in to manage your bookings and find trusted help nearby.
        </Text>

        <View style={{ gap: 14, marginTop: 28 }}>
          <Input
            label="Phone number"
            placeholder="e.g. 905454545"
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoComplete="tel"
            icon="phone"
            value={phone}
            onChangeText={setPhone}
          />
          <Input
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            autoCapitalize="none"
            icon="lock"
            value={password}
            onChangeText={setPassword}
            errorText={error ?? undefined}
          />
        </View>

        <View style={{ marginTop: 28 }}>
          <Button
            label="Sign in"
            onPress={onSubmit}
            loading={submitting}
            icon="arrow-right"
            iconPosition="right"
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            New to AdeegFinder?{" "}
          </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable hitSlop={6}>
              <Text style={[styles.footerLink, { color: colors.secondary }]}>
                Create an account
              </Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  footer: {
    marginTop: 32,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  footerLink: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
});
