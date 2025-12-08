import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from "react-native";

type CustomButtonProps = {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  disabled?: boolean;
  textStyle?: StyleProp<any>;
};

export default function CustomButton({
  title,
  onPress,
  style,
  backgroundColor = "#208FCB",
  disabled = false,
  textStyle,
}: CustomButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: disabled ? "#CCCCCC" : backgroundColor },
        style,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      activeOpacity={disabled ? 1 : 0.5}
      disabled={disabled}
    >
      <Text style={[styles.text, disabled && styles.disabledText, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: 15,
    width: "90%",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    color: "#888",
  },
});
