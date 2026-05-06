import { Feather } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useColors } from "@/hooks/useColors";
import { apiRequest } from "@/lib/api";
import { asArray } from "@/lib/format";
import type { Category } from "@/lib/types";
import { categoryIcon } from "@/lib/categoryIcons";

type ApiList<T> = T[] | { data?: T[] };

function unwrap<T>(val: ApiList<T> | null | undefined): T[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return asArray(val.data);
}

type CatForm = { name: string; icon: string; description: string };
const EMPTY_FORM: CatForm = { name: "", icon: "", description: "" };

function CategoryModal({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const colors = useColors();
  const isEdit = !!category;
  const [form, setForm] = useState<CatForm>(
    category
      ? {
          name: category.name,
          icon: category.icon ?? "",
          description: category.description ?? "",
        }
      : EMPTY_FORM
  );
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      isEdit
        ? apiRequest(`/admin/categories/${category!.id}`, {
            method: "PUT",
            body: form,
          })
        : apiRequest("/admin/categories", { method: "POST", body: form }),
    onSuccess: () => {
      onSaved();
      onClose();
    },
    onError: (e: any) => setError(e?.message ?? "Failed to save category"),
  });

  const set = (key: keyof CatForm) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalSheet,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              {isEdit ? "Edit Category" : "New Category"}
            </Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <View style={{ gap: 14 }}>
            <Input
              label="Category Name"
              icon="tag"
              value={form.name}
              onChangeText={set("name")}
              placeholder="e.g. Plumbing"
              autoFocus
            />
            
            <Input
              label="Icon Name (Feather)"
              icon="image"
              value={form.icon}
              onChangeText={set("icon")}
              placeholder="e.g. tool, home, zap"
            />
            <Input
              label="Description"
              icon="file-text"
              value={form.description}
              onChangeText={set("description")}
              placeholder="Short description"
              multiline
              numberOfLines={3}
              style={{ minHeight: 80, textAlignVertical: "top" } as any}
            />
          </View>

          {error ? (
            <Text style={[styles.errorText, { color: colors.destructive }]}>
              {error}
            </Text>
          ) : null}

          <View style={styles.modalActions}>
            <Button
              label="Cancel"
              variant="outline"
              onPress={onClose}
              style={{ flex: 1 }}
            />
            <Button
              label={isEdit ? "Update" : "Create"}
              onPress={() => mutation.mutate()}
              loading={mutation.isPending}
              disabled={!form.name.trim()}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function CategoryRow({
  category,
  onEdit,
  onDelete,
}: {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const colors = useColors();
 const { icon, bg, fg } = categoryIcon(category.name ?? category.name);

  return (
    <Card style={styles.catCard} padded={false}>
      <View style={styles.catContent}>
        <View style={[styles.catIcon, { backgroundColor: bg }]}>
          <MaterialCommunityIcons name={icon} size={20} color={fg} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={[styles.catName, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {category.name}
          </Text>
          
            <Text
              style={[styles.catDesc, { color: colors.mutedForeground }]}
              numberOfLines={2}
            >
              {category.description}
            </Text>
          {typeof category.workers_count === "number" ? (
            <View style={styles.workerCountRow}>
              <Feather
                name="briefcase"
                size={11}
                color={colors.mutedForeground}
              />
              <Text
                style={[styles.workerCount, { color: colors.mutedForeground }]}
              >
                {category.workers_count}{" "}
                {category.workers_count === 1 ? "worker" : "workers"}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.catActions}>
          <Pressable
            onPress={onEdit}
            style={[styles.actionBtn, { backgroundColor: colors.accent }]}
            hitSlop={6}
          >
            <Feather name="edit-2" size={15} color={colors.primary} />
          </Pressable>
          <Pressable
            onPress={onDelete}
            style={[styles.actionBtn, { backgroundColor: "#FEE2E2" }]}
            hitSlop={6}
          >
            <Feather name="trash-2" size={15} color="#DC2626" />
          </Pressable>
        </View>
      </View>
    </Card>
  );
}

export default function CategoriesManagementScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const qc = useQueryClient();

  const [modalTarget, setModalTarget] = useState<Category | null | "new">(
    null
  );

  const categoriesQ = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => apiRequest<ApiList<Category>>("/admin/categories"),
  });

  const categories = useMemo(
    () => unwrap(categoriesQ.data),
    [categoriesQ.data]
  );

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/admin/categories/${id}`, { method: "DELETE" }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });

  const handleDelete = (cat: Category) => {
    const doDelete = () => deleteMutation.mutate(cat.id);
    if (Platform.OS === "web") {
      doDelete();
      return;
    }
    Alert.alert(
      "Delete Category",
      `Remove "${cat.name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: doDelete },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />

      {modalTarget !== null && (
        <CategoryModal
          category={modalTarget === "new" ? null : modalTarget}
          onClose={() => setModalTarget(null)}
          onSaved={() =>
            qc.invalidateQueries({ queryKey: ["admin", "categories"] })
          }
        />
      )}

      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[
          styles.header,
          { paddingTop: (isWeb ? 67 : insets.top) + 14 },
        ]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>Admin</Text>
            <Text style={styles.title}>Categories</Text>
          </View>
          <Pressable
            onPress={() => setModalTarget("new")}
            style={styles.addBtn}
          >
            <Feather name="plus" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
        <Text style={styles.subtitle}>
          {categories.length} service{" "}
          {categories.length === 1 ? "category" : "categories"}
        </Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: (isWeb ? 100 : 96) + 16 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={categoriesQ.isRefetching}
            onRefresh={() => categoriesQ.refetch()}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {categoriesQ.isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : categories.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View
              style={[styles.emptyIcon, { backgroundColor: colors.accent }]}
            >
              <Feather name="grid" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No categories yet
            </Text>
            <Text
              style={[styles.emptyDesc, { color: colors.mutedForeground }]}
            >
              Tap the + button above to create the first category.
            </Text>
            <View style={{ marginTop: 20, width: 200 }}>
              <Button
                label="Add Category"
                size="sm"
                icon="plus"
                onPress={() => setModalTarget("new")}
              />
            </View>
          </View>
        ) : (
          categories.map((c) => (
            <CategoryRow
              key={c.id}
              category={c}
              onEdit={() => setModalTarget(c)}
              onDelete={() => handleDelete(c)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    fontSize: 26,
    letterSpacing: -0.6,
    marginTop: 2,
  },
  subtitle: {
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginTop: 8,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 10,
  },
  catCard: {
    overflow: "hidden",
  },
  catContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
  },
  catIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  catName: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  catDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 17,
  },
  workerCountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  workerCount: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  catActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyWrap: {
    paddingVertical: 60,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    marginBottom: 6,
  },
  emptyDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    gap: 18,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    letterSpacing: -0.3,
  },
  errorText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
});
