import { Feather } from "@expo/vector-icons";
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
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useColors } from "@/hooks/useColors";
import { apiRequest } from "@/lib/api";
import { asArray, initials } from "@/lib/format";
import type { User, Worker } from "@/lib/types";

type TabFilter = "all" | "clients" | "workers";
const TABS: { id: TabFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "clients", label: "Clients" },
  { id: "workers", label: "Workers" },
];

type ApiList<T> = T[] | { data?: T[] };

function unwrap<T>(val: ApiList<T> | null | undefined): T[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return asArray(val.data);
}

type NormalizedUser = User & {
  _type: "client" | "worker";
  _workerId?: number;
};

function normalizeClient(u: User): NormalizedUser {
  return { ...u, _type: "client" };
}
function normalizeWorker(w: Worker): NormalizedUser {
  return { ...w.user, _type: "worker", _workerId: w.id };
}

type EditForm = {
  name: string;
  phone: string;
  city: string;
};

function UserEditModal({
  user,
  onClose,
  onSaved,
}: {
  user: NormalizedUser;
  onClose: () => void;
  onSaved: () => void;
}) {
  const colors = useColors();
  const [form, setForm] = useState<EditForm>({
    name: user.name ?? "",
    phone: user.phone ?? "",
    city: user.city ?? "",
  });
  const [error, setError] = useState<string | null>(null);

  const endpoint =
    user._type === "worker"
      ? `/admin/workers/${user._workerId ?? user.id}`
      : `/admin/clients/${user.id}`;

  const mutation = useMutation({
    mutationFn: () =>
      apiRequest(endpoint, {
        method: "PUT",
        body: { name: form.name, phone: form.phone, city: form.city },
      }),
    onSuccess: () => {
      onSaved();
      onClose();
    },
    onError: (e: any) => setError(e?.message ?? "Failed to update user"),
  });

  const set = (key: keyof EditForm) => (val: string) =>
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
              Edit User
            </Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <View style={styles.modalAvatar}>
            <Avatar name={user.name} size={56} />
            <View>
              <Text style={[styles.modalName, { color: colors.foreground }]}>
                {user.name}
              </Text>
              <View
                style={[
                  styles.rolePill,
                  {
                    backgroundColor:
                      user._type === "worker"
                        ? "#7C3AED22"
                        : colors.accent,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.roleText,
                    {
                      color:
                        user._type === "worker" ? "#7C3AED" : colors.primary,
                    },
                  ]}
                >
                  {user._type === "worker" ? "Worker" : "Client"}
                </Text>
              </View>
            </View>
          </View>

          <View style={{ gap: 14 }}>
            <Input
              label="Full Name"
              icon="user"
              value={form.name}
              onChangeText={set("name")}
              placeholder="Full name"
            />
            <Input
              label="Phone"
              icon="phone"
              value={form.phone}
              onChangeText={set("phone")}
              placeholder="Phone number"
              keyboardType="phone-pad"
            />
            <Input
              label="City"
              icon="map-pin"
              value={form.city}
              onChangeText={set("city")}
              placeholder="City"
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
              label="Save"
              onPress={() => mutation.mutate()}
              loading={mutation.isPending}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function UserRow({
  user,
  onEdit,
  onDelete,
}: {
  user: NormalizedUser;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const colors = useColors();
  const isWorker = user._type === "worker";
  return (
    <Card style={styles.userRow} padded={false}>
      <View style={styles.userContent}>
        <Avatar name={user.name} size={44} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={[styles.userName, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {user.name}
          </Text>
          <Text
            style={[styles.userPhone, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            {user.phone}
          </Text>
          <View style={{ flexDirection: "row", gap: 6, marginTop: 2 }}>
            <View
              style={[
                styles.rolePill,
                {
                  backgroundColor: isWorker ? "#7C3AED22" : colors.accent,
                },
              ]}
            >
              <Text
                style={[
                  styles.roleText,
                  { color: isWorker ? "#7C3AED" : colors.primary },
                ]}
              >
                {isWorker ? "Worker" : "Client"}
              </Text>
            </View>
            {user.city ? (
              <View
                style={[
                  styles.rolePill,
                  { backgroundColor: colors.muted },
                ]}
              >
                <Feather
                  name="map-pin"
                  size={9}
                  color={colors.mutedForeground}
                />
                <Text
                  style={[styles.roleText, { color: colors.mutedForeground }]}
                >
                  {user.city}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.userActions}>
          <Pressable
            onPress={onEdit}
            style={[
              styles.actionBtn,
              { backgroundColor: colors.accent },
            ]}
            hitSlop={6}
          >
            <Feather name="edit-2" size={15} color={colors.primary} />
          </Pressable>
          <Pressable
            onPress={onDelete}
            style={[
              styles.actionBtn,
              { backgroundColor: "#FEE2E2" },
            ]}
            hitSlop={6}
          >
            <Feather name="trash-2" size={15} color="#DC2626" />
          </Pressable>
        </View>
      </View>
    </Card>
  );
}

export default function UsersManagementScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const qc = useQueryClient();

  const [tab, setTab] = useState<TabFilter>("all");
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<NormalizedUser | null>(null);

  const clientsQ = useQuery({
    queryKey: ["admin", "clients"],
    queryFn: () => apiRequest<ApiList<User>>("/admin/clients"),
  });
  const workersQ = useQuery({
    queryKey: ["admin", "workers"],
    queryFn: () => apiRequest<ApiList<Worker>>("/admin/workers"),
  });

  const clients = useMemo(
    () => unwrap(clientsQ.data).map(normalizeClient),
    [clientsQ.data]
  );
  const workers = useMemo(
    () => unwrap(workersQ.data).map(normalizeWorker),
    [workersQ.data]
  );

  const all: NormalizedUser[] = useMemo(
    () => [...clients, ...workers],
    [clients, workers]
  );

  const source =
    tab === "clients" ? clients : tab === "workers" ? workers : all;

  const filtered = useMemo(() => {
    if (!search.trim()) return source;
    const q = search.toLowerCase();
    return source.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q) ||
        (u.city ?? "").toLowerCase().includes(q)
    );
  }, [source, search]);

  const deleteMutation = useMutation({
    mutationFn: (user: NormalizedUser) => {
      const endpoint =
        user._type === "worker"
          ? `/admin/workers/${user._workerId ?? user.id}`
          : `/admin/clients/${user.id}`;
      return apiRequest(endpoint, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "clients"] });
      qc.invalidateQueries({ queryKey: ["admin", "workers"] });
    },
  });

  const handleDelete = (user: NormalizedUser) => {
    const doDelete = () => deleteMutation.mutate(user);
    if (Platform.OS === "web") {
      doDelete();
      return;
    }
    Alert.alert(
      "Delete User",
      `Remove ${user.name}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: doDelete },
      ]
    );
  };

  const isLoading = clientsQ.isLoading || workersQ.isLoading;
  const refetch = () => {
    clientsQ.refetch();
    workersQ.refetch();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />

      {editTarget && (
        <UserEditModal
          user={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["admin", "clients"] });
            qc.invalidateQueries({ queryKey: ["admin", "workers"] });
          }}
        />
      )}

      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[
          styles.header,
          { paddingTop: (isWeb ? 67 : insets.top) + 14 },
        ]}
      >
        <Text style={styles.eyebrow}>Admin</Text>
        <Text style={styles.title}>Users</Text>

        <View style={[styles.searchBox, { backgroundColor: "#FFFFFF" }]}>
          <Feather name="search" size={17} color={colors.mutedForeground} />
          <TextInput
            placeholder="Search by name, phone, city…"
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Feather name="x" size={15} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {TABS.map((t) => {
            const count =
              t.id === "all"
                ? all.length
                : t.id === "clients"
                ? clients.length
                : workers.length;
            const active = tab === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => setTab(t.id)}
                style={[
                  styles.tab,
                  {
                    backgroundColor: active
                      ? "#FFFFFF"
                      : "rgba(255,255,255,0.18)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    { color: active ? colors.primary : "#FFFFFF" },
                  ]}
                >
                  {t.label}
                </Text>
                <View
                  style={[
                    styles.tabCount,
                    {
                      backgroundColor: active
                        ? colors.primary
                        : "rgba(255,255,255,0.35)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabCountText,
                      { color: active ? "#FFFFFF" : "#FFFFFF" },
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: (isWeb ? 100 : 96) + 16 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={clientsQ.isRefetching || workersQ.isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View
              style={[styles.emptyIcon, { backgroundColor: colors.accent }]}
            >
              <Feather name="users" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {search ? "No matches" : "No users yet"}
            </Text>
            <Text
              style={[styles.emptyDesc, { color: colors.mutedForeground }]}
            >
              {search
                ? "Try a different name or phone number."
                : "Users will appear here when they register."}
            </Text>
          </View>
        ) : (
          filtered.map((u) => (
            <UserRow
              key={`${u._type}-${u.id}`}
              user={u}
              onEdit={() => setEditTarget(u)}
              onDelete={() => handleDelete(u)}
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
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
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
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 14,
    marginTop: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  tabsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    paddingRight: 4,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  tabLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.2,
  },
  tabCount: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
    minWidth: 20,
    alignItems: "center",
  },
  tabCountText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 10,
  },
  userRow: {
    overflow: "hidden",
  },
  userContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  userName: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  userPhone: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  roleText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  userActions: {
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
  modalAvatar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  modalName: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    marginBottom: 6,
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
