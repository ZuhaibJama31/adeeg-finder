import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api";
import { asArray } from "@/lib/format";
import type { Booking } from "@/lib/types";

type ApiList<T> = T[] | { data?: T[] };

function unwrap<T>(val: ApiList<T> | null | undefined): T[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return asArray((val as { data?: T[] }).data);
}

export type NewBookingAlert = {
  booking: Booking;
  id: string;
};

export function useNewBookingNotifications() {
  const prevIdsRef   = useRef<Set<number> | null>(null);
  const [alerts, setAlerts] = useState<NewBookingAlert[]>([]);

  /* Request browser notification permission on web (once) */
  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  useQuery({
    queryKey: ["admin", "bookings", "notify-poll"],
    queryFn: async () => {
      const raw = await apiRequest<ApiList<Booking>>("/admin/bookings");
      const bookings = unwrap(raw);

      /* First load — just record the IDs, don't alert */
      if (prevIdsRef.current === null) {
        prevIdsRef.current = new Set(bookings.map((b) => b.id));
        return raw;
      }

      const newOnes = bookings.filter((b) => !prevIdsRef.current!.has(b.id));

      if (newOnes.length > 0) {
        /* Update the known-ID set */
        prevIdsRef.current = new Set(bookings.map((b) => b.id));

        /* In-app alerts */
        const incoming: NewBookingAlert[] = newOnes.map((b) => ({
          booking: b,
          id: `${b.id}-${Date.now()}`,
        }));
        setAlerts((prev) => [...incoming, ...prev]);

        /* Native browser notification on web */
        if (
          Platform.OS === "web" &&
          typeof window !== "undefined" &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          newOnes.forEach((b) => {
            new Notification("New Booking — AdeegFinder", {
              body: `${b.client?.name ?? "A client"} requested service in ${b.city}`,
              icon: "/favicon.ico",
              tag: `booking-${b.id}`,
            });
          });
        }
      }

      return raw;
    },
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });

  const dismiss = (id: string) =>
    setAlerts((prev) => prev.filter((a) => a.id !== id));

  const dismissAll = () => setAlerts([]);

  return { alerts, dismiss, dismissAll };
}
