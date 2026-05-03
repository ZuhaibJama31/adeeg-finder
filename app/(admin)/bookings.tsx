import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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
import { asArray, formatDateTime, statusColors } from "@/lib/format";
import type { Booking, BookingStatus } from "@/lib/types";

type ApiList<T> = T[] | { data?: T[] };

function unwrap<T>(val: ApiList<T> | null | undefined): T[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return asArray(val.data);
}

type Filter = "all" | "active" | "completed" | "cancelled";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all",       label: "All" },
  { id: "active",    label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

const ACTIVE_STATUSES: BookingStatus[] = ["pending", "accepted", "in_progress"];

/* ─── Status action definitions ─── */
type StatusAction = {
  nextStatus: BookingStatus;
  label: string;
  icon: string;
  variant: "primary" | "success" | "danger" | "neutral";
};

const STATUS_ACTIONS: Record<BookingStatus, StatusAction[]> = {
  pending: [
    { nextStatus: "accepted",    label: "Accept",      icon: "check",      variant: "success" },
    { nextStatus: "rejected",    label: "Reject",      icon: "x",          variant: "danger"  },
  ],
  accepted: [
    { nextStatus: "in_progress", label: "Start Work",  icon: "play",       variant: "primary" },
    { nextStatus: "cancelled",   label: "Cancel",      icon: "slash",      variant: "danger"  },
  ],
  in_progress: [
    { nextStatus: "completed",   label: "Complete",    icon: "check-circle", variant: "success" },
    { nextStatus: "cancelled",   label: "Cancel",      icon: "slash",      variant: "danger"  },
  ],
  completed:  [],
  cancelled:  [],
  rejected:   [],
};

/* ─── Variant colours ─── */
const VARIANT_COLORS = {
  primary: { bg: "#0D47A1",   fg: "#FFFFFF" },
  success: { bg: "#1E6B3E",   fg: "#FFFFFF" },
  danger:  { bg: "#B71C1C",   fg: "#FFFFFF" },
  neutral: { bg: "#334155",   fg: "#FFFFFF" },
};

export default function AdminBookingsScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const isWeb   = Platform.OS === "web";
  const [filter, setFilter] = useState<Filter>("all");

  const bookingsQ = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: () => apiRequest<ApiList<Booking>>("/admin/bookings"),
  });

  const bookings = useMemo(() => unwrap(bookingsQ.data), [bookingsQ.data]);

  const filtered = useMemo(() => {
    switch (filter) {
      case "active":    return bookings.filter((b) => ACTIVE_STATUSES.includes(b.status));
      case "completed": return bookings.filter((b) => b.status === "completed");
      case "cancelled": return bookings.filter((b) => b.status === "cancelled" || b.status === "rejected");
      default:          return bookings;
    }
  }, [bookings, filter]);

  const stats = useMemo(() => ({
    active:    bookings.filter((b) => ACTIVE_STATUSES.includes(b.status)).length,
    completed: bookings.filter((b) => b.status === "completed").length,
    revenue:   bookings.filter((b) => b.status === "completed").reduce((s, b) => s + (b.agreed_price ?? 0), 0),
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
                  { backgroundColor: active ? "#FFFFFF" : "rgba(255,255,255,0.18)" },
                ]}
              >
                <Text style={[styles.tabLabel, { color: active ? colors.primary : "#FFFFFF" }]}>
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
            <View style={[styles.emptyIcon, { backgroundColor: colors.accent }]}>
              <Feather name="calendar" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No bookings
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
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

/* ─── Individual booking card with expandable status actions ─── */
function AdminBookingCard({ booking }: { booking: Booking }) {
  const colors      = useColors();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const actions     = STATUS_ACTIONS[booking.status] ?? [];
  const hasActions  = actions.length > 0;
  const sc          = statusColors(booking.status);

  const mutation = useMutation({
    mutationFn: (nextStatus: BookingStatus) =>
      apiRequest(`/admin/bookings/${booking.id}`, {
        method: "PATCH",
        body: { status: nextStatus },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      setExpanded(false);
    },
  });

  return (
    <Card style={styles.bookingCard}>
      {/* ── Top row ── */}
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
        {hasActions && (
          <Pressable
            onPress={() => setExpanded((v) => !v)}
            style={[
              styles.actionToggle,
              { backgroundColor: expanded ? colors.primary + "22" : colors.accent },
            ]}
            hitSlop={8}
          >
            <Feather
              name={expanded ? "chevron-up" : "more-horizontal"}
              size={15}
              color={expanded ? colors.primary : colors.mutedForeground}
            />
          </Pressable>
        )}
      </View>

      {/* ── Description ── */}
      <Text
        style={[styles.bookingDesc, { color: colors.foreground }]}
        numberOfLines={2}
      >
        {booking.description}
      </Text>

      {/* ── Client / Worker ── */}
      <View style={styles.partiesRow}>
        {booking.client ? (
          <View style={styles.party}>
            <Avatar name={booking.client.name} size={32} />
            <View>
              <Text style={[styles.partyRole, { color: colors.mutedForeground }]}>
                Client
              </Text>
              <Text style={[styles.partyName, { color: colors.foreground }]} numberOfLines={1}>
                {booking.client.name}
              </Text>
            </View>
          </View>
        ) : null}

        {booking.worker ? (
          <>
            <Feather name="arrow-right" size={14} color={colors.mutedForeground} />
            <View style={styles.party}>
              <Avatar name={booking.worker.user?.name} size={32} />
              <View>
                <Text style={[styles.partyRole, { color: colors.mutedForeground }]}>
                  Worker
                </Text>
                <Text style={[styles.partyName, { color: colors.foreground }]} numberOfLines={1}>
                  {booking.worker.user?.name ?? "—"}
                </Text>
              </View>
            </View>
          </>
        ) : null}
      </View>

      {/* ── Meta ── */}
      <View style={[styles.metaRow, { borderTopColor: colors.border }]}>
        <View style={styles.metaItem}>
          <Feather name="map-pin" size={12} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]} numberOfLines={1}>
            {booking.city}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="clock" size={12} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]} numberOfLines={1}>
            {formatDateTime(booking.scheduled_at)}
          </Text>
        </View>
      </View>

      {/* ── Expandable status actions ── */}
      {hasActions && expanded && (
        <View style={[styles.actionsPanel, { borderTopColor: colors.border }]}>
          {mutation.isError && (
            <View style={styles.errorRow}>
              <Feather name="alert-circle" size={13} color="#B71C1C" />
              <Text style={styles.errorText}>
                {(mutation.error as any)?.message ?? "Failed to update status"}
              </Text>
            </View>
          )}

          <Text style={[styles.actionsLabel, { color: colors.mutedForeground }]}>
            Change status
          </Text>

          <View style={styles.actionButtons}>
            {actions.map((action) => {
              const vc      = VARIANT_COLORS[action.variant];
              const loading = mutation.isPending && mutation.variables === action.nextStatus;
              return (
                <Pressable
                  key={action.nextStatus}
                  onPress={() => mutation.mutate(action.nextStatus)}
                  disabled={mutation.isPending}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    {
                      backgroundColor: vc.bg,
                      opacity: mutation.isPending && !loading ? 0.5 : pressed ? 0.82 : 1,
                    },
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={vc.fg} />
                  ) : (
                    <Feather
                      name={action.icon as any}
                      size={14}
                      color={vc.fg}
                    />
                  )}
                  <Text style={[styles.actionBtnLabel, { color: vc.fg }]}>
                    {action.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* ── Terminal status badge ── */}
      {!hasActions && (booking.status === "completed" || booking.status === "cancelled" || booking.status === "rejected") && (
        <View style={[styles.terminalRow, { borderTopColor: colors.border }]}>
          <View style={[styles.terminalPill, { backgroundColor: sc.bg + "28" }]}>
            <Feather
              name={booking.status === "completed" ? "check-circle" : "x-circle"}
              size={12}
              color={sc.fg}
            />
            <Text style={[styles.terminalText, { color: sc.fg }]}>
              {booking.status === "completed" ? "Completed" : booking.status === "cancelled" ? "Cancelled" : "Rejected"}
            </Text>
          </View>
        </View>
      )}
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
  miniStat: { flex: 1, alignItems: "center" },
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
  miniDivider: { width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.25)" },
  tabsRow: { flexDirection: "row", gap: 8, marginTop: 14, paddingRight: 4 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  tabLabel: { fontFamily: "Inter_600SemiBold", fontSize: 12, letterSpacing: 0.2 },
  listContent: { paddingHorizontal: 20, paddingTop: 16, gap: 10 },
  bookingCard: { gap: 10 },
  bookingTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  bookingId: { fontFamily: "Inter_600SemiBold", fontSize: 11, flex: 1 },
  price: { fontFamily: "Inter_700Bold", fontSize: 15 },
  actionToggle: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  bookingDesc: { fontFamily: "Inter_500Medium", fontSize: 13, lineHeight: 18 },
  partiesRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
  party: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  partyRole: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  partyName: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 5, flexShrink: 1 },
  metaText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  /* ── Actions panel ── */
  actionsPanel: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 10,
  },
  actionsLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  actionButtons: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    minWidth: 100,
    justifyContent: "center",
  },
  actionBtnLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  errorText: { fontFamily: "Inter_500Medium", fontSize: 12, color: "#B71C1C", flex: 1 },
  /* ── Terminal ── */
  terminalRow: {
    borderTopWidth: 1,
    paddingTop: 10,
    alignItems: "flex-start",
  },
  terminalPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  terminalText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.2,
  },
  emptyWrap: { paddingVertical: 60, alignItems: "center", paddingHorizontal: 24 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontFamily: "Inter_700Bold", fontSize: 17, marginBottom: 6 },
  emptyDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
