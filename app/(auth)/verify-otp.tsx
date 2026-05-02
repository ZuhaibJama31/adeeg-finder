import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
 
import { signInWithPhoneNumber } from "firebase/auth";
 
import { AppLogo } from "@/components/AppLogo";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { auth } from "@/src/firebase";
 
export default function VerifyOtp() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
 
  const params = useLocalSearchParams<{
    phone: string;
    name?: string;
    city?: string;
    password?: string;
    mode: "login" | "register";
  }>();
 
  const { firebaseLogin } = useAuth();
 
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState<any>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
 
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
 
  /* ---------------- AUTO-SEND OTP ON MOUNT ---------------- */
 
  useEffect(() => {
    sendOtp();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
 
  /* ---------------- COUNTDOWN TIMER ---------------- */
 
  const startCountdown = () => {
    setCountdown(60);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
 
  /* ---------------- SEND OTP ---------------- */
 
  const sendOtp = async () => {
    try {
      setSendingOtp(true);
 
      const confirmationResult = await signInWithPhoneNumber(auth, params.phone);
 
      setConfirmation(confirmationResult);
      setOtpSent(true);
      startCountdown();
 
      Alert.alert("OTP Sent", `A verification code was sent to ${params.phone}`);
    } catch (e: any) {
      Alert.alert("Failed to send OTP", e.message);
    } finally {
      setSendingOtp(false);
    }
  };
 
  /* ---------------- VERIFY OTP ---------------- */
 
  const verifyOtp = async () => {
    if (!code || code.length < 4) {
      return Alert.alert("Invalid code", "Please enter the OTP you received.");
    }
 
    if (!confirmation) {
      return Alert.alert("No OTP sent", "Please request the OTP first.");
    }
 
    try {
      setVerifyingOtp(true);
 
      const result = await confirmation.confirm(code);
      const idToken = await result.user.getIdToken();
 
      // firebaseLogin calls /firebase-login on Laravel and saves token + user
      await firebaseLogin({
        idToken,
        name: params.name,
        phone: params.phone,
        city: params.city,
        password: params.password,
        mode: params.mode,
      });
 
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Invalid OTP", e.message);
    } finally {
      setVerifyingOtp(false);
    }
  };
 
  /* ---------------- RENDER ---------------- */
 
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
          Verify your number
        </Text>
 
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Enter the 6-digit code sent to{"\n"}
          <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>
            {params.phone}
          </Text>
        </Text>
 
        {/* OTP INPUT */}
        <View style={{ marginTop: 32 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            Verification code
          </Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="------"
            keyboardType="number-pad"
            maxLength={6}
            style={[
              styles.otpInput,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
            placeholderTextColor={colors.mutedForeground}
          />
        </View>
 
        {/* VERIFY BUTTON */}
        <View style={{ marginTop: 20 }}>
          <Button
            label="Verify OTP"
            onPress={verifyOtp}
            loading={verifyingOtp}
            icon="check"
            iconPosition="right"
          />
        </View>
 
        {/* RESEND */}
        <View style={styles.resendRow}>
          {countdown > 0 ? (
            <Text style={[styles.resendText, { color: colors.mutedForeground }]}>
              Resend code in{" "}
              <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>
                {countdown}s
              </Text>
            </Text>
          ) : (
            <Pressable onPress={sendOtp} disabled={sendingOtp} hitSlop={8}>
              <Text style={[styles.resendLink, { color: colors.secondary }]}>
                {sendingOtp ? "Sending..." : "Resend OTP"}
              </Text>
            </Pressable>
          )}
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
    lineHeight: 22,
    marginTop: 8,
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    marginBottom: 8,
  },
  otpInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 24,
    letterSpacing: 8,
    textAlign: "center",
    fontFamily: "Inter_700Bold",
  },
  resendRow: {
    marginTop: 24,
    alignItems: "center",
  },
  resendText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  resendLink: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
});
 