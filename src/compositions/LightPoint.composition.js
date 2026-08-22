import Phaser from "phaser";
import { inventoryComposition } from "@/compositions/Inventory.composition.js";
import { ITEM_MATCHES, LIGHT_POINT } from "@/configs/gameplay.config.js";

export const lightPointComposition = {
  preloadLightPointAnimation(scene) {
    scene.load.atlas("lightPoint", "assets/animation/environment/candle.png", "assets/animation/environment/candle.json");
  },

  createLightPoints(scene, lightPointsLayer) {
    const lightPointsPhysicLayer = scene.physics.add.staticGroup();
    lightPointsLayer.forEach((lightPointMeta) => {
      const lightPoint = lightPointsPhysicLayer.get(lightPointMeta.x, lightPointMeta.y, "lightPoint", "1");
      lightPoint.setOrigin(0, 1);
      lightPoint.setDisplaySize(lightPointMeta.width, lightPointMeta.height);
      lightPoint.refreshBody();
      lightPoint.currentBurningTimeInMs = 0;
    });
    return lightPointsPhysicLayer;
  },

  interactWithLightPoint(inventoryStore, lightPoint, userInput) {
    const turnOn = lightPoint.currentBurningTimeInMs <= 0 && Phaser.Input.Keyboard.JustDown(userInput.interact) && inventoryComposition.decreaseItem(inventoryStore, ITEM_MATCHES);

    if (turnOn) {
      lightPoint.setFrame("2");
      lightPoint.currentBurningTimeInMs = LIGHT_POINT.maxBurningTimeInSec * 1000;
    }
  },

  decreaseBurningTime(lightPointsLayer, deltaTime) {
    lightPointsLayer.getChildren().forEach(lightPoint => {
      if (lightPoint.currentBurningTimeInMs > 0) lightPoint.currentBurningTimeInMs -= deltaTime;
      else lightPoint.setFrame("1");
    });
  },
};

