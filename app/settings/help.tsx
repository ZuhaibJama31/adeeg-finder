import { Feather } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { Stack } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS: { q: string; a: string }[] = [
  {
    q: "How do I book a service?",
    a: "Open the home tab, pick a category or search for a pro, tap their profile, then hit Book this service. Choose a time slot, describe the job, add the address, and send the request.",
  },
  {
    q: "How are professionals verified?",
    a: "Every worker on AdeegFinder submits ID and proof of skills. We review credentials before approving them and continually monitor reviews and complaints.",
  },
  {
    q: "How do I pay?",
    a: "You agree on a price with the pro before the job starts. After completion you can pay them directly in cash or via mobile money — no in-app fees.",
  },
  {
    q: "Can I cancel a booking?",
    a: "Yes. Open the booking from the Bookings tab and tap Cancel booking. You can cancel anytime before the pro marks the job as in progress.",
  },
  {
    q: "What if there's an issue with the service?",
    a: "Reach out to support using the form below or email us. We'll mediate between you and the pro and take action where needed.",
  },
];

export default function HelpSupportScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const toggleFaq = (idx: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const onSendMessage = () => {
    if (!subject.trim() || !message.trim()) {
      if (Platform.OS === "web") {
        return;
      }
      Alert.alert("Missing details", "Please add a subject and a message.");
      return;
    }
    const body = encodeURIComponent(
      `${message}\n\n— Sent from AdeegFinder by ${user?.name ?? "a user"} (${user?.phone ?? "no phone"})`,
    );
    const subj = encodeURIComponent(subject);
    Linking.openURL(`mailto:support@adeegfinder.app?subject=${subj}&body=${body}`);
    setSent(true);
    setSubject("");
    setMessage("");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: "Help & Support",
          headerTitleStyle: { fontFamily: "Inter_700Bold" },
        }}
      />
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={styles.content}
        bottomOffset={32}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.quickGrid}>
          <QuickAction
            icon="phone-call"
            label="Call us"
            description="+252 906977122"
            onPress={() => Linking.openURL("tel:+252906977122")}
          />
          <QuickAction
            icon="mail"
            label="Email"
            description="support@adeegfinder.app"
            onPress={() =>
              Linking.openURL("mailto:support@adeegfinder.com")
            }
          />
          <QuickAction
            icon="message-circle"
            label="WhatsApp"
            description="Chat with us"
            onPress={() =>
              Linking.openURL("https://wa.me/252907784112")
            }
          />
          <QuickAction
            icon="globe"
            label="Help center"
            description="adeegfinder.app/help"
            onPress={() =>
              Linking.openURL("https://adeegfinder.com/help")
            }
          />
        </View>

        <Text style={[styles.heading, { color: colors.foreground }]}>
          Frequently asked questions
        </Text>

        <Card padded={false} style={{ marginTop: 12 }}>
          {FAQS.map((faq, idx) => {
            const open = openIndex === idx;
            const isLast = idx === FAQS.length - 1;
            return (
              <View
                key={faq.q}
                style={{
                  borderBottomColor: colors.border,
                  borderBottomWidth: isLast ? 0 : 1,
                }}
              >
                <Pressable
                  onPress={() => toggleFaq(idx)}
                  style={({ pressed }) => [
                    styles.faqHeader,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Text
                    style={[styles.faqQ, { color: colors.foreground }]}
                  >
                    {faq.q}
                  </Text>
                  <Feather
                    name={open ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={colors.mutedForeground}
                  />
                </Pressable>
                {open && (
                  <Text
                    style={[styles.faqA, { color: colors.mutedForeground }]}
                  >
                    {faq.a}
                  </Text>
                )}
              </View>
            );
          })}
        </Card>

        <Text style={[styles.heading, { color: colors.foreground, marginTop: 28 }]}>
          Send us a message
        </Text>
        <Text style={[styles.helper, { color: colors.mutedForeground }]}>
          Tell us what's going on and we'll get back to you within 24 hours.
        </Text>

        <View style={{ gap: 12, marginTop: 14 }}>
          <Input
            label="Subject"
            placeholder="e.g. Issue with a booking"
            icon="tag"
            value={subject}
            onChangeText={setSubject}
          />
          <Input
            label="Message"
            placeholder="Describe the issue in detail…"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
            style={{ minHeight: 110, paddingTop: 12, textAlignVertical: "top" }}
          />
        </View>

        {sent && (
          <View
            style={[
              styles.successBanner,
              { backgroundColor: colors.accent, borderRadius: colors.radius - 4 },
            ]}
          >
            <Feather name="check-circle" size={14} color={colors.primary} />
            <Text style={[styles.successText, { color: colors.primary }]}>
              We opened your mail app — send the email and we'll reply soon.
            </Text>
          </View>
        )}

        <View style={{ marginTop: 18 }}>
          <Button
            label="Send message"
            icon="send"
            iconPosition="right"
            onPress={onSendMessage}
          />
        </View>

        <Text
          style={[styles.footnote, { color: colors.mutedForeground }]}
        >
          Support hours: Sat – Thu, 8 AM – 8 PM EAT.
        </Text>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  description,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  description: string;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius - 4,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
      ]}
    >
      <View
        style={[styles.quickIcon, { backgroundColor: colors.accent }]}
      >
        <Feather name={icon} size={16} color={colors.primary} />
      </View>
      <Text style={[styles.quickLabel, { color: colors.foreground }]}>
        {label}
      </Text>
      <Text
        style={[styles.quickDesc, { color: colors.mutedForeground }]}
        numberOfLines={1}
      >
        {description}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quickCard: {
    width: "48%",
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  quickDesc: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  heading: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    letterSpacing: -0.2,
    marginTop: 28,
  },
  helper: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  faqQ: {
    flex: 1,
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    lineHeight: 20,
  },
  faqA: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  successText: {
    flex: 1,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  footnote: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    textAlign: "center",
    marginTop: 18,
  },
});
