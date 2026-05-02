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
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
 
import { AppLogo } from "@/components/AppLogo";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useColors } from "@/hooks/useColors";
 
/* ---------------- PHONE VALIDATION ---------------- */
 
const isValidSomaliPhone = (phone: string): boolean => {
  const pattern = /^(\+252|00252)?(61|62|63|64|65|66|68|69|71|77|90)\d{7}$/;
  return pattern.test(phone);
};
 
const formatPhoneForApi = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  if (phone.startsWith("+")) return phone;
  if (cleaned.startsWith("252")) return "+" + cleaned;
  if (cleaned.length === 9) return "+252" + cleaned;
  return phone;
};
 
export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
 
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
 
  /* ---------------- SUBMIT ---------------- */
 
  const onSubmit = async () => {
    try {
      setSubmitting(true);
 
      if (!phone) {
        return Alert.alert("Error", "Please enter your phone number.");
      }
 
      if (!isValidSomaliPhone(phone)) {
        return Alert.alert("Invalid phone", "Enter a valid Somali phone number.");
      }
 
      const formattedPhone = formatPhoneForApi(phone);
 
      // Navigate to OTP screen with login mode
      router.push({
        pathname: "/(auth)/verify-otp",
        params: {
          phone: formattedPhone,
          mode: "login",
        },
      });
    } catch (e: any) {
      Alert.alert("Error", e.message);
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
        {/* HEADER */}
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.replace("/(auth)/welcome")}
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
 
        {/* TITLE */}
        <Text style={[styles.title, { color: colors.foreground }]}>
          Welcome back
        </Text>
 
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Sign in using OTP verification.
        </Text>
 
        {/* INPUT */}
        <View style={{ gap: 14, marginTop: 28 }}>
          <Input
            label="Phone number"
            placeholder="e.g. 612345678"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            icon="phone"
          />
        </View>
 
        {/* BUTTON */}
        <View style={{ marginTop: 28 }}>
          <Button
            label="Continue"
            onPress={onSubmit}
            loading={submitting}
            icon="arrow-right"
            iconPosition="right"
          />
        </View>
 
        {/* FOOTER */}
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
 
/* ---------------- STYLES ---------------- */
 
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
 