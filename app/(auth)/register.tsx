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
import { useAuth } from "@/contexts/AuthContext";
 
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
 
  const onSubmit = async () => {
    try {
      setSubmitting(true);
 
      if (!name || !phone || !password) {
        return Alert.alert("Error", "Fill all required fields.");
      }
 
      if (!isValidSomaliPhone(phone)) {
        return Alert.alert("Invalid phone", "Enter a valid Somali number.");
      }
 
      if (password.length < 6) {
        return Alert.alert("Weak password", "Password must be at least 6 characters.");
      }
 
      const formattedPhone = formatPhoneForApi(phone);
 
      await register({
        name,
        phone: formattedPhone,
        password,
        city,
        role: "client",
      });
 
      // ✅ No router.replace here — AuthGate in _layout.tsx handles
      // the redirect automatically when isAuthenticated becomes true
 
    } catch (e: any) {
      Alert.alert("Registration failed", e.message || "Something went wrong.");
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
 
        {/* TITLE */}
        <Text style={[styles.title, { color: colors.foreground }]}>
          Create your account
        </Text>
 
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Fill in your details to get started.
        </Text>
 
        {/* INPUTS */}
        <View style={{ gap: 14, marginTop: 20 }}>
          <Input
            label="Full name"
            placeholder="Your name"
            icon="user"
            value={name}
            onChangeText={setName}
          />
 
          <Input
            label="Phone number"
            placeholder="612345678"
            icon="phone"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
 
          <Input
            label="City (optional)"
            placeholder="Garoowe"
            icon="map-pin"
            value={city}
            onChangeText={setCity}
          />
 
          <Input
            label="Password"
            placeholder="At least 6 characters"
            icon="lock"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>
 
        {/* BUTTON */}
        <View style={{ marginTop: 24 }}>
          <Button
            label="Create account"
            onPress={onSubmit}
            loading={submitting}
            icon="arrow-right"
            iconPosition="right"
          />
        </View>
 
        {/* FOOTER */}
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
 