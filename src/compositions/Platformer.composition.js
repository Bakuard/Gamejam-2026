import {tilemapComposition } from "@/compositions/Tilemap.composition.js";

export const platformerComposition = {
  preloadLevel(scene) {
    scene.load.image("floor-wall-roof", "assets/levels/tiles/floor-wall-roof.png");
    scene.load.image("chair", "assets/levels/tiles/chair.png");
    scene.load.tilemapTiledJSON("platformer-tilemap", "assets/levels/tilemaps/platformer.json");
    scene.load.image('mountBack', 'assets/img/background/mount-back.png');
    scene.load.image('mountFront', 'assets/img/background/mount-front.png');
  },

  createLevel(scene) {
    const map = scene.make.tilemap({ key: "platformer-tilemap" });

    const platformLayer = tilemapComposition.createTileLayer(map, "floor-wall-roof", "Platforms", [4, 5, 6]);
    const woodPlatformLayer = tilemapComposition.createTileLayer(map, "floor-wall-roof", "WoodPlatforms", [4, 5, 6], true);
    const wallsLayer = tilemapComposition.createTileLayer(map, "floor-wall-roof", "Walls", [4, 5, 6]);
    const chairLayer = tilemapComposition.createObjectLayer(scene, map, "chair_layer", true);
    const startPointsLayer = tilemapComposition.createMetaObjectLayer(map, "start_points_layer");
    const ghostWanderAreaLayer = tilemapComposition.createMetaObjectLayer(map, "ghost_wander_area_layer");

    return [
      map,
      platformLayer,
      woodPlatformLayer,
      wallsLayer,
      chairLayer,
      tilemapComposition.toMap(startPointsLayer, "name"),
      tilemapComposition.toMap(ghostWanderAreaLayer, "name")
    ];
  },

  createParallaxImages(scene) {
    const camera = scene.cameras.main;

    const backgroundFar = scene.add.image(-1755, 1706, 'mountBack')
      .setOrigin(0.5, 0.04)
      .setScrollFactor(0);

    const backgroundNear = scene.add.image(-1755, 1706, 'mountFront')
      .setOrigin(0.9, -2)
      .setScrollFactor(0);

      return [camera, backgroundNear, backgroundFar];
  },

  moveParallaxImages(camera, backgroundNear, backgroundFar, scene) {
    const scrollX = camera.scrollX;
    const scrollY = camera.scrollY;

    backgroundFar.setPosition(-scrollX * 0.3, scene.scale.height - scrollY * 0.55);
    backgroundNear.setPosition(-scrollX * 0.7, scene.scale.height - scrollY * 0.8);
  }
};
