import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { formatDateTime } from "@/lib/format";
import type { Booking } from "@/lib/types";

type Props = {
  booking:Booking;
};

export function BookingCard({ booking }: Props) {
  const colors = useColors();
  const { user } = useAuth();
  //const isWorker = user?.role === "worker";
  const counterparty = booking.worker;

  return (
    <Pressable
      onPress={() => router.push(`/booking/${booking.id}`)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.95 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.idChip}>
            <Text
              style={[styles.idText, { color: colors.mutedForeground }]}
            >
              #{booking.id}
            </Text>
          </View>
          <Badge status={booking.status} />
        </View>

        <View style={styles.row}>
          <Avatar
            name={counterparty?.user.name}

            size={44}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={[styles.name, { color: colors.foreground }]}
              numberOfLines={1}
            >
              {counterparty?.user.name}
            </Text>
            <Text
              style={[styles.role, { color: colors.mutedForeground }]}
              numberOfLines={1}
            >
              {counterparty?.category?.name ?? "Service"}
            </Text>
          </View>
          {booking.agreed_price ? (
            <Text style={[styles.price, { color: colors.primary }]}>
              ${booking.agreed_price}
            </Text>
          ) : null}
        </View>

        <Text
          style={[styles.description, { color: colors.foreground }]}
          numberOfLines={2}
        >
          {booking.description}
        </Text>

        <View
          style={[
            styles.metaRow,
            { borderTopColor: colors.border },
          ]}
        >
          <View style={styles.metaItem}>
            <Feather name="calendar" size={13} color={colors.mutedForeground} />
            <Text
              style={[styles.metaText, { color: colors.mutedForeground }]}
              numberOfLines={1}
            >
              {formatDateTime(booking.scheduled_at)}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="map-pin" size={13} color={colors.mutedForeground} />
            <Text
              style={[styles.metaText, { color: colors.mutedForeground }]}
              numberOfLines={1}
            >
              {booking.city}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  idChip: {},
  idText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  name: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  role: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 2,
  },
  price: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  description: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
  metaText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
});
