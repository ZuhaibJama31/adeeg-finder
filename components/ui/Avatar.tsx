import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { initials } from "@/lib/format";

type Props = {
  name?: string | null;
  uri?: string | null;
  size?: number;
};

export function Avatar({ name, uri, size = 48 }: Props) {
  const colors = useColors();

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.accent,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: colors.primary, fontSize: Math.round(size * 0.38) },
        ]}
      >
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
});
