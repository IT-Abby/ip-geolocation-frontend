import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/scripts/supabase";
import React, { useState } from "react";
import LOGO from "@/assets/images/ip-location.svg";
import Input from "@/components/input-field";
import CustomButton from "@/components/custom-button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Login Failed", error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      setLoading(false);
      router.replace("/home/page");
    }
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (error) Alert.alert(error.message);
    if (!session)
      Alert.alert("Please check your inbox for email verification!");
    setLoading(false);
  }

  return (
    <>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <View style={styles.container}>
          <LOGO width={350} height={250} />

          <Text style={styles.header}> Instant Geolocation & IP Look-up</Text>
          <Text>Find your IP and its precise location.</Text>
          <Input
            label={"Email"}
            value={email}
            onChangeText={setEmail}
            placeholder={"Enter Email"}
          />

          <Input
            label={"Password"}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder={"Enter Password"}
          />

          <CustomButton
            title="Sign-In"
            disabled={loading}
            onPress={() => signInWithEmail()}
            style={styles.button}
            textStyle={{ color: "#7461F4" }}
          />
          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.line} />
          </View>

          <CustomButton
            title="Sign-Up"
            disabled={loading}
            onPress={() => signUpWithEmail()}
            style={styles.button2}
          />
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  keyboardView: {
    flex: 1,
  },
  button: {
    backgroundColor: "#FFFFFF",
    marginTop: 20,
    elevation: 5,
  },
  button2: {
    backgroundColor: "#7461F4",
    marginTop: 20,
    elevation: 5,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
    marginTop: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#000000",
  },
  orText: {
    marginHorizontal: 10,
    color: "#555",
    fontSize: 16,
  },
});
