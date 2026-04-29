import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { WorkerCard } from "@/components/WorkerCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useColors } from "@/hooks/useColors";
import { apiRequest } from "@/lib/api";
import { categoryIcon } from "@/lib/categoryIcons";
import { asArray } from "@/lib/format";
import type { Category, User } from "@/lib/types";

type ApiList<T> = T[] | { data?: T[] };
function unwrap<T>(v: ApiList<T> | null | undefined): T[] {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return asArray(v.data);
}

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiRequest<ApiList<Category>>("/categories"),
  });
  const workersQuery = useQuery({
    queryKey: ["workers", { category: id }],
    queryFn: () =>
      apiRequest<ApiList<User>>(`/workers?category_id=${id}`),
  });

  const category = useMemo(
    () => unwrap(categoriesQuery.data).find((c) => String(c.id) === String(id)),
    [categoriesQuery.data, id],
  );

  const allWorkers = useMemo(() => unwrap(workersQuery.data), [workersQuery.data]);
  const workers = useMemo(() => {
    if (!category) return allWorkers;
    return allWorkers.filter((w) => {
      const wid = w.category_id ?? w.category?.id;
      if (wid != null) return String(wid) === String(category.id);
      const cn = w.category?.name?.toLowerCase();
      return cn ? cn === category.name.toLowerCase() : true;
    });
  }, [allWorkers, category]);

  const cfg = category ? categoryIcon(category.name) : categoryIcon(null);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: category?.name ?? "Category",
          headerTitleStyle: { fontFamily: "Inter_700Bold" },
        }}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.hero,
            {
              backgroundColor: colors.card,
              borderRadius: colors.radius,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.heroIcon,
              { backgroundColor: cfg.bg, borderRadius: colors.radius - 4 },
            ]}
          >
            <Feather name={cfg.icon} size={26} color={cfg.fg} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>
              {category?.name ?? "Category"}
            </Text>
            <Text
              style={[styles.heroSub, { color: colors.mutedForeground }]}
              numberOfLines={2}
            >
              {category?.description ??
                "Verified pros ready to take on your job."}
            </Text>
            <Text style={[styles.heroCount, { color: colors.primary }]}>
              {workers.length} pro{workers.length === 1 ? "" : "s"} available
            </Text>
          </View>
        </View>

        {workersQuery.isLoading ? (
          <View style={{ marginTop: 18 }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : workersQuery.isError ? (
          <EmptyState
            icon="cloud-off"
            title="Couldn't load professionals"
            description="Check your connection and try again."
            actionLabel="Try again"
            onActionPress={() => workersQuery.refetch()}
          />
        ) : workers.length === 0 ? (
          <EmptyState
            icon="users"
            title="No professionals yet"
            description="No one is offering this service in your area just yet."
          />
        ) : (
          <View style={{ marginTop: 18 }}>
            {workers.map((w) => (
              <WorkerCard key={w.id} worker={w} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderWidth: 1,
  },
  heroIcon: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    letterSpacing: -0.3,
  },
  heroSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  heroCount: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    marginTop: 8,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
});
