import React from "react";
import { Platform, ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  withTabBarPadding?: boolean;
  contentStyle?: ViewStyle;
  refreshControl?: React.ReactElement;
};

export function ScreenContainer({
  children,
  scroll = true,
  withTabBarPadding = false,
  contentStyle,
  refreshControl,
}: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const bottomTabSpace = withTabBarPadding ? (isWeb ? 100 : 96) : isWeb ? 34 : insets.bottom;

  const Container = scroll ? ScrollView : View;

  return (
    <Container
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={
        scroll
          ? [
              styles.content,
              {
                paddingBottom: bottomTabSpace + 16,
              },
              contentStyle,
            ]
          : undefined
      }
      refreshControl={scroll ? refreshControl : undefined}
      showsVerticalScrollIndicator={false}
    >
      {scroll ? (
        children
      ) : (
        <View style={[{ flex: 1, paddingBottom: bottomTabSpace }, contentStyle]}>
          {children}
        </View>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 0,
  },
});
