import * as Phaser from "phaser";
import { sceneComposition } from "@/compositions/scene.composition.js";
import {playerComposition} from "@/compositions/Player.composition.js";
import {platformerComposition} from "@/compositions/Platformer.composition.js";
import * as Config from "@/configs/gameplay.config.js";
import { ghostComposition } from "@/compositions/Ghost.composition.js";
import { dynamicLightingComposition } from "@/compositions/DynamicLighting.composition.js";
import { calendarComposition } from "@/compositions/Calendar.composition.js";
import { audioComposition } from "@/compositions/Audio.composition.js";
import { analyticsComposition } from "@/compositions/Analytics.composition.js";
import { particlesComposition } from "@/compositions/Particles.composition.js";
import { doorComposition } from "@/compositions/Door.composition.js";

export class PlatformerScene extends Phaser.Scene {
  constructor(playerStore, calendarStore) {
    super("MainScene");
    this.playerStore = playerStore;
    this.calendarStore = calendarStore;
  }

  preload() {
    sceneComposition.preload(this);

    platformerComposition.preloadLevel(this);
    doorComposition.preloadDoorAnimations(this);
    playerComposition.preloadPlayerAnimation(this);
    ghostComposition.preloadGhostAnimation(this, Config.GHOSTS);
    ghostComposition.preloadGhostParticles(this);
    audioComposition.preloadAudioFiles(this, Config.AUDIO);
    dynamicLightingComposition.preloadShaders(this);
    particlesComposition.preloadParticlesTextures(this);
  }

  create() {
    const [camera, backgroundNear, backgroundFar] = platformerComposition.createParallaxImages(this);
    platformerComposition.createBackground(this, camera);

    this.camera = camera;
    this.backgroundNear = backgroundNear;
    this.backgroundFar = backgroundFar;

    audioComposition.createAudioForScene(this, Config.AUDIO);

    calendarComposition.initCalendar(this.calendarStore, Config.TIME);

    const [
      map,
      platformLayer,
      woodPlatformLayer,
      wallsLayer,
      chairLayer,
      stairsLayer,
      startPointsLayer,
      ghostsWanderAreaLayer,
      prowlGhostPointsLayer,
      doorsLayer
    ] = platformerComposition.createLevel(this);
    this.map = map;
    this.platformLayer = platformLayer;
    this.woodPlatformLayer = woodPlatformLayer;
    this.wallsLayer = wallsLayer;
    this.stairsLayer = stairsLayer;

    this.doorsLayer = doorComposition.createDoors(this, doorsLayer);

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
    this.ghosts = ghostComposition.createGhosts(this, Config.GHOSTS, startPointsLayer, ghostsWanderAreaLayer, prowlGhostPointsLayer);

    this.physics.add.collider(this.player, platformLayer);
    this.physics.add.collider(this.player, wallsLayer);
    this.physics.add.collider(this.player, woodPlatformLayer, null, (player, platform) => playerComposition.jumpOff(player, platform, this.userInput));
    this.physics.add.collider(
      this.player,
      chairLayer,
      (player, chair) => (player.isStandingOnChair = player.body.touching.down && chair.body.touching.up),
      (player, chair) => playerComposition.jumpOff(player, chair, this.userInput)
    );
    this.physics.add.overlap(this.player, chairLayer, (player, chair) => playerComposition.pickUpChair(player, chair, this.userInput));
    for (const ghost of this.ghosts) {
      this.physics.add.overlap(this.player, ghost, (player, ghost) => ghostComposition.handlePlayerCollision(this, this.playerStore));
      this.physics.add.overlap(ghost, this.doorsLayer, (ghost, door) => ghostComposition.tyrCloseDoor(ghost, door));
    }
    this.physics.add.overlap(this.player, this.doorsLayer, (player, door) => doorComposition.toggleDoor(door, this.userInput));
    this.physics.add.collider(this.player, this.doorsLayer, null, (player, door) => door.isClosed);

    audioComposition.play(this, "music:mountains");
    this.events.on(Phaser.Scenes.Events.POST_UPDATE, this.postUpdate, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off(Phaser.Scenes.Events.POST_UPDATE, this.postUpdate, this);
    });

    this.nightPipeline = dynamicLightingComposition.prepareAmbientLightPipeline(this, Config.TIME, this.calendarStore.currentPhase, calendarComposition.getCurrentPhaseProgress(this.calendarStore));

    analyticsComposition.createAnalytics(Config.ANALYTICS);
  }

  update(time, delta) {
    calendarComposition.setCurrentTime(this.calendarStore, delta);

    const isMorning = calendarComposition.isMorning(this.calendarStore);
    if (!this._wasMorning && isMorning) {
      audioComposition.stop(this, "music:mountains");
      audioComposition.play(this, "music:chemical_x");
    }
    this._wasMorning = isMorning;

    playerComposition.movePlayerOnPlatformers(this, this.player, this.userInput, this.platformLayer, this.woodPlatformLayer, this.stairsLayer, this.map, this.camera);
    playerComposition.throwChair(this.player, this.userInput, this.wallsLayer);
    ghostComposition.moveAllGhosts(this.ghosts, this.player, time, delta);
    ghostComposition.updateGhostsStateTimer(this.ghosts, delta);
    ghostComposition.gameOverIfAllGhostsDead(this, this.ghosts, this.playerStore);

    platformerComposition.moveParallaxImages(this.camera, this.backgroundNear, this.backgroundFar, this);
    dynamicLightingComposition.updateAmbientLightPipeline(this.nightPipeline, this.calendarStore.currentPhase, calendarComposition.getCurrentPhaseProgress(this.calendarStore));
  }

  postUpdate() {
    playerComposition.careChair(this.player);
  }
}
