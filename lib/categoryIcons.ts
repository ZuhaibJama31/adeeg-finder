import type { ComponentProps } from "react";
import type { Feather } from "@expo/vector-icons";

type FeatherName = ComponentProps<typeof Feather>["name"];

type IconConfig = {
  icon: FeatherName;
  bg: string;
  fg: string;
};

const FALLBACK: IconConfig = {
  icon: "tool",
  bg: "#E0E7FF",
  fg: "#3730A3",
};

const MAP: { match: RegExp; cfg: IconConfig }[] = [
  { match: /plumb|pipe|water|tap|faucet/i, cfg: { icon: "droplet", bg: "#DBEAFE", fg: "#1D4ED8" } },
  { match: /electr|wire|power/i, cfg: { icon: "zap", bg: "#FEF3C7", fg: "#B45309" } },
  { match: /clean|wash|laundry/i, cfg: { icon: "wind", bg: "#D1FAE5", fg: "#047857" } },
  { match: /driv|driver|transport|taxi/i, cfg: { icon: "navigation", bg: "#E0E7FF", fg: "#3730A3" } },
  { match: /car|auto|mech|repair/i, cfg: { icon: "truck", bg: "#FEE2E2", fg: "#B91C1C" } },
  { match: /paint/i, cfg: { icon: "feather", bg: "#FCE7F3", fg: "#9D174D" } },
  { match: /carpent|wood|furnit/i, cfg: { icon: "hexagon", bg: "#FEF3C7", fg: "#92400E" } },
  { match: /deliver|courier|ship/i, cfg: { icon: "package", bg: "#FFEDD5", fg: "#C2410C" } },
  { match: /ac|air|cool|refrig|hvac/i, cfg: { icon: "thermometer", bg: "#DBEAFE", fg: "#1E3A8A" } },
  { match: /weld|metal/i, cfg: { icon: "shield", bg: "#FEF3C7", fg: "#A16207" } },
  { match: /computer|tech|it|laptop/i, cfg: { icon: "monitor", bg: "#E0E7FF", fg: "#4338CA" } },
  { match: /garden|land|plant/i, cfg: { icon: "feather", bg: "#D1FAE5", fg: "#065F46" } },
  { match: /cook|chef|food/i, cfg: { icon: "coffee", bg: "#FED7AA", fg: "#9A3412" } },
  { match: /tutor|teach|edu/i, cfg: { icon: "book-open", bg: "#E0E7FF", fg: "#3730A3" } },
  { match: /beaut|hair|salon|spa/i, cfg: { icon: "scissors", bg: "#FCE7F3", fg: "#BE185D" } },
];

export function categoryIcon(name?: string | null): IconConfig {
  if (!name) return FALLBACK;
  const found = MAP.find((m) => m.match.test(name));
  return found ? found.cfg : FALLBACK;
}
