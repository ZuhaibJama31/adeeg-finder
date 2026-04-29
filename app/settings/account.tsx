import { Feather } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { ApiError, apiRequest } from "@/lib/api";

export default function AccountSecurityScreen() {
  const colors = useColors();
  const { user, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [twoFactor, setTwoFactor] = useState(false);
  const [biometric, setBiometric] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);

  const onChangePassword = async () => {
    if (submitting) return;
    setError(null);
    setSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest("/password/reset", {
        method: "PUT",
        body: {
          current_password: currentPassword,
          password: newPassword,
          password_confirmation: confirmPassword,
        },
      });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Couldn't update your password.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const onDeleteAccount = () => {
    const proceed = async () => {
      try {
        await apiRequest("/account", { method: "DELETE" });
      } catch {
        // ignore — fall through to logout regardless
      }
      await logout();
      router.replace("/(auth)/welcome");
    };

    if (Platform.OS === "web") {
      proceed();
      return;
    }
    Alert.alert(
      "Delete account?",
      "This will permanently remove your account, bookings, and history. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: proceed },
      ],
    );
  };

  return (

    
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: "Account & Security",
          headerTitleStyle: { fontFamily: "Inter_700Bold" },

          headerLeft: () => (
                      <Pressable
                        onPress={() => {
                          if (router.canGoBack()) {
                            router.back();
                          } else {
                            router.replace("/profile");
                          }
                        }}
                        style={{ paddingHorizontal: 12 }}
                      >
                        <Feather
                          name="arrow-left"
                          size={22}
                          color={colors.foreground}
                        />
                      </Pressable>
                    ),
        }}
      />
      

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={styles.content}
        bottomOffset={32}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            Signed in as
          </Text>
          <View style={styles.identityRow}>
            <View
              style={[
                styles.identityIcon,
                { backgroundColor: colors.accent },
              ]}
            >
              <Feather name="user" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.identityName, { color: colors.foreground }]}>
                {user?.name ?? "—"}
              </Text>
              <Text
                style={[styles.identityMeta, { color: colors.mutedForeground }]}
              >
                {user?.phone ?? "No phone on file"}
              </Text>
            </View>
          </View>
        </Card>

        <Text style={[styles.heading, { color: colors.foreground }]}>
          Change password
        </Text>
        <Text style={[styles.helper, { color: colors.mutedForeground }]}>
          Choose a strong password you don't reuse anywhere else.
        </Text>

        <View style={{ gap: 12, marginTop: 14 }}>
          <Input
            label="Current password"
            placeholder="Enter current password"
            secureTextEntry
            autoCapitalize="none"
            icon="lock"
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <Input
            label="New password"
            placeholder="At least 6 characters"
            secureTextEntry
            autoCapitalize="none"
            icon="key"
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <Input
            label="Confirm new password"
            placeholder="Re-enter new password"
            secureTextEntry
            autoCapitalize="none"
            icon="check"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            errorText={error ?? undefined}
          />
        </View>

        {success && (
          <View
            style={[
              styles.successBanner,
              { backgroundColor: colors.accent, borderRadius: colors.radius - 4 },
            ]}
          >
            <Feather name="check-circle" size={14} color={colors.primary} />
            <Text style={[styles.successText, { color: colors.primary }]}>
              Password updated successfully.
            </Text>
          </View>
        )}

        <View style={{ marginTop: 18 }}>
          <Button
            label="Update password"
            icon="shield"
            onPress={onChangePassword}
            loading={submitting}
          />
        </View>

        <Text style={[styles.heading, { color: colors.foreground, marginTop: 28 }]}>
          Security preferences
        </Text>

        <Card padded={false} style={{ marginTop: 12 }}>
          <PrefRow
            icon="smartphone"
            label="Two-factor authentication"
            description="Require a code at sign-in"
            value={twoFactor}
            onChange={setTwoFactor}
            isLast={false}
          />
          <PrefRow
            icon="unlock"
            label="Biometric unlock"
            description="Use Face ID or fingerprint"
            value={biometric}
            onChange={setBiometric}
            isLast={false}
          />
          <PrefRow
            icon="alert-circle"
            label="Login alerts"
            description="Notify me of new device sign-ins"
            value={loginAlerts}
            onChange={setLoginAlerts}
            isLast
          />
        </Card>

        <Text style={[styles.heading, { color: colors.foreground, marginTop: 28 }]}>
          Danger zone
        </Text>

        <Card style={{ marginTop: 12 }}>
          <View style={styles.dangerRow}>
            <View
              style={[
                styles.dangerIcon,
                { backgroundColor: "#FEE2E2" },
              ]}
            >
              <Feather name="trash-2" size={18} color={colors.destructive} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.dangerTitle, { color: colors.foreground }]}>
                Delete account
              </Text>
              <Text
                style={[styles.dangerSub, { color: colors.mutedForeground }]}
              >
                Permanently remove your account and bookings. This cannot be
                undone.
              </Text>
            </View>
          </View>
          <Pressable
            onPress={onDeleteAccount}
            style={({ pressed }) => [
              styles.dangerBtn,
              {
                borderColor: colors.destructive,
                borderRadius: colors.radius - 4,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Feather name="trash-2" size={14} color={colors.destructive} />
            <Text style={[styles.dangerBtnText, { color: colors.destructive }]}>
              Delete my account
            </Text>
          </Pressable>
        </Card>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

function PrefRow({
  icon,
  label,
  description,
  value,
  onChange,
  isLast,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  isLast: boolean;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.prefRow,
        {
          borderBottomColor: colors.border,
          borderBottomWidth: isLast ? 0 : 1,
        },
      ]}
    >
      <View
        style={[styles.prefIcon, { backgroundColor: colors.accent }]}
      >
        <Feather name={icon} size={15} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.prefLabel, { color: colors.foreground }]}>
          {label}
        </Text>
        <Text style={[styles.prefDesc, { color: colors.mutedForeground }]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.primary, false: colors.border }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={colors.border}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  identityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  identityName: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  identityMeta: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 2,
  },
  heading: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    letterSpacing: -0.2,
    marginTop: 24,
  },
  helper: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  successText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  prefIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  prefLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  prefDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  dangerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  dangerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  dangerSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  dangerBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    letterSpacing: 0.2,
  },
});
