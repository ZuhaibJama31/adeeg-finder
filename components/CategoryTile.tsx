import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { categoryIcon } from "@/lib/categoryIcons";
import type { Category } from "@/lib/types";


type Props = {
  category: Category;
  width?: number | "auto";
};

export function CategoryTile({ category, width = "auto" }: Props) {
  const colors = useColors();
  const cfg = categoryIcon(category.name);
const { icon, bg, fg } = categoryIcon(category.name ?? category.name);

  return (
    <Pressable
      onPress={() => router.push(`/category/${category.id}`)}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
          width: width === "auto" ? undefined : width,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        Platform.select({
          ios: {
            shadowColor: "#0F172A",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 12,
          },
          android: { elevation: 1 },
          default: {},
        }),
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: cfg.bg, borderRadius: colors.radius - 4 },
        ]}
      >
        <MaterialCommunityIcons name={icon} size={20} color={fg} />
      </View>
      <Text
        style={[styles.label, { color: colors.foreground }]}
        numberOfLines={1}
      >
        {category.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  iconWrap: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    textAlign: "center",
  },
});
