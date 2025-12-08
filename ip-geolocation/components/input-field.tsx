import { View, TextInput, StyleSheet, Text } from "react-native";
import React, { useState } from "react";

interface InputFieldProps {
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  containerStyle?: any;
  inputStyle?: any;
  label: string;
}

export default function InputField({
  value,
  placeholder,
  onChangeText,
  secureTextEntry = false,
  containerStyle,
  inputStyle,
  label,
}: InputFieldProps) {
  return (
    <View style={[styles.outerContainer, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          value={value}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          onChangeText={onChangeText}
          style={[styles.input, inputStyle]}
          placeholderTextColor="#888"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    width: "90%",
    marginBottom: 15,
  },

  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
    fontWeight: "bold",
  },

  inputWrapper: {
    paddingVertical: 5,
    paddingHorizontal: 20,
    backgroundColor: "#f1f1f1",
    borderRadius: 10,

    borderWidth: 1,
    borderColor: "#ccc",
  },
  input: {
    fontSize: 16,
    color: "#333",

    borderWidth: 0,
    paddingHorizontal: 0,
  },
});
