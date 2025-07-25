import { StyleSheet, Text, View } from "react-native";
import { getStatusColor, getStatusText } from "../utils/statusUtils";

interface StatusBadgeProps {
  status: string;
  size?: "small" | "medium" | "large";
  showText?: boolean;
}

export default function StatusBadge({ 
  status, 
  size = "medium",
  showText = true 
}: StatusBadgeProps) {
  const backgroundColor = getStatusColor(status);
  const text = getStatusText(status);
  
  return (
    <View
      style={[
        styles.badge,
        styles[size],
        { backgroundColor }
      ]}
    >
      {showText && (
        <Text style={[styles.text, styles[`${size}Text`]]}>
          {text}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  medium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  large: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  text: {
    color: "white",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 14,
  },
}); 