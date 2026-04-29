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

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (submitting) return;
    setError(null);

    if (!name.trim() || !phone.trim() || !password) {
      setError("Please fill in your name, phone and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        phone: phone.trim(),
        password,
        role: "client",
        city: city.trim() || undefined,
      });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not create your account.";
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
            onPress={() => router.back()}
            hitSlop={12}
            style={[
              styles.backBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <AppLogo variant="mark" />
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>
          Create your account
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Sign up as a client to start booking trusted local workers.
        </Text>

        <View
          style={[
            styles.infoBanner,
            {
              backgroundColor: colors.accent,
              borderRadius: colors.radius - 4,
              marginTop: 20,
            },
          ]}
        >
          <View
            style={[
              styles.infoIcon,
              { backgroundColor: colors.primary },
            ]}
          >
            <Feather name="briefcase" size={14} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoTitle, { color: colors.primary }]}>
              Are you a service professional?
            </Text>
            <Text
              style={[styles.infoDesc, { color: colors.foreground }]}
            >
              Worker accounts are added by our team after a verification
              review. Contact support to apply.
            </Text>
          </View>
        </View>

        <View style={{ gap: 14, marginTop: 20 }}>
          <Input
            label="Full name"
            placeholder="Your name"
            icon="user"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Phone number"
            placeholder="e.g. 252905454545"
            keyboardType="phone-pad"
            autoCapitalize="none"
            icon="phone"
            value={phone}
            onChangeText={setPhone}
          />
          <Input
            label="City (optional)"
            placeholder="e.g. Garoowe"
            icon="map-pin"
            autoCapitalize="words"
            value={city}
            onChangeText={setCity}
          />
          <Input
            label="Password"
            placeholder="At least 6 characters"
            secureTextEntry
            autoCapitalize="none"
            icon="lock"
            value={password}
            onChangeText={setPassword}
            errorText={error ?? undefined}
          />
        </View>

        <View style={{ marginTop: 24 }}>
          <Button
            label="Create account"
            onPress={onSubmit}
            loading={submitting}
            icon="arrow-right"
            iconPosition="right"
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Already have an account?{" "}
          </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable hitSlop={6}>
              <Text style={[styles.footerLink, { color: colors.secondary }]}>
                Sign in
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
    marginBottom: 24,
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
    fontSize: 26,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  infoIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  infoDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  footer: {
    marginTop: 28,
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
