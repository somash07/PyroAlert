import { Audio } from "expo-av";

class SoundManager {
  private sound: Audio.Sound | null = null;
  private isLoaded = false;
  private isLoading = false;

  async loadNotificationSound() {
    if (this.isLoaded || this.isLoading) return;

    this.isLoading = true;

    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/sounds/alert.mp3"),
        {
          shouldPlay: false,
          volume: 0.8,
          rate: 1.0,
        }
      );

      this.sound = sound;
      this.isLoaded = true;
    } catch (error) {
      console.log("Error loading notification sound:", error);
    } finally {
      this.isLoading = false;
    }
  }

  async playNotificationSound() {
    try {
      if (!this.sound || !this.isLoaded) {
        await this.loadNotificationSound();
      }

      if (this.sound && this.isLoaded) {
        await this.sound.replayAsync();
      } else {
        console.warn("Sound not loaded properly, cannot play.");
      }
    } catch (error) {
      console.log("Error playing notification sound:", error);
    }
  }

  async unloadSound() {
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
      this.isLoaded = false;
    }
  }
}

export const soundManager = new SoundManager();
