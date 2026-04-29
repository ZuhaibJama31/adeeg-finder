import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BookingCard } from "@/components/BookingCard";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { apiRequest } from "@/lib/api";
import { asArray } from "@/lib/format";
import type { Booking, BookingStatus } from "@/lib/types";

type Filter = "all" | "active" | "completed" | "cancelled";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

const ACTIVE_STATUSES: BookingStatus[] = [
  "pending",
  "accepted",
  "in_progress",
];

function unwrap(value: Booking[] | { data?: Booking[] } | null | undefined): Booking[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return asArray(value.data);
}

export default function BookingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { user } = useAuth();
  const [filter, setFilter] = useState<Filter>("all");

  const query = useQuery({
    queryKey: ["bookings"],
    queryFn: () =>
      apiRequest<Booking[] | { data?: Booking[] }>("/bookings"),
  });

  const bookings = useMemo(() => unwrap(query.data), [query.data]);

  const filtered = useMemo(() => {
    if (filter === "all") return bookings;
    if (filter === "active")
      return bookings.filter((b) => ACTIVE_STATUSES.includes(b.status));
    if (filter === "completed")
      return bookings.filter((b) => b.status === "completed");
    if (filter === "cancelled")
      return bookings.filter(
        (b) => b.status === "cancelled" || b.status === "rejected",
      );
    return bookings;
  }, [bookings, filter]);

  const isWorker = user?.role === "worker";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[
          styles.header,
          { paddingTop: (isWeb ? 67 : insets.top) + 14 },
        ]}
      >
        <Text style={styles.eyebrow}>
          {isWorker ? "Your assignments" : "Your bookings"}
        </Text>
        <Text style={styles.title}>
          {isWorker ? "Jobs to manage" : "Manage your services"}
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => setFilter(f.id)}
                style={[
                  styles.tab,
                  {
                    backgroundColor: active
                      ? "#FFFFFF"
                      : "rgba(255,255,255,0.18)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: active ? colors.primary : "#FFFFFF",
                    },
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: (isWeb ? 100 : 96) + 16,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => query.refetch()}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {query.isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : query.isError ? (
          <EmptyState
            icon="cloud-off"
            title="Couldn't load bookings"
            description="Check your connection and try again."
            actionLabel="Try again"
            onActionPress={() => query.refetch()}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="calendar"
            title={
              filter === "all"
                ? isWorker
                  ? "No jobs yet"
                  : "No bookings yet"
                : "Nothing here"
            }
            description={
              isWorker
                ? "New requests from clients will show up here."
                : "Browse trusted professionals and book your first service."
            }
            actionLabel={!isWorker ? "Browse services" : undefined}
            onActionPress={
              !isWorker ? () => router.push("/(tabs)") : undefined
            }
          />
        ) : (
          filtered.map((b) => <BookingCard key={b.id} booking={b} />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    fontSize: 26,
    letterSpacing: -0.6,
    marginTop: 6,
  },
  tabsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 20,
    paddingRight: 12,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  tabLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.2,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
});
