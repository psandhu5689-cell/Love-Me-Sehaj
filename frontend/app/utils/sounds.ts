import { Audio } from 'expo-av';
import { Platform } from 'react-native';

// Sound URLs - cute UI sounds
const SOUNDS = {
  pop: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // Cute pop
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Soft click
  success: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3', // Success chime
  magic: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', // Magic sparkle
  complete: 'https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3', // Level complete
};

class SoundManager {
  private sounds: { [key: string]: Audio.Sound | null } = {};
  private isLoaded: boolean = false;
  private isMuted: boolean = false;

  async loadSounds() {
    if (this.isLoaded) return;

    try {
      for (const [key, uri] of Object.entries(SOUNDS)) {
        try {
          const { sound } = await Audio.Sound.createAsync(
            { uri },
            { shouldPlay: false, volume: 0.5 }
          );
          this.sounds[key] = sound;
        } catch (e) {
          console.log(`Failed to load sound: ${key}`);
          this.sounds[key] = null;
        }
      }
      this.isLoaded = true;
    } catch (error) {
      console.log('Error loading sounds:', error);
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  async play(soundName: keyof typeof SOUNDS) {
    if (this.isMuted) return;
    
    try {
      const sound = this.sounds[soundName];
      if (sound) {
        await sound.setPositionAsync(0);
        await sound.playAsync();
      }
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  }

  // Convenience methods
  async playPop() {
    await this.play('pop');
  }

  async playClick() {
    await this.play('click');
  }

  async playSuccess() {
    await this.play('success');
  }

  async playMagic() {
    await this.play('magic');
  }

  async playComplete() {
    await this.play('complete');
  }

  async unloadAll() {
    for (const sound of Object.values(this.sounds)) {
      if (sound) {
        await sound.unloadAsync();
      }
    }
    this.sounds = {};
    this.isLoaded = false;
  }
}

export const soundManager = new SoundManager();
export default soundManager;
