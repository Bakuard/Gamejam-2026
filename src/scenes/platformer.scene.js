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
import { pullEventManager } from "@/utils/PullEventManager.js";
import { dropItemsComposition } from "@/compositions/DropItems.composition.js";
import { tilemapComposition } from "@/compositions/Tilemap.composition.js";
import { DROP_ITEMS } from "@/configs/gameplay.config.js";

export class PlatformerScene extends Phaser.Scene {
  constructor(playerStore, calendarStore, ghostsStore, inventoryStore) {
    super("MainScene");
    this.playerStore = playerStore;
    this.calendarStore = calendarStore;
    this.ghostsStore = ghostsStore;
    this.inventoryStore = inventoryStore;
  }

  preload() {
    sceneComposition.preload(this);

    platformerComposition.preloadLevel(this);
    dropItemsComposition.preloadDropItemsImage(this);
    doorComposition.preloadDoorAnimations(this);
    playerComposition.preloadPlayerAnimation(this);
    ghostComposition.preloadGhostAnimation(this, Config.GHOSTS);
    ghostComposition.preloadGhostParticles(this);
    audioComposition.preloadAudioFiles(this, Config.AUDIO);
    dynamicLightingComposition.preloadShaders(this);
    particlesComposition.preloadParticlesTextures(this);
  }

  create() {
    pullEventManager.registerInbox("changeAmbientAudio", "morning", "night");
    pullEventManager.registerInbox("createNewGhosts", "night");
    pullEventManager.registerInbox("spawnOrDespawnDropItems", "morning", "night");

    const [camera, backgroundNear, backgroundFar] = platformerComposition.createParallaxImages(this);
    platformerComposition.createBackground(this, camera);

    this.camera = camera;
    this.backgroundNear = backgroundNear;
    this.backgroundFar = backgroundFar;

    audioComposition.createAudioForScene(this, Config.AUDIO);

    calendarComposition.initCalendar(this.calendarStore, Config.TIME);

    const [map, platformLayer, woodPlatformLayer, wallsLayer, chairLayer, stairsLayer, startPointsLayer, ghostsWanderAreaLayer, prowlGhostPointsLayer, doorsLayer, dropItemsSpawnAreaLayer] =
      platformerComposition.createLevel(this);
    this.map = map;
    this.platformLayer = platformLayer;
    this.woodPlatformLayer = woodPlatformLayer;
    this.wallsLayer = wallsLayer;
    this.stairsLayer = stairsLayer;
    this.startPointsLayer = startPointsLayer;
    this.ghostsWanderAreaLayer = ghostsWanderAreaLayer;
    this.prowlGhostPointsLayer = prowlGhostPointsLayer;

    this.emptyTilesCenterForMatches = tilemapComposition.findEmptyTilesCenterInArea(map, camera, dropItemsSpawnAreaLayer.matches, platformLayer, woodPlatformLayer, wallsLayer);

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
    this.ghosts = [];

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

    changeAmbientAudio(this);
    createNewGhosts(this);
    spawnOrDespawnDropItems(this);

    playerComposition.movePlayerOnPlatformers(this, this.player, this.userInput, this.platformLayer, this.woodPlatformLayer, this.stairsLayer, this.map, this.camera);
    playerComposition.throwChair(this.player, this.userInput, this.wallsLayer);
    ghostComposition.moveAllGhosts(this.ghosts, this.player, time, delta);
    ghostComposition.updateGhostsStateTimer(this.ghosts, delta);

    platformerComposition.moveParallaxImages(this.camera, this.backgroundNear, this.backgroundFar, this);
    dynamicLightingComposition.updateAmbientLightPipeline(this.nightPipeline, this.calendarStore.currentPhase, calendarComposition.getCurrentPhaseProgress(this.calendarStore));
  }

  postUpdate() {
    playerComposition.careChair(this.player);
  }
}

function changeAmbientAudio(scene) {
  if (pullEventManager.checkEvent("changeAmbientAudio", "night") && calendarComposition.getCurrentPhaseProgress(scene.calendarStore) >= Config.TIME.nightPhaseTransitionFraction) {
    audioComposition.stop(scene, "music:mountains");
    audioComposition.play(scene, "music:chemical_x");
    pullEventManager.clearEvent("changeAmbientAudio", "night");
  } else if (pullEventManager.checkEvent("changeAmbientAudio", "morning") && calendarComposition.getCurrentPhaseProgress(scene.calendarStore) >= Config.TIME.morningPhaseTransitionFraction) {
    audioComposition.stop(scene, "music:chemical_x");
    audioComposition.play(scene, "music:mountains");
    pullEventManager.clearEvent("changeAmbientAudio", "morning");
  }
}

function createNewGhosts(scene) {
  if (!pullEventManager.checkEvent("createNewGhosts", "night") || calendarComposition.getCurrentPhaseProgress(scene.calendarStore) < Config.TIME.nightPhaseTransitionFraction) return;

  scene.ghosts = ghostComposition.createGhosts(scene, Config.GHOSTS, scene.startPointsLayer, scene.ghostsWanderAreaLayer, scene.prowlGhostPointsLayer, scene.ghostsStore);
  for (const ghost of scene.ghosts) {
    scene.physics.add.overlap(scene.player, ghost, (player, ghost) => ghostComposition.handlePlayerCollision(scene, scene.playerStore));
    scene.physics.add.overlap(ghost, scene.doorsLayer, (ghost, door) => ghostComposition.tryCloseDoor(ghost, door));
  }

  pullEventManager.clearEvent("createNewGhosts", "night");
  scene.ghostsStore.currentGhostsNumber++;
  console.log(`currentGhostsNumber: ${scene.ghostsStore.currentGhostsNumber}, night: ${pullEventManager.checkEvent("createNewGhosts", "night")}`);
}

function spawnOrDespawnDropItems(scene) {
  if (pullEventManager.checkEvent("spawnOrDespawnDropItems", "night") && calendarComposition.getCurrentPhaseProgress(scene.calendarStore) >= Config.TIME.nightPhaseTransitionFraction) {
    dropItemsComposition.despawnDropItems(scene.dropItems);
    pullEventManager.clearEvent("spawnOrDespawnDropItems", "night");
  } else if (!scene.dropItems || pullEventManager.checkEvent("spawnOrDespawnDropItems", "morning") && calendarComposition.getCurrentPhaseProgress(scene.calendarStore) >= Config.TIME.morningPhaseTransitionFraction) {
    scene.dropItems = dropItemsComposition.spawnMatches(scene, scene.emptyTilesCenterForMatches, Config.DROP_ITEMS, scene.calendarStore.totalDays);
    scene.physics.add.overlap(scene.player, scene.dropItems, (player, item) => dropItemsComposition.handlePlayerCollision(player, item, scene.dropItems, scene.inventoryStore));
    pullEventManager.clearEvent("spawnOrDespawnDropItems", "morning");
  }
}