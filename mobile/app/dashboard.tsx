"use client";

import { Incident } from "@/types";
import { getStatusColor } from "@/utils/statusUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Eye, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { io } from "socket.io-client";
import {
  GRAY_COLOR,
  LIGHT_GRAY,
  PRIMARY_COLOR,
  SUCCESS_COLOR,
  WARNING_COLOR,
  WHITE,
} from "../constants/constants";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import { apiService } from "../services/api";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { playNotificationSound } = useNotification();
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [markLoading, setMarkLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(
    null
  );
  const [completionNotes, setCompletionNotes] = useState("");
  const [userCurrentStatus, setUserCurrentStatus] = useState<any>("");
  const getStatusFromLocalStorage = async () => {
    const status = await AsyncStorage.getItem("status");
    if (status) {
      setUserCurrentStatus(status);
    } else {
      setUserCurrentStatus(user?.status);
    }
  };
  useEffect(() => {
    loadIncidents();
    getStatusFromLocalStorage();
    loadUserCurrentStatus();
  }, []);

  const loadUserCurrentStatus = async () => {
    const data = await apiService.getFireFighterUserDetailById(user?._id || "");
    setUserCurrentStatus(data.status);
    await AsyncStorage.setItem("status", data.status);
  };

  const loadIncidents = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getIncidents(user?._id || "", [
        "assigned",
        "dispatched",
      ]);
      setIncidents(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load incidents");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const socket = io("https://pyroalert-tdty.onrender.com", {
      transports: ["websocket"], // important for React Native
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("status-update", (data) => {
      if (data.userId === user?._id) {
        setUserCurrentStatus(data.status);
      }
    });

    socket.on("incident-updated", (data) => {
      playNotificationSound(); // Play sound on incident update
      loadIncidents();
      loadUserCurrentStatus();
    });

    socket.on("incident_completed", (data) => {
      playNotificationSound(); // Play sound on incident completion
      loadIncidents();
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [user?._id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadIncidents();
    setRefreshing(false);
  };

  const handleMarkComplete = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setShowCompleteDialog(true);
  };

  const handleConfirmComplete = async () => {
    if (!selectedIncidentId) return;

    try {
      setMarkLoading(true);
      await apiService.markIncidentComplete(
        selectedIncidentId,
        user?._id ?? "",
        completionNotes
      );
      // await loadIncidents()
      loadUserCurrentStatus();
      setIncidents((prev) =>
        prev.map((incident) =>
          incident._id === selectedIncidentId
            ? { ...incident, status: "completed" }
            : incident
        )
      );
      setShowCompleteDialog(false);
      setSelectedIncidentId(null);
      setCompletionNotes("");
      loadIncidents();
      Alert.alert("Success", "Incident marked as complete");
    } catch (error) {
      Alert.alert("Error", "Failed to update incident");
    } finally {
      setMarkLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: () => {
          logout().then(() => router.replace("/login"));
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>
            {user && user?.name.charAt(0)?.toUpperCase() + user?.name?.slice(1)}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push(`/profile?profileId=${user?._id}`)}
          >
            <User size={20} color={WHITE} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Current Status</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                userCurrentStatus === "available"
                  ? SUCCESS_COLOR
                  : WARNING_COLOR,
            },
          ]}
        >
          <Text style={styles.statusText}>
            {userCurrentStatus?.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Assigned Incidents</Text>

        <ScrollView
          style={styles.incidentsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {incidents &&
            incidents.length > 0 &&
            incidents?.map((incident) => (
              <View key={incident._id} style={styles.incidentCard}>
                <View style={styles.incidentHeader}>
                  <Text style={styles.incidentTitle}>New Incident Occured</Text>

                  <TouchableOpacity
                    style={[styles.priorityBadge]}
                    onPress={() => {
                      router.push(
                        `/incident-details?incidentId=${incident._id}`
                      );
                    }}
                    activeOpacity={0.7}
                  >
                    <Eye size={16} color={GRAY_COLOR} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.incidentDescription}>{incident.notes}</Text>
                <Text style={styles.incidentLocation}>
                  📍 {incident.location}
                </Text>

                <View style={styles.incidentFooter}>
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

                  {user?._id === incident.leaderId &&
                    incident.status !== "completed" && (
                      <TouchableOpacity
                        style={styles.completeButton}
                        onPress={() => handleMarkComplete(incident._id)}
                      >
                        <Text style={styles.completeButtonText}>
                          Mark Complete
                        </Text>
                      </TouchableOpacity>
                    )}
                </View>
              </View>
            ))}

          {incidents.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No incidents assigned</Text>
            </View>
          )}
        </ScrollView>
      </View>

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
                  setSelectedIncidentId(null);
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_GRAY,
  },
  header: {
    backgroundColor: PRIMARY_COLOR,
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  soundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeText: {
    color: WHITE,
    fontSize: 16,
    opacity: 0.9,
  },
  nameText: {
    color: WHITE,
    fontSize: 24,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: "600",
  },
  statusCard: {
    backgroundColor: WHITE,
    marginHorizontal: 24,
    marginTop: -12,
    padding: 20,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  incidentsList: {
    flex: 1,
  },
  incidentCard: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  incidentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  incidentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
    marginRight: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  priorityText: {
    color: WHITE,
    fontSize: 10,
    fontWeight: "600",
  },
  incidentDescription: {
    fontSize: 14,
    color: GRAY_COLOR,
    marginBottom: 8,
    lineHeight: 20,
  },
  incidentLocation: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  incidentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  completeButton: {
    backgroundColor: SUCCESS_COLOR,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  completeButtonText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: GRAY_COLOR,
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
