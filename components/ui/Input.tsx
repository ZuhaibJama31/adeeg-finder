import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = TextInputProps & {
  label?: string;
  icon?: React.ComponentProps<typeof Feather>["name"];
  errorText?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  rightAdornment?: React.ReactNode;
};

export function Input({
  label,
  icon,
  errorText,
  helperText,
  containerStyle,
  rightAdornment,
  secureTextEntry,
  ...rest
}: Props) {
  const colors = useColors();
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);

  const isPassword = !!secureTextEntry;
  const effectiveSecure = isPassword && !show;

  const borderColor = errorText
    ? colors.destructive
    : focused
      ? colors.primary
      : colors.border;

  return (
    <View style={[{ width: "100%" }, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.foreground }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.field,
          {
            backgroundColor: colors.card,
            borderColor,
            borderRadius: colors.radius - 4,
          },
        ]}
      >
        {icon && (
          <Feather
            name={icon}
            size={18}
            color={focused ? colors.primary : colors.mutedForeground}
            style={{ marginRight: 10 }}
          />
        )}
        <TextInput
          {...rest}
          secureTextEntry={effectiveSecure}
          placeholderTextColor={colors.mutedForeground}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[
            styles.input,
            { color: colors.foreground },
            rest.style as object,
          ]}
        />
        {isPassword ? (
          <Pressable onPress={() => setShow((s) => !s)} hitSlop={10}>
            <Feather
              name={show ? "eye-off" : "eye"}
              size={18}
              color={colors.mutedForeground}
            />
          </Pressable>
        ) : (
          rightAdornment ?? null
        )}
      </View>
      {(errorText || helperText) && (
        <Text
          style={[
            styles.helper,
            {
              color: errorText ? colors.destructive : colors.mutedForeground,
            },
          ]}
        >
          {errorText ?? helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  field: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    paddingVertical: 12,
  },
  helper: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 6,
    paddingHorizontal: 4,
  },
});
