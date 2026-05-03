import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import { statusColors, statusLabel } from "@/lib/format";
import type { Booking } from "@/lib/types";

type Props = {
  booking: Booking;
  onDismiss: () => void;
  autoDismissMs?: number;
};

export function AdminNotificationBanner({
  booking,
  onDismiss,
  autoDismissMs = 5000,
}: Props) {
  const colors   = useColors();
  const slideY   = useRef(new Animated.Value(-120)).current;
  const opacity  = useRef(new Animated.Value(0)).current;
  const isWeb    = Platform.OS === "web";

  /* Slide in */
  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  /* Auto dismiss */
  useEffect(() => {
    const t = setTimeout(() => slide_out(), autoDismissMs);
    return () => clearTimeout(t);
  }, [autoDismissMs]);

  const slide_out = () => {
    Animated.parallel([
      Animated.timing(slideY, {
        toValue: -120,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  };

  const sc = statusColors(booking.status);

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          transform: [{ translateY: slideY }],
          opacity,
          top: isWeb ? 16 : 52,
        },
      ]}
    >
      {/* Accent strip */}
      <View style={[styles.accent, { backgroundColor: colors.secondary }]} />

      <View style={styles.iconWrap}>
        <View style={[styles.iconCircle, { backgroundColor: "#FF6D0022" }]}>
          <Feather name="calendar" size={18} color={colors.secondary} />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            New Booking
          </Text>
          <View style={[styles.statusPill, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusText, { color: sc.fg }]}>
              {statusLabel(booking.status)}
            </Text>
          </View>
        </View>

        <Text
          style={[styles.desc, { color: colors.mutedForeground }]}
          numberOfLines={1}
        >
          {booking.client?.name ?? "Client"} · {booking.city}
        </Text>

        <Text
          style={[styles.detail, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {booking.description}
        </Text>
      </View>

      <Pressable onPress={slide_out} style={styles.closeBtn} hitSlop={10}>
        <Feather name="x" size={16} color={colors.mutedForeground} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
  accent: {
    width: 4,
    alignSelf: "stretch",
  },
  iconWrap: {
    paddingLeft: 12,
    paddingVertical: 14,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  statusText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  desc: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  detail: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  closeBtn: {
    paddingRight: 14,
    paddingVertical: 14,
    alignSelf: "flex-start",
    paddingTop: 16,
  },
});
