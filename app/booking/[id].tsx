import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { ApiError, apiRequest } from "@/lib/api";
import { asArray, formatDate, formatTime, statusLabel } from "@/lib/format";
import type { Booking, BookingStatus } from "@/lib/types";

function unwrapOne(
  data: Booking | { booking?: Booking } | { data?: Booking } | null | undefined,
): Booking | null {
  if (!data) return null;
  if (typeof data !== "object") return null;
  if ("id" in data) return data as Booking;
  if ("booking" in data && data.booking) return data.booking;
  if ("data" in data && data.data) return data.data as Booking;
  return null;
}

function unwrapList(
  data: Booking[] | { data?: Booking[] } | null | undefined,
): Booking[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return asArray(data.data);
}

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: ["booking", id],
    queryFn: () =>
      apiRequest<Booking | { booking?: Booking } | { data?: Booking }>(
        `/client/bookings/${id}`,
      ),
    retry: 0,
  });

  const listQuery = useQuery({
    queryKey: ["bookings"],
    queryFn: () =>
      apiRequest<Booking[] | { data?: Booking[] }>("client/bookings"),
    enabled: detailQuery.isError || !unwrapOne(detailQuery.data),
  });

  const fromList = useMemo(
    () =>
      unwrapList(listQuery.data).find((b) => String(b.id) === String(id)),
    [listQuery.data, id],
  );

  const booking = unwrapOne(detailQuery.data) ?? fromList ?? null;
  const isLoading =
    detailQuery.isLoading || (!booking && listQuery.isLoading);

  const isWorker = user?.role === "worker";

  const updateMutation = useMutation({
    mutationFn: async (payload: {
      status: BookingStatus;
      agreed_price?: number;
    }) =>
      apiRequest(`/client/bookings/${id}`, {
        method: "PUT",
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Couldn't update the booking.";
      setActionError(message);
    },
  });

  const updateStatus = (status: BookingStatus) => {
    setActionError(null);
    if (Platform.OS === "web") {
      updateMutation.mutate({ status });
      return;
    }
    Alert.alert(
      `Mark as ${statusLabel(status).toLowerCase()}?`,
      "This will update the booking for both parties.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: status === "cancelled" || status === "rejected" ? "destructive" : "default",
          onPress: () => updateMutation.mutate({ status }),
        },
      ],
    );
  };

  const counterparty = isWorker
  ? booking?.client
  : booking?.worker?.user;

  const renderActions = () => {
    if (!booking) return null;
    if (updateMutation.isPending) {
      return (
        <Button
          label="Updating…"
          loading
          variant="primary"
          onPress={() => {}}
        />
      );
    }

    if (isWorker) {
      if (booking.status === "pending") {
        return (
          <View style={{ gap: 10 }}>
            <Button
              label="Accept job"
              icon="check"
              onPress={() => updateStatus("accepted")}
            />
            <Button
              label="Decline"
              icon="x"
              variant="outline"
              onPress={() => updateStatus("rejected")}
            />
          </View>
        );
      }
      if (booking.status === "accepted") {
        return (
          <Button
            label="Mark complete"
            icon="check-circle"
            onPress={() => updateStatus("completed")}
          />
        );
      }
    } else {
      if (booking.status === "pending" || booking.status === "accepted") {
        return (
          <View style={{ gap: 10 }}>
            {booking.status === "accepted" && (
              <Button
                label="Mark complete"
                icon="check-circle"
                onPress={() => updateStatus("completed")}
              />
            )}
            <Button
              label="Cancel booking"
              icon="x"
              variant="outline"
              onPress={() => updateStatus("cancelled")}
            />
          </View>
        );
      }
    }
    return null;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={[styles.header, { paddingTop: (isWeb ? 67 : insets.top) + 14 }]}
        >
          <View style={styles.topRow}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              style={styles.iconBtn}
            >
              <Feather name="arrow-left" size={18} color="#FFFFFF" />
            </Pressable>
            
            <View style={{ width: 38 }} />
          </View>

          {isLoading ? (
            <View style={{ marginTop: 24 }}>
              <Skeleton width={"60%"} height={24} />
              <Skeleton width={"40%"} height={14} style={{ marginTop: 8 }} />
            </View>
          ) : booking ? (
            <View style={{ marginTop: 22 }}>
              <Badge
                status={booking.status}
                bg="rgba(255,255,255,0.22)"
                fg="#FFFFFF"
              />
              <Text style={styles.heroTitle} numberOfLines={2}>
                {booking.description}
              </Text>
              <Text style={styles.heroSub}>
                {formatDate(booking.scheduled_at)} ·{" "}
                {formatTime(booking.scheduled_at)}
              </Text>
            </View>
          ) : (
            <Text style={styles.heroTitle}>Booking not found</Text>
          )}
        </LinearGradient>

        {booking && (
          <View style={styles.body}>
            <Card>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                {isWorker ? "Client" : "Worker Details"}
              </Text>
              <View style={styles.partyRow}>
              
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.partyName, { color: colors.foreground }]}
                  >
                    {counterparty?.name}
                  </Text>
                  <Text
                    style={[styles.partyRole, { color: colors.mutedForeground }]}
                  >
                    {counterparty?.category?.name}
                  </Text>
                </View>
                {counterparty?.phone ? (
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: colors.accent },
                    ]}
                  >
                    <Feather name="phone" size={16} color={colors.primary} />
                  </View>
                ) : null}
              </View>
            </Card>

            <Card style={{ marginTop: 14 }}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                Schedule
              </Text>
              <DetailRow
                icon="calendar"
                label="Date"
                value={formatDate(booking.scheduled_at)}
              />
              <DetailRow
                icon="clock"
                label="Time"
                value={formatTime(booking.scheduled_at)}
              />
              {booking.agreed_price ? (
                <DetailRow
                  icon="dollar-sign"
                  label="Agreed price"
                  value={`$${booking.agreed_price}`}
                />
              ) : null}
            </Card>

            <Card style={{ marginTop: 14 }}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                Location
              </Text>
              <DetailRow
                icon="map-pin"
                label="Address"
                value={booking.address}
              />
              <DetailRow
                icon="navigation"
                label="City"
                value={booking.city}
              />
            </Card>

            <Card style={{ marginTop: 14 }}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                Job description
              </Text>
              <Text
                style={[
                  styles.description,
                  { color: colors.foreground, marginTop: 8 },
                ]}
              >
                {booking.description}
              </Text>
            </Card>

            {actionError && (
              <Text
                style={[
                  styles.errorText,
                  { color: colors.destructive },
                ]}
              >
                {actionError}
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {booking && renderActions() && (
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
          {renderActions()}
        </View>
      )}
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value?: string | null;
}) {
  const colors = useColors();
  return (
    <View style={styles.detailRow}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: colors.accent },
        ]}
      >
        <Feather name={icon} size={14} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
          {label}
        </Text>
        <Text style={[styles.detailValue, { color: colors.foreground }]}>
          {value ?? "—"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 30,
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
  heroTitle: {
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    fontSize: 22,
    letterSpacing: -0.4,
    marginTop: 12,
    lineHeight: 28,
  },
  heroSub: {
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 6,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  partyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  partyName: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  partyRole: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 2,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  detailLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  detailValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginTop: 2,
  },
  description: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 12,
    textAlign: "center",
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
