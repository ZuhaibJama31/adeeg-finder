import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, type ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle | ViewStyle[];
};

export function Skeleton({
  width = "100%",
  height = 16,
  radius = 8,
  style,
}: Props) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.base,
        {
          width: width as ViewStyle["width"],
          height,
          borderRadius: radius,
          backgroundColor: colors.muted,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Skeleton width={56} height={56} radius={28} />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width={"70%"} height={14} />
          <Skeleton width={"40%"} height={12} />
          <Skeleton width={"55%"} height={12} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {},
  card: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
});
