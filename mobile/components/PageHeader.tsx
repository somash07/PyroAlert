import { PRIMARY_COLOR } from "@/constants/constants";
import { ArrowLeft } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
  bgColor?: string;
}

export default function PageHeader({
  title,
  onBack,
  rightComponent,
  bgColor,
}: PageHeaderProps) {
  return (
    <View
      style={[styles.header, { backgroundColor: bgColor ?? PRIMARY_COLOR }]}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        disabled={!onBack}
      >
        {onBack && <ArrowLeft size={24} color="white" />}
      </TouchableOpacity>

      <Text style={styles.headerTitle}>{title}</Text>

      <View style={styles.rightContainer}>{rightComponent}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    width: 40,
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  rightContainer: {
    width: 40,
    alignItems: "center",
  },
});
