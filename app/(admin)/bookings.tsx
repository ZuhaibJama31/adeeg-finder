import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useColors } from "@/hooks/useColors";
import { apiRequest } from "@/lib/api";
import { asArray, formatDateTime } from "@/lib/format";
import type { Booking, BookingStatus } from "@/lib/types";

type ApiList<T> = T[] | { data?: T[] };

function unwrap<T>(val: ApiList<T> | null | undefined): T[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return asArray(val.data);
}

type Filter = "all" | "active" | "completed" | "cancelled";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

const ACTIVE_STATUSES: BookingStatus[] = ["pending", "accepted", "in_progress"];

export default function AdminBookingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const [filter, setFilter] = useState<Filter>("all");

  const bookingsQ = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: () => apiRequest<ApiList<Booking>>("/admin/bookings"),
  });

  const bookings = useMemo(
    () => unwrap(bookingsQ.data),
    [bookingsQ.data]
  );

  const filtered = useMemo(() => {
    switch (filter) {
      case "active":
        return bookings.filter((b) => ACTIVE_STATUSES.includes(b.status));
      case "completed":
        return bookings.filter((b) => b.status === "completed");
      case "cancelled":
        return bookings.filter(
          (b) => b.status === "cancelled" || b.status === "rejected"
        );
      default:
        return bookings;
    }
  }, [bookings, filter]);

  const stats = useMemo(() => ({
    active: bookings.filter((b) => ACTIVE_STATUSES.includes(b.status)).length,
    completed: bookings.filter((b) => b.status === "completed").length,
    revenue: bookings
      .filter((b) => b.status === "completed")
      .reduce((s, b) => s + (b.agreed_price ?? 0), 0),
  }), [bookings]);

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
        <Text style={styles.eyebrow}>Admin</Text>
        <Text style={styles.title}>All Bookings</Text>

        <View style={styles.miniStats}>
          <View style={styles.miniStat}>
            <Text style={styles.miniValue}>{bookings.length}</Text>
            <Text style={styles.miniLabel}>Total</Text>
          </View>
          <View style={styles.miniDivider} />
          <View style={styles.miniStat}>
            <Text style={styles.miniValue}>{stats.active}</Text>
            <Text style={styles.miniLabel}>Active</Text>
          </View>
          <View style={styles.miniDivider} />
          <View style={styles.miniStat}>
            <Text style={styles.miniValue}>${stats.revenue.toFixed(0)}</Text>
            <Text style={styles.miniLabel}>Revenue</Text>
          </View>
        </View>

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
                    { color: active ? colors.primary : "#FFFFFF" },
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
          styles.listContent,
          { paddingBottom: (isWeb ? 100 : 96) + 16 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={bookingsQ.isRefetching}
            onRefresh={() => bookingsQ.refetch()}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {bookingsQ.isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View
              style={[styles.emptyIcon, { backgroundColor: colors.accent }]}
            >
              <Feather name="calendar" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No bookings
            </Text>
            <Text
              style={[styles.emptyDesc, { color: colors.mutedForeground }]}
            >
              {filter === "all"
                ? "No bookings have been made yet."
                : `No ${filter} bookings found.`}
            </Text>
          </View>
        ) : (
          filtered.map((b) => <AdminBookingCard key={b.id} booking={b} />)
        )}
      </ScrollView>
    </View>
  );
}

function AdminBookingCard({ booking }: { booking: Booking }) {
  const colors = useColors();
  return (
    <Card style={styles.bookingCard}>
      <View style={styles.bookingTop}>
        <Badge status={booking.status} />
        <Text style={[styles.bookingId, { color: colors.mutedForeground }]}>
          #{booking.id}
        </Text>
        {booking.agreed_price ? (
          <Text style={[styles.price, { color: colors.primary }]}>
            ${booking.agreed_price}
          </Text>
        ) : null}
      </View>

      <Text
        style={[styles.bookingDesc, { color: colors.foreground }]}
        numberOfLines={2}
      >
        {booking.description}
      </Text>

      <View style={styles.partiesRow}>
        {booking.client ? (
          <View style={styles.party}>
            <Avatar name={booking.client.name} size={32} />
            <View>
              <Text
                style={[styles.partyRole, { color: colors.mutedForeground }]}
              >
                Client
              </Text>
              <Text
                style={[styles.partyName, { color: colors.foreground }]}
                numberOfLines={1}
              >
                {booking.client.name}
              </Text>
            </View>
          </View>
        ) : null}

        {booking.worker ? (
          <>
            <Feather
              name="arrow-right"
              size={14}
              color={colors.mutedForeground}
            />
            <View style={styles.party}>
              <Avatar name={booking.worker.user?.name} size={32} />
              <View>
                <Text
                  style={[styles.partyRole, { color: colors.mutedForeground }]}
                >
                  Worker
                </Text>
                <Text
                  style={[styles.partyName, { color: colors.foreground }]}
                  numberOfLines={1}
                >
                  {booking.worker.user?.name ?? "—"}
                </Text>
              </View>
            </View>
          </>
        ) : null}
      </View>

      <View
        style={[styles.metaRow, { borderTopColor: colors.border }]}
      >
        <View style={styles.metaItem}>
          <Feather name="map-pin" size={12} color={colors.mutedForeground} />
          <Text
            style={[styles.metaText, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            {booking.city}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="clock" size={12} color={colors.mutedForeground} />
          <Text
            style={[styles.metaText, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            {formatDateTime(booking.scheduled_at)}
          </Text>
        </View>
      </View>
    </Card>
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
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    fontSize: 26,
    letterSpacing: -0.6,
    marginTop: 2,
  },
  miniStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 14,
    padding: 12,
  },
  miniStat: {
    flex: 1,
    alignItems: "center",
  },
  miniValue: {
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    fontSize: 20,
    letterSpacing: -0.4,
  },
  miniLabel: {
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  miniDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  tabsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    paddingRight: 4,
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
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 10,
  },
  bookingCard: {
    gap: 10,
  },
  bookingTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bookingId: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    flex: 1,
  },
  price: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  bookingDesc: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    lineHeight: 18,
  },
  partiesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  party: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  partyRole: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  partyName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 1,
  },
  metaText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  emptyWrap: {
    paddingVertical: 60,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    marginBottom: 6,
  },
  emptyDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
