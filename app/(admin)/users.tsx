import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  Alert,
  Image,
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
  _category?: string;
};

function normalizeClient(u: User): NormalizedUser {
  return { ...u, _type: "client" };
}
function normalizeWorker(w: Worker): NormalizedUser {
  return {
     ...w.user, _type: "worker",
      _workerId: w.id,
      _category: w.category?.name
    };
}

type EditForm = {
  name: string;
  phone: string;
  city: string;
};

type CreateForm = {
  role: "client" | "worker";
  name: string;
  phone: string;
  city: string;
  email: string;
  password: string;
  category: string;
};

// ─── Category type ─────────────────────────────────────────────────────────────

type Category = {
  id: number;
  name: string;
  [key: string]: any;
};

// ─── Photo Picker ─────────────────────────────────────────────────────────────

async function pickImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permission required", "Please allow access to your photo library.");
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
    base64: true,
  });
  if (result.canceled || !result.assets?.[0]) return null;
  const asset = result.assets[0];
  return asset.uri;
}

// ─── PhotoPickerRow ────────────────────────────────────────────────────────────

function PhotoPickerRow({
  photoUri,
  name,
  onPick,
  colors,
}: {
  photoUri: string | null;
  name: string;
  onPick: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Pressable onPress={onPick} style={styles.photoPickerRow}>
      <View style={styles.photoPreviewWrap}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
        ) : (
          <View
            style={[
              styles.photoPreview,
              styles.photoPlaceholder,
              { backgroundColor: "#7C3AED22" },
            ]}
          >
            <Feather name="user" size={22} color="#7C3AED" />
          </View>
        )}
        <View style={[styles.photoBadge, { backgroundColor: "#7C3AED" }]}>
          <Feather name="camera" size={10} color="#FFF" />
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.photoLabel, { color: colors.foreground }]}>
          {photoUri ? "Change photo" : "Add profile photo"}
        </Text>
        <Text style={[styles.photoSub, { color: colors.mutedForeground }]}>
          Square image recommended · JPG or PNG
        </Text>
      </View>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

// ─── CategoryDropdown ─────────────────────────────────────────────────────────

