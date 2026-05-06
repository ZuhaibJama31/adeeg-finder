import type { ComponentProps } from "react";
import type { MaterialCommunityIcons } from "@expo/vector-icons";

type MCIName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type IconConfig = {
  icon: MCIName;
  bg: string;
  fg: string;
};

const FALLBACK: IconConfig = {
  icon: "wrench",
  bg: "#E0E7FF",
  fg: "#3730A3",
};

const MAP: { match: RegExp; cfg: IconConfig }[] = [
  { match: /plumb|pipe|water|tap|faucet/i,        cfg: { icon: "faucet",           bg: "#DBEAFE", fg: "#1D4ED8" } },
  { match: /koronti|electr|wire|power/i,          cfg: { icon: "lightning-bolt",   bg: "#FEF3C7", fg: "#B45309" } },
  { match: /clean|wash|laundry|nadiin/i,          cfg: { icon: "broom",            bg: "#D1FAE5", fg: "#047857" } },
  { match: /driv|transport|taxi|darawal/i,        cfg: { icon: "truck",         bg: "#E0E7FF", fg: "#3730A3" } },
  { match: /car|auto|mech/i,                      cfg: { icon: "hammer",       bg: "#FEE2E2", fg: "#B91C1C" } },
  { match: /paint|rinji/i,                        cfg: { icon: "format-paint",     bg: "#FCE7F3", fg: "#9D174D" } },
  { match: /carpenter|wood|furnit|najaar/i,       cfg: { icon: "hammer",           bg: "#FEF3C7", fg: "#92400E" } },
  { match: /deliver|courier|ship/i,               cfg: { icon: "package-variant",  bg: "#FFEDD5", fg: "#C2410C" } },
  { match: /ac|air|cool|refrig|hvac/i,            cfg: { icon: "air-conditioner",  bg: "#DBEAFE", fg: "#1E3A8A" } },
  { match: /weld|metal|xidid/i,                   cfg: { icon: "gas-cylinder",             bg: "#FEF3C7", fg: "#A16207" } },
  { match: /software|engineer|dev|code|program/i, cfg: { icon: "code-braces",      bg: "#E0E7FF", fg: "#4338CA" } },
  { match: /mason|brick|cement|dhisme/i,          cfg: { icon: "wall",            bg: "#F3F4F6", fg: "#374151" } },
  { match: /security|guard|watch|gaashaanle/i,    cfg: { icon: "shield-account",   bg: "#FEE2E2", fg: "#B91C1C" } },
  { match: /garden|land|plant/i,                  cfg: { icon: "shovel",           bg: "#D1FAE5", fg: "#065F46" } },
  { match: /cook|chef|food/i,                     cfg: { icon: "chef-hat",         bg: "#FED7AA", fg: "#9A3412" } },
  { match: /tutor|teach|edu/i,                    cfg: { icon: "book-open-variant",bg: "#E0E7FF", fg: "#3730A3" } },
  { match: /beaut|hair|salon|spa/i,               cfg: { icon: "scissors-cutting", bg: "#FCE7F3", fg: "#BE185D" } },
];

export function categoryIcon(name?: string | null): IconConfig {
  if (!name) return FALLBACK;
  const found = MAP.find((m) => m.match.test(name));
  return found ? found.cfg : FALLBACK;
}