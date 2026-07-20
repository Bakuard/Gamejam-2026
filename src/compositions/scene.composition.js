import { EventBus } from "@/utils/utils";
import * as EventNames from "@/configs/eventNames.config.js";

export const sceneComposition = {
  preload(scene) {
    scene.load.on("progress", (value) => {
      EventBus.emit(EventNames.PRELOADING_PROGRESS, value);
    });

    scene.load.on("complete", () => {
      EventBus.emit(EventNames.COMPLETE_PRELOADING, true);
    });
  },
};
