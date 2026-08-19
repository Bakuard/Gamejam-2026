import Phaser from "phaser";
import { inventoryComposition } from "@/compositions/Inventory.composition.js";
import { ITEM_MATCHES } from "@/configs/gameplay.config.js";

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
    });
    return lightPointsPhysicLayer;
  },

  interactWithLightPoint(inventoryStore, lightPoint, userInput) {
    Phaser.Input.Keyboard.JustDown(userInput.interact)
      && inventoryComposition.decreaseItem(inventoryStore, ITEM_MATCHES)
      && lightPoint.setFrame("2");
  },
};

