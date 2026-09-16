import { EventBus } from "@/utils/utils";
import * as EventNames from "@/configs/eventNames.config.js";
import { dynamicLightingComposition } from "@/compositions/DynamicLighting.composition.js";
import { audioComposition } from "@/compositions/Audio.composition.js";

export const sceneComposition = {
  preload(scene) {
    scene.load.on("progress", (value) => {
      EventBus.emit(EventNames.PRELOADING_PROGRESS, value);
    });

    scene.load.on("complete", () => {
      EventBus.emit(EventNames.COMPLETE_PRELOADING, true);
    });
  },

  setPause(scene, isGamePause, isPlaySound = true) {
    if (!scene) return;

    if (isGamePause) {
      dynamicLightingComposition.stop();
      setTimeout(() => scene.scene.pause(), 0);
      audioComposition.updateGlobalVolume(scene, false);
    } else {
      scene.scene.resume();
      dynamicLightingComposition.isStoped = false;
      const playSound = scene.playerStore?.isPlaySound ?? isPlaySound;
      audioComposition.updateGlobalVolume(scene, playSound);
    }
  },
};
