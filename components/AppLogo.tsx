import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  variant?: "full" | "mark";
  color?: "auto" | "light" | "dark";
};

export function AppLogo({ variant = "full", color = "auto" }: Props) {
  const colors = useColors();

  const navy = color === "light" ? "#FFFFFF" : colors.primary;
  const orange = colors.secondary;
  const subtitle =
    color === "light" ? "rgba(255,255,255,0.85)" : colors.mutedForeground;

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.mark,
          { backgroundColor: navy, borderRadius: 14 },
        ]}
      >
        <Feather name="map-pin" size={20} color="#FFFFFF" />
        <View
          style={[
            styles.dot,
            { backgroundColor: orange },
          ]}
        />
      </View>
      {variant === "full" && (
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.title}>
            <Text style={{ color: navy }}>Adeeg</Text>
            <Text style={{ color: orange }}>Finder</Text>
          </Text>
          <Text style={[styles.subtitle, { color: subtitle }]}>
            Trusted local services
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  mark: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  dot: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginTop: 1,
    letterSpacing: 0.2,
  },
});
