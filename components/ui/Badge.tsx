import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

import { statusColors, statusLabel } from "@/lib/format";
import type { BookingStatus } from "@/lib/types";

type Props = {
  status?: BookingStatus;
  label?: string;
  bg?: string;
  fg?: string;
  style?: ViewStyle;
};

export function Badge({ status, label, bg, fg, style }: Props) {
  const colors = status ? statusColors(status) : null;
  const background = bg ?? colors?.bg ?? "#E5E7EB";
  const foreground = fg ?? colors?.fg ?? "#374151";
  const text = label ?? (status ? statusLabel(status) : "");

  return (
    <View style={[styles.badge, { backgroundColor: background }, style]}>
      <Text style={[styles.text, { color: foreground }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  text: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
});
