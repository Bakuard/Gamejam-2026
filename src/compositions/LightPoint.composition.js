import Phaser from "phaser";
import { inventoryComposition } from "@/compositions/Inventory.composition.js";
import { ITEM_MATCHES, LIGHT_POINT } from "@/configs/gameplay.config.js";
import { audioComposition } from "@/compositions/Audio.composition.js";

export const lightPointComposition = {
  preloadLightPointAnimation(scene) {
    scene.load.atlas("lightPoint", "assets/animation/environment/candle.png", "assets/animation/environment/candle.json");
  },

  createLightPoints(scene, lightPointsLayer) {
    const lightPointsPhysicLayer = scene.physics.add.staticGroup();
    const lightPointsAreaLayer = scene.physics.add.staticGroup();
    lightPointsLayer.forEach((lightPointMeta) => {
      const lightPoint = lightPointsPhysicLayer.get(lightPointMeta.x + lightPointMeta.width / 2, lightPointMeta.y, "lightPoint", "1");
      lightPoint.setOrigin(0.5, 1);
      lightPoint.setDisplaySize(lightPointMeta.width, lightPointMeta.height);
      lightPoint.refreshBody();
      lightPoint.currentBurningTimeInMs = 0;
      lightPoint.turnOn = false;
      lightPoint.centerX = lightPointMeta.x + lightPointMeta.width / 2;
      lightPoint.centerY = lightPointMeta.y - lightPointMeta.height / 2;

      const lightPointAreaSize = LIGHT_POINT.protectionRadius * 2;
      const lightPointArea = scene.add.zone(lightPoint.centerX, lightPoint.centerY, lightPointAreaSize, lightPointAreaSize);
      scene.physics.add.existing(lightPointArea, true);
      lightPointsAreaLayer.add(lightPointArea);

      lightPointArea.lightPoint = lightPoint;
    });
    return [lightPointsPhysicLayer, lightPointsAreaLayer];
  },

  interactWithLightPoint(inventoryStore, lightPoint, userInput) {
    const turnOn = (Phaser.Input.Keyboard.JustDown(userInput.interact) || Phaser.Input.Keyboard.JustDown(userInput.one)) && lightPoint.currentBurningTimeInMs <= 0 && inventoryComposition.decreaseItem(inventoryStore, ITEM_MATCHES);

    if (turnOn) {
      lightPoint.setFrame("2");
      lightPoint.currentBurningTimeInMs = LIGHT_POINT.maxBurningTimeInSec * 1000;
      lightPoint.turnOn = true;
      audioComposition.play(lightPoint.scene, "matches");
    }
  },

  decreaseBurningTime(lightPointsLayer, deltaTime) {
    lightPointsLayer.getChildren().forEach(lightPoint => {
      if (lightPoint.currentBurningTimeInMs > 0) {
        lightPoint.currentBurningTimeInMs -= deltaTime;
      } else if (lightPoint.turnOn) {
        lightPoint.setFrame("1");
        lightPoint.turnOn = false;
      }
    });
  },
};

