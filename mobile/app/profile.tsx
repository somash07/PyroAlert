"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Calendar, MapPin, Phone, Shield, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ErrorScreen from "../components/ErrorScreen";
import InfoCard from "../components/InfoCard";
import LoadingScreen from "../components/LoadingScreen";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import {
  GRAY_COLOR,
  PRIMARY_COLOR,
  SUCCESS_COLOR,
  WHITE,
} from "../constants/constants";
import { apiService } from "../services/api";
import type { FFighter, Incident } from "../types";
import { formatDate } from "../utils/dateUtils";

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<FFighter | null>(null);
  const [history, setHistory] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [incidentLoading, setIncidentLoading] = useState(false);

  const params = useLocalSearchParams();
  const profileId = (params.profileId as string) || "";

  const loadHistoryOfUser = async () => {
    try {
      setIncidentLoading(true);
      const data = await apiService.getIncidents(profileId || "", [
        "completed",
      ]);
      setHistory(data);
    } catch (error) {
    } finally {
      setIncidentLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getFireFighterUserDetailById(
        profileId || ""
      );
      setProfile(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (profileId) {
      loadProfile();
      loadHistoryOfUser();
    }
  }, [profileId]);

  if (isLoading) {
    return <LoadingScreen message="Loading profile..." />;
  }

  if (!profile) {
    return (
      <ErrorScreen
        title="Profile not found"
        message="Unable to load profile information"
        onGoBack={() => router.back()}
        icon="shield"
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />

      <PageHeader
        title="Profile"
        onBack={() => router.back()}
        bgColor={SUCCESS_COLOR}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              {profile.image ? (
                <Image
                  source={{ uri: profile.image }}
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                />
              ) : (
                <Text style={styles.profileImageText}>
                  {profile.name.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
          </View>
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileEmail}>{profile.email}</Text>
          <StatusBadge status={profile.status} size="large" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <InfoCard>
            <View style={styles.contactItem}>
              <Phone size={18} color={GRAY_COLOR} />
              <Text style={styles.contactText}>{profile.contact}</Text>
            </View>
          </InfoCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Incident History</Text>
          {incidentLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={PRIMARY_COLOR} />
            </View>
          ) : history.length > 0 ? (
            history.map((incident) => (
              <InfoCard key={incident._id}>
                <View style={styles.historyHeader}>
                  <View style={styles.historyTitleRow}>
                    <Text style={styles.historyTitle}>
                      {incident.alert_type.toUpperCase()}
                    </Text>
                    <StatusBadge status={incident.status} size="small" />
                  </View>
                  <Text style={styles.historyDate}>
                    {formatDate(incident.timestamp)}
                  </Text>
                </View>

                <View style={styles.historyDetails}>
                  <View style={styles.historyDetailItem}>
                    <MapPin size={16} color={GRAY_COLOR} />
                    <Text style={styles.historyDetailText}>
                      {incident.location}
                    </Text>
                  </View>

                  {incident.notes && (
                    <View style={styles.historyDetailItem}>
                      <Shield size={16} color={GRAY_COLOR} />
                      <Text style={styles.historyDetailText}>
                        {incident.notes}
                      </Text>
                    </View>
                  )}

                  <View style={styles.historyDetailItem}>
                    <User size={16} color={GRAY_COLOR} />
                    <Text style={styles.historyDetailText}>
                      {incident.leaderId === user?._id
                        ? "As Team Lead"
                        : "As Team Member"}
                    </Text>
                  </View>
                </View>
              </InfoCard>
            ))
          ) : (
            <View style={styles.emptyHistoryCard}>
              <Calendar size={32} color={GRAY_COLOR} />
              <Text style={styles.emptyHistoryText}>
                You haven't completed any firefighting incidents yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: WHITE,
  },
  profileImageText: {
    fontSize: 36,
    fontWeight: "700",
    color: WHITE,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 4,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: GRAY_COLOR,
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contactText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
  historyHeader: {
    marginBottom: 16,
  },
  historyTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  historyDate: {
    fontSize: 14,
    color: GRAY_COLOR,
    fontWeight: "500",
  },
  historyDetails: {
    gap: 8,
  },
  historyDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  historyDetailText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },
  emptyHistoryCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  emptyHistoryText: {
    fontSize: 16,
    color: GRAY_COLOR,
    marginTop: 12,
    fontWeight: "500",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
});
