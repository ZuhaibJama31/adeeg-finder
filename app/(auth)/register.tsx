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
import { useColors } from "@/hooks/useColors";

const isValidSomaliPhone = (phone: string): boolean => {
  const pattern =
    /^(\+252|00252)?(61|62|63|64|65|66|68|69|71|77|90)\d{7}$/;

  return pattern.test(phone);
};

const formatPhoneForApi = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");

  if (phone.startsWith("+")) return phone;

  if (
    cleaned.startsWith("252") &&
    cleaned.length === 12
  ) {
    return "+" + cleaned;
  }

  if (cleaned.length === 9) {
    return cleaned;
  }

  return cleaned;
};

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(
    null
  );

 const onSubmit = () => {
  router.push({
    pathname: "./(auth)/verify-otp",
    params: {
      name,
      phone,
      password,
      city,
      mode: "register",
    },
  });
};

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <StatusBar style="dark" />

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          {
            paddingTop:
              (isWeb
                ? 67
                : insets.top) + 8,
            paddingBottom:
              (isWeb
                ? 34
                : insets.bottom) + 24,
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
              {
                backgroundColor:
                  colors.card,
                borderColor:
                  colors.border,
              },
            ]}
          >
            <Feather
              name="arrow-left"
              size={18}
              color={
                colors.foreground
              }
            />
          </Pressable>

          <AppLogo variant="mark" />
        </View>

        <Text
          style={[
            styles.title,
            {
              color:
                colors.foreground,
            },
          ]}
        >
          Create your account
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color:
                colors.mutedForeground,
            },
          ]}
        >
          Verify your phone with OTP
          before creating account.
        </Text>

        <View
          style={[
            styles.infoBanner,
            {
              backgroundColor:
                colors.accent,
              borderRadius:
                colors.radius - 4,
              marginTop: 20,
            },
          ]}
        >
          <View
            style={[
              styles.infoIcon,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
          >
            <Feather
              name="shield"
              size={14}
              color="#fff"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.infoTitle,
                {
                  color:
                    colors.primary,
                },
              ]}
            >
              Secure Registration
            </Text>

            <Text
              style={[
                styles.infoDesc,
                {
                  color:
                    colors.foreground,
                },
              ]}
            >
              We verify your phone
              number before account
              creation.
            </Text>
          </View>
        </View>

        <View
          style={{
            gap: 14,
            marginTop: 20,
          }}
        >
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
            errorText={error || undefined}
          />
        </View>

        <View
          style={{ marginTop: 24 }}
        >
          <Button
            label="Continue to OTP"
            onPress={onSubmit}
            loading={submitting}
            icon="arrow-right"
            iconPosition="right"
          />
        </View>

        <View style={styles.footer}>
          <Text
            style={[
              styles.footerText,
              {
                color:
                  colors.mutedForeground,
              },
            ]}
          >
            Already have an
            account?{" "}
          </Text>

          <Link
            href="/(auth)/login"
            asChild
          >
            <Pressable
              hitSlop={6}
            >
              <Text
                style={[
                  styles.footerLink,
                  {
                    color:
                      colors.secondary,
                  },
                ]}
              >
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
    justifyContent:
      "space-between",
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
    fontFamily:
      "Inter_700Bold",
    fontSize: 26,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontFamily:
      "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  infoBanner: {
    flexDirection: "row",
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
    fontFamily:
      "Inter_700Bold",
    fontSize: 13,
  },
  infoDesc: {
    fontFamily:
      "Inter_400Regular",
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
    fontFamily:
      "Inter_500Medium",
    fontSize: 13,
  },
  footerLink: {
    fontFamily:
      "Inter_700Bold",
    fontSize: 13,
  },
});