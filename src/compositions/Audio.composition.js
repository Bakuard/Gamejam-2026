export const audioComposition = {
  preloadAudioFiles(scene, audioConfigs) {
    for (const audioConfig of audioConfigs) {
      scene.load.audio(audioConfig.key, audioConfig.filePath);
    }
  },

  createAudioForScene(scene, audioConfigs) {
    for (const audioConfig of audioConfigs) {
      scene.sound.add(audioConfig.key, audioConfig);
    }

    scene.events.once("shutdown", () => scene.sound.stopAll());
  },

  play(scene, key, audioOptions) {
    if (!key) throw new Error("audioComposition.play(): key is required");

    let sound = scene.sound.get(key);
    if (!sound) throw new Error(`audioComposition.play(): sound with key '${key}' not found. Did you call createAudioForScene()?`);

    //Если запускается звук в момент его затухания после вызова stop
    scene.tweens.killTweensOf(sound);
    const targetVolume = audioOptions?.volume ?? sound.customConfig?.volume ?? 1;
    if (sound.volume !== targetVolume) sound.volume = targetVolume;

    if (audioOptions && (!sound.isPlaying || !audioOptions.ignoreIfPlaying)) {
      sound.play(audioOptions);
    } else if (!sound.isPlaying || !sound.config.ignoreIfPlaying) {
      sound.play();
    }
  },

  stop(scene, key) {
    const sound = scene.sound.get(key);
    if (!sound || !sound.isPlaying) return;

    scene.tweens.killTweensOf(sound);
    const fadeInMs = sound.config?.fadeInMs ?? 0;

    if (fadeInMs === 0) {
      sound.stop();
      return;
    }

    const originalVolume = sound.volume;
    scene.tweens.add({
      targets: sound,
      volume: 0,
      duration: fadeInMs,
      ease: "Linear",
      onComplete: () => {
        sound.stop();
        sound.volume = originalVolume;
      },
    });
  },

  updateGlobalVolume(scene, isPlaySound) {
    scene.sound.mute = !isPlaySound;
  },
};