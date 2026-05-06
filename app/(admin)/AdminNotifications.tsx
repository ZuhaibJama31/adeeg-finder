import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { apiRequest } from "@/lib/api";

/* ---------------- TYPES ---------------- */

type Notification = {
  id: string | number;
  data?: {
    title?: string;
    message?: string;
  };
};

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const res = await apiRequest<Notification[]>(
        "/admin/notifications"
      );

      // safety fallback if API returns null/undefined
      setNotifications(res || []);
    } catch (error) {
      console.log("Failed to load notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ padding: 16, flex: 1 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Notifications
      </Text>

      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No notifications found
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={{
              padding: 12,
              borderBottomWidth: 1,
              borderColor: "#ddd",
            }}
          >
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
              {item.data?.title || "Notification"}
            </Text>
            <Text style={{ marginTop: 4 }}>
              {item.data?.message || ""}
            </Text>
          </View>
        )}
      />
    </View>
  );
}