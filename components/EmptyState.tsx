import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { useColors } from "@/hooks/useColors";

type Props = {
  icon?: React.ComponentProps<typeof Feather>["name"];
  title: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function EmptyState({
  icon = "inbox",
  title,
  description,
  actionLabel,
  onActionPress,
}: Props) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: colors.accent },
        ]}
      >
        <Feather name={icon} size={28} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {description && (
        <Text style={[styles.desc, { color: colors.mutedForeground }]}>
          {description}
        </Text>
      )}
      {actionLabel && onActionPress && (
        <View style={{ marginTop: 16, width: 220 }}>
          <Button label={actionLabel} onPress={onActionPress} size="sm" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    textAlign: "center",
    marginBottom: 6,
  },
  desc: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
