import * as Phaser from "phaser";
import { sceneComposition } from "@/compositions/scene.composition.js";
import {playerComposition} from "@/compositions/Player.composition.js";
import {platformerComposition} from "@/compositions/Platformer.composition.js";
import * as Config from "@/configs/gameplay.config.js";
import { ghostComposition } from "@/compositions/Ghost.composition.js";

export class PlatformerScene extends Phaser.Scene {
  constructor(playerStore) {
    super("MainScene");
    this.playerStore = playerStore;
  }

  preload() {
    sceneComposition.preload(this);

    platformerComposition.preloadLevel(this);
    playerComposition.preloadPlayerAnimation(this);
    ghostComposition.preloadGhostAnimation(this, Config.GHOSTS);
  }

  create() {
    const [camera, backgroundNear, backgroundFar] = platformerComposition.createParallaxImages(this);

    this.camera = camera;
    this.backgroundNear = backgroundNear;
    this.backgroundFar = backgroundFar;

    const [map, platformLayer, woodPlatformLayer, wallsLayer, chairLayer, startPointsLayer, ghostWanderAreaLayer] = platformerComposition.createLevel(this);

    this.userInput = playerComposition.createUserInput(this);
    playerComposition.preparePlayerAnimation(this);
    this.player = playerComposition.createPlayer(
      this,
      startPointsLayer.player.x,
      startPointsLayer.player.y,
      Config.PLAYER_DISPLAY_WIDTH,
      Config.PLAYER_DISPLAY_HEIGHT,
      Config.PLAYER_PLATFORM_BODY_WIDTH,
      Config.PLAYER_PLATFORM_BODY_HEIGHT,
      Config.PLAYER_SPEED
    );
    playerComposition.configureCameraFollow(this, this.player, this.cameras.main.width / 4, this.cameras.main.height / 4);

    ghostComposition.prepareGhostAnimation(this, Config.GHOSTS);
    this.ghosts = ghostComposition.createGhosts(this, Config.GHOSTS, startPointsLayer, ghostWanderAreaLayer);

    this.physics.add.collider(this.player, platformLayer);
    this.physics.add.collider(this.player, wallsLayer);
    this.physics.add.collider(this.player, woodPlatformLayer, null, (player, platform) => playerComposition.jumpOffPlatform(player, platform, this.userInput));
    this.physics.add.collider(this.player, chairLayer);
    this.physics.add.overlap(this.player, chairLayer, (player, chair) => playerComposition.pickUpChair(player, chair, this.userInput));
    for (const ghost of this.ghosts) {
      this.physics.add.overlap(this.player, ghost, (player, ghost) => ghostComposition.handlePlayerCollision(this, this.playerStore));
    }

    this.events.on('postupdate', this.postUpdate.bind(this));
  }

  update(time, delta) {
    playerComposition.movePlayerOnPlatformers(this.player, this.userInput);
    playerComposition.throwChair(this.player, this.userInput);
    for (let i = this.ghosts.length - 1; i >= 0; i--) {
      const ghost = this.ghosts[i];
      ghostComposition.moveGhost(this.player, ghost, delta);
      ghostComposition.ghostStateTimer(ghost, delta);
      if (ghost.isDestroyed) this.ghosts.splice(i, 1);
    }
    platformerComposition.moveParallaxImages(this.camera, this.backgroundNear, this.backgroundFar, this);

    if (this.ghosts.length === 0) {
      this.playerStore.isGameOver = true;
      this.playerStore.isWin = true;
      this.scene.stop();
    }
  }

  postUpdate() {
    playerComposition.careChair(this.player);
  }
}