function CategoryDropdown({
  value,
  onChange,
  colors,
}: {
  value: string;
  onChange: (val: string) => void;
  colors: ReturnType<typeof useColors>;
}) {
  const [open, setOpen] = useState(false);

  const categoriesQ = useQuery<Category[]>({
    queryKey: ["admin", "categories"],
    queryFn: () => apiRequest<Category[]>("/admin/categories"),
    staleTime: 5 * 60 * 1000,
  });

  const categories: Category[] = useMemo(() => {
    const raw = categoriesQ.data;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    return (raw as any)?.data ?? [];
  }, [categoriesQ.data]);

  const selectedLabel = useMemo(() => {
    if (!value) return null;
    const found = categories.find(
      (c) => String(c.id) === value || c.name === value
    );
    return found?.name ?? value;
  }, [value, categories]);

  return (
    <View>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
        Category
      </Text>

      {/* Trigger */}
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.dropdownTrigger,
          {
            backgroundColor: colors.muted,
            borderColor: open ? "#7C3AED" : colors.border,
          },
        ]}
      >
        <Feather name="briefcase" size={16} color={selectedLabel ? "#7C3AED" : colors.mutedForeground} />
        <Text
          style={[
            styles.dropdownTriggerText,
            { color: selectedLabel ? colors.foreground : colors.mutedForeground },
          ]}
          numberOfLines={1}
        >
          {selectedLabel ?? "Select a category…"}
        </Text>
        {categoriesQ.isLoading ? (
          <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Loading…</Text>
        ) : (
          <Feather
            name={open ? "chevron-up" : "chevron-down"}
            size={16}
            color={colors.mutedForeground}
          />
        )}
      </Pressable>

      {/* Inline dropdown list */}
      {open && (
        <View
          style={[
            styles.dropdownList,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {categoriesQ.isLoading ? (
            <View style={styles.dropdownLoading}>
              <Text style={[styles.dropdownLoadingText, { color: colors.mutedForeground }]}>
                Fetching categories…
              </Text>
            </View>
          ) : categoriesQ.isError ? (
            <View style={styles.dropdownLoading}>
              <Feather name="alert-circle" size={14} color="#DC2626" />
              <Text style={[styles.dropdownLoadingText, { color: "#DC2626" }]}>
                Failed to load categories
              </Text>
            </View>
          ) : categories.length === 0 ? (
            <View style={styles.dropdownLoading}>
              <Text style={[styles.dropdownLoadingText, { color: colors.mutedForeground }]}>
                No categories found
              </Text>
            </View>
          ) : (
            <ScrollView
              style={{ maxHeight: 400 }}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {categories.map((cat, idx) => {
                const isSelected = String(cat.id) === value || cat.name === value;
                const isLast = idx === categories.length - 1;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => {
                      onChange(String(cat.id));
                      setOpen(false);
                    }}
                    style={[
                      styles.dropdownItem,
                      !isLast && {
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: colors.border,
                      },
                      isSelected && { backgroundColor: "#7C3AED11" },
                    ]}
                  >
                    <View style={styles.dropdownItemInner}>
                      <View
                        style={[
                          styles.dropdownDot,
                          { backgroundColor: isSelected ? "#7C3AED" : colors.muted },
                        ]}
                      />
                      <Text
                        style={[
                          styles.dropdownItemText,
                          {
                            color: isSelected ? "#7C3AED" : colors.foreground,
                            fontFamily: isSelected ? "Inter_600SemiBold" : "Inter_400Regular",
                          },
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </View>
                    {isSelected && (
                      <Feather name="check" size={14} color="#7C3AED" />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

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
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isWorker = user._type === "worker";

  const endpoint = isWorker
    ? `/admin/workers/${user._workerId ?? user.id}`
    : `/admin/clients/${user.id}`;

  const mutation = useMutation({
    mutationFn: async () => {
      const body: Record<string, string> = {
        name: form.name,
        phone: form.phone,
        city: form.city,
      };
      if (isWorker && photoUri) {
        body.photo_url = photoUri;
      }
      return apiRequest(endpoint, { method: "PUT", body });
    },
    onSuccess: () => {
      onSaved();
      onClose();
    },
    onError: (e: any) => setError(e?.message ?? "Failed to update user"),
  });

  const set = (key: keyof EditForm) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handlePickPhoto = async () => {
    const uri = await pickImage();
    if (uri) setPhotoUri(uri);
  };

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
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarThumb} />
            ) : (
              <Avatar name={user.name} size={56} />
            )}
            <View>
              <Text style={[styles.modalName, { color: colors.foreground }]}>
                {user.name}
              </Text>
              <View
                style={[
                  styles.rolePill,
                  { backgroundColor: isWorker ? "#7C3AED22" : colors.accent },
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
            </View>
          </View>

          {isWorker && (
            <PhotoPickerRow
              photoUri={photoUri}
              name={form.name}
              onPick={handlePickPhoto}
              colors={colors}
            />
          )}

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

// ─── Create User Modal ────────────────────────────────────────────────────────

function CreateUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const colors = useColors();
  const [form, setForm] = useState<CreateForm>({
    role: "client",
    name: "",
    phone: "",
    city: "",
    email: "",
    password: "",
    category: "",
  });
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const endpoint =
        form.role === "worker" ? "/admin/workers" : "/admin/clients";

        const body: Record<string, string | number> = {
          name: form.name,
          phone: form.phone,
          city: form.city,
          email: form.email,
          password: form.password,
};
        if (form.role === "worker") {
          if (photoUri) body.photo_url = photoUri;
          if (form.category) body.category_id = parseInt(form.category, 10);
        }
      return apiRequest(endpoint, { method: "POST", body });
    },
    onSuccess: () => {
      onCreated();
      onClose();
    },
    onError: (e: any) => setError(e?.message ?? "Failed to create user"),
  });

  const set = (key: keyof CreateForm) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handlePickPhoto = async () => {
    const uri = await pickImage();
    if (uri) setPhotoUri(uri);
  };

  const isWorker = form.role === "worker";

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ justifyContent: "flex-end", flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                New User
              </Text>
              <Pressable onPress={onClose} hitSlop={12}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </Pressable>
            </View>

            {/* Role selector */}
            <View>
              <Text
                style={[styles.fieldLabel, { color: colors.mutedForeground }]}
              >
                Role
              </Text>
              <View style={styles.roleToggleRow}>
                {(["client", "worker"] as const).map((role) => {
                  const active = form.role === role;
                  return (
                    <Pressable
                      key={role}
                      onPress={() => set("role")(role)}
                      style={[
                        styles.roleToggleBtn,
                        {
                          backgroundColor: active
                            ? role === "worker"
                              ? "#7C3AED"
                              : colors.primary
                            : colors.muted,
                          borderColor: active ? "transparent" : colors.border,
                        },
                      ]}
                    >
                      <Feather
                        name={role === "worker" ? "briefcase" : "user"}
                        size={14}
                        color={active ? "#FFF" : colors.mutedForeground}
                      />
                      <Text
                        style={[
                          styles.roleToggleText,
                          { color: active ? "#FFF" : colors.mutedForeground },
                        ]}
                      >
                        {role === "worker" ? "Worker" : "Client"}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Photo picker — workers only */}
            {isWorker && (
              <PhotoPickerRow
                photoUri={photoUri}
                name={form.name}
                onPick={handlePickPhoto}
                colors={colors}
              />
            )}

            {/* Fields */}
            <View style={{ gap: 14 }}>
              <Input
                label="Full Name"
                icon="user"
                value={form.name}
                onChangeText={set("name")}
                placeholder="Full name"
              />
              <Input
                label="Email"
                icon="mail"
                value={form.email}
                onChangeText={set("email")}
                placeholder="email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                label="Password"
                icon="lock"
                value={form.password}
                onChangeText={set("password")}
                placeholder="Password"
                secureTextEntry
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

            {/* Category dropdown — workers only */}
            {isWorker && (
              <CategoryDropdown
                value={form.category}
                onChange={set("category")}
                colors={colors}
              />
            )}

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
                label="Create"
                onPress={() => mutation.mutate()}
                loading={mutation.isPending}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── UserRow ──────────────────────────────────────────────────────────────────

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
          
          {isWorker && (
              <Text
              style={[styles.userPhone, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            {user._category}
          </Text>
            )}

          
          <View style={{ flexDirection: "row", gap: 6, marginTop: 2 }}>
            <View
              style={[
                styles.rolePill,
                { backgroundColor: isWorker ? "#7C3AED22" : colors.accent },
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
              <View style={[styles.rolePill, { backgroundColor: colors.muted }]}>
                <Feather name="map-pin" size={9} color={colors.mutedForeground} />
                <Text style={[styles.roleText, { color: colors.mutedForeground }]}>
                  {user.city}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.userActions}>
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

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function UsersManagementScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const qc = useQueryClient();

  const [tab, setTab] = useState<TabFilter>("all");
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<NormalizedUser | null>(null);
  const [showCreate, setShowCreate] = useState(false);

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

  const handleCreated = () => {
    qc.invalidateQueries({ queryKey: ["admin", "clients"] });
    qc.invalidateQueries({ queryKey: ["admin", "workers"] });
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

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[
          styles.header,
          { paddingTop: (isWeb ? 67 : insets.top) + 14 },
        ]}
      >
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.eyebrow}>Admin</Text>
            <Text style={styles.title}>Users</Text>
          </View>
          <Pressable
            onPress={() => setShowCreate(true)}
            style={styles.createBtn}
            hitSlop={8}
          >
            <Feather name="user-plus" size={16} color="#FFF" />
            <Text style={styles.createBtnText}>New</Text>
          </Pressable>
        </View>

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
            <View style={[styles.emptyIcon, { backgroundColor: colors.accent }]}>
              <Feather name="users" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {search ? "No matches" : "No users yet"}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 2,
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
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    marginBottom: 4,
  },
  createBtnText: {
    fontFamily: "Inter_600SemiBold",
    color: "#FFF",
    fontSize: 13,
    letterSpacing: 0.2,
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
  // Modal shared
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
  avatarThumb: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
  // Photo picker
  photoPickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#7C3AED33",
    backgroundColor: "#7C3AED08",
  },
  photoPreviewWrap: {
    position: "relative",
  },
  photoPreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  photoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  photoBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  photoLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    marginBottom: 2,
  },
  photoSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  // Role toggle (create modal)
  fieldLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  roleToggleRow: {
    flexDirection: "row",
    gap: 10,
  },
  roleToggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  roleToggleText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  // Category dropdown
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  dropdownTriggerText: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  dropdownList: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  dropdownLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 18,
  },
  dropdownLoadingText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  dropdownItemInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  dropdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dropdownItemText: {
    fontSize: 14,
  },
});