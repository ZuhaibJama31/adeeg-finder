import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

import { useColors } from "@/hooks/useColors";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof Feather>["name"];
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  icon,
  iconPosition = "left",
  fullWidth = true,
  size = "md",
  style,
}: Props) {
  const colors = useColors();
  const isDisabled = disabled || loading;

  const heights = { sm: 40, md: 52, lg: 58 };
  const fontSizes = { sm: 14, md: 16, lg: 17 };
  const height = heights[size];
  const fontSize = fontSizes[size];

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress?.();
  };

  const radius = colors.radius - 2;

  const renderInner = (textColor: string) => (
    <View style={styles.inner}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <Feather name={icon} size={18} color={textColor} />
          )}
          <Text
            style={[styles.label, { color: textColor, fontSize }]}
            numberOfLines={1}
          >
            {label}
          </Text>
          {icon && iconPosition === "right" && (
            <Feather name={icon} size={18} color={textColor} />
          )}
        </>
      )}
    </View>
  );

  if (variant === "primary") {
    return (
      <Pressable
        onPress={handlePress}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.base,
          {
            height,
            borderRadius: radius,
            opacity: isDisabled ? 0.6 : pressed ? 0.92 : 1,
            transform: [{ scale: pressed ? 0.99 : 1 }],
            width: fullWidth ? "100%" : undefined,
          },
          style,
        ]}
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: radius },
          ]}
        />
        {renderInner(colors.primaryForeground)}
      </Pressable>
    );
  }

  let bg = colors.secondary;
  let fg = colors.secondaryForeground;
  let borderColor: string | undefined;
  let borderWidth = 0;

  if (variant === "outline") {
    bg = "transparent";
    fg = colors.primary;
    borderColor = colors.border;
    borderWidth = 1;
  } else if (variant === "ghost") {
    bg = "transparent";
    fg = colors.primary;
  } else if (variant === "danger") {
    bg = colors.destructive;
    fg = colors.destructiveForeground;
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          height,
          borderRadius: radius,
          backgroundColor: bg,
          borderColor,
          borderWidth,
          opacity: isDisabled ? 0.6 : pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
          width: fullWidth ? "100%" : undefined,
        },
        style,
      ]}
    >
      {renderInner(fg)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
});
