import * as Phaser from "phaser";
import { sceneComposition } from "@/compositions/scene.composition.js";
import {playerComposition} from "@/compositions/Player.composition.js";
import {platformerComposition} from "@/compositions/Platformer.composition.js";
import * as Config from "@/configs/gameplay.config.js";
import { ghostComposition } from "@/compositions/Ghost.composition.js";
import { dynamicLightingComposition } from "@/compositions/DynamicLighting.composition.js";
import { Calendar } from "@/compositions/Calendar.composition.js";

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
    dynamicLightingComposition.preloadShaders(this);
  }

  create() {
    const [camera, backgroundNear, backgroundFar] = platformerComposition.createParallaxImages(this);

    this.camera = camera;
    this.backgroundNear = backgroundNear;
    this.backgroundFar = backgroundFar;

    this.calendar = new Calendar(5, 5, 5, 5);

    const [map, platformLayer, woodPlatformLayer, wallsLayer, chairLayer, startPointsLayer, ghostWanderAreaLayer] = platformerComposition.createLevel(this);

    this.wallsLayer = wallsLayer;

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
    this.physics.add.collider(this.player, woodPlatformLayer, null, (player, platform) => playerComposition.jumpOff(player, platform, this.userInput));
    this.physics.add.collider(this.player, chairLayer, null, (player, chair) => playerComposition.jumpOff(player, chair, this.userInput));
    this.physics.add.overlap(this.player, chairLayer, (player, chair) => playerComposition.pickUpChair(player, chair, this.userInput));
    for (const ghost of this.ghosts) {
      this.physics.add.overlap(this.player, ghost, (player, ghost) => ghostComposition.handlePlayerCollision(this, this.playerStore));
    }

    // убрать эту строку:
    this.events.on(Phaser.Scenes.Events.POST_UPDATE, this.postUpdate, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off(Phaser.Scenes.Events.POST_UPDATE, this.postUpdate, this);
    });

    this.nightPipeline = dynamicLightingComposition.prepareAmbientLightPipeline(
      this,
      0.2,
      0.2,
      0.2,
      0.2,
      this.calendar.getCurrentDayPhase(),
      this.calendar.getCurrentPhaseProgress()
    );
  }

  update(time, delta) {
    this.calendar.setCurrentTime(delta);

    playerComposition.movePlayerOnPlatformers(this.player, this.userInput);
    playerComposition.throwChair(this.player, this.userInput, this.wallsLayer);
    ghostComposition.moveAllGhosts(this.ghosts, this.player, time, delta);
    ghostComposition.updateGhostsStateTimer(this.ghosts, delta);
    ghostComposition.gameOverIfAllGhostsDead(this, this.ghosts, this.playerStore);

    platformerComposition.moveParallaxImages(this.camera, this.backgroundNear, this.backgroundFar, this);
    dynamicLightingComposition.updateAmbientLightPipeline(this.nightPipeline, this.calendar.getCurrentDayPhase(), this.calendar.getCurrentPhaseProgress());
  }

  postUpdate() {
    playerComposition.careChair(this.player);
  }
}
