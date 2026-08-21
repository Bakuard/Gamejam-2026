import {tilemapComposition } from "@/compositions/Tilemap.composition.js";

export const platformerComposition = {
  preloadLevel(scene) {
    scene.load.image("floor-wall-roof", "assets/levels/tiles/floor-wall-roof.png");
    scene.load.image("decor", "assets/levels/tiles/level-art-tiles.png");
    scene.load.image("chair", "assets/levels/tiles/chair.png");
    scene.load.image("stairs-tiles", "assets/levels/tiles/stairs-tiles.png");
    scene.load.image("mountBack", "assets/img/background/mount-back.png");
    scene.load.image("mountFront", "assets/img/background/mount-front.png");
    scene.load.tilemapTiledJSON("platformer-tilemap", "assets/levels/tilemaps/platformer.json");
  },

  createLevel(scene) {
    const map = scene.make.tilemap({ key: "platformer-tilemap" });

    tilemapComposition.createTileLayer(map, "decor", "BackgroundWalls", []);
    tilemapComposition.createTileLayer(map, "decor", "DecorItems", []);
    const platformLayer = tilemapComposition.createTileLayer(map, "floor-wall-roof", "Platforms", [2, 3, 4, 18, 19, 35, 36]);
    const woodPlatformLayer = tilemapComposition.createTileLayer(map, "floor-wall-roof", "WoodPlatforms", [2, 3, 4, 18, 19, 35, 36], true);
    const wallsLayer = tilemapComposition.createTileLayer(map, "floor-wall-roof", "Walls", [2, 3, 4, 18, 19, 35, 36]);
    const stairsLayer = tilemapComposition.createTileLayer(map, "stairs-tiles", "Stairs", [2, 3, 4, 18, 19, 35, 36]);
    const chairLayer = tilemapComposition.createObjectLayer(scene, map, "chair_layer", true);
    const startPointsLayer = tilemapComposition.createMetaObjectLayer(map, "start_points_layer");
    const doorsLayer = tilemapComposition.createMetaObjectLayer(map, "doors_layer");
    const ghostsWanderAreaLayer = tilemapComposition.createMetaObjectLayer(map, "ghost_wander_area_layer");
    const prowlGhostPointsLayer = tilemapComposition.createMetaObjectLayer(map, "prowl_ghost_points_layer");
    const matchesSpawnAreaLayer = tilemapComposition.createMetaObjectLayer(map, "matches_spawn_area_layer");
    const masterKeysSpawnAreaLayer = tilemapComposition.createMetaObjectLayer(map, "master_keys_spawn_area_layer");
    const saltSpawnAreaLayer = tilemapComposition.createMetaObjectLayer(map, "salt_spawn_area_layer");
    const lightPointsLayer = tilemapComposition.createMetaObjectLayer(map, "light_points_layer");

    return [
      map,
      platformLayer,
      woodPlatformLayer,
      wallsLayer,
      chairLayer,
      stairsLayer,
      tilemapComposition.toMap(startPointsLayer, "name"),
      tilemapComposition.toMap(ghostsWanderAreaLayer, "name"),
      prowlGhostPointsLayer,
      doorsLayer,
      matchesSpawnAreaLayer,
      masterKeysSpawnAreaLayer,
      saltSpawnAreaLayer,
      lightPointsLayer,
    ];
  },

  createParallaxImages(scene) {
    const camera = scene.cameras.main;

    const backgroundFar = scene.add.image(-1755, 1706, "mountBack").setOrigin(0.5, 0.04).setScrollFactor(0);

    const backgroundNear = scene.add.image(-1755, 1706, "mountFront").setOrigin(0.9, -2).setScrollFactor(0);

    return [camera, backgroundNear, backgroundFar];
  },

  moveParallaxImages(camera, backgroundNear, backgroundFar, scene) {
    const scrollX = camera.scrollX;
    const scrollY = camera.scrollY;

    backgroundFar.setPosition(-scrollX * 0.3, scene.scale.height - scrollY * 0.9);
    backgroundNear.setPosition(-scrollX * 0.7, scene.scale.height - scrollY * 1.34);
  },

  createBackground(scene, camera) {
    const bg = scene.add.rectangle(0, 0, camera.width, camera.height, 0x98e5fe);
    bg.setOrigin(0, 0);
    bg.setScrollFactor(0);
    bg.setDepth(-1000);
    scene.scale.on("resize", (gameSize) => bg.setSize(gameSize.width, gameSize.height));
  },
};
