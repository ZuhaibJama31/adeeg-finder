import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import {
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
import { apiRequest } from "@/lib/api";
import { asArray } from "@/lib/format";
import type { Worker } from "@/lib/types";


type Props = {
  worker: Worker;
  onPress?: () => void;
};

type ApiList<T> = T[] | { data?: T[] };
function unwrap<T>(v: ApiList<T> | null | undefined): T[] {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return asArray(v.data);
}

export default function WorkerDetailScreen() {
  const params = useLocalSearchParams();
  const id = String(params.id);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { user } = useAuth();

  const detailQuery = useQuery({
    queryKey: ["worker", id],
    queryFn: () => apiRequest<Worker>(`/workers/${id}`),
    retry: 0,
  });

  const listQuery = useQuery({
    queryKey: ["workers"],
    queryFn: () => apiRequest<ApiList<Worker>>("/workers"),
    enabled: detailQuery.isError,
  });

  const fromList = useMemo(
    () => unwrap(listQuery.data).find((w) => String(w.id) === String(id)),
    [listQuery.data, id],
  );

  const worker = detailQuery.data ?? fromList;
  const isLoading = detailQuery.isLoading || (detailQuery.isError && listQuery.isLoading);

  const skills: string[] = (() => {
    if (!worker) return [];
    if (Array.isArray(worker.category?.name)) return worker.category?.name;
    if (typeof worker.category?.name === "string" && worker.category?.name.length > 0) {
      return worker.category?.name.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
    }
    return [];
  })();

  const canBook = user?.role !== "worker";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={[
            styles.header,
            { paddingTop: (isWeb ? 67 : insets.top) + 14 },
          ]}
        >
          <View style={styles.topRow}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              style={styles.iconBtn}
            >
              <Feather name="arrow-left" size={18} color="#FFFFFF" />
            </Pressable>
            <Pressable hitSlop={10} style={styles.iconBtn}>
              <Feather name="share-2" size={16} color="#FFFFFF" />
            </Pressable>
          </View>

          {isLoading ? (
            <View style={{ alignItems: "center", paddingVertical: 32 }}>
              
            </View>
          ) : worker ? (
            <View style={styles.profile}>
              <Text style={styles.profileName}>{worker.user.name}</Text>
              <Text style={styles.profileRole}>
                {worker.category?.name ?? "Local Specialist"}
              </Text>
              <View style={styles.metaRow}>
                <View style={styles.metaPill}>
                  <Feather name="star" size={12} color="#FFFFFF" />
                  <Text style={styles.metaText}>
                    {(worker.rating ?? 4.8).toFixed(1)}
                  </Text>
                </View>
                {worker.user.city ? (
                  <View style={styles.metaPill}>
                    <Feather name="map-pin" size={12} color="#FFFFFF" />
                    <Text style={styles.metaText}>{worker.user.city}</Text>
                  </View>
                ) : null}
                <View style={styles.metaPill}>
                  <Feather name="check-circle" size={12} color="#FFFFFF" />
                  <Text style={styles.metaText}>Verified</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={{ paddingVertical: 32 }}>
              <Text
                style={{
                  textAlign: "center",
                  color: "#FFFFFF",
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                Worker not found
              </Text>
            </View>
          )}
        </LinearGradient>

        {worker && (
          <View style={styles.body}>
            <Card>
              <Text
                style={[styles.sectionTitle, { color: colors.foreground }]}
              >
                About
              </Text>
              <Text
                style={[
                  styles.bodyText,
                  { color: colors.mutedForeground, marginTop: 8 },
                ]}
              >
                {worker.bio ??
                  `Experienced ${worker.category?.name?.toLowerCase() ?? "local"} professional dedicated to quality work and on-time service.`}
              </Text>
            </Card>

            {skills.length > 0 && (
              <Card style={{ marginTop: 14 }}>
                <Text
                  style={[styles.sectionTitle, { color: colors.foreground }]}
                >
                  Skills
                </Text>
                <View style={styles.skillsWrap}>
                  {skills.map((s) => (
                    <View
                      key={s}
                      style={[
                        styles.skillChip,
                        { backgroundColor: colors.accent },
                      ]}
                    >
                      <Text
                        style={[styles.skillText, { color: colors.primary }]}
                      >
                        {s}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card>
            )}

            <Card style={{ marginTop: 14 }}>
              <Text
                style={[styles.sectionTitle, { color: colors.foreground }]}
              >
                Contact
              </Text>
              <View style={styles.contactRow}>
                <View
                  style={[
                    styles.contactIcon,
                    { backgroundColor: colors.accent },
                  ]}
                >
                  <Feather name="phone" size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.contactLabel, { color: colors.mutedForeground }]}
                  >
                    Phone
                  </Text>
                  <Text
                    style={[styles.contactValue, { color: colors.foreground }]}
                  >
                    {worker.user.phone ?? "Hidden until booking"}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>

      {worker && canBook && (
        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              paddingBottom: (isWeb ? 34 : insets.bottom) + 12,
            },
          ]}
        >
          <Button
            label="Book this service"
            icon="calendar"
            onPress={() =>
              router.push({
                pathname: "/booking/new",
                params: {
                  workerId: String(worker.id),
                  workerName: worker.user.name,
                },
              })
            }
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
    fontSize: 14,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  profile: {
    alignItems: "center",
    marginTop: 18,
    gap: 8,
  },
  profileName: {
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    fontSize: 22,
    letterSpacing: -0.4,
    marginTop: 6,
  },
  profileRole: {
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  metaText: {
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
    fontSize: 11,
    letterSpacing: 0.3,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    letterSpacing: -0.2,
  },
  bodyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  skillChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  skillText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  contactLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  contactValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
  },
});
