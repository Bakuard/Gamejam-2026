import * as Phaser from "phaser";
import { sceneComposition } from "@/compositions/scene.composition.js";
import {playerComposition} from "@/compositions/Player.composition.js";
import {platformerComposition} from "@/compositions/Platformer.composition.js";
import * as Config from "@/configs/gameplay.config.js";

export class PlatformerScene extends Phaser.Scene {
  constructor(playerStore) {
    super("MainScene");
    this.playerStore = playerStore;
  }

  preload() {
    sceneComposition.preload(this);

    platformerComposition.preloadLevel(this);
    playerComposition.preloadPlayerAnimation(this);
  }

  create() {
    const [camera, backgroundNear, backgroundFar] = platformerComposition.createParallaxImages(this);

    this.camera = camera;
    this.backgroundNear = backgroundNear;
    this.backgroundFar = backgroundFar;

    const [map, platformLayer, wallsLayer, chairLayer, stairLayer] = platformerComposition.createLevel(this);
    this.stairLayer = stairLayer;

    this.userInput = playerComposition.createUserInput(this);
    playerComposition.preparePlayerAnimation(this);
    this.player = playerComposition.createPlayer(
      this,
      -1755,
      1706,
      Config.PLAYER_DISPLAY_WIDTH,
      Config.PLAYER_DISPLAY_HEIGHT,
      Config.PLAYER_PLATFORM_BODY_WIDTH,
      Config.PLAYER_PLATFORM_BODY_HEIGHT,
      Config.PLAYER_SPEED,
      Config.PLAYER_MAX_HEALTH
    );

    playerComposition.configureCameraFollow(this, this.player, this.cameras.main.width / 4, this.cameras.main.height / 4);
    this.physics.add.collider(this.player, platformLayer);
    this.physics.add.collider(this.player, wallsLayer);
    this.physics.add.collider(this.player, chairLayer);
  }

  update(time, delta) {
    playerComposition.movePlayerOnPlatformers(this.player, this.userInput);
    playerComposition.moveOnStair(this, this.player, this.stairLayer, this.userInput);
    playerComposition.handleChairCollision(this.player, this.userInput);
    platformerComposition.moveParallaxImages(this.camera, this.backgroundNear, this.backgroundFar, this);
  }
}
