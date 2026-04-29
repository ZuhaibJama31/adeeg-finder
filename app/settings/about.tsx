import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import Constants from "expo-constants";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Card } from "@/components/ui/Card";
import { useColors } from "@/hooks/useColors";

const VERSION =
  Constants.expoConfig?.version ??
  Constants.manifest2?.extra?.version ??
  "1.0.0";

const VALUES: {
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  description: string;
}[] = [
  {
    icon: "shield",
    title: "Trust & verification",
    description:
      "Every pro is vetted with ID and skills review before they appear on the platform.",
  },
  {
    icon: "zap",
    title: "Speed",
    description:
      "From searching to booking in under a minute — we hate friction as much as you do.",
  },
  {
    icon: "users",
    title: "Local first",
    description:
      "Built for Somali cities and the trades that keep them running.",
  },
  {
    icon: "heart",
    title: "Fair to pros",
    description:
      "No hidden fees. Workers get paid directly and keep what they earn.",
  },
];

const TEAM_STATS = [
  { label: "Pros onboarded", value: "1.2k+" },
  { label: "Cities served", value: "12" },
  { label: "Jobs completed", value: "8.4k" },
];

export default function AboutScreen() {
  const colors = useColors();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: "About AdeegFinder",
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

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { borderRadius: colors.radius }]}
        >
          <View style={styles.iconWrap}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.iconImg}
              resizeMode="cover"
            />
          </View>

          <Text style={styles.heroTitle}>AdeegFinder</Text>
          <Text style={styles.heroTagline}>
            Trusted local services, booked in seconds.
          </Text>

          <View style={styles.versionPill}>
            <Feather name="info" size={11} color="#FFFFFF" />
            <Text style={styles.versionText}>Version {VERSION}</Text>
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          {TEAM_STATS.map((s) => (
            <View
              key={s.label}
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius - 4,
                },
              ]}
            >
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {s.value}
              </Text>
              <Text
                style={[styles.statLabel, { color: colors.mutedForeground }]}
              >
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        <Card style={{ marginTop: 16 }}>
          <Text style={[styles.heading, { color: colors.foreground }]}>
            Our mission
          </Text>
          <Text style={[styles.body, { color: colors.mutedForeground }]}>
            AdeegFinder connects clients with verified local service
            professionals — plumbers, electricians, cleaners, drivers, AC
            techs, painters and more — so people can get help they trust, fast.
          </Text>
        </Card>

        <Text style={[styles.sectionHeading, { color: colors.foreground }]}>
          What we stand for
        </Text>

        <View style={{ gap: 10, marginTop: 12 }}>
          {VALUES.map((v) => (
            <Card key={v.title}>
              <View style={styles.valueRow}>
                <View
                  style={[styles.valueIcon, { backgroundColor: colors.accent }]}
                >
                  <Feather name={v.icon} size={16} color={colors.primary} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.valueTitle, { color: colors.foreground }]}
                  >
                    {v.title}
                  </Text>
                  <Text
                    style={[
                      styles.valueDesc,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {v.description}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        <Text style={[styles.sectionHeading, { color: colors.foreground }]}>
          Connect with us
        </Text>

        <View style={styles.socialRow}>
          <SocialBtn
            icon="globe"
            label="Website"
            onPress={() => Linking.openURL("https://adeegfinder.app")}
          />
          <SocialBtn
            icon="twitter"
            label="Twitter"
            onPress={() =>
              Linking.openURL("https://twitter.com/adeegfinder")
            }
          />
          <SocialBtn
            icon="instagram"
            label="Instagram"
            onPress={() =>
              Linking.openURL("https://instagram.com/adeegfinder")
            }
          />
          <SocialBtn
            icon="facebook"
            label="Facebook"
            onPress={() =>
              Linking.openURL("https://facebook.com/adeegfinder")
            }
          />
        </View>

        <Text style={[styles.copy, { color: colors.mutedForeground }]}>
          © {new Date().getFullYear()} AdeegFinder
        </Text>
      </ScrollView>
    </View>
  );
}

function SocialBtn({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  onPress: () => void;
}) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.socialBtn,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius - 4,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Feather name={icon} size={18} color={colors.primary} />
      <Text style={[styles.socialLabel, { color: colors.foreground }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  hero: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.16)",
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  iconImg: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
  },
  heroTitle: {
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    fontSize: 26,
    marginTop: 14,
  },
  heroTagline: {
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  },
  versionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
  },
  versionText: {
    color: "#fff",
    fontSize: 11,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  heading: {
    fontSize: 16,
    fontWeight: "700",
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 24,
  },
  valueRow: {
    flexDirection: "row",
    gap: 12,
  },
  valueIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  valueTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  valueDesc: {
    fontSize: 13,
    marginTop: 4,
  },
  socialRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "48%",
    padding: 12,
    borderWidth: 1,
  },
  socialLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  copy: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 11,
  },
});