import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { useColors } from "@/hooks/useColors";
import type { Worker } from "@/lib/types";

type Props = {
  worker: Worker;
  onPress?: () => void;
};

export function WorkerCard({ worker, onPress }: Props) {
  const colors = useColors();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push({
        pathname: "/worker/[id]",
        params: { id: String(worker.id) },
      });
    }
  };

  
  const skillLine = worker.category?.name ?? "Local Specialist";

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.95 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <Card style={styles.card}>
        <View style={styles.row}>

         
          <Avatar
            name={worker.user?.name}
            uri={worker.user?.avatar_url}
            size={56}
          />

          <View style={styles.body}>

            <Text
              style={[styles.name, { color: colors.foreground }]}
              numberOfLines={1}
            >
              {worker.user?.name}
            </Text>

            <Text
              style={[styles.skill, { color: colors.mutedForeground }]}
              numberOfLines={1}
            >
              {skillLine}
            </Text>

            <View style={styles.metaRow}>

              <View style={styles.metaItem}>
                <Feather name="star" size={13} color={colors.secondary} />
                <Text style={[styles.metaText, { color: colors.foreground }]}>
                  {(worker.rating ?? 0).toFixed(1)}
                </Text>
              </View>

              {/* ✅ FIXED city path */}
              {worker.user?.city && (
                <View style={styles.metaItem}>
                  <Feather
                    name="map-pin"
                    size={13}
                    color={colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.metaText,
                      { color: colors.mutedForeground },
                    ]}
                    numberOfLines={1}
                  >
                    {worker.user.city}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View
            style={[
              styles.chevron,
              { backgroundColor: colors.accent },
            ]}
          >
            <Feather name="chevron-right" size={18} color={colors.primary} />
          </View>

        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  skill: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 1,
  },
  metaText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  chevron: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});