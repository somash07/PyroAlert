import React, { createContext, useContext, useState } from "react";
import { Platform } from "react-native";
import { soundManager } from "../utils/soundUtils";

interface NotificationContextType {
  playNotificationSound: () => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  const playNotificationSound = async () => {
    if (!isSoundEnabled) return;

    try {

      if (Platform.OS === "android" || Platform.OS === "ios") {
        await soundManager.playNotificationSound();
      } else if (Platform.OS === "web") {
        if (typeof AudioContext !== "undefined") {
          const audioContext = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(
            600,
            audioContext.currentTime + 0.1
          );

          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.2
          );

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.2);
        }
      }
    } catch (error) {
      console.log("Error playing notification sound:", error);
      // Fallback to console log
      console.log("🔔 Notification received!");
    }
  };

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
  };

  const value: NotificationContextType = {
    playNotificationSound,
    isSoundEnabled,
    toggleSound,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
