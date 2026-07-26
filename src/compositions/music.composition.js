export const musicComposition = {
  KEYS: {
    TAVERN_8BIT: "music:tavern_8bit",
    CHEMICAL_X: "music:chemical_x",
    CHILL: "music:chill",
    MOUNTAINS: "music:mountains",
    SHORT_SHILL: "music:short_shill",
  },

  preload(scene) {
    scene.load.audio(this.KEYS.TAVERN_8BIT, "assets/sounds/8-bit_Tavern.mp3");
    scene.load.audio(this.KEYS.CHEMICAL_X, "assets/sounds/Chemical_X.mp3");
    // scene.load.audio(this.KEYS.CHILL, "assets/sounds/chill.mp3");
    // scene.load.audio(this.KEYS.MOUNTAINS, "assets/sounds/mountains-sounds.mp3");
    // scene.load.audio(this.KEYS.SHORT_SHILL, "assets/sounds/short-shill.mp3");
  },

  _currentByScene: new WeakMap(),

  playMusic(scene, key, options = {}) {
    const { volume = 0.5, loop = true, fadeInMs = 0 } = options;

    if (!scene?.sound) {
      throw new Error("musicComposition.playMusic(scene, key): scene is required");
    }

    if (!key) {
      throw new Error("musicComposition.playMusic(scene, key): key is required");
    }

    if (!scene.cache.audio.exists(key)) {
      // Музыка не была загружена в preload (или неверный key)
      // Возвращаем null, чтобы вызывающий код мог решить, что делать.
      // eslint-disable-next-line no-console
      console.warn(`[musicComposition] Audio key not found in cache: "${key}"`);
      return null;
    }

    const current = this._currentByScene.get(scene);
    if (current) {
      // если уже играет тот же трек — просто убедимся, что он играет
      if (current.key === key) {
        if (!current.isPlaying) current.play();
        return current;
      }

      current.stop();
      current.destroy();
      this._currentByScene.delete(scene);
    }

    const music = scene.sound.add(key, { loop, volume: fadeInMs > 0 ? 0 : volume });
    music.play();

    if (fadeInMs > 0) {
      scene.tweens.add({
        targets: music,
        volume,
        duration: fadeInMs,
        ease: "Linear",
      });
    }

    this._currentByScene.set(scene, music);

    // гарантированно чистим музыку при остановке/уничтожении сцены
    scene.events.once("shutdown", () => {
      const s = this._currentByScene.get(scene);
      if (s) {
        s.stop();
        s.destroy();
        this._currentByScene.delete(scene);
      }
    });

    return music;
  },
};
