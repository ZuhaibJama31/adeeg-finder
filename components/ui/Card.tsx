import React from "react";
import { Platform, StyleSheet, View, type ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  elevated?: boolean;
  padded?: boolean;
};

export function Card({ children, style, elevated = true, padded = true }: Props) {
  const colors = useColors();
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          padding: padded ? 16 : 0,
          borderWidth: 1,
          borderColor: colors.border,
        },
        elevated && styles.shadow,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: Platform.select({
    ios: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
    },
    android: {
      elevation: 2,
    },
    default: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
    },
  }) as ViewStyle,
});
