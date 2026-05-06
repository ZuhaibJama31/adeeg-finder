import { useRouter } from "expo-router";

// inside your component:
const router = useRouter();

import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";
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

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { apiRequest } from "@/lib/api";
import { asArray, formatDateTime } from "@/lib/format";
import type { Booking, User, Worker } from "@/lib/types";

type ApiList<T> = T[] | { data?: T[] };

function unwrap<T>(val: ApiList<T> | null | undefined): T[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return asArray(val.data);
}

type StatCardProps = {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string | number;
  accent?: boolean;
  color?: string;
};

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colors = useColors();
  const iconBg = color ?? colors.primary;
  return (
    <Card style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: iconBg + "22" }]}>
        <Feather name={icon} size={18} color={iconBg} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </Card>
  );
}

export default function AdminDashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { user } = useAuth();

  const clientsQ = useQuery({
    queryKey: ["admin", "clients"],
    queryFn: () => apiRequest<ApiList<User>>("/admin/clients"),
  });
  const workersQ = useQuery({
    queryKey: ["admin", "workers"],
    queryFn: () => apiRequest<ApiList<Worker>>("/admin/workers"),
  });
  const bookingsQ = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: () => apiRequest<ApiList<Booking>>("/admin/bookings"),
  });

  const clients = useMemo(() => unwrap(clientsQ.data), [clientsQ.data]);
  const workers = useMemo(() => unwrap(workersQ.data), [workersQ.data]);
  const bookings = useMemo(() => unwrap(bookingsQ.data), [bookingsQ.data]);

  const activeBookings = bookings.filter((b) =>
    ["pending", "accepted", "in_progress"].includes(b.status)
  );
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const totalRevenue = completedBookings.reduce(
    (s, b) => s + (b.agreed_price ?? 0),
    0
  );

  const recentBookings = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.created_at ?? b.scheduled_at).getTime() -
        new Date(a.created_at ?? a.scheduled_at).getTime()
    )
    .slice(0, 8);

  const isLoading = clientsQ.isLoading || workersQ.isLoading || bookingsQ.isLoading;

  const refetchAll = () => {
    clientsQ.refetch();
    workersQ.refetch();
    bookingsQ.refetch();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{
          paddingBottom: (isWeb ? 100 : 96) + 16,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={
              clientsQ.isRefetching ||
              workersQ.isRefetching ||
              bookingsQ.isRefetching
            }
            onRefresh={refetchAll}
            tintColor={colors.primary}
          />
        }
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={[
            styles.header,
            { paddingTop: (isWeb ? 67 : insets.top) + 14 },
          ]}
        >
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.eyebrow}>AdeegFinder</Text>
              <Text style={styles.title}>Admin Dashboard</Text>
            </View>
            <View style={styles.adminBadge}>
              <Feather name="shield" size={13} color="#FFFFFF" />
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          </View>
          <Text style={styles.greeting}>
            Welcome back, {user?.name?.split(" ")[0] ?? "Admin"}
          </Text>
        </LinearGradient>

        <View style={styles.body}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Overview
          </Text>

          <View style={styles.statsGrid}>
            <Pressable style={styles.statWrapper} onPress={() => router.push("/(admin)/users")}>
            <StatCard
            icon="users"
            label="Total Users"
            value={isLoading ? "—" : clients.length + workers.length}
            color={colors.primary}
            />
            </Pressable>
            
           <StatCard
              icon="briefcase"
              label="Workers"
              value={isLoading ? "—" : workers.length}
              color="#7C3AED"
            />
            <StatCard
              icon="clock"
              label="Active Jobs"
              value={isLoading ? "—" : activeBookings.length}
              color={colors.warning}
            />
            <StatCard
              icon="check-circle"
              label="Completed"
              value={isLoading ? "—" : completedBookings.length}
              color={colors.success}
            />
            <StatCard
              icon="calendar"
              label="All Bookings"
              value={isLoading ? "—" : bookings.length}
              color="#0891B2"
            />
          </View>

          <Text
            style={[
              styles.sectionTitle,
              { color: colors.foreground, marginTop: 24 },
            ]}
          >
            Recent Bookings
          </Text>

          {bookingsQ.isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : recentBookings.length === 0 ? (
            <Card style={{ alignItems: "center", paddingVertical: 32 }}>
              <Feather name="calendar" size={32} color={colors.mutedForeground} />
              <Text
                style={[
                  styles.emptyText,
                  { color: colors.mutedForeground, marginTop: 12 },
                ]}
              >
                No bookings yet
              </Text>
            </Card>
          ) : (
            recentBookings.map((b) => (
              <Card key={b.id} style={styles.bookingRow}>
                <View style={styles.bookingTop}>
                  <Badge status={b.status} />
                  {b.agreed_price ? (
                    <Text style={[styles.price, { color: colors.primary }]}>
                      ${b.agreed_price}
                    </Text>
                  ) : null}
                </View>
                <Text
                  style={[styles.bookingDesc, { color: colors.foreground }]}
                  numberOfLines={1}
                >
                  {b.description}
                </Text>
                <View style={styles.bookingMeta}>
                  <View style={styles.metaItem}>
                    <Feather
                      name="user"
                      size={12}
                      color={colors.mutedForeground}
                    />
                    <Text
                      style={[
                        styles.metaText,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {b.client?.name ?? "Client"}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Feather
                      name="map-pin"
                      size={12}
                      color={colors.mutedForeground}
                    />
                    <Text
                      style={[
                        styles.metaText,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {b.city}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Feather
                      name="calendar"
                      size={12}
                      color={colors.mutedForeground}
                    />
                    <Text
                      style={[
                        styles.metaText,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {formatDateTime(b.scheduled_at)}
                    </Text>
                  </View>
                </View>
              </Card>
            ))
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
    justifyContent: "space-between",
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
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  adminBadgeText: {
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  greeting: {
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 10,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    letterSpacing: -0.2,
    marginBottom: 14,
  },
  statsGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 10,
},
statWrapper: {
  width: "47%",
  flexGrow: 1,
},
  statCard: {
    
    flexGrow: 1,
    gap: 6,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    letterSpacing: 0.2,
  },
  bookingRow: {
    marginBottom: 10,
    gap: 8,
  },
  bookingTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  bookingMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E9F0",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  emptyText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
});
