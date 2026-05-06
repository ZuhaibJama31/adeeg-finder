import { Feather } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryTile } from "@/components/CategoryTile";
import { EmptyState } from "@/components/EmptyState";
import { SectionHeader } from "@/components/SectionHeader";
import { WorkerCard } from "@/components/WorkerCard";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { apiRequest } from "@/lib/api";
import { asArray } from "@/lib/format";
import type { Category, Worker } from "@/lib/types";
import { categoryIcon } from "@/lib/categoryIcons";


type ApiList<T> = T[] | { data?: T[] };

function unwrapList<T>(value: ApiList<T> | null | undefined): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return asArray((value as { data?: T[] }).data);
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiRequest<ApiList<Category>>("/categories"),
  });
  const workersQuery = useQuery({
    queryKey: ["workers"],
    queryFn: () => apiRequest<ApiList<Worker>>("/workers"),
  });

  const categories = useMemo(
    () => unwrapList(categoriesQuery.data),
    [categoriesQuery.data],
  );
  const workers = useMemo(
    () => unwrapList(workersQuery.data),
    [workersQuery.data],
  );

  const filteredWorkers = useMemo(() => {
    if (!search.trim()) return workers;
    const q = search.toLowerCase();
    return workers.filter((w) => {
      const name = w.user?.name.toLowerCase() ?? "";
      const city = (w.user.city ?? "").toLowerCase();
      const cat = (w.category?.name ?? "").toLowerCase();
      const skills = Array.isArray(w.user.phone)
        ? w.user.phone.join(" ").toLowerCase()
        : (w.user.phone ?? "").toString().toLowerCase();
      return (
        name.includes(q) ||
        city.includes(q) ||
        cat.includes(q) ||
        skills.includes(q)
      );
    });
  }, [workers, search]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  const isClient = user?.role !== "worker";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{
          paddingBottom: (isWeb ? 100 : 96) + 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={[
            styles.header,
            {
              paddingTop: (isWeb ? 67 : insets.top) + 14,
            },
          ]}
        >
          <View style={styles.headerTopRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.locationRow}>
                <Feather name="map-pin" size={14} color="#FFFFFF" />
                <Text style={styles.locationText} numberOfLines={1}>
                  {user?.city || "Set your location"}
                </Text>
                <Feather name="chevron-down" size={14} color="#FFFFFF" />
              </View>
              <Text style={styles.greeting}>
                {greeting}, {user?.name?.split(" ")[0] ?? "there"}
              </Text>
            </View>
            <Pressable
              onPress={() => router.push("/(tabs)/profile")}
              style={styles.bell}
            >
              <Feather name="bell" size={18} color="#FFFFFF" />
              <View style={[styles.bellDot, { backgroundColor: colors.secondary }]} />
            </Pressable>
          </View>

          <Text style={styles.heroTitle}>
            Find Trusted{"\n"}
            Local <Text style={{ color: colors.secondary }}>Services</Text>
          </Text>

          <View
            style={[
              styles.searchWrap,
              { backgroundColor: "#FFFFFF" },
            ]}
          >
            <Feather name="search" size={18} color={colors.mutedForeground} />
            <TextInput
              placeholder="Search for a service…"
              placeholderTextColor={colors.mutedForeground}
              value={search}
              onChangeText={setSearch}
              style={[styles.searchInput, { color: colors.foreground }]}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")} hitSlop={8}>
                <Feather name="x" size={16} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <View style={styles.categoryHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Categories
            </Text>
            <Pressable hitSlop={8}>
              <Text style={[styles.viewAll, { color: colors.secondary }]}>
                View all
              </Text>
            </Pressable>
          </View>

          {categoriesQuery.isLoading ? (
            <View style={styles.categoryGrid}>
              {Array.from({ length: 8 }).map((_, i) => (
                <View key={i} style={styles.categorySlot}>
                  <Skeleton height={92} radius={colors.radius} />
                </View>
              ))}
            </View>
          ) : categoriesQuery.isError ? (
            <EmptyState
              icon="cloud-off"
              title="Couldn't load categories"
              description="Make sure your API server is running and reachable."
              actionLabel="Try again"
              onActionPress={() => categoriesQuery.refetch()}
            />
          ) : categories.length === 0 ? (
            <EmptyState
              icon="grid"
              title="No categories yet"
              description="Service categories will appear here when added."
            />
          ) : (
            <View style={styles.categoryGrid}>
              {categories.slice(0, 8).map((c) => (
                <View key={c.id} style={styles.categorySlot}>
                  <CategoryTile category={c} />
                </View>
              ))}
            </View>
          )}

          <SectionHeader
            title={isClient ? "Recommended for you" : "Top professionals"}
            actionLabel={workers.length > 0 ? "View all" : undefined}
          />

          {workersQuery.isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : workersQuery.isError ? (
            <EmptyState
              icon="cloud-off"
              title="Couldn't load workers"
              description="Make sure your API server is running and reachable."
              actionLabel="Try again"
              onActionPress={() => workersQuery.refetch()}
            />
          ) : filteredWorkers.length === 0 ? (
            <EmptyState
              icon="users"
              title={search ? "No matches" : "No professionals yet"}
              description={
                search
                  ? "Try a different name, skill or city."
                  : "Service professionals will show here when they sign up."
              }
            />
          ) : (
            filteredWorkers
              .slice(0, 10)
              .map((w) => <WorkerCard key={w.id} worker={w} />)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
    fontSize: 13,
    maxWidth: 200,
  },
  greeting: {
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 4,
  },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bellDot: {
    position: "absolute",
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#0D47A1",
  },
  heroTitle: {
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.8,
    marginTop: 22,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    height: 52,
    borderRadius: 16,
    marginTop: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    letterSpacing: -0.2,
  },
  viewAll: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  categorySlot: {
    width: "25%",
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
});
