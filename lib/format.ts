import type { BookingStatus } from "./types";

export function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function statusLabel(status: BookingStatus): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "accepted":
      return "Accepted";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
}

export function statusColors(status: BookingStatus): {
  bg: string;
  fg: string;
} {
  switch (status) {
    case "pending":
      return { bg: "#FEF3C7", fg: "#92400E" };
    case "accepted":
      return { bg: "#DBEAFE", fg: "#1E40AF" };
    case "in_progress":
      return { bg: "#E0E7FF", fg: "#3730A3" };
    case "completed":
      return { bg: "#D1FAE5", fg: "#065F46" };
    case "cancelled":
      return { bg: "#FEE2E2", fg: "#991B1B" };
    case "rejected":
      return { bg: "#FEE2E2", fg: "#991B1B" };
    default:
      return { bg: "#E5E7EB", fg: "#374151" };
  }
}

export function initials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "").concat(parts[1]?.[0] ?? "").toUpperCase() || "?";
}

export function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}
