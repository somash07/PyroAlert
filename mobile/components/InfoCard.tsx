import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

interface InfoCardProps {
  children: ReactNode;
  style?: any;
}

export default function InfoCard({ children, style }: InfoCardProps) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
}); 