import React, { useRef, useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import {
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";

import { auth, firebaseConfig } from "@/src/firebase";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export default function VerifyOtp() {
  const recaptcha = useRef<any>(null);

  const params = useLocalSearchParams<any>();

  const [code, setCode] = useState("");
  const [verificationId, setVerificationId] = useState("");

  const phone = params.phone;
  const mode = params.mode;

  /* ---------------- SEND OTP ---------------- */

  const sendOtp = async () => {
    try {
      const provider = new PhoneAuthProvider(auth);

      const id = await provider.verifyPhoneNumber(
        phone,
        recaptcha.current
      );

      setVerificationId(id);
      Alert.alert("OTP sent");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  /* ---------------- VERIFY OTP ---------------- */

  const verifyOtp = async () => {
    try {
      const credential =
        PhoneAuthProvider.credential(
          verificationId,
          code
        );

      await signInWithCredential(auth, credential);

      // AFTER Firebase success → call Laravel

      if (mode === "register") {
        await apiRequest("/register", {
          method: "POST",
          body: {
            name: params.name,
            phone,
            password: params.password,
            city: params.city,
          },
          auth: false,
        });
      }

      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Invalid OTP", e.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptcha}
        firebaseConfig={firebaseConfig}
      />

      <Text>Verify {phone}</Text>
      <Button label="Sign In" onPress={sendOtp}>
        
        </Button>

      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="6-digit code"
        keyboardType="number-pad"
      />

      <Button label="Verify" onPress={verifyOtp} />
    </View>
  );
}