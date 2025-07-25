"use client";
import { PRIMARY_COLOR } from "@/constants/constants";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { formatDate } from "@/utils/dateUtils";
import { getStatusColor } from "@/utils/statusUtils";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Shield,
  Target,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { io } from "socket.io-client";
import { GRAY_COLOR, SUCCESS_COLOR, WHITE } from "../constants/constants";
import { apiService } from "../services/api";
import type { IncidentDetails } from "../types";

export default function IncidentDetailsScreen() {
  const router = useRouter();

  const { user } = useAuth();
  const { playNotificationSound } = useNotification();
  const { incidentId } = useLocalSearchParams<{ incidentId: string }>();
  const [incident, setIncident] = useState<IncidentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [markLoading, setMarkLoading] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");

  const firefighterId = user?._id || "";

  const loadIncidentDetails = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getIncidentDetails(
        incidentId,
        firefighterId
      );
      setIncident(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load incident details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (incidentId) {
      loadIncidentDetails();
    }
  }, [incidentId]);

  // Listen for incident updates and play notification sound
  useEffect(() => {
    const socket = io("https://pyroalert-tdty.onrender.com", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("incident-updated", (data: any) => {
      playNotificationSound();
      if (data.incidentId === incidentId) {
        loadIncidentDetails();
      }
    });

    socket.on("incident_completed", (data: any) => {
      playNotificationSound(); // Play sound on incident completion
      // Reload incident details if it's the same incident
      // if (data.incidentId === incidentId) {
      //   loadIncidentDetails();
      // }
    });

    return () => {
      socket.disconnect();
    };
  }, [incidentId, playNotificationSound]);

  const handleMarkComplete = () => {
    if (!incident) return;
    setShowCompleteDialog(true);
  };

  const handleConfirmComplete = async () => {
    if (!incident) return;

    try {
      setMarkLoading(true);
      await apiService.markIncidentComplete(
        incident._id,
        user?._id ?? "",
        completionNotes
      );
      setIncident((prev: IncidentDetails | null) =>
        prev ? { ...prev, status: "completed" } : null
      );
      setShowCompleteDialog(false);
      setCompletionNotes("");
      Alert.alert("Success", "Incident marked as complete");
    } catch (error) {
      Alert.alert("Error", "Failed to update incident");
    } finally {
      setMarkLoading(false);
    }
  };

  const handlePhoneCall = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, "");
    Linking.openURL(`tel:${cleanNumber}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  // const handleLocationPress = () => {
  //   if (incident?.geo_location) {
  //     const { lat, long } = incident.geo_location;
  //     const url = `https://www.google.com/maps?q=${lat},${long}`;
  //     Linking.openURL(url);
  //   }
  // };

  const handleLocationPress = () => {
    if (incident?.geo_location) {
      const { lat, long } = incident.geo_location;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${long}&travelmode=driving`;
      Linking.openURL(url);
    }
  };

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case "completed":
  //       return SUCCESS_COLOR;
  //     case "in-progress":
  //       return WARNING_COLOR;
  //     case "pending":
  //       return PRIMARY_COLOR;
  //     default:
  //       return GRAY_COLOR;
  //   }
  // };

  const getAlertTypeIcon = (alertType: string) => {
    switch (alertType.toLowerCase()) {
      case "fire":
        return <AlertTriangle size={28} color="#DC2626" />;
      case "smoke":
        return <Shield size={28} color="#059669" />;
      case "accident":
        return <Target size={28} color="#EA580C" />;
      default:
        return <AlertTriangle size={28} color={PRIMARY_COLOR} />;
    }
  };

  // const formatDate = (timestamp: string) => {
  //   const date = new Date(timestamp);
  //   return date.toLocaleDateString("en-US", {
  //     weekday: "short",
  //     month: "short",
  //     day: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   });
  // };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Loading incident details...</Text>
      </SafeAreaView>
    );
  }

  if (!incident) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <AlertTriangle size={48} color={GRAY_COLOR} />
        <Text style={styles.errorText}>Incident not found</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => router.back()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(incident.status) },
          ]}
        >
          <Text style={styles.statusText}>
            {incident.status.replace("-", " ").toUpperCase()}
          </Text>
        </View>

        <View style={styles.alertTypeCard}>
          <View style={styles.alertTypeIconContainer}>
            {getAlertTypeIcon(incident.alert_type)}
          </View>
          <View style={styles.alertTypeInfo}>
            <Text style={styles.alertTypeText}>
              {incident.alert_type.toUpperCase()}
            </Text>
            <Text style={styles.alertTypeSubtext}>
              Emergency Classification
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.locationCard}
          onPress={handleLocationPress}
        >
          <View style={styles.locationIconContainer}>
            <MapPin size={24} color={PRIMARY_COLOR} />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>{incident.location}</Text>
            <Text style={styles.locationSubtext}>Tap to open in Maps</Text>
          </View>
          <ExternalLink size={20} color={GRAY_COLOR} />
        </TouchableOpacity>

        <View style={styles.timeCard}>
          <View style={styles.timeIconContainer}>
            <Clock size={24} color={GRAY_COLOR} />
          </View>
          <View style={styles.timeInfo}>
            <Text style={styles.timeLabel}>Incident Reported</Text>
            <Text style={styles.timeValue}>
              {formatDate(incident.timestamp)}
            </Text>
          </View>
        </View>

        <View style={styles.detectionCard}>
          <Text style={styles.cardTitle}>Detection Information</Text>
          <View style={styles.detectionRow}>
            <Text style={styles.detectionLabel}>Method</Text>
            <Text style={styles.detectionValue}>
              {incident.detection_method}
            </Text>
          </View>
          <View style={styles.detectionDivider} />
          <View style={styles.detectionRow}>
            <Text style={styles.detectionLabel}>Device</Text>
            <Text style={styles.detectionValue}>{incident.device_name}</Text>
          </View>
        </View>

        {incident.assigned_firefighters &&
          incident.assigned_firefighters.length > 0 && (
            <View style={styles.partnersSection}>
              <Text style={styles.cardTitle}>Assigned Team</Text>
              <View style={styles.partnersCard}>
                {incident.assigned_firefighters.map((firefighter, index) => (
                  <View key={firefighter._id}>
                    <View style={styles.partnerItem}>
                      <TouchableOpacity
                        // style={styles.partnerAvatar}
                        onPress={() =>
                          router.push(`/profile?profileId=${firefighter._id}`)
                        }
                        activeOpacity={0.7}
                      >
                        {firefighter.image ? (
                          <Image
                            source={{ uri: firefighter.image }}
                            style={{ width: 32, height: 32, borderRadius: 16 }}
                          />
                        ) : (
                          <View style={styles.partnerAvatar}>
                            <Text style={styles.partnerAvatarText}>
                              {firefighter.name.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>

                      <View style={styles.partnerInfo}>
                        <Text style={styles.partnerName}>
                          {firefighter.name}
                        </Text>
                        <Text style={styles.partnerContact}>
                          {firefighter.contact}
                        </Text>
                      </View>
                      <View style={styles.partnerActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handlePhoneCall(firefighter.contact)}
                        >
                          <Phone size={18} color={PRIMARY_COLOR} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleEmail(firefighter.contact)}
                        >
                          <Mail size={18} color={PRIMARY_COLOR} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {index < incident.assigned_firefighters.length - 1 && (
                      <View style={styles.partnerDivider} />
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

        {incident.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.cardTitle}>Additional Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{incident.notes}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {user?._id === incident.leaderId && incident.status !== "completed" && (
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleMarkComplete}
          >
            <CheckCircle size={22} color={WHITE} />
            <Text style={styles.completeButtonText}>Mark as Complete</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Complete Dialog */}
      {showCompleteDialog && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogContainer}>
            <Text style={styles.dialogTitle}>Mark Incident Complete</Text>
            <Text style={styles.dialogSubtitle}>
              Please add any notes about the completion:
            </Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Enter completion notes..."
              value={completionNotes}
              onChangeText={setCompletionNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.dialogButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowCompleteDialog(false);
                  setCompletionNotes("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmComplete}
                disabled={markLoading}
              >
                {markLoading ? (
                  <ActivityIndicator size="small" color={WHITE} />
                ) : (
                  <Text style={styles.confirmButtonText}>Complete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: GRAY_COLOR,
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    color: GRAY_COLOR,
    marginTop: 16,
    marginBottom: 32,
    textAlign: "center",
    fontWeight: "600",
  },
  errorButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    color: WHITE,
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 24,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  alertTypeCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.08,
    // shadowRadius: 8,
    elevation: 3,
  },
  alertTypeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  alertTypeInfo: {
    marginLeft: 20,
    flex: 1,
  },
  alertTypeText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  alertTypeSubtext: {
    fontSize: 14,
    color: GRAY_COLOR,
    marginTop: 4,
    fontWeight: "500",
  },
  locationCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.08,
    // shadowRadius: 8,
    elevation: 3,
  },
  locationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEF3F2",
    justifyContent: "center",
    alignItems: "center",
  },
  locationInfo: {
    marginLeft: 16,
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
  },
  locationSubtext: {
    fontSize: 13,
    color: GRAY_COLOR,
    marginTop: 2,
    fontWeight: "500",
  },
  timeCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.08,
    // shadowRadius: 8,
    elevation: 3,
  },
  timeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  timeInfo: {
    marginLeft: 16,
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: GRAY_COLOR,
    fontWeight: "500",
  },
  timeValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 4,
  },
  detectionCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.08,
    // shadowRadius: 8,
    elevation: 3,
  },
  detectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  detectionDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 8,
  },
  detectionLabel: {
    fontSize: 16,
    color: GRAY_COLOR,
    fontWeight: "500",
  },
  detectionValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  partnersSection: {
    marginBottom: 16,
  },
  partnersCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 24,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.08,
    // shadowRadius: 8,
    elevation: 3,
  },
  partnerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  partnerDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 8,
  },
  partnerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: "center",
    alignItems: "center",
  },
  partnerAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: WHITE,
  },
  partnerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  partnerContact: {
    fontSize: 14,
    color: GRAY_COLOR,
    marginTop: 2,
    fontWeight: "500",
  },
  partnerActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  notesSection: {
    marginBottom: 16,
  },
  notesCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 24,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.08,
    // shadowRadius: 8,
    elevation: 3,
  },
  notesText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    fontWeight: "500",
  },
  actionSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: WHITE,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  completeButton: {
    backgroundColor: SUCCESS_COLOR,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.15,
    // shadowRadius: 8,
    elevation: 4,
  },
  completeButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  dialogOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  dialogContainer: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    width: "90%",
    maxWidth: 400,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  dialogSubtitle: {
    fontSize: 16,
    color: GRAY_COLOR,
    marginBottom: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "#F9FAFB",
    marginBottom: 20,
    minHeight: 100,
  },
  dialogButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: SUCCESS_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
});
